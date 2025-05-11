import { loadBurnerSK, saveBurnerSK } from "~~/hooks/scaffold-eth/useBurnerWallet";
import { Chain, Connector, ConnectorData } from "wagmi";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { BurnerConnector } from './BurnerConnector';

export class BurnerWalletConnector extends Connector {
  readonly id = "burner-wallet";
  readonly name = "Burner Wallet";
  readonly ready = true;
  
  #provider?: any;
  #account?: `0x${string}`;
  #chain?: { id: number; unsupported: boolean };
  #walletClient?: any;
  
  constructor(config: { chains?: Chain[]; options?: any }) {
    super({ ...config, options: { ...config.options } });
  }
  
  async connect(): Promise<Required<ConnectorData>> {
    // Get or generate a private key
    let privateKey = loadBurnerSK();
    if (!privateKey || privateKey === "0x") {
      privateKey = generatePrivateKey();
      saveBurnerSK(privateKey);
    }
    
    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    this.#account = account.address;
    
    // Set the chain to the first supported chain
    const chainId = this.chains[0]?.id || 31337;
    this.#chain = { id: chainId, unsupported: false };
    
    // Create a wallet client (not stored as we'll recreate as needed)
    const chain = this.chains.find(c => c.id === chainId) || this.chains[0];
    if (!chain) throw new Error("No chain found");
    
    const client = createWalletClient({
      account,
      chain,
      transport: http(),
    });
    
    this.#provider = client;
    this.#walletClient = client;
    
    return {
      account: account.address,
      chain: { id: chainId, unsupported: false },
    };
  }
  
  async disconnect(): Promise<void> {
    this.#provider = undefined;
    this.#account = undefined;
    this.#chain = undefined;
    this.#walletClient = undefined;
  }
  
  async getAccount(): Promise<`0x${string}`> {
    if (!this.#account) {
      throw new Error("No account set");
    }
    return this.#account;
  }
  
  async getChainId(): Promise<number> {
    if (!this.#chain) {
      throw new Error("No chain set");
    }
    return this.#chain.id;
  }
  
  async getProvider(): Promise<any> {
    return this.#provider;
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<any> {
    // If we have a wallet client and the chainId matches, return it
    if (this.#walletClient && (!chainId || chainId === this.#chain?.id)) {
      return this.#walletClient;
    }

    // Otherwise recreate the wallet client with the requested chain
    const privateKey = loadBurnerSK();
    const account = privateKeyToAccount(privateKey);
    
    const chain = chainId 
      ? this.chains.find(c => c.id === chainId) 
      : this.chains.find(c => c.id === this.#chain?.id) || this.chains[0];
    
    if (!chain) throw new Error(`Chain not found for chainId: ${chainId}`);
    
    const client = createWalletClient({
      account,
      chain,
      transport: http(),
    });
    
    this.#walletClient = client;
    return client;
  }
  
  async isAuthorized(): Promise<boolean> {
    try {
      const privateKey = loadBurnerSK();
      return !!privateKey && privateKey !== "0x";
    } catch {
      return false;
    }
  }
  
  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.emit("disconnect");
    } else {
      this.#account = accounts[0] as `0x${string}`;
      this.emit("change", { account: this.#account });
    }
  }
  
  protected onChainChanged(chainId: string | number): void {
    const id = Number(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.#chain = { id, unsupported };
    this.emit("change", { chain: { id, unsupported } });
  }
  
  protected onDisconnect(error: Error): void {
    this.emit("disconnect");
  }
}

export { BurnerConnector }; 