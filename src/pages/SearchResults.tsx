import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Users, Tags } from "lucide-react";

interface Profile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface NFT {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  creator_id: string;
  attributes: Array<{ trait_type?: string; value?: string }>|null;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState<string>(searchParams.get("q")?.trim() || "");

  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<NFT[]>([]);
  const navigate = useNavigate();

  // Extract moods from creator posts
  const moods = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((nft) => {
      (nft.attributes || []).forEach((a) => {
        if ((a.trait_type || "").toLowerCase() === "mood" && a.value) {
          set.add(a.value.trim().toLowerCase());
        }
      });
    });
    return Array.from(set).sort();
  }, [posts]);

  useEffect(() => {
    const current = searchParams.get("q")?.trim() || "";
    setQ(current);
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      const query = q.trim();
      console.info("SearchResults: start", { query });
      if (!query) {
        setProfiles([]);
        setPosts([]);
        return;
      }
      setLoading(true);
      try {
        // 1) Find matching users
        const { data: profA, error: errA } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .or(
            `username.ilike.%${query}%,display_name.ilike.%${query}%`
          )
          .limit(10);
        if (errA) console.error("SearchResults: profiles error", errA);
        const prof = profA || [];
        setProfiles(prof);
        console.info("SearchResults: profiles", { count: prof.length, sample: prof.slice(0, 3) });

        const creatorIds = prof.map((p) => p.user_id);

        // Helper to normalize attributes into an array
        const normalize = (p: any): NFT => ({
          id: p.id,
          title: p.title,
          description: p.description ?? null,
          image_url: p.image_url,
          creator_id: p.creator_id,
          attributes: Array.isArray(p.attributes) ? (p.attributes as any) : [],
        });

        // 2) Posts by matched users
        const postsByUser = creatorIds.length
          ? await supabase
              .from("nfts")
              .select("id, title, description, image_url, creator_id, attributes")
              .in("creator_id", creatorIds)
              .limit(24)
          : { data: [] as any[], error: null };
        if ((postsByUser as any).error)
          console.error("SearchResults: postsByUser error", (postsByUser as any).error);

        // 3) Additionally find posts matching the text (title/description)
        const postsByText = await supabase
          .from("nfts")
          .select("id, title, description, image_url, creator_id, attributes")
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(24);
        if (postsByText.error)
          console.error("SearchResults: postsByText error", postsByText.error);

        // Merge unique posts
        const map = new Map<string, NFT>();
        (postsByUser as any).data?.forEach((p: any) => map.set(p.id, normalize(p)));
        postsByText.data?.forEach((p: any) => map.set(p.id, normalize(p)));
        const merged = Array.from(map.values());
        setPosts(merged);
        console.info("SearchResults: posts", { count: merged.length, sample: merged.slice(0, 2).map(p => ({ id: p.id, title: p.title })) });
      } catch (e) {
        console.error("SearchResults: unexpected error", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    console.info("SearchResults: manual submit", { query });
    setSearchParams(query ? { q: query } : {});
  };

  const heading = q ? `Search Results for "${q}"` : "Search Results";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <SEO
        title={`${heading} | Aura`}
        description={`Search results for ${q || "all"} across users and posts on Aura.`}
        path={`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
      />

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{heading}</h1>
        <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
          <Input
            placeholder="Search users, posts, or moods..."
            aria-label="Search query"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-md"
          />
        </form>
      </header>

      {loading && (
        <p className="text-muted-foreground">Searching...</p>
      )}

      {!loading && !profiles.length && !posts.length && (
        <p className="text-muted-foreground">No results found.</p>
      )}

      {/* Users */}
      {!!profiles.length && (
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Users</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const username = (p.username || "").trim();
              const href = username ? `/u/${encodeURIComponent(username)}` : "#";
              return (
                <Link
                  to={href}
                  key={p.user_id}
                  onClick={() => console.info("SearchResults: click user", { user: p.username, id: p.user_id })}
                  className="block"
                >
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Avatar>
                        <AvatarImage src={p.avatar_url || undefined} alt={`${p.display_name || p.username || "User"} avatar`} />
                        <AvatarFallback>{(p.display_name || p.username || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{p.display_name || p.username || "User"}</CardTitle>
                        <p className="text-xs text-muted-foreground">@{p.username || "unknown"}</p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Posts */}
      {!!posts.length && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Posts</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {posts.map((nft) => (
              <Link
                to={`/nft/${nft.id}`}
                key={nft.id}
                onClick={() => console.info('SearchResults: click post', { id: nft.id })}
                className="block"
              >
                <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-0">
                    <img
                      src={nft.image_url}
                      alt={`${nft.title} NFT image`}
                      loading="lazy"
                      className="w-full h-40 object-cover"
                    />
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="text-sm line-clamp-1">{nft.title}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Moods extracted from matched posts */}
      {!!moods.length && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Tags className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Moods</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  console.info('SearchResults: click mood', { mood: m, from: q });
                  const next = q ? `${q},${m}` : m;
                  navigate(`/vibe-matching?q=${encodeURIComponent(next)}`);
                }}
                className="px-3 py-1 rounded-full bg-surface-elevated text-sm text-foreground border border-border hover:border-primary/50 transition-colors"
                aria-label={`Filter by mood ${m}`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default SearchResults;
