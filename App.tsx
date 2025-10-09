import React, {Suspense, useEffect, useRef, useState} from 'react';
import {AppProvider} from '@/contexts/AppContext';
import {ThemeProvider} from '@/hooks/useTheme';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage';
import SchedulerPage from '@/pages/SchedulerPage';
import ConfigurationPage from '@/pages/ConfigurationPage';
import SettingsPage from '@/pages/SettingsPage';
import UpdatesPage from '@/pages/UpdatesPage';
import type {Variants} from 'framer-motion';
import {motion} from 'framer-motion';
import {useApp} from '@/contexts/AppContext'; // ⬅️ 新增：拿到 activeProfile
import {LoadingPage} from './pages/LoadingPage';
import {Toaster} from "sonner";

const variants: Variants = {
  show: {
    opacity: 1,
    x: 0,
    display: 'block' as const,
    transition: {type: 'tween' as const, duration: 0.2, ease: 'easeOut' as const}
  },
  hide: {
    opacity: 0,
    x: -24,
    transition: {type: 'tween' as const, duration: 0.2, ease: 'easeOut' as const},
    transitionEnd: {display: 'none'}
  },
};

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);

  return (
    <>
      <ThemeProvider>

        {!hideLoading && (
          <motion.div
            initial={false}
            animate={{opacity: ready ? 0 : 1}}
            transition={{duration: 0.2}}
            onAnimationComplete={(definition) => {
              // definition 就是本次动画的属性，例如 { opacity: 0 }
              if (ready && (definition as any).opacity === 0) {
                setHideLoading(true); // 动画到 0 后卸载
              }
            }}
            className="fixed inset-0 z-[100]"
          >
            <LoadingPage/>
          </motion.div>
        )}

        <Suspense fallback={null}>
          <AppProvider setReady={setReady}>
            {ready && (
              <>
                <Main/>
                <Toaster/>
              </>
            )}
          </AppProvider>
        </Suspense>
      </ThemeProvider>
    </>
  );
};


type PageKey = 'home' | 'scheduler' | 'configuration' | 'settings' | 'updates';

// 计算“实例键”：三页带 profileId，其他页不带
const instanceKeyOf = (page: PageKey, pid?: string) =>
  page === 'home' || page === 'scheduler' || page === 'configuration'
    ? `${page}:${pid ?? 'none'}`
    : page;

// 反解实例键 -> [page, pid]
const parseInstanceKey = (k: string): [PageKey, string | undefined] => {
  if (k.includes(':')) {
    const [p, pid] = k.split(':');
    return [p as PageKey, pid];
  }
  return [k as PageKey, undefined];
};

const Main: React.FC = () => {
  const [activePage, setActivePage] = React.useState<PageKey>('home');

  // ⬇️ 新增：拿当前激活配置 id
  const {activeProfile} = useApp();

  const activePid = activeProfile.id;
  // ✅ 初始化保活集合用“实例键”，而非仅页面名
  const seenKeysRef = React.useRef<Set<string>>(
    new Set([instanceKeyOf('home', activePid)]) // 初始保活 Home:当前配置
  );

  // 每次页面或配置切换，把当前实例加入保活集合
  React.useEffect(() => {
    seenKeysRef.current.add(instanceKeyOf(activePage, activePid));
  }, [activePage, activePid]);

  // 用函数映射生成页面（便于按 pid 渲染实例；需要的话可把 pid 作为 prop 传进页面）
  const renderPage = React.useCallback((page: PageKey, pid: string) => {
    switch (page) {
      case 'home':
        return <HomePage profileId={pid}/>; // 如需按配置取数，可给三页加 profileId prop
      case 'scheduler':
        return <SchedulerPage profileId={pid}/>;
      case 'configuration':
        return <ConfigurationPage profileId={pid}/>;
      case 'settings':
        return <SettingsPage/>;
      case 'updates':
        return <UpdatesPage/>;
      default:
        return <></>;
    }
  }, []);

  // 当前激活实例键
  const activeInstanceKey = instanceKeyOf(activePage, activePid);

  return (
    <MainLayout activePage={activePage} setActivePage={setActivePage}>
      {/* 外层容器固定尺寸，内部页面叠放 */}
      <div className="relative flex-1 min-h-0 overflow-hidden scroll-embedded h-[calc(100%-70px)] lg:h-full">
        {/* ⬇️ 用“已见实例键”来渲染，确保同一页面不同配置能各自保活 */}
        {Array.from(seenKeysRef.current).map((instKey) => {
          const [page, pid] = parseInstanceKey(instKey);
          const isActive = instKey === activeInstanceKey;
          return (
            <motion.div
              key={instKey} // ⬅️ 关键：实例键作为 key，区分不同配置的同一页面
              className="absolute inset-0 overflow-y-auto scroll-embedded pr-2 "
              variants={variants}
              initial={isActive ? 'show' : 'hide'}
              animate={isActive ? 'show' : 'hide'}
              style={{pointerEvents: isActive ? 'auto' : 'none'}}
              aria-hidden={!isActive}
            >
              {renderPage(page, pid)}
            </motion.div>
          );
        })}
      </div>
    </MainLayout>
  );
};

export default App;
