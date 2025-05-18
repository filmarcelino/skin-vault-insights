
import { FC, ReactNode } from "react";
import { Header } from "./header";
import { TopNav } from "./top-nav";
import { MobileNav } from "@/components/ui/mobile-nav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TopNav />
      <div className="flex-1">
        <div className="flex-1 overflow-auto pb-20 md:pb-6">
          <main className="max-w-6xl mx-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
