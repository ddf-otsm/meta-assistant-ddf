import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-50 text-dark-800 font-sans">
      <Header />
      <div className="flex-1 flex">
        {!isMobile && <Sidebar />}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
      
      {/* Mobile menu button */}
      {isMobile && (
        <div className="fixed bottom-4 right-4">
          <button className="bg-primary-600 text-white p-3 rounded-full shadow-lg">
            <i className="ri-menu-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
