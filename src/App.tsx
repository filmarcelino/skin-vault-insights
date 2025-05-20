
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomeScreenPopup } from "@/components/ui/home-screen-popup";
import UnderConstruction from "./pages/UnderConstruction";

// Set up React Query with 15 minutes staleTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      retry: 1,
    },
  },
});

const App = () => {
  console.log("App component rendering - Under Construction Mode");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Toaster />
          <Sonner />
          <HomeScreenPopup />
          <BrowserRouter>
            <Routes>
              {/* All routes point to the Under Construction page */}
              <Route path="/" element={<UnderConstruction />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
