import AuraHero from "@/components/AuraHero";
import VibeMatchingDemo from "@/components/VibeMatchingDemo";
import AuraFeed from "@/components/AuraFeed";
import SEO from "@/components/SEO";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Curation is the new flex."
        description="Swipe to sculpt your feed, stack moodboards that earn, subscribe to visionary creators like the Medicis, and mint AI pieces in MintLab."
        path="/"
        image="/lovable-uploads/bae1fb83-3cef-4194-92f0-681955365ded.png?v=2"
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
