import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef} from 'react';
import type {ConfigProfile, SchedulerStatus, Asset, LogEntry, AppSettings, UISettings} from '@/lib/types.ts';

import api from '@/services/api';
import {GlobalSelectProvider} from "@/components/ui/select-global"

// type
import {useWebSocketStore} from "@/store/websocketStore.ts";
import {StorageUtil} from "@/lib/storage.ts";

interface AppContextType {
  profiles: ConfigProfile[];
  activeProfile: ConfigProfile | null;
  setActiveProfile: (profile: ConfigProfile | null) => void;

  logs: LogEntry[];
  uiSettings: UISettings;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  const [scriptRunning, setScriptRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assets, setAssets] = useState<Asset | null>(null);

  const [uiSettings, setUiSettings] = useState<UISettings | null>(null);

  configRes.read()

  const configStore = useWebSocketStore((s) => s.configStore);

  const pollMs = 1
  // 保存上次值以做浅比较，避免无变化 setState
  const prevRef = useRef({
    schedulerStatus: null as any,
    scriptRunning: false,
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
        const newAssets = await api.getAssets();
        setAssets(newAssets);
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

  const value = {
    profiles,
    activeProfile,
    setActiveProfile,
    logs,

    uiSettings
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
