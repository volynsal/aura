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
        image="/lovable-uploads/53e0d869-5f3f-4770-a316-e6580fdb7e9f.png"
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
