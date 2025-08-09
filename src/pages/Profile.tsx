import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Share, Heart, Upload, X, MoreVertical, Edit, Trash2, Coins, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const userPosts = [
  { 
    id: 1, 
    type: "image", 
    content: "caught this moment between dreams and reality", 
    tags: ["#aesthetic", "#neon", "#cyberpunk", "#dreams"],
    image: "/placeholder.svg",
    notes: 5637,
    timestamp: "3 hours ago"
  },
  { 
    id: 2, 
    type: "text", 
    content: "sometimes the void stares back and it's actually kind of aesthetic ngl",
    tags: ["#void", "#aesthetic", "#relatable"],
    notes: 1203,
    timestamp: "1 day ago"
  },
  { 
    id: 3, 
    type: "quote", 
    content: "we are all just NPCs in someone else's main character moment",
    source: "overheard at 3am",
    tags: ["#quotes", "#3am thoughts", "#existential"],
    notes: 2847,
    timestamp: "2 days ago"
  }
];

const savedCollections = [
  { name: "Late Night Vibes", pieces: 12, mood: "nocturnal", preview: "/placeholder.svg" },
  { name: "Emotional Abstracts", pieces: 8, mood: "melancholic", preview: "/placeholder.svg" },
  { name: "Future Nostalgia", pieces: 15, mood: "nostalgic", preview: "/placeholder.svg" }
];

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOwnProfile] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserNFTs();
    }
  }, [user]);

  const fetchUserNFTs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserNFTs(data || []);
    } catch (error: any) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: "Error loading NFTs",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteNFT = async (nftId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('nfts')
        .delete()
        .eq('id', nftId)
        .eq('creator_id', user.id); // Extra security check

      if (error) throw error;

      // Update local state
      setUserNFTs(prev => prev.filter(nft => nft.id !== nftId));
      
      toast({
        title: "NFT deleted",
        description: "Your NFT has been removed from the database."
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMintNFT = async (nftId: string) => {
    // TODO: Implement actual blockchain minting
    // For now, we'll just update the is_minted status
    try {
      const { error } = await supabase
        .from('nfts')
        .update({ is_minted: true })
        .eq('id', nftId)
        .eq('creator_id', user.id);

      if (error) throw error;

      // Update local state
      setUserNFTs(prev => prev.map(nft => 
        nft.id === nftId ? { ...nft, is_minted: true } : nft
      ));
      
      toast({
        title: "NFT minted!",
        description: "Your NFT has been minted to the blockchain.",
      });
    } catch (error: any) {
      toast({
        title: "Minting failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewNFT = (nft: any) => {
    navigate(`/nft/${nft.id}`);
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setEditForm({
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        // Create initial profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'user',
            bio: '',
            avatar_url: ''
          })
          .select()
          .single();

        if (createError) throw createError;
        
        setProfile(newProfile);
        setEditForm({
          username: newProfile.username || '',
          bio: newProfile.bio || '',
          avatar_url: newProfile.avatar_url || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setEditForm(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      let avatarUrl = editForm.avatar_url;
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: editForm.username,
          bio: editForm.bio,
          avatar_url: avatarUrl
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProfile(data);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated."
      });

      setIsEditing(false);
      setAvatarFile(null);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="text-center mb-6 pb-6 border-b border-border/30">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl">{profile.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mb-1">{profile.username || 'Anonymous'}</h1>
          <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto leading-relaxed">
            {profile.bio || 'No bio yet'}
          </p>
          
          <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-4">
            <span>Since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span>Aura ✨ 94</span>
          </div>
          
          {isOwnProfile ? (
            <div className="flex justify-center gap-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={editForm.avatar_url} />
                        <AvatarFallback className="text-2xl">{editForm.username[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <label htmlFor="avatar-upload">
                          <Button variant="outline" size="sm" className="text-xs cursor-pointer" asChild>
                            <span>
                              <Upload className="w-3 h-3 mr-1" />
                              Change Photo
                            </span>
                          </Button>
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        {editForm.avatar_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditForm(prev => ({ ...prev, avatar_url: '' }));
                              setAvatarFile(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your username"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isUploading}
                        className="flex-1"
                        variant="aura"
                      >
                        {isUploading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            username: profile.username || '',
                            bio: profile.bio || '',
                            avatar_url: profile.avatar_url || ''
                          });
                          setAvatarFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="minimal" size="sm" className="text-xs">
                <Share className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <Button variant="aura" size="sm" className="text-xs">Follow</Button>
              <Button variant="outline" size="sm" className="text-xs">Message</Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-surface/50">
            <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">Likes</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Following</TabsTrigger>
            <TabsTrigger value="wrapped" className="text-xs">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {userNFTs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No NFTs Yet</h3>
                <p className="text-muted-foreground mb-6">Upload your first NFT to get started</p>
                <Button 
                  onClick={() => navigate('/create')}
                  variant="aura"
                >
                  Upload NFT
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                {userNFTs.map((nft, index) => (
                  <article 
                    key={nft.id} 
                    className="bg-surface border border-border/30 rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleViewNFT(nft)}
                  >
                    {/* NFT Header */}
                    <div className="flex items-center gap-3 p-3 border-b border-border/20">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="text-xs">{profile.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium text-xs">{profile.username}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(nft.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger 
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                        >
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewNFT(nft);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate('/create', { state: { editNFT: nft } });
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!nft.is_minted && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMintNFT(nft.id);
                              }}
                              className="text-primary"
                            >
                              <Coins className="w-4 h-4 mr-2" />
                              Mint NFT
                            </DropdownMenuItem>
                          )}
                          {!nft.is_minted && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this NFT? This action cannot be undone.')) {
                                  handleDeleteNFT(nft.id);
                                }
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* NFT Image */}
                    <div className="relative">
                      <img 
                        src={nft.image_url} 
                        alt={nft.title} 
                        className="w-full object-cover"
                        style={{ 
                          height: `${200 + (index % 3) * 40}px`
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                      {/* NFT Status Badge */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                          NFT
                        </Badge>
                        {nft.is_minted ? (
                          <Badge variant="default" className="text-xs bg-green-600 text-white">
                            Minted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-orange-500/20 border-orange-500 text-orange-400">
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* NFT Content */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-1">{nft.title}</h3>
                      {nft.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {nft.description}
                        </p>
                      )}
                      
                      {/* Price & Rarity */}
                      <div className="flex items-center justify-between mb-3">
                        {nft.price_eth && (
                          <span className="text-xs font-medium text-primary">
                            {nft.price_eth} ETH
                          </span>
                        )}
                        {nft.rarity && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {nft.rarity}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Attributes */}
                      {nft.attributes && nft.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {nft.attributes.slice(0, 2).map((attr: any, idx: number) => (
                            <span key={idx} className="text-xs bg-surface-elevated px-2 py-1 rounded">
                              {attr.trait_type}: {attr.value}
                            </span>
                          ))}
                          {nft.attributes.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{nft.attributes.length - 2}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {!nft.is_minted ? (
                          <Button 
                            size="sm" 
                            variant="aura" 
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMintNFT(nft.id);
                            }}
                          >
                            <Coins className="w-3 h-3 mr-1" />
                            Mint NFT
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs"
                            disabled
                          >
                            Minted ✓
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* NFT Footer */}
                    <div className="px-3 pb-3 flex items-center justify-between border-t border-border/20 pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(nft.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-3">
                        <button 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-sm">↻</span>
                        </button>
                        <button 
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid gap-6">
              {savedCollections.map((collection) => (
                <div key={collection.name} className="border border-border/50 rounded-xl p-6 bg-surface/50 backdrop-blur-sm hover:bg-surface/80 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-aura rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                      <p className="text-muted-foreground mb-3">{collection.pieces} posts liked</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">
                          {collection.mood}
                        </Badge>
                        <button className="text-sm text-primary hover:underline">
                          View all likes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">Following</h3>
              <p className="text-muted-foreground mb-6">Blogs you're following will appear here</p>
              <div className="space-y-4 max-w-md mx-auto">
                {["aesthetic_dreams", "void_poetry", "digital_nostalgia"].map((blog) => (
                  <div key={blog} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{blog[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{blog}</p>
                      <p className="text-xs text-muted-foreground">Active 2h ago</p>
                    </div>
                    <Button variant="outline" size="sm">Unfollow</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wrapped" className="mt-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Archive</h3>
              <p className="text-muted-foreground mb-6">Browse your posts by month and year</p>
              <div className="max-w-sm mx-auto space-y-2">
                {["December 2024", "November 2024", "October 2024"].map((month) => (
                  <button key={month} className="w-full p-3 text-left bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors">
                    <span className="font-medium">{month}</span>
                    <span className="text-sm text-muted-foreground ml-2">(12 posts)</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;