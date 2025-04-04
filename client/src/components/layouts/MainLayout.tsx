import { ReactNode } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-dark-50">
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
            className="bg-primary-600 text-white p-3 rounded-full shadow-lg"
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
