import React from 'react';
import {useTranslation} from 'react-i18next';
import {Home, ListChecks, SlidersHorizontal, Settings, BookOpenText, ArrowBigUpDash} from 'lucide-react';
import HeartbeatChart, {HeartbeatIndicator} from "@/components/HeartbeatDiv.tsx";
import {motion} from "framer-motion";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({activePage, setActivePage}) => {
  const {t} = useTranslation();

  const navItems = [
    {id: 'home', label: t('home'), icon: Home},
    {id: 'scheduler', label: t('scheduler'), icon: ListChecks},
    {id: 'configuration', label: t('configuration'), icon: SlidersHorizontal},
    {id: 'settings', label: t('settings'), icon: Settings},
    {id: 'wiki', label: t('wiki'), icon: BookOpenText},
  ];

  return (
    <div className="relative">
      {/* 侧边栏 - 桌面端 */}
      <aside
        className="w-64 h-full flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-col lg:block hidden">
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

        <nav className="flex-1 px-4 py-6 h-[calc(100%-64px)] flex flex-col">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                {item.id === 'settings' && (
                  <hr key={item.id + 'hr'} className="border-[1px] border-slate-300 dark:border-slate-500"/>
                )}
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center w-full px-4 py-3 my-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activePage === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3"/>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex-grow"/>
          <button
            className="flex flex-row items-center justify-center p-4 bg-red-100/50 hover:bg-red-100/90 dark:bg-red-900/50 hover:dark:bg-red-900/90 w-full rounded-xl self-start mb-2 transition">
            <ArrowBigUpDash className="text-red-500"/>
            <div className="ml-2 text-sm font-bold rounded-lg text-red-500">
              {t("update.available")}
            </div>
            <div className="flex-grow"/>
          </button>

          <HeartbeatChart/>
        </nav>

      </aside>

      {/* 手机端底部导航栏 */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center py-2 px-4 z-49">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center w-full text-sm font-medium py-2 ${
              activePage === item.id
                ? 'text-primary-500'
                : 'text-slate-600 dark:text-slate-300 hover:text-primary-500'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1"/>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
