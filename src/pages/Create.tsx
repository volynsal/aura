import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Palette, TrendingUp, Coins, Eye, Heart, Share, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileSectionNav from "@/components/MobileSectionNav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import NFTUpload from "@/components/NFTUpload";
import SubscriptionTiers from "@/components/SubscriptionTiers";

const moods = ["ethereal", "dark", "vibrant", "melancholic", "euphoric", "chaotic", "serene", "rebellious"];

const curatedBoards = [
  {
    id: 1,
    title: "Late Night Energy",
    curator: "mood_curator",
    mood: "nocturnal",
    pieces: 12,
    earnings: "2.4 ETH",
    views: "8.4K",
    likes: 247,
    mints: 34,
    preview: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    id: 2,
    title: "Digital Melancholy",
    curator: "you",
    mood: "melancholic", 
    pieces: 8,
    earnings: "1.7 ETH",
    views: "5.2K",
    likes: 189,
    mints: 23,
    preview: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  }
];

const availableNFTs = [
  { id: 1, title: "Neon Dreams #23", artist: "cyber_artist", mood: "euphoric", image: "/placeholder.svg" },
  { id: 2, title: "Void Walker", artist: "dark_creator", mood: "melancholic", image: "/placeholder.svg" },
  { id: 3, title: "Digital Serenity", artist: "peace_maker", mood: "serene", image: "/placeholder.svg" },
  { id: 4, title: "Chaos Theory", artist: "rebel_mind", mood: "chaotic", image: "/placeholder.svg" },
  { id: 5, title: "Ethereal Flow", artist: "dream_weaver", mood: "ethereal", image: "/placeholder.svg" },
  { id: 6, title: "Urban Pulse", artist: "city_soul", mood: "vibrant", image: "/placeholder.svg" }
];

const Create = () => {
  const navigate = useNavigate();
  const [newBoard, setNewBoard] = useState({
    title: "",
    description: "",
    mood: "",
    selectedNFTs: [] as number[]
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [savingWallet, setSavingWallet] = useState(false);
  const { address, isConnected } = useAccount();
 
  useEffect(() => {
    const loadWallet = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setWalletAddress(data.wallet_address || '');
      }
    };
    loadWallet();
  }, [user]);

  // Auto-fill payout wallet from connected wallet
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  const saveWallet = async () => {
    if (!user) return;
    setSavingWallet(true);
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress.trim() || null })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Could not save wallet', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Payout wallet updated' });
    }
    setSavingWallet(false);
  };
  const handleNFTToggle = (nftId: number) => {
    setNewBoard(prev => ({
      ...prev,
      selectedNFTs: prev.selectedNFTs.includes(nftId) 
        ? prev.selectedNFTs.filter(id => id !== nftId)
        : [...prev.selectedNFTs, nftId]
    }));
  };

  const handleCreateBoard = () => {
    if (newBoard.title && newBoard.mood && newBoard.selectedNFTs.length > 0) {
      // In real app, this would save to backend
      console.log("Creating board:", newBoard);
      setIsCreating(false);
      setNewBoard({ title: "", description: "", mood: "", selectedNFTs: [] });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileSectionNav />
      
      <div className="pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create & Earn</h1>
          <p className="text-muted-foreground">Curate moodboards and earn when others mint your vibes</p>
        </div>

        <Tabs defaultValue="boards" className="w-full">
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
              <TabsTrigger value="boards" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                My Boards
              </TabsTrigger>
              <Button asChild variant="ghost" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                <a
                  href="https://chatgpt.com/g/g-Yxt9Kr5MD-mintlab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open MintLab in a new tab"
                >
                  MintLab <ArrowUpRight className="w-4 h-4 inline-block ml-1" />
                </a>
              </Button>
              <TabsTrigger value="upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Upload NFT
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="earnings" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Earnings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="boards" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Curation Boards</h2>
              <Button onClick={() => setIsCreating(true)} variant="aura">
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </div>
            
            <div className="grid gap-6">
              {curatedBoards.map((board) => (
                <Card key={board.id} className="overflow-hidden gentle-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-2">{board.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>by {board.curator}</span>
                          <Badge variant="secondary" className="capitalize">
                            {board.mood}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{board.earnings}</div>
                        <div className="text-sm text-muted-foreground">earned</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Preview Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {board.preview.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-surface-elevated rounded-lg" />
                      ))}
                      {board.pieces > 4 && (
                        <div className="aspect-square bg-surface-elevated rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                          +{board.pieces - 4}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {board.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {board.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {board.mints} mints
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <NFTUpload onSuccess={() => {}} />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payout Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Set the wallet address where you want to receive creator earnings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="0x… or ENS"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                    <Button onClick={saveWallet} disabled={savingWallet} variant="aura">
                      {savingWallet ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Status: {isConnected ? `Connected (${address?.slice(0,6)}...${address?.slice(-4)})` : "Not connected"}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line react/no-unknown-property */}
                      <w3m-button balance="hide" size="sm"></w3m-button>
                      <Button variant="secondary" size="sm" onClick={() => address && setWalletAddress(address)}>
                        Use connected wallet
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <SubscriptionTiers isOwner={true} />
          </TabsContent>


          <TabsContent value="earnings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="aura-element" style={{"--delay": 0} as any}>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary halo-float" />
                  <div className="text-2xl font-bold">4.1 ETH</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </CardContent>
              </Card>
              <Card className="aura-element" style={{"--delay": 1} as any}>
                <CardContent className="p-6 text-center">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-primary halo-float" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">Active Boards</div>
                </CardContent>
              </Card>
              <Card className="aura-element" style={{"--delay": 2} as any}>
                <CardContent className="p-6 text-center">
                  <Coins className="w-8 h-8 mx-auto mb-2 text-primary halo-float" />
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-sm text-muted-foreground">Total Mints</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { board: "Late Night Energy", amount: "0.3 ETH", mints: 5, time: "2 hours ago" },
                    { board: "Digital Melancholy", amount: "0.1 ETH", mints: 2, time: "1 day ago" },
                    { board: "Cyberpunk Dreams", amount: "0.7 ETH", mints: 12, time: "3 days ago" }
                  ].map((earning, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-surface rounded-lg">
                      <div>
                        <div className="font-medium">{earning.board}</div>
                        <div className="text-sm text-muted-foreground">
                          {earning.mints} new mints • {earning.time}
                        </div>
                      </div>
                      <div className="text-primary font-bold">+{earning.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
};

export default Create;