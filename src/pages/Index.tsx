import AuraNavbar from "@/components/AuraNavbar";
import AuraHero from "@/components/AuraHero";
import VibeMatchingDemo from "@/components/VibeMatchingDemo";
import AuraFeed from "@/components/AuraFeed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AuraNavbar />
      <AuraHero />
      <VibeMatchingDemo />
      <AuraFeed />
    </div>
  );
};

export default Index;
