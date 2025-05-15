
import { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { TopNav } from "./top-nav";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <TopNav />
      <div className="flex-1">
        <div className={`flex-1 overflow-auto ${isMobile ? 'pb-24' : 'pb-6'}`}>
          <main className="max-w-6xl mx-auto p-4 md:p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <MobileNav />
      </div>
    </div>
  );
};
