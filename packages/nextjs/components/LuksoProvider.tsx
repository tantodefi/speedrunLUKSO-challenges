"use client";
import {
  createClientUPProvider,
  type UPClientProvider,
} from "@lukso/up-provider";
import { createWalletClient, custom } from "viem";
import { lukso, luksoTestnet } from "viem/chains";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";

interface UpProviderContext {
  provider: UPClientProvider | null;
  client: ReturnType<typeof createWalletClient> | null;
  chainId: number;
  accounts: Array<`0x${string}`>;
  contextAccounts: Array<`0x${string}`>;
  walletConnected: boolean;
  selectedAddress: `0x${string}` | null;
  setSelectedAddress: (address: `0x${string}` | null) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const UpContext = createContext<UpProviderContext | undefined>(undefined);
// Remove top-level provider initialization; move to useEffect in UpProvider.

const defaultUpProviderContext: UpProviderContext = {
  provider: null,
  client: null,
  chainId: 0,
  accounts: [],
  contextAccounts: [],
  walletConnected: false,
  selectedAddress: null,
  setSelectedAddress: () => {},
  isSearching: false,
  setIsSearching: () => {},
};

export function useUpProvider() {
  const context = useContext(UpContext);
  if (!context) {
    if (typeof window !== "undefined") {
      console.warn("useUpProvider was called outside of UpProvider. Returning default context.");
    }
    return defaultUpProviderContext;
  }
  return context;
}

interface UpProviderProps {
  children: ReactNode;
}

export function UpProvider({ children }: UpProviderProps) {
  const [provider, setProvider] = useState<UPClientProvider | null>(null);
  const [chainId, setChainId] = useState<number>(0);
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Only initialize UP provider on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Provider detection logging
      console.log("[LuksoProvider] window.lukso:", window.lukso);
      console.log("[LuksoProvider] window.ethereum:", window.ethereum);
      const up = createClientUPProvider();
      setProvider(up);
      if (window.lukso) {
        console.log("[LuksoProvider] Universal Profile provider detected.");
      } else if (window.ethereum) {
        console.log("[LuksoProvider] Standard EVM provider detected (MetaMask, WalletConnect, etc).");
      } else {
        console.log("[LuksoProvider] No provider detected in window.");
      }

      try {
        const allowed = up.allowedAccounts || [];
        setAccounts(allowed);
        const context = up.contextAccounts || [];
        setContextAccounts(context);
        if (context.length > 0) {
          console.log("[LuksoProvider] Initial grid owner (context account):", context[0]);
        } else {
          console.log("[LuksoProvider] No initial context accounts (no grid owner)");
        }
        setWalletConnected(allowed.length > 0 && context.length > 0);
      } catch (e) {
        console.error("[LuksoProvider] Error initializing accounts/contextAccounts:", e);
      }

      const accountsChanged = (_accounts: Array<`0x${string}`>) => {
        setAccounts(_accounts);
        setWalletConnected(_accounts.length > 0 && (up.contextAccounts?.length ?? 0) > 0);
        console.log("[LuksoProvider] accountsChanged:", _accounts);
      };
      const contextAccountsChanged = (_contextAccounts: Array<`0x${string}`>) => {
        setContextAccounts(_contextAccounts);
        setWalletConnected((up.allowedAccounts?.length ?? 0) > 0 && _contextAccounts.length > 0);
        if (_contextAccounts.length > 0) {
          console.log("[LuksoProvider] contextAccountsChanged, grid owner:", _contextAccounts[0]);
        } else {
          console.log("[LuksoProvider] contextAccountsChanged, no grid owner");
        }
      };
      const chainChanged = (_chainId: number) => {
        setChainId(_chainId);
        console.log("[LuksoProvider] chainChanged:", _chainId);
      };
      up.on("accountsChanged", accountsChanged);
      up.on("contextAccountsChanged", contextAccountsChanged);
      up.on("chainChanged", chainChanged);
      return () => {
        up.removeListener("accountsChanged", accountsChanged);
        up.removeListener("contextAccountsChanged", contextAccountsChanged);
        up.removeListener("chainChanged", chainChanged);
      };
    }
  }, []);

  const client = useMemo(() => {
    if (provider && chainId) {
      try {
        return createWalletClient({
          chain: chainId === 42 ? lukso : luksoTestnet,
          transport: custom(provider),
        });
      } catch (e) {
        console.warn("Could not create wallet client:", e);
        return null;
      }
    }
    return null;
  }, [chainId, provider]);

  const value: UpProviderContext = {
    provider,
    client,
    chainId,
    accounts,
    contextAccounts,
    walletConnected,
    selectedAddress,
    setSelectedAddress,
    isSearching,
    setIsSearching,
  };

  return <UpContext.Provider value={value}>{children}</UpContext.Provider>;
}
