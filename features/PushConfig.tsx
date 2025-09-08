
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import type { AppSettings } from '../lib/types.ts';

interface PushConfigProps {
  onClose: () => void;
}

const PushConfig: React.FC<PushConfigProps> = ({ onClose }) => {
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
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{t('push.title')}</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <label htmlFor="push_enabled" className="text-slate-700 dark:text-slate-200 font-medium">
            {t('push.enable')}
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('push.enableDesc')}</p>
        </div>
        <input 
          id="push_enabled"
          name="push_enabled"
          type="checkbox" 
          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          checked={settings.push_enabled ?? false}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="push_webhook_url" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('push.webhookUrl')}
        </label>
        <input 
          id="push_webhook_url"
          name="push_webhook_url"
          type="text" 
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
          value={settings.push_webhook_url ?? ''}
          onChange={handleChange}
          placeholder={t('push.webhookUrlPlaceholder')}
          disabled={!settings.push_enabled}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default PushConfig;
