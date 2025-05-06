
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import AddSkin from "./pages/AddSkin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/auth/require-auth";
import Landing from "./pages/Landing";

// Configuração do React Query para 15 minutos de staleTime em vez de 5 minutos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutos
      retry: 1,
    },
  },
});

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CurrencyProvider>
            <div className="min-h-screen bg-background text-foreground antialiased">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <Layout><Index /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/inventory" element={
                    <RequireAuth>
                      <Layout><Inventory /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/add" element={
                    <RequireAuth>
                      <Layout><AddSkin /></Layout>
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
          </CurrencyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
