import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Connector } from "wagmi";
import { Chain } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { BurnerWalletConnector } from "./burnerWalletConnector";

type InstructionStepName = "install" | "connect" | "create";
type WalletStep = {
  description: string;
  step: InstructionStepName;
  title: string;
};

const { walletConnectProjectId } = scaffoldConfig;

// Custom function to check if Universal Profile extension is installed
const isUniversalProfileExtensionInstalled = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for the UP extension marker
  if (window.ethereum?.isUniversalProfileExtension) return true;
  
  // Check for UP extension in multiple providers scenario
  if (window.ethereum?.providers?.some((p: any) => p.isUniversalProfileExtension)) return true;
  
  return false;
};

// Custom Universal Profile (UP) Extension Wallet for LUKSO
const universalProfileWallet = ({
  chains,
  projectId,
}: {
  chains: Chain[];
  projectId?: string;
}) => {
  const upWallet = {
    id: "universal-profile",
    name: "Universal Profile",
    iconUrl: "https://lh3.googleusercontent.com/K10ZSC-D3dojnJIEQXbjVlqzDYTGxLqwvmBFyMDGmGe8gtjiFQcFOm6C5JrjOBOgK5ElcJCMvWeJ-rA2fkVkVx7JDg=s128-rj-sc0x00ffffff",
    iconBackground: "#ffffff",
    downloadUrls: {
      chrome:
        "https://chrome.google.com/webstore/detail/universal-profile-browser/abpickdkkbnbcoepogfhkhennhfhehfn",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/up-browser-extension/",
    },
    createConnector: () => {
      const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
      
      const isUPExtensionInstalled = isUniversalProfileExtensionInstalled();

      const injectedWalletInstance = injectedWallet({ 
        chains,
        shimDisconnect: true
      });

      const walletSteps: WalletStep[] = [
        {
          description: "We recommend using the Universal Profile extension for LUKSO.",
          step: "install",
          title: "Install the Universal Profile extension",
        },
        {
          description: "After installing the extension, create or import a Universal Profile",
          step: "create",
          title: "Create or Import Universal Profile",
        },
        {
          description: "Once you set up your Universal Profile wallet, you're ready to connect",
          step: "connect",
          title: "Connect to this website",
        },
      ];

      return {
        connector: injectedWalletInstance.createConnector().connector,
        extension: {
          instructions: {
            learnMoreUrl: "https://docs.lukso.tech/guides/browser-extension/install-browser-extension/",
            steps: walletSteps,
          },
        },
        getProvider: async () => {
          if (!isUPExtensionInstalled) {
            throw new Error("Universal Profile Extension not installed");
          }
          
          // Find the UP provider in case of multiple providers
          if (window.ethereum?.providers) {
            const upProvider = window.ethereum.providers.find((p: any) => p.isUniversalProfileExtension);
            if (upProvider) return upProvider;
          }
          
          return provider;
        },
      };
    },
  };

  return upWallet;
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