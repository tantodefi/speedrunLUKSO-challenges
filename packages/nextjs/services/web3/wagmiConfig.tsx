import { wagmiConnectors } from "./wagmiConnectors";
import { Chain } from "viem";
import { configureChains, createConfig } from "wagmi";
import { hardhat, mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const chainArray = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : [...targetNetworks, mainnet];

// Convert readonly array to regular array for RainbowKit compatibility
export const enabledChains = [...chainArray];

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  enabledChains,
  [
    alchemyProvider({ apiKey: scaffoldConfig.alchemyApiKey }),
    publicProvider(),
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: wagmiConnectors,
  publicClient,
  webSocketPublicClient,
});
