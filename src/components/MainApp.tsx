
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

// Lazy load pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Profile = lazy(() => import("@/pages/Profile"));
const Search = lazy(() => import("@/pages/Search"));
const AddSkin = lazy(() => import("@/pages/AddSkin"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

export function MainApp() {
  const { user, isLoading } = useAuth();
  
  // Show loading screen while auth state is being determined
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loading size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Routes that redirect to landing if not authenticated */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Landing />}
        />
        
        {/* Protected routes within layout */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Index />
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
            path="/search"
            element={
              <RequireAuth>
                <Search />
              </RequireAuth>
            }
          />
          <Route
            path="/add"
            element={
              <RequireAuth>
                <AddSkin />
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
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
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
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
