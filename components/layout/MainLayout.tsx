
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

type PageKey = 'home' | 'scheduler' | 'configuration' | 'settings' | 'updates';


interface MainLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: PageKey) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex h-screen w-screen text-slate-800 dark:text-slate-200">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
