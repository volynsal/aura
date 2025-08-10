import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
export default function OnrampSection() {
  const { toast } = useToast();
  const handleStart = () => {
    const el = document.querySelector("w3m-onramp") as any;
    if (el && typeof el.click === "function") {
      el.click();
    } else {
      (document.querySelector("w3m-button") as any)?.click?.();
      toast({ title: "Connect wallet to start onramp" });
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
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Start onramp flow</div>
              <Button onClick={handleStart} variant="aura" size="sm">
                Buy Crypto with Card
              </Button>
              {/* Hidden native onramp element we trigger programmatically */}
              {/* eslint-disable-next-line react/no-unknown-property */}
              <w3m-onramp size="md" style={{ display: "none" }}></w3m-onramp>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
