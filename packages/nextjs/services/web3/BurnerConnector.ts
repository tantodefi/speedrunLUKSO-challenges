// Simplified version of a burner connector
// This is a replacement for the deleted BurnerConnector.ts file

import { Chain, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Base connector class (simplified)
class BaseConnector {
  readonly chains: Chain[];
  
  constructor(config: { chains?: Chain[] }) {
    this.chains = config.chains || [];
  }
  
  protected onAccountsChanged(): void { /* empty */ }
  protected onChainChanged(): void { /* empty */ }
  protected onDisconnect(): void { /* empty */ }
}

export type BurnerConnectorOptions = {
  chains?: Chain[];
};

export class BurnerConnector extends BaseConnector {
  readonly id = 'burner';
  readonly name = 'Burner Wallet';
  readonly ready = true;

  private account: ReturnType<typeof privateKeyToAccount> | undefined;
  
  constructor(config: { chains?: Chain[]; options?: BurnerConnectorOptions }) {
    super(config);
  }

  async connect() {
    // Generate or retrieve a private key
    const privateKey = this.getPrivateKey();
    
    // Create an account from the private key
    this.account = privateKeyToAccount(privateKey);
    
    // Return the connection details
    return {
      account: this.account.address,
      chain: {
        id: this.chains[0]?.id ?? 1,
        unsupported: false,
      },
    };
  }

  async disconnect(): Promise<void> {
    // Clear the stored account
    this.account = undefined;
  }

  async getAccount(): Promise<`0x${string}`> {
    if (!this.account) {
      throw new Error('Burner wallet is not connected');
    }
    return this.account.address;
  }

  async getChainId(): Promise<number> {
    return this.chains[0]?.id ?? 1;
  }

  async getProvider() {
    throw new Error('Burner wallet does not support getProvider');
  }

  async getSigner() {
    if (!this.account) {
      throw new Error('Burner wallet is not connected');
    }
    
    const client = createWalletClient({
      account: this.account,
      chain: this.chains[0],
      transport: http(),
    });
    
    return client;
  }

  async isAuthorized() {
    try {
      const privateKey = localStorage.getItem('burnerWalletPrivateKey');
      return !!privateKey;
    } catch {
      return false;
    }
  }

  private getPrivateKey(): `0x${string}` {
    try {
      // Try to retrieve from localStorage
      const storedKey = localStorage.getItem('burnerWalletPrivateKey');
      if (storedKey) {
        return storedKey as `0x${string}`;
      }
      
      // Generate a new private key (for demo purposes)
      // In a real app, you would use a more secure method
      const newKey = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;
      
      // Store it
      localStorage.setItem('burnerWalletPrivateKey', newKey);
      return newKey;
    } catch (error) {
      console.error('Failed to get or generate private key', error);
      throw new Error('Failed to get or generate private key');
    }
  }
} 