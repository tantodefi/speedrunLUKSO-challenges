import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import scaffoldConfig from "~~/scaffold.config";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const { walletConnectProjectId } = scaffoldConfig;
const targetNetworks = getTargetNetworks();

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains: targetNetworks, projectId: walletConnectProjectId }),
      walletConnectWallet({ chains: targetNetworks, projectId: walletConnectProjectId }),
      ledgerWallet({ chains: targetNetworks, projectId: walletConnectProjectId }),
      coinbaseWallet({ chains: targetNetworks, appName: "Scaffold-ETH 2" }),
      injectedWallet({ chains: targetNetworks }),
      rainbowWallet({ chains: targetNetworks, projectId: walletConnectProjectId }),
      safeWallet({ chains: targetNetworks }),
    ],
  },
]);
