import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, base, baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

import { ReactNode, useEffect } from 'react';

// Get projectId from WalletConnect Cloud
const projectId = '6cdf8f3385abe52c71db1e86d8a627d6';

// Create metadata
const metadata = {
  name: 'AURA NFT Platform',
  description: 'Where digital art meets emotion',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [baseSepolia, base, mainnet, polygon, arbitrum] as const;

// Configure connectors with mobile-friendly options
const connectors = [
  metaMask({
    dappMetadata: metadata,
    useDeeplink: true, // Enable deep linking for mobile
    preferDesktop: false // Prefer mobile app over desktop
  }),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
    preference: 'all', // Allow both smart wallet and wallet link
    version: '4'
  })
];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  connectors,
  enableWalletConnect: false, // Disable WalletConnect to avoid relayer/origin issues
  enableInjected: true, // Enable injected wallets
  enableEIP6963: true, // Enable EIP-6963 for better wallet detection
  enableCoinbase: true // Enable Coinbase SDK
});

interface Web3ProviderProps {
  children: ReactNode;
}

let isWeb3ModalInitialized = false;

export function Web3Provider({ children }: Web3ProviderProps) {
  // Initialize Web3Modal only once globally
  useEffect(() => {
    if (!(window as any).__W3M_INITED) {
      createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: false, // Disable to prevent analytics errors
        enableOnramp: true,
        allowUnsupportedChain: false,
        themeMode: 'dark',
        themeVariables: {
          '--w3m-z-index': 1000
        }
      });
      (window as any).__W3M_INITED = true;
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}