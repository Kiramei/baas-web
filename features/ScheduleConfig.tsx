
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import type { AppSettings } from '../lib/types.ts';

interface ScheduleConfigProps {
  onClose: () => void;
}

const ScheduleConfig: React.FC<ScheduleConfigProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeProfile, saveProfile } = useApp();

  const [settings, setSettings] = useState<Partial<AppSettings>>(activeProfile?.settings || {});

  useEffect(() => {
    setSettings(activeProfile?.settings || {});
  }, [activeProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    if (activeProfile) {
      const updatedProfile = {
        ...activeProfile,
        settings: { ...activeProfile.settings, ...settings } as AppSettings,
      };
      await saveProfile(updatedProfile);
      onClose();
    }
  };
  
  // FIX: Explicitly type scheduleTasks as an array of string keys from AppSettings
  // This ensures `taskKey` is treated as a string, fixing errors with `.replace` and string-only props.
  const scheduleTasks: Extract<keyof AppSettings, string>[] = [
    'schedule_cafe',
    'schedule_lessons',
    'schedule_bounty',
    'schedule_commissions',
    'schedule_shop',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{t('schedule.title')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('schedule.desc')}</p>
      </div>
      
      <div className="space-y-4">
        {scheduleTasks.map(taskKey => (
          <div key={taskKey} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <label htmlFor={taskKey} className="text-slate-700 dark:text-slate-200 font-medium">
              {t(taskKey.replace('_', '.'))}
            </label>
            <input 
              id={taskKey}
              name={taskKey}
              type="checkbox" 
              className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              checked={settings[taskKey] ?? true}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default ScheduleConfig;
