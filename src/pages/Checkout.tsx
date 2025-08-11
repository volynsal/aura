import OnchainCheckoutDemo from "@/components/OnchainCheckoutDemo";
import SEO from "@/components/SEO";
import OnrampSection from "@/components/OnrampSection";
import MobileSectionNav from "@/components/MobileSectionNav";

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileSectionNav />
      <SEO
        title="Aura Onchain Checkout — ETH & USDC on Base Sepolia"
        description="Demo onchain checkout: send ETH or USDC on Base Sepolia with one click using your wallet."
        path="/checkout"
      />
      <main className="px-4 sm:px-6">
        <header className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">Onchain Checkout</h1>
          <p className="text-muted-foreground mt-2">Fast wallet-native payments for tips, unlocks, and mints.</p>
        </header>
        <OnchainCheckoutDemo />
        <OnrampSection />
      </main>
    </div>
  );
}
