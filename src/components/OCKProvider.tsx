import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "viem/chains";
import { ONCHAINKIT_API_KEY, CDP_PROJECT_ID } from "@/config/onchain";

export function OCKProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={ONCHAINKIT_API_KEY}
      chain={base}
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
