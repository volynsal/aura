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
import NFTView from "./pages/NFTView";
import NotFound from "./pages/NotFound";
import AuraNavbar from "./components/AuraNavbar";
import AuraBottomNav from "./components/AuraBottomNav";
import { AuthProvider } from "./hooks/useAuth";
import { Web3Provider } from "./components/Web3Provider";
import { HelmetProvider } from "react-helmet-async";
import SEO from "./components/SEO";
import SearchResults from "./pages/SearchResults";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/Checkout";
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
      {/* Default SEO for all pages */}
      <SEO 
        title="Aura — Your mood is your gallery"
        description="Aura: Your mood is your gallery. Share and discover digital art by vibe."
        image="/lovable-uploads/c01519dd-0698-4c23-b3a7-e5af5415a354.png"
      />
      <Web3Provider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <AuraNavbar />
                <main className="flex-1 pb-20">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/vibe-matching" element={<VibeMatching />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/u/:username" element={<UserProfile />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/nft/:id" element={<NFTView />} />
                    <Route path="/checkout" element={<Checkout />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <AuraBottomNav />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </Web3Provider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;