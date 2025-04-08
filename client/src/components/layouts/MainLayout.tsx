import { ReactNode } from 'react';

import { useIsMobile } from '@/hooks/use-mobile.js';

import Header from './Header.js';
import Sidebar from './Sidebar.js';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header />
      <div className="flex-1 flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-auto" role="main">
          {children}
        </main>
      </div>

      {/* Mobile menu button */}
      {isMobile && (
        <div className="fixed bottom-4 right-4">
          <button
            className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <i className="ri-menu-line" aria-hidden="true"></i>
          </button>
        </div>
      )}
    </div>
  );
}
