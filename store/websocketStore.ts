import {toast} from "sonner"
import {create} from "zustand";
import {SecureWebSocket} from "@/lib/SecureWebSocket";
import {subscribeWithSelector} from "zustand/middleware";
import {deepMerge, getTimestampMs, isPlainObject, pause} from "@/lib/utils.ts";
import {useGlobalLogStore} from "@/store/globalLogStore.ts";
import {t} from "i18next";

const SECRET = "FOSL";
const BASE = "ws://localhost:8190";

type WsName = "provider" | "sync" | "trigger" | "heartbeat";

export interface LogItem {
  time: string;
  level: string;
  message: string;
}

interface RawLogItem extends LogItem {
  scope: string;
}

interface StatusItem {
  running: boolean;
  config_id: string | null;
  current_task: string | null;
  waiting_tasks: string[];
  timestamp: number;
}

interface WrappedStatusItem {
  config_id: string | null;
  status: StatusItem;
}

interface CommandPayload {
  command: string;
  config_id?: string;
  timestamp: number;
  payload: { [id: string]: any };
}

interface InitState {
  all_data_initialized: boolean;
}

interface SyncOperation {
  op: string;
  path: string;
  value: any | null;
}

interface WsMessageItem {
  type: string;
  scopes?: string[];
  entry?: RawLogItem;
  entries?: RawLogItem[];
  status?: InitState | StatusItem | WrappedStatusItem | string;
  timestamp?: number;
  data?: any;
  resource?: string;
  resource_id?: string;
  "ops"?: SyncOperation;
  "command"?: string;
}


interface LogStoreSet {
  [key: string]: LogItem[];
}

interface WebSocketState {
  connections: Partial<Record<WsName, SecureWebSocket>>;
  logStore: LogStoreSet;
  configStore: any;
  staticStore: any;
  eventStore: any;
  guiStore: any;
  updateStore: any;
  statusStore: { [id: string]: StatusItem };
  connect: (name: WsName) => Promise<void>;
  disconnect: (name: WsName) => void;
  send: (name: WsName, data: any) => void;
  init: () => Promise<void>;
  modify: (path: string, value: any) => void;
  patch: (path: string, value: any) => void;
  trigger: (payload: CommandPayload, callback?: (e) => void) => void;
  pendingCallbacks: Record<string, (data?: any) => void>;

  _all_data_initialized: boolean;
  _heartbeat_time: number;
  _initiating: boolean;
}

const {appendGlobalLog} = useGlobalLogStore.getState()

const connectWithRetry = async (name: WsName, retryInterval = 1000) => {
  const {connect} = useWebSocketStore.getState();

  while (true) {
    try {
      await connect(name);
      console.log(`[${name}] connected successfully`);
      return;
    } catch (err) {
      console.error(`[${name}] connect failed, retrying in ${retryInterval}ms`, err);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
}


export const waitFor = <T>(
  get: () => any,
  subscribe: any,
  selector: (s: any) => T,
  predicate: (val: T) => boolean,
  timeoutMs = Infinity
) => {
  return new Promise<void>((resolve, reject) => {
    const initial = selector(get());
    if (predicate(initial)) {
      resolve();
      return;
    }

    const unsub = subscribe(
      selector,
      (val: T) => {
        if (predicate(val)) {
          clearTimeout(timer);
          unsub();
          resolve();
        }
      }
    );

    let timer: any = null;
    if (timeoutMs !== Infinity) {
      timer = setTimeout(() => {
        unsub();
        reject(new Error("waitFor timeout"));
      }, timeoutMs);
    }
  });
}

export const useWebSocketStore = create<WebSocketState>()(
  subscribeWithSelector((set, get, api) => ({
    connections: {},
    logStore: {},
    configStore: {},
    staticStore: {},
    eventStore: {},
    guiStore: {},
    updateStore: {},
    statusStore: {},
    pendingCallbacks: {},

    _all_data_initialized: false,
    _heartbeat_time: 0,
    _initiating: false,

    connect: async (name: WsName) => {
      if (get().connections[name]) return;

      let url = "";
      if (name === "provider") url = `${BASE}/ws/provider`;
      if (name === "sync") url = `${BASE}/ws/sync`;
      if (name === "trigger") url = `${BASE}/ws/trigger`;
      if (name === "heartbeat") url = `${BASE}/ws/heartbeat`;

      const resourceCallBack = {
        "config": (message: WsMessageItem) => {
          set((state) => ({
            configStore: {
              ...state.configStore,
              [message.resource_id]: message.data,
            },
          }));
        },
        "event": (message: WsMessageItem) => {
          set((state) => ({
            eventStore: {
              ...state.eventStore,
              [message.resource_id]: message.data,
            },
          }));
        },
        "static": (message: WsMessageItem) => {
          set((_) => ({
            staticStore: message.data,
          }));
        },
        "gui": (message: WsMessageItem) => {
          set((_) => ({
            guiStore: message.data,
          }));
        },
        "setup_toml": (message: WsMessageItem) => {
          set((_) => ({
            updateStore: message.data,
          }));
        },
      };

      const callbackDict = {
        "config_list": (message: WsMessageItem) => {
          set((state) => {
            const config_added = Object.fromEntries(message.data.map((id) => [id, {}]));
            const statusStore = Object.fromEntries(message.data.map((id) => {
              if (id in state.statusStore) return [id, state.statusStore[id]];
              return [id, {}];
            }));
            const event_added = Object.fromEntries(message.data.map((id) => [id, []]));
            const log_added = Object.fromEntries(
              message.data.map((id) => {
                const key = `config:${id}`;
                return [key, state.logStore[key] ?? []];
              })
            );
            return {
              configStore: {...state.configStore, ...config_added},
              eventStore: {...state.eventStore, ...event_added},
              logStore: {...state.logStore, ...log_added},
              statusStore: {...state.statusStore, ...statusStore},
            };
          });
        },

        "snapshot": (message: WsMessageItem) => {
          resourceCallBack[message.resource](message);
        },

        "logs_full": (message: WsMessageItem) => {
          const scopes = message.scopes;
          const log_added: { [key: string]: LogItem[] } = Object.fromEntries(scopes.map((id) => [id, []]));
          const entries = message.entries;
          entries.forEach((e: RawLogItem) => {
            const info = {
              time: e.time,
              level: e.level,
              message: e.message
            }
            log_added[e.scope].push(info)
            if (e.scope == 'global') appendGlobalLog(info)
          })
          set(_ => {
            return {logStore: log_added}
          })
        },
        "log": (message: WsMessageItem) => {
          const data = message.entry;
          const info = {
            time: data.time,
            level: data.level,
            message: data.message,
          };

          set((state) => {
            const prevLogs = state.logStore[data.scope] ?? [];
            return {
              logStore: {
                ...state.logStore,
                [data.scope]: [...prevLogs, info], // ✅ 返回新数组
              },
            };
          });
          if (data.scope == 'global') appendGlobalLog(info)
        },
        "status": (message: WsMessageItem) => {
          const data = message.status;
          if (typeof data === "string") return
          if ("all_data_initialized" in data) {
            set(state => ({...state, _all_data_initialized: true}));
          } else {
            let k0 = Object.keys(data)[0];
            if (typeof data[k0] === "object" && "config_id" in data[k0]) {
              Object.keys(data).forEach((key) => {
                set(state => ({
                  statusStore: {
                    ...state.statusStore,
                    [key]: {
                      ...(state.statusStore[key] ?? {}),
                      ...(data[key] as StatusItem)
                    }
                  }
                }));
              });
            } else {
              set(state => ({
                statusStore: {
                  ...state.statusStore,
                  [data.config_id]: (data as WrappedStatusItem).status
                }
              }));
            }
          }
        },
        "command_response": (message: WsMessageItem) => {
          const {timestamp, command, data, status} = message;

          const cb = get().pendingCallbacks[timestamp];
          if (cb) {
            cb({command, data, status});
            delete get().pendingCallbacks[timestamp];
          } else {
            console.warn("CallBack Not Found:", message);
          }
        },

        "patch": (message: WsMessageItem) => {
          const ops = message.ops;
          const resource = message.resource;
          if (resource === "gui") return;
          const resource_id = message.resource_id ?? null;
          if (!resource_id) return;

          if (Array.isArray(ops)) {
            ops.forEach((op) => {
              const path = `${resource_id}::${resource}${op.path}`;
              let value = op.value;
              get().patch(path, value);
            });
          } else {
            console.error("Invalid patch message:", message);
          }
        },

        "patch_ack": (message: WsMessageItem) => {
          const {timestamp} = message;
          const cb = get().pendingCallbacks[timestamp];
          if (cb) {
            cb();
            delete get().pendingCallbacks[timestamp];
          } else {
            console.warn("CallBack Not Found:", message);
          }
        },

        "heartbeat": (message: WsMessageItem) => {
          const {timestamp} = message;
          set(state => ({...state, _heartbeat_time: timestamp}));
        }
      };
      const ws = new SecureWebSocket(url, SECRET, name);
      await ws.connect((msg) => {
        try {
          const message = JSON.parse(msg) as WsMessageItem;
          callbackDict[message.type]?.(message);
        } catch (err) {
          console.error("Message parse error:", err, msg);
        }
      });

      ws.onClose = () => {
        set((state) => {
          const next = {...state.connections};
          delete next[name];
          return {connections: next};
        });
      };

      ws.onError = (e) => console.error("Socket error:", e);

      set((state) => ({
        connections: {...state.connections, [name]: ws},
      }));
    },


    disconnect: (name: WsName) => {
      const conn = get().connections[name];
      if (conn) {
        (conn as any).ws?.close();
        set((state) => {
          const next = {...state.connections};
          delete next[name];
          return {connections: next};
        });
      }
    },

    send: (name: WsName, data: any) => {
      const conn = get().connections[name];
      if (conn) conn.sendJson(data);
    },

    init: async () => {
      if (get()._initiating) return;
      set(state => ({...state, _initiating: true}));
      await connectWithRetry("heartbeat");

      await connectWithRetry("provider")
      // await pause(Infinity)
      // Sync Stage Init
      await connectWithRetry("sync")

      get().send("sync", {type: "pull", resource: "static"});
      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => Object.keys(s.staticStore).length,
        (len) => len > 0
      );

      get().send("sync", {type: "pull", resource: "gui"});
      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => Object.keys(s.guiStore).length,
        (len) => len > 0
      );

      get().send("sync", {type: "pull", resource: "setup_toml"});
      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => Object.keys(s.updateStore).length,
        (len) => len > 0
      );

      get().send("sync", {type: "list"});

      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => Object.keys(s.configStore).length,
        (len) => len > 0
      );

      Object.keys(get().configStore).forEach((key: string) => {
        get().send("sync", {type: "pull", resource: "config", resource_id: key});
      });

      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => Object.keys(s.eventStore).length,
        (len) => len > 0
      );

      Object.keys(get().configStore).forEach((key: string) => {
        get().send("sync", {type: "pull", resource: "event", resource_id: key});
      });

      await connectWithRetry("trigger");

      await waitFor(
        get,
        api.subscribe,
        (s: WebSocketState) => s._all_data_initialized,
        (status) => status
      );
      set(state => ({...state, _initiating: false}));
    },

    patch: (path: string, patch: any) => {
      const [resourceId, scopeRaw] = path.split("::");
      const [scope, ...keys] = scopeRaw.split("/");

      set((state) => {
        let storeKey: keyof WebSocketState;
        // 确定目标 store
        switch (scope) {
          case "config":
            storeKey = "configStore";
            break;
          case "event":
            storeKey = "eventStore";
            break;
          case "gui":
            storeKey = "guiStore";
            break;
          case "setup_toml":
            storeKey = "updateStore";
            break;
          default:
            throw new Error(`Unknown resource scope: ${scope}`);
        }

        const store = state[storeKey] as Record<string, any>;
        const prev = store?.[resourceId] ?? {};

        if (!(keys[0] in prev) && patch === undefined) {
          return; // No change
        }

        let base = {...prev};
        // 直接更新指定的字段
        if (keys.length === 0 || (keys.length === 1 && keys[0] === "")) base = patch;
        else {
          let current = base;
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }

          const lastKey = keys[keys.length - 1];
          current[lastKey] = patch;
        }
        if (resourceId === "global")
          return {
            [storeKey]: {
              ...store,
              ...base
            }
          };
        else
          return {
            [storeKey]: {
              ...store,
              [resourceId]: base
            }
          };
      });
    },


    modify: (path: string, patch: any) => {
      const [resourceId, scope] = path.split("::");
      const timestamp = getTimestampMs();
      const ops = isPlainObject(patch) ?
        Object.entries(patch).map(([key, value]) => ({
          op: "replace",
          path: `/${key}`,
          value: value
        }))
        :
        [{
          op: "replace",
          path: "/",
          value: patch
        }]
      get().pendingCallbacks[timestamp] = () => {
        toast.success(t("settings.updateSuccess"), {
          description: t("settings.updateSuccessDesc"),
        })
      };
      get().send("sync", {
        type: "patch",
        resource_id: resourceId,
        resource: scope,
        timestamp: timestamp,
        ops: ops
      });
    },

    trigger: (payload, callback) => {
      const timestamp = payload.timestamp || Date.now();
      if (callback) {
        get().pendingCallbacks[timestamp] = callback;
      }
      get().send("trigger", {
        type: "command",
        timestamp,
        ...payload,
      });
    }

  }))
);

