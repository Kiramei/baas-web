
import type { ConfigProfile, AppSettings, SchedulerStatus, LogEntry, Asset } from '../lib/types.ts';

// This file mocks the Tauri backend API.
// In a real Tauri app, you would replace these functions with `invoke` calls.

const MOCK_DELAY = 100;

let mockProfiles: ConfigProfile[] = [
  {
    id: 'default_config',
    name: '默认配置',
    settings: {
      server: 'CN',
      adbIP: '127.0.0.1',
      adbPort: '16384',
      open_emulator_stat: true,
    },
  },
  {
    id: 'second_config',
    name: '小号配置',
    settings: {
      server: 'JP',
      adbIP: '127.0.0.1',
      adbPort: '16400',
      open_emulator_stat: false,
    },
  },
];

let mockSchedulerStatus: SchedulerStatus = {
  runningTask: null,
  taskQueue: ['收集每日体力', '咖啡厅', '日程', '商店购买'],
};

let mockLogEntries: LogEntry[] = [
    { id: 1, timestamp: new Date().toISOString(), level: 'INFO', message: 'Application initialized.' },
  { id: 2, timestamp: new Date().toISOString(), level: 'INFO', message: 'Waiting for script to start.' }
];
let logIdCounter = 3;

let mockAssets: Asset = {
    ap: { count: 120, max: 120, time: Date.now() / 1000 - 60 },
    creditpoints: { count: 1500000, time: Date.now() / 1000 - 120 },
    pyroxene: { count: 24000, time: Date.now() / 1000 - 180 },
    tactical_challenge_coin: { count: 500, time: Date.now() / 1000 - 3600 },
};


const api = {
  getProfiles: async (): Promise<ConfigProfile[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockProfiles]), MOCK_DELAY));
  },

  saveProfile: async (profile: ConfigProfile): Promise<void> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const index = mockProfiles.findIndex(p => p.id === profile.id);
            if (index > -1) {
                mockProfiles[index] = profile;
            } else {
                mockProfiles.push(profile);
            }
            console.log('Saved profile:', profile);
            resolve();
        }, MOCK_DELAY)
     });
  },

  deleteProfile: async (profileId: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        mockProfiles = mockProfiles.filter(p => p.id !== profileId);
        console.log('Deleted profile:', profileId);
        resolve();
      }, MOCK_DELAY)
    });
  },

  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    return new Promise(resolve => setTimeout(() => resolve(mockSchedulerStatus), MOCK_DELAY));
  },
  
  getInitialLogs: async (): Promise<LogEntry[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockLogEntries]), 100));
  },
  
  getAssets: async (): Promise<Asset> => {
    // Simulate asset updates
    mockAssets.ap.count = Math.min(mockAssets.ap.max, mockAssets.ap.count + 5);
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockAssets))), MOCK_DELAY));
  },

  startScript: async (): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (mockSchedulerStatus.runningTask === null && mockSchedulerStatus.taskQueue.length > 0) {
                const nextTask = mockSchedulerStatus.taskQueue.shift()!;
                mockSchedulerStatus.runningTask = nextTask;
                const log: LogEntry = {id: logIdCounter++, timestamp: new Date().toISOString(), level: 'INFO', message: `Script started. Running task: ${nextTask}`};
                mockLogEntries.push(log);
                
                // Simulate task completion
                setTimeout(() => {
                    const completedTask = mockSchedulerStatus.runningTask;
                    mockSchedulerStatus.runningTask = null;
                    const log: LogEntry = {id: logIdCounter++, timestamp: new Date().toISOString(), level: 'INFO', message: `Task completed: ${completedTask}`};
                    mockLogEntries.push(log);
                    api.startScript(); // try to start next task
                }, 5000 + Math.random() * 3000);
                // }, 1000);
            } else if (mockSchedulerStatus.runningTask === null && mockSchedulerStatus.taskQueue.length === 0) {
                 const log: LogEntry = {id: logIdCounter++, timestamp: new Date().toISOString(), level: 'INFO', message: `All tasks completed.`};
                 mockLogEntries.push(log);
            }
            resolve();
        }, MOCK_DELAY)
    });
  },

  stopScript: async (): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if(mockSchedulerStatus.runningTask) {
                mockSchedulerStatus.taskQueue.unshift(mockSchedulerStatus.runningTask);
                mockSchedulerStatus.runningTask = null;
            }
             const log: LogEntry = {id: logIdCounter++, timestamp: new Date().toISOString(), level: 'WARN', message: `Script stopped by user.`};
             mockLogEntries.push(log);
            resolve();
        }, MOCK_DELAY)
    });
  },

};

export default api;
