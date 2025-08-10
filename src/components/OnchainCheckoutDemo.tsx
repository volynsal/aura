import { useState, useMemo } from "react";
import { useAccount, useSwitchChain, useSendTransaction, useWriteContract, useDisconnect } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { parseEther, parseUnits } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resetWalletSessions } from "@/lib/walletReset";

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

// Supported networks
const NETWORKS = [
  { id: base.id, label: "Base", chain: base },
  { id: mainnet.id, label: "Ethereum", chain: mainnet }
] as const;

// USDC contract addresses (6 decimals)
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913",
  [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48"
};

export default function OnchainCheckoutDemo() {
  const { toast } = useToast();
  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { sendTransaction, isPending: sendingEth } = useSendTransaction();
  const { writeContract, isPending: sendingUsdc } = useWriteContract();
  const { disconnect } = useDisconnect();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [token, setToken] = useState<"ETH" | "USDC">("ETH");
  const [network, setNetwork] = useState<number>(base.id);

  const selectedNetwork = useMemo(() => NETWORKS.find((n) => n.id === Number(network)) ?? NETWORKS[0], [network]);
  const onSelectedNetwork = chainId === selectedNetwork.id;

  const validRecipient = useMemo(() => /^0x[a-fA-F0-9]{40}$/.test(recipient), [recipient]);
  const amountValid = useMemo(() => {
    const n = Number(amount);
    return !Number.isNaN(n) && n > 0;
  }, [amount]);
  const isSending = sendingEth || sendingUsdc || isSwitching;

  const handleSendPayment = async () => {
    if (!isConnected) {
      (document.querySelector("w3m-button") as any)?.click?.();
      return;
    }

    if (!onSelectedNetwork) {
      switchChain({ chainId: selectedNetwork.id });
      return;
    }

    if (!validRecipient) {
      toast({ title: "Enter a valid recipient address", variant: "destructive" });
      return;
    }

    if (!amountValid) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }

    try {
      if (token === "ETH") {
        await sendTransaction({ to: recipient as `0x${string}`, value: parseEther(amount) });
      } else {
        const usdcAddress = USDC_ADDRESSES[selectedNetwork.id];
        if (!usdcAddress) {
          toast({ title: "Unsupported network for USDC", variant: "destructive" });
          return;
        }
        await writeContract({
          address: usdcAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as `0x${string}`, parseUnits(amount, 6)],
          chain: selectedNetwork.chain,
          account: address as `0x${string}`
        });
      }

      toast({ title: "Payment sent", description: `${amount} ${token} on ${selectedNetwork.label}` });
    } catch (e: any) {
      toast({ title: "Transaction failed", description: e?.shortMessage || e?.message, variant: "destructive" });
    }
  };

  const handleResetWallet = () => {
    try { disconnect?.(); } catch {}
    resetWalletSessions();
    toast({ title: "Connection reset", description: "Please reconnect your wallet" });
  };

  return (
    <section className="py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Buy Me a Coffee (Onchain)</CardTitle>
            <CardDescription>
              Enter recipient, amount, token, and network, then send in one click.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Status: {isConnected ? `Connected${onSelectedNetwork ? ` on ${selectedNetwork.label}` : ` (switch to ${selectedNetwork.label})`}` : "Not connected"}
              </div>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line react/no-unknown-property */}
                <w3m-button balance="hide" size="sm"></w3m-button>
                <Button size="sm" variant="secondary" onClick={handleResetWallet}>Reset Connect</Button>
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={token} onValueChange={(v) => setToken(v as "ETH" | "USDC")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={String(network)} onValueChange={(v) => setNetwork(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(base.id)}>Base</SelectItem>
                    <SelectItem value={String(mainnet.id)}>Ethereum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSendPayment} disabled={!validRecipient || !amountValid || isSending} variant="aura">
                {onSelectedNetwork ? `Send ${amount} ${token}` : `Switch to ${selectedNetwork.label}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
