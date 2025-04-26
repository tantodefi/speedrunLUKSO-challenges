# Integrating @lukso/up-provider with Next.js

This guide documents the steps to integrate the [@lukso/up-provider](https://www.npmjs.com/package/@lukso/up-provider) package into a Next.js app. Follow these steps to add Universal Profiles support, listen for account events, and provide accounts to your app’s state.

### Integrating @lukso/up-provider (Checkpoint 1)

Follow these steps to add Universal Profiles support to your Next.js app using the [@lukso/up-provider](https://www.npmjs.com/package/@lukso/up-provider) and the official LUKSO miniapp template pattern:

1. **Install the up-provider package**
   ```sh
   npm install @lukso/up-provider --legacy-peer-deps
   ```

2. **Create an UpProvider component** in `packages/nextjs/components/UpProvider.tsx`:
   ```tsx
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
     type ReactNode,
     useMemo,
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
   const provider = typeof window !== "undefined" ? createClientUPProvider() : null;

   export function useUpProvider() {
     const context = useContext(UpContext);
     if (!context) {
       throw new Error("useUpProvider must be used within a UpProvider");
     }
     return context;
   }

   export function UpProvider({ children }: { children: React.ReactNode }) {
     const [chainId, setChainId] = useState<number>(0);
     const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
     const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>([]);
     const [walletConnected, setWalletConnected] = useState(false);
     const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(null);
     const [isSearching, setIsSearching] = useState(false);
     const [account] = accounts ?? [];
     const [contextAccount] = contextAccounts ?? [];

     const client = useMemo(() => {
       if (provider && chainId) {
         return createWalletClient({
           chain: chainId === 42 ? lukso : luksoTestnet,
           transport: custom(provider),
         });
       }
       return null;
     }, [chainId]);

     useEffect(() => {
       let mounted = true;
       async function init() {
         try {
           if (!client || !provider) return;
           const _accounts = (await provider.request("eth_accounts", [])) as Array<`0x${string}`>;
           if (!mounted) return;
           setAccounts(_accounts);
           const _chainId = (await provider.request("eth_chainId")) as number;
           if (!mounted) return;
           setChainId(_chainId);
           const _contextAccounts = provider.contextAccounts;
           if (!mounted) return;
           setContextAccounts(_contextAccounts);
           setWalletConnected(_accounts[0] != null && _contextAccounts[0] != null);
         } catch (error) {
           console.error(error);
         }
       }
       init();
       if (provider) {
         const accountsChanged = (_accounts: Array<`0x${string}`>) => {
           setAccounts(_accounts);
           setWalletConnected(_accounts[0] != null && contextAccount != null);
         };
         const contextAccountsChanged = (_accounts: Array<`0x${string}`>) => {
           setContextAccounts(_accounts);
           setWalletConnected(account != null && _accounts[0] != null);
         };
         const chainChanged = (_chainId: number) => {
           setChainId(_chainId);
         };
         provider.on("accountsChanged", accountsChanged);
         provider.on("chainChanged", chainChanged);
         provider.on("contextAccountsChanged", contextAccountsChanged);
         return () => {
           mounted = false;
           provider.removeListener("accountsChanged", accountsChanged);
           provider.removeListener("contextAccountsChanged", contextAccountsChanged);
           provider.removeListener("chainChanged", chainChanged);
         };
       }
     }, [client, account, contextAccount]);

     const data = useMemo(() => {
       return {
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
     }, [
       client,
       chainId,
       accounts,
       contextAccounts,
       walletConnected,
       selectedAddress,
       isSearching,
     ]);
     return (
       <UpContext.Provider value={data}>
         <div className="min-h-screen flex items-center justify-center">
           {children}
         </div>
       </UpContext.Provider>
     );
   }
   ```

3. **Wrap your app with UpProvider** in `packages/nextjs/components/ScaffoldEthAppWithProviders.tsx`:
   ```tsx
   import { UpProvider } from "./UpProvider";
   // ...
   return (
     <UpProvider>
       {/* other providers */}
       <WagmiProvider config={wagmiConfig}>
         <QueryClientProvider client={queryClient}>
           <ProgressBar />
           <RainbowKitProvider /* ... */>
             <ScaffoldEthApp>{children}</ScaffoldEthApp>
           </RainbowKitProvider>
         </QueryClientProvider>
       </WagmiProvider>
     </UpProvider>
   );
   ```

4. **Consume the UP context anywhere in your app:**
   ```tsx
   import { useUpProvider } from "./UpProvider";
   const {
     accounts,
     contextAccounts,
     walletConnected,
     chainId,
     selectedAddress,
     setSelectedAddress,
     // ...etc
   } = useUpProvider();
   ```

- The `UpProvider` component manages all UP connection state, events, and provides a `useUpProvider` hook for easy access.
- If you have dependency conflicts, use `--legacy-peer-deps` during installation.
- Make sure all children that need UP accounts are wrapped by the `UpProvider`.

---

With these steps, your Next.js app now supports Universal Profiles via the LUKSO up-provider, and all account changes are logged and available in app state.
