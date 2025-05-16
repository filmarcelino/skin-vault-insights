
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomeScreenPopup } from "@/components/ui/home-screen-popup";
import MaintenancePage from "./pages/MaintenancePage";
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
import SearchPage from "./pages/Search";
import AdminConsole from "./pages/AdminConsole";

// Set up React Query with 15 minutes staleTime for better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    },
  },
});

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <CurrencyProvider>
              <SubscriptionProvider>
                <div className="min-h-screen bg-background text-foreground antialiased">
                  <Toaster />
                  <Sonner />
                  <HomeScreenPopup />
                  <BrowserRouter>
                    <Routes>
                      {/* Maintenance page as the main route */}
                      <Route path="*" element={<MaintenancePage />} />
                      
                      {/* Admin-only access to authentication during maintenance */}
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                    </Routes>
                  </BrowserRouter>
                </div>
              </SubscriptionProvider>
            </CurrencyProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
