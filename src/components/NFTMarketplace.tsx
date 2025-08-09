import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Share2, ShoppingCart, Filter, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NFT {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_eth: number;
  price_usd: number;
  rarity: string;
  is_exclusive: boolean;
  creator: {
    display_name: string;
    username: string;
  };
  marketplace_orders: Array<{
    id: string;
    price_eth: number;
    price_usd: number;
    status: string;
  }>;
}

interface NFTMarketplaceProps {
  showFilters?: boolean;
}

export default function NFTMarketplace({ showFilters = true }: NFTMarketplaceProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nfts')
        .select(`
          *,
          profiles:creator_id (display_name, username),
          marketplace_orders (id, price_eth, price_usd, status)
        `)
        .eq('marketplace_orders.status', 'active');

      if (error) throw error;

      const processedNFTs = data?.map(nft => ({
        ...nft,
        creator: {
          display_name: nft.profiles?.display_name || 'Unknown',
          username: nft.profiles?.username || 'unknown'
        }
      })) || [];

      setNfts(processedNFTs);
    } catch (error: any) {
      toast({
        title: "Error loading NFTs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.creator.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRarity = rarityFilter === 'all' || nft.rarity === rarityFilter;
    
    const matchesPrice = priceFilter === 'all' || (() => {
      const price = nft.marketplace_orders[0]?.price_eth || nft.price_eth;
      switch (priceFilter) {
        case 'low': return price < 0.1;
        case 'medium': return price >= 0.1 && price < 1;
        case 'high': return price >= 1;
        default: return true;
      }
    })();

    return matchesSearch && matchesRarity && matchesPrice;
  });

  const purchaseNFT = async (nft: NFT) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase NFTs.",
        variant: "destructive"
      });
      return;
    }

    try {
      const order = nft.marketplace_orders[0];
      if (!order) {
        toast({
          title: "Not for sale",
          description: "This NFT is not currently for sale.",
          variant: "destructive"
        });
        return;
      }

      // Update order status to sold
      const { error: orderError } = await supabase
        .from('marketplace_orders')
        .update({ 
          status: 'sold',
          buyer_id: user.id,
          sold_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "Purchase successful!",
        description: `You've successfully purchased "${nft.title}".`
      });

      fetchNFTs();
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search NFTs or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="low">Under 0.1 ETH</SelectItem>
              <SelectItem value="medium">0.1 - 1 ETH</SelectItem>
              <SelectItem value="high">Over 1 ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNFTs.map((nft) => {
          const activeOrder = nft.marketplace_orders[0];
          const price = activeOrder?.price_eth || nft.price_eth;
          const priceUsd = activeOrder?.price_usd || nft.price_usd;

          return (
            <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={nft.image_url}
                  alt={nft.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={`${getRarityColor(nft.rarity)} text-white`}>
                    {nft.rarity}
                  </Badge>
                </div>
                {nft.is_exclusive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Exclusive</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-lg">{nft.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {nft.creator.display_name}
                  </p>
                  {nft.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {nft.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-lg">{price} ETH</div>
                    {priceUsd && (
                      <div className="text-sm text-muted-foreground">
                        ${priceUsd}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedNft(nft)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      {selectedNft && (
                        <>
                          <DialogHeader>
                            <DialogTitle>{selectedNft.title}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <img
                              src={selectedNft.image_url}
                              alt={selectedNft.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Creator</h4>
                                <p>{selectedNft.creator.display_name}</p>
                              </div>
                              
                              {selectedNft.description && (
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedNft.description}
                                  </p>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium mb-2">Price</h4>
                                <div className="text-xl font-bold">
                                  {price} ETH
                                </div>
                                {priceUsd && (
                                  <div className="text-muted-foreground">
                                    ${priceUsd}
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={() => purchaseNFT(selectedNft)}
                                className="w-full"
                                variant="aura"
                                disabled={!activeOrder}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {activeOrder ? 'Purchase Now' : 'Not for Sale'}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => purchaseNFT(nft)}
                    variant="aura"
                    disabled={!activeOrder}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNFTs.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No NFTs found</h3>
          <p className="text-muted-foreground">
            {searchTerm || rarityFilter || priceFilter
              ? 'Try adjusting your filters to see more results.'
              : 'No NFTs are currently available for purchase.'
            }
          </p>
        </div>
      )}
    </div>
  );
}