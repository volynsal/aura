import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";

export default function OnrampSection() {
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [amount, setAmount] = useState<string>("10"); // Fiat amount in USD
  const [token, setToken] = useState<string>("USDC"); // 'USDC' | 'ETH'
  const [network, setNetwork] = useState<string>("base"); // 'base' | 'ethereum'

  const minAmount = 2; // Provider minimum
  const isAmountValid = Number(amount) >= minAmount;

  const handleStart = async () => {
    const chainId = network === "base" ? 8453 : 1;
    try {
      if (currentChainId !== chainId && switchChainAsync) {
        await switchChainAsync({ chainId });
      }
    } catch {}
    const el = document.querySelector("w3m-onramp") as any;
    try {
      el?.setAttribute?.("data-chain-id", String(chainId));
      el?.setAttribute?.("data-asset", token);
      el?.setAttribute?.("data-fiat-currency", "USD");
      el?.setAttribute?.("data-amount", amount);
    } catch {}
    el?.click?.();
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="onramp-amount">Amount (USD)</Label>
                <Input
                  id="onramp-amount"
                  type="number"
                  inputMode="decimal"
                  min={minAmount}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Minimum purchase is ${minAmount}. Provider availability varies by region.</p>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between gap-4">
              <Button onClick={handleStart} variant="aura" size="sm" disabled={!isAmountValid}>
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
