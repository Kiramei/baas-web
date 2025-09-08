
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import type { AppSettings } from '../lib/types.ts';

interface EmulatorConfigProps {
  onClose: () => void;
}

const EmulatorConfig: React.FC<EmulatorConfigProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeProfile, saveProfile } = useApp();

  const [settings, setSettings] = useState<Partial<AppSettings>>(activeProfile?.settings || {});

  useEffect(() => {
    setSettings(activeProfile?.settings || {});
  }, [activeProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{t('emulator.title')}</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
            <label htmlFor="open_emulator_stat" className="text-slate-700 dark:text-slate-200 font-medium">
            {t('emulator.autoStart')}
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('emulator.autoStartDesc')}</p>
        </div>
        <input 
          id="open_emulator_stat"
          name="open_emulator_stat"
          type="checkbox" 
          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          checked={settings.open_emulator_stat ?? true}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="emulator_path" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('emulator.path')}
        </label>
        <input 
          id="emulator_path"
          name="emulator_path"
          type="text" 
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          value={settings.emulator_path ?? ''}
          onChange={handleChange}
          placeholder="e.g., C:\\Program Files\\Nox\\bin\\Nox.exe"
        />
        <p className="text-sm text-slate-500">{t('emulator.pathDesc')}</p>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default EmulatorConfig;
