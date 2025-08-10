import { useState, useMemo } from "react";
import { useAccount, useSwitchChain, useSendTransaction, useWriteContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { parseEther, parseUnits } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Ban } from "lucide-react";

// Minimal ERC20 ABI for transfer
const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

// Base Sepolia USDC (Circle) – 6 decimals
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export default function OnchainCheckoutDemo() {
  const { toast } = useToast();
  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { sendTransaction, isPending: sendingEth } = useSendTransaction();
  const { writeContract, isPending: sendingUsdc } = useWriteContract();

  const [recipient, setRecipient] = useState<string>("");
  const onBaseSepolia = chainId === baseSepolia.id;

  const validRecipient = useMemo(() => /^0x[a-fA-F0-9]{40}$/.test(recipient), [recipient]);

  const handlePayEth = async () => {
    if (!isConnected) {
      (document.querySelector("w3m-button") as any)?.click?.();
      return;
    }
    if (!onBaseSepolia) {
      switchChain({ chainId: baseSepolia.id });
      return;
    }
    if (!validRecipient) {
      toast({ title: "Enter a valid recipient address", variant: "destructive" });
      return;
    }
    try {
      await sendTransaction({ to: recipient as `0x${string}`, value: parseEther("0.001") });
      toast({ title: "ETH payment sent", description: "0.001 ETH on Base Sepolia" });
    } catch (e: any) {
      toast({ title: "Transaction failed", description: e?.shortMessage || e?.message, variant: "destructive" });
    }
  };

  const handlePayUsdc = async () => {
    if (!isConnected) {
      (document.querySelector("w3m-button") as any)?.click?.();
      return;
    }
    if (!onBaseSepolia) {
      switchChain({ chainId: baseSepolia.id });
      return;
    }
    if (!validRecipient) {
      toast({ title: "Enter a valid recipient address", variant: "destructive" });
      return;
    }
    try {
      await writeContract({
        address: USDC_BASE_SEPOLIA,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient as `0x${string}`, parseUnits("1", 6)],
        chain: baseSepolia,
        account: address as `0x${string}`
      });
      toast({ title: "USDC payment sent", description: "1 USDC on Base Sepolia" });
    } catch (e: any) {
      toast({ title: "Transaction failed", description: e?.shortMessage || e?.message, variant: "destructive" });
    }
  };

  return (
    <section className="py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Onchain Checkout Demo (Base Sepolia)</CardTitle>
            <CardDescription>
              Pay a creator with one click using ETH or USDC. Connect wallet, set recipient, and send.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Status: {isConnected ? `Connected${onBaseSepolia ? " on Base Sepolia" : " (switch to Base Sepolia)"}` : "Not connected"}
              </div>
              {/* Web3Modal button */}
              {/* eslint-disable-next-line react/no-unknown-property */}
              <w3m-button balance="hide" size="sm"></w3m-button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.trim())}
              />
              {!validRecipient && recipient && (
                <p className="text-xs text-destructive">Invalid address</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handlePayEth}
                disabled={sendingEth || isSwitching}
                variant={!isConnected ? "secondary" : "aura"}
              >
                {!isConnected && <Ban className="mr-2 h-4 w-4 opacity-80" aria-hidden="true" />}
                {onBaseSepolia ? "Pay 0.001 ETH" : "Switch to Base Sepolia"}
              </Button>
              <Button
                onClick={handlePayUsdc}
                disabled={sendingUsdc || isSwitching}
                variant="secondary"
              >
                {!isConnected && <Ban className="mr-2 h-4 w-4 opacity-80" aria-hidden="true" />}
                {onBaseSepolia ? "Pay 1 USDC" : "Switch to Base Sepolia"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
