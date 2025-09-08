
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import type { AppSettings } from '../lib/types.ts';

interface ServerConfigProps {
  onClose: () => void;
}

const ServerConfig: React.FC<ServerConfigProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeProfile, saveProfile } = useApp();
  
  const [settings, setSettings] = React.useState<Partial<AppSettings>>(activeProfile?.settings || {});

  React.useEffect(() => {
    setSettings(activeProfile?.settings || {});
  }, [activeProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value }));
  };
  
  const handleSave = async () => {
      if(activeProfile) {
          const updatedProfile = { 
            ...activeProfile, 
            settings: {
              ...activeProfile.settings,
              ...settings
            } as AppSettings 
          };
          await saveProfile(updatedProfile);
          onClose();
      }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="server" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          {t('server.server')}
        </label>
        <select
          id="server"
          name="server"
          value={settings.server || 'CN'}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="CN">{t('server.cn')}</option>
          <option value="Global">{t('server.global')}</option>
          <option value="JP">{t('server.jp')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="adbIP" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          {t('server.adbIP')}
        </label>
        <input
          id="adbIP"
          name="adbIP"
          type="text"
          value={settings.adbIP || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="127.0.0.1"
        />
      </div>

      <div>
        <label htmlFor="adbPort" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          {t('server.adbPort')}
        </label>
        <input
          id="adbPort"
          name="adbPort"
          type="text"
          value={settings.adbPort || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="16384"
        />
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default ServerConfig;
