import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface ProfileRow {
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface NFT {
  id: string;
  title: string;
  image_url: string;
  creator_id: string;
}

const UserProfile = () => {
  const { username = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const previewLimit = 5;
  const tiers = [
    { id: 'supporter', name: 'Supporter', price: '$5/mo', benefits: ['Unlock full gallery', 'Creator updates'] },
    { id: 'fan', name: 'Fan', price: '$15/mo', benefits: ['Exclusive posts', 'Early drops', 'Discord role'] },
    { id: 'patron', name: 'Patron', price: '$50/mo', benefits: ['Monthly 1:1 feedback', 'Exclusive airdrops'] },
  ];
  const isOwner = useMemo(() => (profile?.user_id && user?.id) ? profile.user_id === user.id : false, [profile, user]);

  useEffect(() => {
    const load = async () => {
      const q = (username || "").trim();
      console.info("UserProfile: start", { username: q });
      if (!q) {
        setLoading(false);
        return;
      }
      try {
        // Fetch profile by username (case-insensitive)
        const { data: prof, error: e1 } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, bio, avatar_url, created_at")
          .ilike("username", q)
          .maybeSingle();
        if (e1) console.error("UserProfile: profile error", e1);
        setProfile(prof || null);

        if (prof?.user_id) {
          const { data: posts, error: e2 } = await supabase
            .from("nfts")
            .select("id, title, image_url, creator_id")
            .eq("creator_id", prof.user_id)
            .order("created_at", { ascending: false })
            .limit(48);
          if (e2) console.error("UserProfile: nfts error", e2);
          setNfts(posts || []);
        } else {
          setNfts([]);
        }
      } catch (e) {
        console.error("UserProfile: unexpected", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const displayName = useMemo(() => profile?.display_name || profile?.username || "User", [profile]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <SEO
        title={`${displayName} | Aura Profile`}
        description={`View ${displayName}'s profile and artwork on Aura.`}
        path={`/u/${encodeURIComponent(username || "")}`}
        structuredData={profile ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: displayName,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          image: profile.avatar_url || undefined,
          description: profile.bio || undefined,
        } : undefined}
      />

      {loading ? (
        <p className="text-muted-foreground">Loading profile...</p>
      ) : !profile ? (
        <p className="text-muted-foreground">Profile not found.</p>
      ) : (
        <>
          <header className="mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url || undefined} alt={`${displayName} avatar`} />
                <AvatarFallback>{displayName.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{displayName}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>
          </header>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Artworks</h2>
              {!isOwner && nfts.length > previewLimit && (
                <Button variant="aura" size="sm" onClick={() => setSubscribeOpen(true)}>
                  Subscribe
                </Button>
              )}
            </div>
            {nfts.length === 0 ? (
              <p className="text-muted-foreground">No artworks yet.</p>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {nfts.map((nft, idx) => {
                const isLocked = !isOwner && idx >= previewLimit;
                return (
                  <div key={nft.id} className="relative">
                    <Card
                      className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => (isLocked ? setSubscribeOpen(true) : navigate(`/nft/${nft.id}`))}
                    >
                      <CardContent className="p-0">
                        <img
                          src={nft.image_url}
                          alt={`${nft.title} NFT image`}
                          loading="lazy"
                          className={`w-full h-40 object-cover ${isLocked ? 'opacity-60' : ''}`}
                        />
                      </CardContent>
                      <CardHeader>
                        <CardTitle className="text-sm line-clamp-1">{nft.title}</CardTitle>
                      </CardHeader>
                    </Card>
                    {isLocked && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview limit reached</p>
                        <Button variant="aura" size="sm" onClick={(e) => { e.stopPropagation(); setSubscribeOpen(true); }}>
                          Subscribe to unlock
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </section>

          <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Subscribe to {displayName}</DialogTitle>
                <DialogDescription>
                  Support {displayName} and unlock all artworks. Payments use ETH/USDC on Base via our Checkout demo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTier(t.id)}
                    className={`text-left rounded-lg border p-4 bg-surface hover:border-primary/50 transition-colors ${selectedTier === t.id ? 'border-primary' : 'border-border'}`}
                    aria-pressed={selectedTier === t.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.benefits.join(' • ')}</p>
                      </div>
                      <span className="text-sm font-semibold">{t.price}</span>
                    </div>
                  </button>
                ))}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="secondary" onClick={() => setSubscribeOpen(false)}>Close</Button>
                <Button
                  variant="aura"
                  onClick={() => { navigate('/checkout'); setSubscribeOpen(false); }}
                  disabled={!selectedTier}
                >
                  Continue to Checkout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </main>
  );
};

export default UserProfile;
