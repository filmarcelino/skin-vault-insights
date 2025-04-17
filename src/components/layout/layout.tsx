
import { FC, ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

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
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </CurrencyProvider>
  );
};
