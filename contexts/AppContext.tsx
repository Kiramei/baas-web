
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type {ConfigProfile, SchedulerStatus, Asset, LogEntry, AppSettings} from '@/lib/types.ts';
import api from '@/services/api';
import {
  listProfiles,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
  deleteProfile as apiDeleteProfile,
  reorderProfiles as apiReorderProfiles,
  type ServerCode,
  type ProfileDTO,
} from '@/services/profileService';


interface AppContextType {
  profiles: ConfigProfile[];
  activeProfile: ConfigProfile | null;
  setActiveProfile: (profile: ConfigProfile | null) => void;

  saveProfile: (profile: ConfigProfile) => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;

  createProfile: (payload: { name: string; server: ServerCode }) => Promise<ConfigProfile>;
  reorderProfiles: (idsInOrder: string[]) => Promise<void>;
  updateProfile: (id: string, patch: { name?: string; server?: ServerCode; settings?: any }) => Promise<void>;


  isLoading: boolean;
  scriptRunning: boolean;
  startScript: () => void;
  stopScript: () => void;
  schedulerStatus: SchedulerStatus;
  logs: LogEntry[];
  assets: Asset | null;

  refreshProfiles: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const toConfigProfile = (dto: ProfileDTO): ConfigProfile => ({
  id: dto.id,
  name: dto.name,
  settings: {
    server: dto.server as ServerCode,
    // 其余字段兜底，避免页面读取时报 undefined
    adbIP: '127.0.0.1',
    adbPort: '16384',
    open_emulator_stat: true,
  },
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ConfigProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ConfigProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [scriptRunning, setScriptRunning] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({ runningTask: null, taskQueue: [] });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assets, setAssets] = useState<Asset | null>(null);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const fetchedProfiles = await api.getProfiles();
    setProfiles(fetchedProfiles);
    if (fetchedProfiles.length > 0 && !activeProfile) {
      setActiveProfile(fetchedProfiles[0]);
    }
    setIsLoading(false);
  }, [activeProfile]);

  useEffect(() => {
    fetchProfiles();
    api.getInitialLogs().then(setLogs);
  }, [fetchProfiles]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await api.getSchedulerStatus();
      setSchedulerStatus(status);
      setScriptRunning(status.runningTask !== null);

      const newAssets = await api.getAssets();
      setAssets(newAssets);

      // A real app would use Tauri events for logs instead of polling
      const latestLogs = await api.getInitialLogs();
      setLogs(latestLogs);

    }, 1);
    return () => clearInterval(interval);
  }, []);

  const saveProfile = async (profile: ConfigProfile) => {
    await api.saveProfile(profile);
    fetchProfiles();
  };

  /** —— 配置：创建 —— */
  const createProfile = useCallback(async (payload: { name: string; server: ServerCode, settings: AppSettings }) => {
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
  const updateProfile = useCallback(async (id: string, patch: { name?: string; server?: ServerCode; settings?: any }) => {
    // 先打后端（只传 name/server；settings 若也要落库，可扩展你的 API）
    const { name, server } = patch;
    if (name !== undefined || server !== undefined) {
      await apiUpdateProfile(id, { name, server });
    }
    // 本地同步
    setProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p };
      if (name !== undefined) next.name = name;
      if (server !== undefined) next.settings = { ...next.settings, server };
      if (patch.settings) next.settings = { ...next.settings, ...patch.settings };
      return next;
    }));
    if (activeProfile?.id === id) {
      setActiveProfile(prev => prev ? {
        ...prev,
        name: patch.name ?? prev.name,
        settings: {
          ...prev.settings,
          ...(patch.server ? { server: patch.server } : {}),
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
    const newProfile: ConfigProfile = {
      id: `config_${Date.now()}`,
      name,
      settings: profiles[0]?.settings || { server: 'CN', adbIP: '127.0.0.1', adbPort: '16384', open_emulator_stat: true },
    };
    await api.saveProfile(newProfile);
    await fetchProfiles();
    setActiveProfile(newProfile);
  };

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await listProfiles();                           // 后端顺序即标签顺序
      const cfgs = list.map(toConfigProfile);
      setProfiles(cfgs);
      // 若当前无激活或已不存在，则切到第一项
      if (cfgs.length > 0 && !activeProfile) {
        setActiveProfile(cfgs[0]);
      } else if (activeProfile && !cfgs.find(p => p.id === activeProfile.id)) {
        setActiveProfile(cfgs[0] ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile]);

  // const deleteProfile = async (profileId: string) => {
  //   await api.deleteProfile(profileId);
  //   const remainingProfiles = profiles.filter(p => p.id !== profileId);
  //   setProfiles(remainingProfiles);
  //   if(activeProfile?.id === profileId) {
  //       setActiveProfile(remainingProfiles.length > 0 ? remainingProfiles[0] : null);
  //   }
  // };

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

    refreshProfiles,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
