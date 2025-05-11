import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Chain } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { BurnerWalletConnector } from "./burnerWalletConnector";

const { walletConnectProjectId } = scaffoldConfig;

// Custom Universal Profile (UP) Extension Wallet for LUKSO
const universalProfileWallet = ({
  chains,
  projectId,
}: {
  chains: Chain[];
  projectId?: string;
}) => {
  const injectedWalletInstance = injectedWallet({ chains });
  
  return {
    id: "universal-profile",
    name: "Universal Profile",
    iconUrl: "https://lh3.googleusercontent.com/K10ZSC-D3dojnJIEQXbjVlqzDYTGxLqwvmBFyMDGmGe8gtjiFQcFOm6C5JrjOBOgK5ElcJCMvWeJ-rA2fkVkVx7JDg=s128-rj-sc0x00ffffff",
    iconBackground: "#ffffff",
    downloadUrls: {
      chrome:
        "https://chrome.google.com/webstore/detail/universal-profile-browser/abpickdkkbnbcoepogfhkhennhfhehfn",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/up-browser-extension/",
    },
    createConnector: injectedWalletInstance.createConnector,
  };
};

// Custom burner wallet for local development
const burnerWallet = ({ chains }: { chains: Chain[] }) => {
  return {
    id: "burner-wallet",
    name: "Burner Wallet",
    iconUrl: "https://avatars.githubusercontent.com/u/56928858?s=200&v=4", 
    iconBackground: "#1E1F20",
    createConnector: () => {
      return {
        connector: new BurnerWalletConnector({ chains }),
      };
    },
  };
};

export const getWalletConnectors = (chains: Chain[]) => {
  // Filter for local development chains
  const localChains = chains.filter(chain => chain.id === 31337);
  const showBurnerWallet = localChains.length > 0 || !scaffoldConfig.onlyLocalBurnerWallet;

  return connectorsForWallets([
    {
      groupName: "LUKSO Wallets",
      wallets: [
        universalProfileWallet({ chains, projectId: walletConnectProjectId }),
      ],
    },
    ...(showBurnerWallet ? [{
      groupName: "Development",
      wallets: [
        burnerWallet({ chains }),
      ],
    }] : []),
    {
      groupName: "Popular Wallets",
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({ chains, projectId: walletConnectProjectId }),
        walletConnectWallet({ chains, projectId: walletConnectProjectId }),
        coinbaseWallet({ chains, appName: "Scaffold-ETH 2" }),
        ledgerWallet({ chains, projectId: walletConnectProjectId }),
        rainbowWallet({ chains, projectId: walletConnectProjectId }),
      ],
    },
  ]);
}; 