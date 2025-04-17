
import { FC, ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { MobileNav } from "@/components/ui/mobile-nav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <CurrencyProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 pl-6 md:pl-24 overflow-auto pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </CurrencyProvider>
  );
};
