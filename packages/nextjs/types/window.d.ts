// Extended Ethereum provider interface with Universal Profile extension properties
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isUniversalProfileExtension?: boolean;
    request?: (...args: any[]) => Promise<any>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    [key: string]: any;
  };
} 