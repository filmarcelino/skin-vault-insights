
import { FC, ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-16">
        <Header />
        <main className="container pb-20 md:pb-8 pt-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
