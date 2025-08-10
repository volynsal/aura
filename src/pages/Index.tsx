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
        image="/lovable-uploads/c01519dd-0698-4c23-b3a7-e5af5415a354.png"
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
      <AuraFeed />
    </div>
  );
};

export default Index;
