import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Heart, MessageCircle, Share, DollarSign, Send, Copy, Check } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const NFTView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [nft, setNft] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [marketplaceOrder, setMarketplaceOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNFT();
    }
  }, [id]);

  const fetchNFT = async () => {
    try {
      // Fetch NFT data
      const { data: nftData, error: nftError } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', id)
        .single();

      if (nftError) throw nftError;
      setNft(nftData);

      // Fetch creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', nftData.creator_id)
        .single();

      if (profileError) throw profileError;
      setCreator(profileData);

      // Fetch active marketplace order
      const { data: orderData } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('nft_id', id)
        .eq('status', 'active')
        .single();

      setMarketplaceOrder(orderData);

      // TODO: Fetch likes count and user's like status
      setLikesCount(Math.floor(Math.random() * 100)); // Mock data for now
      setIsLiked(Math.random() > 0.5); // Mock data for now

      // TODO: Fetch comments
      setComments([
        {
          id: 1,
          user: { username: "artlover23", avatar_url: null },
          content: "This is absolutely stunning! Love the aesthetic 🔥",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          user: { username: "cryptowhale", avatar_url: null },
          content: "The composition is perfect. How long did this take to create?",
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (error: any) {
      toast({
        title: "Error loading NFT",
        description: error.message,
        variant: "destructive"
      });
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    // TODO: Implement actual like functionality
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsCommenting(true);
    try {
      // TODO: Implement actual comment functionality
      const newCommentObj = {
        id: Date.now(),
        user: { username: user.email?.split('@')[0] || 'Anonymous', avatar_url: null },
        content: newComment,
        created_at: new Date().toISOString()
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
      
      toast({
        title: "Comment added!",
        description: "Your comment has been posted."
      });
    } catch (error: any) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleListForSale = async () => {
    if (!sellPrice || !nft) return;

    setIsListing(true);
    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .insert({
          nft_id: nft.id,
          seller_id: user?.id,
          price_eth: parseFloat(sellPrice),
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "NFT listed for sale!",
        description: `Your NFT is now listed for ${sellPrice} ETH`
      });
      
      setShowSellDialog(false);
      setSellPrice("");
      
      // Refresh the marketplace order
      fetchNFT();
    } catch (error: any) {
      toast({
        title: "Error listing NFT",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsListing(false);
    }
  };

  const handleBuy = async () => {
    if (!marketplaceOrder || !user) return;

    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .update({ 
          status: 'sold',
          buyer_id: user.id,
          sold_at: new Date().toISOString()
        })
        .eq('id', marketplaceOrder.id);

      if (error) throw error;

      toast({
        title: "Purchase successful!",
        description: `You've purchased ${nft.title} for ${marketplaceOrder.price_eth} ETH`
      });
      
      // Refresh the data
      fetchNFT();
    } catch (error: any) {
      toast({
        title: "Error purchasing NFT",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (!nft) return;
    
    setIsSharing(true);
    const shareUrl = `${window.location.origin}/nft/${id}`;
    const shareTitle = `${nft.title} by ${creator?.display_name || creator?.username}`;
    const shareText = `Check out this amazing NFT: ${nft.title}${nft.description ? ' - ' + nft.description : ''}`;

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        
        toast({
          title: "Shared successfully!",
          description: "The NFT has been shared."
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to copying link if share was cancelled
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      await copyToClipboard(shareUrl);
    }
    
    setIsSharing(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "The NFT link has been copied to your clipboard."
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Could not copy link",
        description: "Please manually copy the URL from your browser.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nft || !creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">NFT not found</p>
          <Button onClick={() => navigate('/profile')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === nft.creator_id;
  const isForSale = marketplaceOrder && marketplaceOrder.status === 'active';

  // Ensure we have an absolute URL for the image
  const getAbsoluteImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${window.location.origin}${imageUrl}`;
    return `${window.location.origin}/${imageUrl}`;
  };

  const absoluteImageUrl = getAbsoluteImageUrl(nft.image_url);
  
  // Debug logging to help troubleshoot
  console.log("NFT Image URL:", nft.image_url);
  console.log("Absolute Image URL:", absoluteImageUrl);

  return (
    <>
      {/* SEO Meta Tags for proper social sharing */}
      <SEO
        title={`${nft.title} by ${creator?.display_name || creator?.username} | Aura`}
        description={nft.description || `Check out this amazing NFT: ${nft.title} by ${creator?.display_name || creator?.username}`}
        path={`/nft/${id}`}
        image={absoluteImageUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "VisualArtwork",
          name: nft.title,
          description: nft.description,
          image: absoluteImageUrl,
          creator: {
            "@type": "Person",
            name: creator?.display_name || creator?.username,
            url: `${window.location.origin}/profile/${creator?.username}`
          },
          dateCreated: nft.created_at,
          artMedium: "Digital Art",
          artworkSurface: "NFT"
        }}
      />
      
      <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              disabled={isSharing}
            >
              {linkCopied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Share className="w-4 h-4 mr-2" />
              )}
              {isSharing ? "Sharing..." : linkCopied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative bg-surface rounded-lg overflow-hidden">
              <img 
                src={nft.image_url} 
                alt={nft.title}
                className="w-full aspect-square object-cover"
              />
              
              {/* Status Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  NFT
                </Badge>
                {nft.is_minted ? (
                  <Badge variant="default" className="bg-green-600 text-white">
                    Minted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/20 border-orange-500 text-orange-400">
                    Draft
                  </Badge>
                )}
                {nft.is_exclusive && (
                  <Badge variant="default" className="bg-purple-600 text-white">
                    Exclusive
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                className="flex-1"
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount} Likes
              </Button>
              
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                {comments.length} Comments
              </Button>

              {/* Show Sell button only for owner when NFT is minted and not currently for sale */}
              {isOwner && nft.is_minted && !isForSale && (
                <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
                  <DialogTrigger asChild>
                    <Button variant="aura">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sell
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>List NFT for Sale</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Price (ETH)</label>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.5"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleListForSale}
                          disabled={!sellPrice || isListing}
                          className="flex-1"
                          variant="aura"
                        >
                          {isListing ? "Listing..." : "List for Sale"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowSellDialog(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Show Buy button for non-owners when NFT is for sale */}
              {!isOwner && isForSale && (
                <Button variant="aura" onClick={handleBuy}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buy for {marketplaceOrder.price_eth} ETH
                </Button>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={creator.avatar_url} />
                <AvatarFallback>{creator.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{creator.display_name || creator.username}</p>
                <p className="text-sm text-muted-foreground">@{creator.username}</p>
              </div>
              {!isOwner && (
                <Button size="sm" variant="outline">Follow</Button>
              )}
            </div>

            {/* NFT Details */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{nft.title}</h1>
                {nft.description && (
                  <p className="text-muted-foreground leading-relaxed">{nft.description}</p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                {/* Show price only when there's an active marketplace order */}
                {isForSale && (
                  <div className="p-3 bg-surface rounded-lg">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-primary">{marketplaceOrder.price_eth} ETH</p>
                  </div>
                )}
                
                {nft.rarity && (
                  <div className="p-3 bg-surface rounded-lg">
                    <p className="text-sm text-muted-foreground">Rarity</p>
                    <p className="font-medium capitalize">{nft.rarity}</p>
                  </div>
                )}
                
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-sm text-muted-foreground">Blockchain</p>
                  <p className="font-medium capitalize">{nft.blockchain || 'Ethereum'}</p>
                </div>
                
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(nft.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Attributes */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.attributes.map((attr: any, idx: number) => (
                      <div key={idx} className="p-3 bg-surface rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {attr.trait_type}
                        </p>
                        <p className="font-medium">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Comments ({comments.length})</h3>
              
              {/* Add Comment */}
              {user && (
                <div className="flex gap-3 p-4 bg-surface rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleComment}
                        disabled={!newComment.trim() || isCommenting}
                        variant="aura"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        {isCommenting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-surface rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">@{comment.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default NFTView;