
export interface ConfigProfile {
  id: string;
  name: string;
  settings: AppSettings;
  // Add other profile-specific data here
}

export interface AppSettings {
  server: 'CN' | 'Global' | 'JP';
  adbIP: string;
  adbPort: string;
  open_emulator_stat: boolean;
  cafe_use_invitation?: boolean;
  cafe_pat_rounds?: number;

  // Schedule Tasks
  schedule_cafe?: boolean;
  schedule_lessons?: boolean;
  schedule_bounty?: boolean;
  schedule_commissions?: boolean;
  schedule_shop?: boolean;

  // Shop
  shop_buy_ap?: boolean;
  shop_refresh_ap?: boolean;

  // Arena
  arena_enabled?: boolean;
  arena_attempts?: number;

  // Emulator
  emulator_path?: string;
  
  // Push
  push_enabled?: boolean;
  push_webhook_url?: string;
  
  // Other
  screenshot_on_error?: boolean;

  // ... other settings from the python config
  [key: string]: any; 
}

export interface UISettings {
  lang: string;
  theme: string;

  startupWidth: number;
  startupHeight: number;
  zoomScale: number;

  scrollToEnd: boolean;

}

export type Theme = 'light' | 'dark' | 'system';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface SchedulerStatus {
  runningTask: string | null;
  taskQueue: string[];
}

export interface Asset {
  ap: { count: number; max: number; time: number };
  creditpoints: { count: number; time: number };
  pyroxene: { count: number; time: number };
  [key: string]: { count: any; max?: any; time: number };
}

export type ProfileProps = {
  profileId?: string;
};
