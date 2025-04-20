
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthProvider, CurrencyUpdateProvider } from "@/contexts/AuthContext";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddSkin from "./pages/AddSkin";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import RequireAuth from "./components/auth/require-auth";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import { useState } from "react";

// Configuração do React Query para 15 minutos de staleTime em vez de 5 minutos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutos
      retry: 1,
    },
  },
});

// Componente wrapper para resolver dependência circular
const AppWithProviders = () => {
  // Esta é uma implementação intermediária para resolver a dependência circular
  const [currencyUpdater, setCurrencyUpdater] = useState(null);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CurrencyUpdateProvider updater={currencyUpdater}>
          <AuthProvider>
            <CurrencyProviderWithUpdater setUpdater={setCurrencyUpdater}>
              <div className="min-h-screen bg-background text-foreground antialiased">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      <RequireAuth>
                        <Layout><Index /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/inventory" element={
                      <RequireAuth>
                        <Layout><Inventory /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/more" element={
                      <RequireAuth>
                        <Layout><Index activeTab="inventory" /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/add" element={
                      <RequireAuth>
                        <Layout><AddSkin /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/search" element={
                      <RequireAuth>
                        <Layout><Index activeTab="search" /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/analytics" element={
                      <RequireAuth>
                        <Layout><Analytics /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/profile" element={
                      <RequireAuth>
                        <Layout><Profile /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/settings" element={
                      <RequireAuth>
                        <Layout><Settings /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="/subscription" element={
                      <RequireAuth>
                        <Layout><Subscription /></Layout>
                      </RequireAuth>
                    } />
                    <Route path="*" element={<Layout><NotFound /></Layout>} />
                  </Routes>
                </BrowserRouter>
              </div>
            </CurrencyProviderWithUpdater>
          </AuthProvider>
        </CurrencyUpdateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Componente intermediário para conectar os dois contextos
const CurrencyProviderWithUpdater = ({ 
  children, 
  setUpdater 
}: { 
  children: React.ReactNode;
  setUpdater: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const currencyContextValue = useCurrency();
  
  // Registrar o atualizador de moeda quando o contexto estiver disponível
  useState(() => {
    if (currencyContextValue) {
      setUpdater({
        setCurrency: currencyContextValue.setCurrency
      });
    }
  });
  
  return children;
};

// Componente principal App que inicializa o CurrencyProvider
const App = () => {
  console.log("App component rendering");
  
  return (
    <CurrencyProvider>
      <AppWithProviders />
    </CurrencyProvider>
  );
};

export default App;
