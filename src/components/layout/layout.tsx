
import { FC } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { TopNav } from "./top-nav";
import { MobileNav } from "@/components/ui/mobile-nav";

export const Layout: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TopNav />
      <div className="flex-1">
        <div className="flex-1 overflow-auto pb-20 md:pb-6">
          <main className="max-w-6xl mx-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};
