
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import AddSkin from "./pages/AddSkin";
import ResetPassword from "./pages/ResetPassword";
import Subscription from "./pages/Subscription";
import Learn from "./pages/Learn";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import RequireAuth from "./components/auth/require-auth";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "./components/ui/sonner";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route
                path="/inventory"
                element={
                  <RequireAuth>
                    <Inventory />
                  </RequireAuth>
                }
              />
              <Route
                path="/analytics"
                element={
                  <RequireAuth>
                    <Analytics />
                  </RequireAuth>
                }
              />
              <Route
                path="/add-skin"
                element={
                  <RequireAuth>
                    <AddSkin />
                  </RequireAuth>
                }
              />
              <Route
                path="/subscription"
                element={
                  <RequireAuth>
                    <Subscription />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
          <SonnerToaster />
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
