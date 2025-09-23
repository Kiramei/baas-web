import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '../components/ui/Card';
import {useTheme} from '../hooks/useTheme';
import type {Theme} from '../lib/types.ts';
import {useApp} from "@/contexts/AppContext.tsx";
import {FormSelect} from "@/components/ui/FormSelect.tsx";

const SettingsPage: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {theme, setTheme} = useTheme();
  const {uiSettings} = useApp();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const [localZoom, setLocalZoom] = useState(uiSettings?.zoomScale ?? 100);

// 当全局 uiSettings 改变时，同步回本地
  useEffect(() => {
    if (uiSettings?.zoomScale !== undefined) {
      setLocalZoom(uiSettings.zoomScale);
    }
  }, [uiSettings?.zoomScale]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newZoom = Number(e.target.value);
    setLocalZoom(newZoom);                // 立即更新UI
    uiSettings.zoomScale = parseInt(e.target.value);
  };


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('settings')}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t('uiSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{t('theme')}</label>
            <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['light', 'dark', 'system'] as Theme[]).map((value) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    theme === value ? 'bg-white dark:bg-slate-700 shadow' : 'hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Settings */}
          <FormSelect
            value={i18n.language}
            label={t('language')}
            onChange={handleLanguageChange}
            options={[
              {value: "en", label: t('english')},
              {value: "zh", label: t('chinese')}
            ]}
          />

          {/* Zoom Settings */}
          <div>
            <label htmlFor="zoom-select"
                   className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{t('ui.zoom')}</label>
            <select
              id="zoom-select"
              value={uiSettings?.zoomScale}
              onChange={handleZoomChange}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {
                Object.entries([
                  50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150
                ]).map(([_, value]) => (
                  <option key={value} value={value}>{value}%</option>
                ))
              }
            </select>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
