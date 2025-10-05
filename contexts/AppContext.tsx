import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef} from 'react';
import type {ConfigProfile, SchedulerStatus, Asset, LogEntry, AppSettings, UISettings} from '@/lib/types.ts';

import api from '@/services/api';
import {
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
  deleteProfile as apiDeleteProfile,
  reorderProfiles as apiReorderProfiles,
  type ProfileDTO,
} from '@/services/profileService';
import {GlobalSelectProvider} from "@/components/ui/select-global"

// type
import {StaticConfig, StaticConvert} from '@/lib/type.static.ts';
import {DynamicConfig, DynamicConvert} from '@/lib/type.dynamic.ts';
import {EventConfig, EventConvert} from '@/lib/type.event.ts';
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {StorageUtil} from "@/lib/storage.ts";

interface AppContextType {
  profiles: ConfigProfile[];
  activeProfile: ConfigProfile | null;
  setActiveProfile: (profile: ConfigProfile | null) => void;

  saveProfile: (profile: ConfigProfile) => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;

  createProfile: (payload: { name: string; server: string }) => Promise<ConfigProfile>;
  reorderProfiles: (idsInOrder: string[]) => Promise<void>;
  updateProfile: (id: string, patch: { name?: string; server?: string; settings?: any }) => Promise<void>;


  isLoading: boolean;
  scriptRunning: boolean;
  startScript: () => void;
  stopScript: () => void;
  schedulerStatus: SchedulerStatus;
  logs: LogEntry[];
  assets: Asset | null;
  uiSettings: UISettings;
  staticConfig: StaticConfig | null;
  eventConfigs: EventConfig[] | null;
  setEventConfigs: React.Dispatch<React.SetStateAction<EventConfig[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const toConfigProfile = (dto: ProfileDTO): ConfigProfile => ({
  id: dto.id,
  name: dto.name,
  settings: dto.settings
});

const fetchStatic = async (): Promise<any> => {
  // 这里假定静态文件放在 public/static.json
  const res = await fetch('/assets/_mock/static.json');
  if (!res.ok) throw new Error('Failed to fetch static config');
  return res.json();
};

const fetchEvent = async (): Promise<any> => {
  // 这里假定静态文件放在 public/static.json
  const res = await fetch('/assets/_mock/event.json');
  if (!res.ok) throw new Error('Failed to fetch event config');
  return res.json();
};


function createResource<T>(promise: Promise<T>) {
  let status = "pending";
  let result: T;
  let suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );
  return {
    read(): T {
      if (status === "pending") throw suspender;
      if (status === "error") throw result;
      return result!;
    },
  };
}

const init = useWebSocketStore.getState().init;
const configRes = createResource(init())


export const AppProvider: React.FC<{ children: ReactNode, setReady: (value: boolean) => void }> = (
  {
    children,
    setReady
  }
) => {
  const [profiles, setProfiles] = useState<ConfigProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ConfigProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [scriptRunning, setScriptRunning] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({runningTask: null, taskQueue: []});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assets, setAssets] = useState<Asset | null>(null);

  const [uiSettings, setUiSettings] = useState<UISettings | null>(null);

  const [staticConfig, setStaticConfig] = useState<StaticConfig | null>(null);
  const [eventConfigs, setEventConfigs] = useState<EventConfig[] | null>(null);

  configRes.read()

  const configStore = useWebSocketStore((s) => s.configStore);


  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const fetchedProfiles = await api.getProfiles();
    setProfiles(fetchedProfiles);
    if (fetchedProfiles.length > 0 && !activeProfile) {
      setActiveProfile(fetchedProfiles[0]);
    }
    setIsLoading(false);
  }, [activeProfile]);

  const pollMs = 1
  // 保存上次值以做浅比较，避免无变化 setState
  const prevRef = useRef({
    schedulerStatus: null as any,
    scriptRunning: false,
    assets: null as Asset,
    UISettings: {},
    logs: [] as LogEntry[],
  });

  const shallowEqual = (a: any, b: any) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!Object.is(a[k], (b as any)[k])) return false;
    return true;
  };

  useEffect(() => {
    let cancelled = false;
    let timer: any = null;

    const arrayShallowEqual = (a: any[], b: any[]) => {
      if (a === b) return true;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
      return true;
    };

    const tick = async () => {
      try {
        const status = await api.getSchedulerStatus();
        const running = status?.runningTask != null;

        if (!shallowEqual(status, prevRef.current.schedulerStatus)) {
          prevRef.current.schedulerStatus = status;
          setSchedulerStatus(status);
        }

        if (running !== prevRef.current.scriptRunning) {
          prevRef.current.scriptRunning = running;
          setScriptRunning(running);
        }

        const newAssets = await api.getAssets();
        if (!shallowEqual(newAssets, prevRef.current.assets)) {
          prevRef.current.assets = newAssets;
          setAssets(newAssets);
        }

        // （真的应用里建议用事件流而不是每次都“全量拉日志”）
        const latestLogs = await api.getInitialLogs();
        if (!arrayShallowEqual(latestLogs, prevRef.current.logs)) {
          prevRef.current.logs = latestLogs;
          setLogs(latestLogs);
        }
      } finally {
        if (!cancelled) timer = setTimeout(tick, pollMs);
      }
    };

    // 启动
    tick();


    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pollMs]);

  const enterMount = useRef(false)

  useEffect(() => {

    if (enterMount.current) return
    enterMount.current = true;

    const mount = async () => {
      const newUISettings = await api.getUISettings();
      setUiSettings(newUISettings);
      fetchStatic().then(data => {
        try {
          const config = StaticConvert.toStaticConfig(JSON.stringify(data));
          setStaticConfig(config);
        } catch (e) {
          console.error("Failed to parse static config:", e);
          return null;
        }
      });

      fetchEvent().then(data => {
        try {
          const config = EventConvert.toEventConfig(JSON.stringify(data));
          setEventConfigs(config);
        } catch (e) {
          console.error("Failed to parse static config:", e);
          return null;
        }
      });
    }
    mount().then(async () => {
      const list = Object.keys(configStore).map((key) => ({
        id: key,
        name: configStore[key].name,
        settings: configStore[key]
      }));
      const tabOrder = await StorageUtil.get<string[]>("tabOrder");
      if (tabOrder && tabOrder.length) {
        list.sort((a, b) => {
          const ia = tabOrder.indexOf(a.id);
          const ib = tabOrder.indexOf(b.id);
          if (ia === -1 && ib === -1) return 0;
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });
      }
      setActiveProfile(list[0]);
    })
  }, []);


  const saveProfile = async (profile: ConfigProfile) => {
    await api.saveProfile(profile);
    await fetchProfiles();
  };

  /** —— 配置：创建 —— */
  const createProfile = useCallback(async (payload: { name: string; server: string, settings: DynamicConfig }) => {
    // 重名校验（本地先卡一次，后端也应兜底）
    if (profiles.some(p => p.name.trim() === payload.name.trim())) {
      throw new Error('Name already exists');
    }
    const created = await apiCreateProfile(payload);
    const cfg = toConfigProfile(created);
    setProfiles(prev => [...prev, cfg]);
    setActiveProfile(cfg);
    return cfg;
  }, [profiles]);

  /** —— 配置：更新（改名/改服务器/或扩展 settings） —— */
  const updateProfile = useCallback(async (id: string, patch: {
    name?: string;
    server?: string;
    settings?: any
  }) => {
    // 先打后端（只传 name/server；settings 若也要落库，可扩展你的 API）
    const {name, server} = patch;
    if (name !== undefined || server !== undefined) {
      await apiUpdateProfile(id, {name, server});
    }
    // 本地同步
    setProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = {...p};
      if (name !== undefined) next.name = name;
      if (server !== undefined) next.settings = {...next.settings, server};
      if (patch.settings) next.settings = {...next.settings, ...patch.settings};
      return next;
    }));
    if (activeProfile?.id === id) {
      setActiveProfile(prev => prev ? {
        ...prev,
        name: patch.name ?? prev.name,
        settings: {
          ...prev.settings,
          ...(patch.server ? {server: patch.server} : {}),
          ...(patch.settings || {}),
        },
      } : prev);
    }
  }, [activeProfile]);

  /** —— 配置：删除（会自动切到相邻可用项） —— */
  const deleteProfile = useCallback(async (id: string) => {
    if (profiles.length <= 1) {
      throw new Error('Cannot delete the last profile');
    }
    await apiDeleteProfile(id);
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === id);
      const next = prev.filter(p => p.id !== id);
      // 若删的是当前激活，则跳到“相邻可用项”（优先右边，边界用左边）
      if (activeProfile?.id === id) {
        const neighbor = next[Math.max(0, Math.min(idx, next.length - 1))] ?? null;
        setActiveProfile(neighbor);
      }
      return next;
    });
  }, [profiles, activeProfile]);

  /** —— 配置：排序（浏览器式拖拽后调用） —— */
  const reorderProfiles = useCallback(async (idsInOrder: string[]) => {
    // 乐观更新
    const map = new Map(profiles.map(p => [p.id, p]));
    const next = idsInOrder.map(id => map.get(id)).filter(Boolean) as ConfigProfile[];
    setProfiles(next);
    try {
      await apiReorderProfiles(idsInOrder);
    } catch {
      // 失败可回滚（此处简单起见不回滚，也可以加个 toast）
    }
  }, [profiles]);


  const addProfile = async (name: string) => {
    // const newProfile: ConfigProfile = {
    //   id: `config_${Date.now()}`,
    //   name,
    //   settings: profiles[0]?.settings || {server: 'CN', adbIP: '127.0.0.1', adbPort: '16384', open_emulator_stat: true},
    // };
    // await api.saveProfile(newProfile);
    // await fetchProfiles();
    // setActiveProfile(newProfile);
  };


  const startScript = () => {
    api.startScript();
  };

  const stopScript = () => {
    api.stopScript();
  };

  const value = {
    profiles,
    activeProfile,
    setActiveProfile,

    createProfile,
    updateProfile,
    deleteProfile,
    reorderProfiles,

    saveProfile,
    addProfile,

    isLoading,

    scriptRunning,
    startScript,
    stopScript,
    schedulerStatus,
    logs,
    assets,

    uiSettings,
    staticConfig,
    eventConfigs,
    setEventConfigs,
  };

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <AppContext.Provider value={value}>
      <GlobalSelectProvider>
        {children}
      </GlobalSelectProvider>
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
