import { FC, ReactNode } from 'react'
import { ConnectKitProvider } from 'connectkit'
import { publicProvider } from 'wagmi/providers/public'
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { ChainUpdateListener } from './ChainUpdateListener'

const { chains, provider, webSocketProvider } = configureChains([chain.hardhat], [publicProvider()])

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

export const WalletConnector: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <ChainUpdateListener>{children}</ChainUpdateListener>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
