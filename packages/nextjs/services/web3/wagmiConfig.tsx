import { Chain } from "viem";
import { configureChains, createConfig } from "wagmi";
import { hardhat, mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getWalletConnectors } from "./rainbowWallets";
import scaffoldConfig from "~~/scaffold.config";

// LUKSO chains
export const luksoMainnet = {
  id: 42,
  name: "LUKSO Mainnet",
  network: "lukso",
  nativeCurrency: {
    name: "LUKSO",
    symbol: "LYX",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.lukso.gateway.fm"],
    },
    public: {
      http: ["https://rpc.lukso.gateway.fm"],
    },
  },
  blockExplorers: {
    default: { name: "LUKSO Explorer", url: "https://explorer.lukso.network" },
  },
} as const satisfies Chain;

export const luksoTestnet = {
  id: 4201,
  name: "LUKSO Testnet",
  network: "lukso-testnet",
  nativeCurrency: {
    name: "LUKSO Testnet",
    symbol: "LYXt",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.lukso.network"],
    },
    public: {
      http: ["https://rpc.testnet.lukso.network"],
    },
  },
  blockExplorers: {
    default: { name: "LUKSO Testnet Explorer", url: "https://explorer.testnet.lukso.network" },
  },
} as const satisfies Chain;

const { targetNetworks, alchemyApiKey } = scaffoldConfig;

// Add LUKSO networks to targetNetworks if targeting LUKSO
const luksoNetworks = [luksoMainnet, luksoTestnet];
const allNetworks = [...targetNetworks, ...luksoNetworks];

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const chainArray = allNetworks.find((network: Chain) => network.id === 1)
  ? allNetworks
  : [...allNetworks, mainnet];

// Convert readonly array to regular array for RainbowKit compatibility
export const enabledChains = [...chainArray];

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  enabledChains,
  [
    alchemyProvider({ apiKey: alchemyApiKey }),
    publicProvider(),
  ]
);

// Get custom wallet connectors including Universal Profile for LUKSO
const connectors = getWalletConnectors(chains);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
