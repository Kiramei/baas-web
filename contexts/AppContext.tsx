import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import type {ConfigProfile, UISettings} from '@/types/app';
import {GlobalSelectProvider} from "@/components/ui/select-global"
import {useWebSocketStore} from "@/store/websocketStore.ts";

import {StorageUtil} from "@/lib/storage.ts";

interface AppContextType {
  uiSettings: UISettings;
  profiles: ConfigProfile[];
  activeProfile: ConfigProfile | null;
  setActiveProfile: (profile: ConfigProfile | null) => void;
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

  const [uiSettings, setUiSettings] = useState<UISettings | null>(null);

  configRes.read()

  const configStore = useWebSocketStore((s) => s.configStore);

  useEffect(() => {
    setUiSettings({
      "lang": "",
      "theme": "",
      "startupWidth": 1280,
      "startupHeight": 720,
      "zoomScale": 100,
      "scrollToEnd": true
    });
  }, []);


  useEffect(() => {
    const list = Object.keys(configStore).map((key) => ({
      id: key,
      name: configStore[key].name,
      settings: configStore[key],
    }));

    if (list.length > 0 && !activeProfile) {
      (async () => {
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
      })();
    }

    setProfiles(list);
  }, [configStore]);

  useEffect(() => {
    setReady(true);
  }, []);

  const value = {
    profiles,
    uiSettings,
    activeProfile,
    setActiveProfile
  };


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
