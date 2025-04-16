
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddSkin from "./pages/AddSkin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/inventory" element={<Layout><Index /></Layout>} /> {/* Placeholder for future pages */}
            <Route path="/add" element={<Layout><AddSkin /></Layout>} />
            <Route path="/search" element={<Layout><Index /></Layout>} /> {/* Placeholder for future pages */}
            <Route path="/analytics" element={<Layout><Index /></Layout>} /> {/* Placeholder for future pages */}
            <Route path="/settings" element={<Layout><Index /></Layout>} /> {/* Placeholder for future pages */}
            <Route path="/more" element={<Layout><Index /></Layout>} /> {/* Placeholder for future pages */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
