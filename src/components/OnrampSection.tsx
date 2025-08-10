import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

export default function OnrampSection() {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  const handleStart = async () => {
    try {
      if (!isConnected) {
        (document.querySelector("w3m-button") as any)?.click?.();
        // give the wallet modal a moment to resolve connection
        setTimeout(() => open({ view: "OnRamp" as any }), 500);
      } else {
        await open({ view: "OnRamp" as any });
      }
    } catch (err) {
      // final fallback to the web component
      (document.querySelector("w3m-onramp") as any)?.click?.();
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
              <Button onClick={handleStart} variant="aura" size="sm">
                Buy Crypto with Card
              </Button>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line react/no-unknown-property */}
                <w3m-button balance="hide" size="sm"></w3m-button>
              </div>
              {/* Hidden onramp element we trigger programmatically for consistency */}
              {/* eslint-disable-next-line react/no-unknown-property */}
              <w3m-onramp size="md" style={{ display: "none" }}></w3m-onramp>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
