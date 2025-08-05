import AuraHero from "@/components/AuraHero";
import FeatureSection from "@/components/FeatureSection";
import AuraWrapped from "@/components/AuraWrapped";
import AuraFooter from "@/components/AuraFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AuraHero />
      <FeatureSection />
      <AuraWrapped />
      <AuraFooter />
    </div>
  );
};

export default Index;
