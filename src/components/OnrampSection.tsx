import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function OnrampSection() {
  const { open } = useWeb3Modal();

  const handleStart = async () => {
    try {
      // Preferred: open Web3Modal directly on Onramp view
      await open({ view: "OnRamp" as any });
    } catch (err) {
      // Fallbacks: try the web component, then prompt connect
      const el = document.querySelector("w3m-onramp") as any;
      if (el?.click) {
        el.click();
      } else {
        (document.querySelector("w3m-button") as any)?.click?.();
      }
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Buy Crypto with Card (Onramp)</CardTitle>
            <CardDescription>
              Purchase ETH or USDC and have it delivered to your connected wallet. Powered by Web3Modal Onramp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use fiat payment methods to top up before paying. Supports multiple providers depending on your region.
            </p>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">Start onramp flow</div>
              <div className="flex items-center gap-3">
                <Button onClick={handleStart} variant="aura" size="sm">
                  Buy Crypto with Card
                </Button>
                {/* eslint-disable-next-line react/no-unknown-property */}
                <w3m-onramp size="md"></w3m-onramp>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
