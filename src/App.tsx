
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomeScreenPopup } from "@/components/ui/home-screen-popup";
import PublicExport from "./pages/PublicExport";

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
  console.log("App component rendering - Export Tool Only Mode");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Toaster />
          <Sonner />
          <HomeScreenPopup />
          <BrowserRouter>
            <Routes>
              {/* Todas as rotas apontam para a página de exportação do Breno */}
              <Route path="/" element={<PublicExport />} />
              <Route path="/export" element={<PublicExport />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
