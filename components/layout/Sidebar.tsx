
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, ListChecks, SlidersHorizontal, Settings, GitBranch } from 'lucide-react';

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'scheduler', label: t('scheduler'), icon: ListChecks },
    { id: 'configuration', label: t('configuration'), icon: SlidersHorizontal },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'updates', label: t('updates'), icon: GitBranch },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
    <div className="h-16 flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
      {/* 左侧 title */}
      <img
        src="/assets/images/logo.png"
        alt="Logo"
        className="h-8 w-8"
      />

      {/* 中间主标题 */}
      <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex-1 text-start ml-2">
        {t('appTitle')}
      </h1>
    </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map(item => (
              <li key={item.id}>
                {item.id == 'settings' && <hr key={item.id + "hr"} className="border-[1px] border-slate-300 dark:border-slate-500" />}
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center w-full px-4 py-3 my-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activePage === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </button>
              </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
