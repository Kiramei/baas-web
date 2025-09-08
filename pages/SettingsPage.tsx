
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../lib/types.ts';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
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
          <div>
             <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{t('language')}</label>
             <select
                id="language-select"
                value={i18n.language}
                onChange={handleLanguageChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
             >
                <option value="en">{t('english')}</option>
                <option value="zh">{t('chinese')}</option>
             </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
