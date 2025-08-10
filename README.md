# Aura — Mood‑Based NFT Discovery & Onchain Checkout (MVP)

Aura is a React + Vite + Tailwind app that helps people discover digital art by vibe. It includes a swipe-style Vibe Matching demo, a simple Explore gallery, and an MVP onchain checkout powered by Wagmi/Web3Modal + Coinbase OnchainKit (including Coinbase Onramp).

## Core Features

- Mood-first discovery
  - Vibe Matching Demo: swipe through “vibe cards” (e.g., Neon Dreams, Mystic Tech) and see your matches.
  - Explore Grid: static mock NFT gallery for quick browsing.
- Clean, responsive UI
  - Built with Tailwind and shadcn components, semantic tokens, lazy images and SEO tags.
- Pages & URLs
  - Home “/” with hero + Vibe Matching Demo
  - Discover “/discover”, Feed “/feed”, Vibe Matching “/vibe-matching”
  - Checkout demo “/checkout” (onchain payments + onramp)
- Web3 ready
  - Wallet connect via Web3Modal, Base Sepolia by default for safe testing.

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS + shadcn/ui
- Routing: react-router-dom
- Web3: wagmi, viem, @web3modal/wagmi, @coinbase/onchainkit

## Onchain Checkout (MVP) — How it works

The MVP demonstrates sending a small payment to a recipient using ETH or USDC on Base Sepolia, plus a fiat onramp entry point.

Entry point page:
- src/pages/Checkout.tsx → renders OnchainCheckoutDemo + OnrampFund

Providers:
- src/components/Web3Provider.tsx
  - Initializes Web3Modal + wagmi (WalletConnect, MetaMask, Coinbase Wallet).
  - Chains include Base Sepolia (test), Base mainnet, and more.
- src/components/OCKProvider.tsx
  - Wraps the app with OnchainKit using Base Sepolia and apiKey/projectId from src/config/onchain.ts.
  - Host allowlist ensures the OnchainKit API key is only used on approved domains.

Config:
- src/config/onchain.ts
  - ONCHAINKIT_API_KEY and optional CDP_PROJECT_ID (for Onramp best UX).
  - These values are demo defaults and should be replaced for your deployment.

Checkout flow (user actions):
1) Connect wallet
   - Web3Modal button (w3m-button) opens; user connects any supported wallet.
2) Network guard
   - If not on Base Sepolia, the UI requests a chain switch (wagmi useSwitchChain).
3) Enter recipient
   - User pastes a 0x… address; simple regex validation ensures correctness.
4) One‑click pay
   - ETH path (useSendTransaction): sends 0.001 ETH → parseEther("0.001").
   - USDC path (useWriteContract): calls ERC20 transfer on Base Sepolia USDC → 1 USDC (6 decimals).
   - File: src/components/OnchainCheckoutDemo.tsx
5) Feedback
   - Success/error toasts are displayed; network/state are reflected in the UI.

Contract note:
- USDC (Base Sepolia): 0x036CbD53842c5426634e7929541eC2318f3dCF7e (6 decimals)

## Coinbase Onramp — How it’s wired

- Entry point: src/components/OnrampFund.tsx
  - Uses OnchainKit’s <FundButton/> to open Coinbase Onramp.
  - Users can buy crypto (card/bank/Coinbase); funds land in the connected wallet.
- OCKProvider passes projectId (CDP_PROJECT_ID) and apiKey when host is allowlisted.
- Practical note: fiat onramps may have limited support for testnets like Base Sepolia; for real flows, switch to Base mainnet.

## Security & Keys

- This repo includes demo keys in src/config/onchain.ts purely for local/staging evaluation.
- Production: do not keep private keys in the repo. If you connect Supabase to this project, store secrets in Supabase Secrets and read them server-side or via Edge Functions.
- If you want a frontend‑only setup, use publishable keys only, or prompt users for keys and store in localStorage (not recommended for sensitive values).

## Local Development

```bash
# 1) Install deps
npm i

# 2) Run dev server
npm run dev
```

Open http://localhost:5173 and navigate to “/checkout” to try the onchain demo.

## Switching to Base Mainnet (optional)

- Update chain in OCKProvider and wagmi config to base (mainnet).
- Replace the USDC contract with the Base mainnet USDC address (and keep 6‑decimal handling).
- Use production‑ready API keys (store them securely, not in the repo).

## Project Structure (selected)

- src/pages/Index.tsx — home (hero + vibe matching)
- src/components/VibeMatchingDemo.tsx — swipe cards + Explore grid
- src/components/OnchainCheckoutDemo.tsx — ETH/USDC send (Base Sepolia)
- src/components/OnrampFund.tsx — Coinbase Onramp FundButton
- src/components/OCKProvider.tsx — OnchainKit provider
- src/components/Web3Provider.tsx — wagmi + Web3Modal
- src/config/onchain.ts — OnchainKit API key & optional CDP Project ID

## Limitations / Next Steps

- Data is mock/static for the demo; no marketplace backend is wired.
- Onramp best experience requires Base mainnet and a valid CDP Project ID.
- Consider moving secrets to Supabase and adding RLS‑backed APIs for real profiles, mints, and purchases.

---
Built with Lovable. To publish, open your project in Lovable and click Share → Publish.
