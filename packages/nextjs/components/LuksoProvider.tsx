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
      try {
        const up = createClientUPProvider();
        setProvider(up);

        up.on("accountsChanged", (accounts: Array<`0x${string}`>) => {
          setAccounts(accounts);
          setWalletConnected(accounts.length > 0);
        });

        up.on("chainChanged", (chainId: number) => {
          setChainId(chainId);
        });
      } catch (e) {
        console.warn("No UP found. Continuing without a Universal Profile provider.");
        setProvider(null);
      }
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
