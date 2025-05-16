
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MainApp } from "@/components/MainApp";
import MaintenancePage from "@/components/MaintenancePage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// App maintenance state
const MAINTENANCE_MODE = false; // Set to true to show maintenance page

export default function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.info("App component rendering");
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent SSR hydration issues
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            {MAINTENANCE_MODE ? (
              <MaintenancePage />
            ) : (
              <AuthProvider>
                <SubscriptionProvider>
                  <CurrencyProvider>
                    <MainApp />
                    <Toaster position="bottom-right" />
                  </CurrencyProvider>
                </SubscriptionProvider>
              </AuthProvider>
            )}
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
