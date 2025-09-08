// import React from 'react';
// import { AppProvider } from '@/contexts/AppContext';
// import { ThemeProvider } from '@/hooks/useTheme';
// import MainLayout from '@/components/layout/MainLayout';
// import HomePage from '@/pages/HomePage';
// import SchedulerPage from '@/pages/SchedulerPage';
// import ConfigurationPage from '@/pages/ConfigurationPage';
// import SettingsPage from '@/pages/SettingsPage';
// import UpdatesPage from '@/pages/UpdatesPage';
// import { motion } from 'framer-motion';
//
// const variants = {
//   show:  { opacity: 1, x: 0,   display: 'block', transition: { type: 'tween', duration: 0.2, ease: 'easeOut' } },
//   hide:  { opacity: 0, x: -24, transition: { type: 'tween', duration: 0.2, ease: 'easeOut' }, transitionEnd: { display: 'none' } },
// };
//
// const App: React.FC = () => (
//   <ThemeProvider>
//     <AppProvider>
//       <Main />
//     </AppProvider>
//   </ThemeProvider>
// );
//
// type PageKey = 'home' | 'scheduler' | 'configuration' | 'settings' | 'updates';
//
// const Main: React.FC = () => {
//   const [activePage, setActivePage] = React.useState<PageKey>('home');
//
//   // 记录访问过的页面，实现懒挂载 + 保活
//   const seenRef = React.useRef<Set<PageKey>>(new Set(['home']));
//   React.useEffect(() => { seenRef.current.add(activePage); }, [activePage]);
//
//   // 用稳定的 map 渲染，key 决定实例身份，确保不被重挂载
//   const pages = React.useMemo(() => ({
//     home:          <HomePage />,
//     scheduler:     <SchedulerPage />,
//     configuration: <ConfigurationPage />,
//     settings:      <SettingsPage />,
//     updates:       <UpdatesPage />,
//   }), []);
//
//   return (
//     <MainLayout activePage={activePage} setActivePage={setActivePage}>
//       {/* 外层容器固定尺寸，内部页面叠放 */}
//       <div className="relative flex-1 min-h-0 h-full overflow-hidden">
//         { (Object.keys(pages) as PageKey[]).map((key) => {
//           if (!seenRef.current.has(key)) return null;          // 未访问的不挂载
//           const isActive = key === activePage;
//           return (
//             <motion.div
//               key={key}
//               // 叠放且各自滚动，保证每页滚动位置独立保留
//               className="absolute inset-0 overflow-y-auto"
//               variants={variants}
//               initial={isActive ? 'show' : 'hide'}
//               animate={isActive ? 'show' : 'hide'}
//               // 禁用非激活页交互
//               style={{ pointerEvents: isActive ? 'auto' : 'none' }}
//               aria-hidden={!isActive}
//             >
//               {pages[key]}
//             </motion.div>
//           );
//         })}
//       </div>
//     </MainLayout>
//   );
// };
//
// export default App;
