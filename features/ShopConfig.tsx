
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import type { AppSettings } from '../lib/types.ts';

interface ShopConfigProps {
  onClose: () => void;
}

const ShopConfig: React.FC<ShopConfigProps> = ({ onClose }) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{t('shop.title')}</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <label htmlFor="shop_buy_ap" className="text-slate-700 dark:text-slate-200 font-medium">
              {t('shop.buyAp')}
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('shop.buyApDesc')}</p>
          </div>
          <input 
            id="shop_buy_ap"
            name="shop_buy_ap"
            type="checkbox" 
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            checked={settings.shop_buy_ap ?? false}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <label htmlFor="shop_refresh_ap" className="text-slate-700 dark:text-slate-200 font-medium">
              {t('shop.refreshAp')}
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('shop.refreshApDesc')}</p>
          </div>
          <input 
            id="shop_refresh_ap"
            name="shop_refresh_ap"
            type="checkbox" 
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            checked={settings.shop_refresh_ap ?? false}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">{t('save')}</button>
      </div>
    </div>
  );
};

export default ShopConfig;
