import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import VibeMatching from "./pages/VibeMatching";
import Create from "./pages/Create";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuraNavbar from "./components/AuraNavbar";
import { AuthProvider } from "./hooks/useAuth";
import { Web3Provider } from "./components/Web3Provider";
import { HelmetProvider } from "react-helmet-async";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <Web3Provider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuraNavbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/vibe-matching" element={<VibeMatching />} />
                <Route path="/create" element={<Create />} />
                <Route path="/login" element={<Login />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </Web3Provider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;