import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { walletConnect, metaMask, coinbaseWallet } from 'wagmi/connectors';

import { ReactNode } from 'react';

// Get projectId from WalletConnect Cloud
const projectId = '6cdf8f3385abe52c71db1e86d8a627d6';

// Create metadata
const metadata = {
  name: 'AURA NFT Platform',
  description: 'Where digital art meets emotion',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, polygon, arbitrum, base] as const;

// Configure connectors explicitly
const connectors = [
  walletConnect({ 
    projectId,
    metadata,
    showQrModal: true
  }),
  metaMask(),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0]
  })
];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  connectors
});

// Create modal with explicit configuration
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  allowUnsupportedChain: false,
  tokens: {
    1: {
      address: '0xA0b86a33E6441b342c22e4b4BdC4E5E61d66e59f'
    }
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}