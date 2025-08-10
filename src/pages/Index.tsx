import AuraHero from "@/components/AuraHero";
import VibeMatchingDemo from "@/components/VibeMatchingDemo";
import AuraFeed from "@/components/AuraFeed";
import SEO from "@/components/SEO";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Aura — Your mood is your gallery"
        description="Aura: Your mood is your gallery. Share and discover digital art by vibe."
        path="/"
        image="/og-aura.png?v=2"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Aura",
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
          potentialAction: {
            "@type": "SearchAction",
            target: `${typeof window !== 'undefined' ? window.location.origin : ''}/discover?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <AuraHero />
      <VibeMatchingDemo />
      <AuraFeed />
    </div>
  );
};

export default Index;
