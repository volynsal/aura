import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "viem/chains";
import { ONCHAINKIT_API_KEY, CDP_PROJECT_ID } from "@/config/onchain";

export function OCKProvider({ children }: { children: ReactNode }) {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const allowlisted = /(^|\.)aura-mood-gallery\.lovable\.app$|^localhost$|^127\.0\.0\.1$/.test(host);

  return (
    <OnchainKitProvider
      apiKey={allowlisted ? ONCHAINKIT_API_KEY : undefined}
      rpcUrl="https://sepolia.base.org"
      chain={baseSepolia}
      projectId={CDP_PROJECT_ID}
      config={{
        appearance: { mode: "auto", name: "Aura" },
        wallet: { display: "modal" },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}

export default OCKProvider;
