"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useUpProvider } from "../components/LuksoProvider";
import ERC725 from "@erc725/erc725.js";
// Use the official LSP3ProfileMetadata schema
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

const Home: NextPage = () => {
  // State for copy-to-clipboard feedback
  const [copiedGridOwner, setCopiedGridOwner] = useState(false);
  const [copiedConnectedUP, setCopiedConnectedUP] = useState(false);
  // Logging to confirm re-renders and context updates
  const { contextAccounts = [], accounts = [] } = useUpProvider();
  useEffect(() => {
    console.log("Rendering Home", { contextAccounts, accounts });
  }, [contextAccounts, accounts]);
  const gridOwner = contextAccounts[0] || "None";
  const connectedUP = accounts[0] || "None";

  // Defensive: Only fetch profiles if address is valid
  // Helper to check if address is a valid 0x address
  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // 2. State for both UP profiles
  const [ownerProfile, setOwnerProfile] = useState<{ username: string; image: string; loading: boolean }>({ username: '', image: '', loading: false });
  const [connectedProfile, setConnectedProfile] = useState<{ username: string; image: string; loading: boolean }>({ username: '', image: '', loading: false });

  const IPFS_GATEWAYS = [
    "https://ipfs.lukso.network/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/"
  ];

  async function fetchIpfsJson(ipfsHash: string): Promise<any> {
    let lastError;
    for (const gateway of IPFS_GATEWAYS) {
      const url = gateway + ipfsHash;
      try {
        const res = await fetch(url, { method: "GET" });
        if (res.ok) {
          return await res.json();
        }
        lastError = new Error(`HTTP ${res.status} at ${url}`);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("All IPFS gateways failed");
  }

  async function resolveIpfsUrl(ipfsUrl: string): Promise<string> {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    for (const gateway of IPFS_GATEWAYS) {
      const url = gateway + ipfsHash;
      try {
        // Try a HEAD request to check if the file exists
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return url;
      } catch (e) {}
    }
    // Fallback to first gateway
    return IPFS_GATEWAYS[0] + ipfsHash;
  }

  // 3. Fetch profile for a given address
  async function fetchProfile(address: string): Promise<{ username: string; image: string }> {
    console.log(`[fetchProfile] Called with address:`, address);
    const isValid = isValidAddress(address);
    console.log(`[fetchProfile] Address is valid:`, isValid);
    if (!isValid) {
      console.warn(`[fetchProfile] Invalid address passed:`, address);
      return { username: '', image: '' };
    }

    // Try mainnet first, then testnet
    const mainnetRpc = "https://rpc.mainnet.lukso.network";
    const testnetRpc = "https://rpc.testnet.lukso.network";
    let lsp3: any = null;
    let rpcTried = '';
    // Helper to fetch from a given RPC
    async function tryFetch(rpcUrl: string) {
      const erc725 = new ERC725(LSP3ProfileSchema, address, rpcUrl);
      try {
        const profileData = await erc725.getData("LSP3Profile");
        console.log(`[fetchProfile] .getData result for ${address} on ${rpcUrl}:`, profileData);
        return profileData?.value || profileData;
      } catch (err) {
        console.warn(`[fetchProfile] .getData failed for ${address} on ${rpcUrl}, trying .fetchData...`, err);
        try {
          const profileData = await erc725.fetchData("LSP3Profile");
          console.log(`[fetchProfile] .fetchData result for ${address} on ${rpcUrl}:`, profileData);
          return profileData?.value || profileData;
        } catch (err2) {
          console.error(`[fetchProfile] Both .getData and .fetchData failed for ${address} on ${rpcUrl}:`, err2);
          return null;
        }
      }
    }
    // Try mainnet
    lsp3 = await tryFetch(mainnetRpc);
    rpcTried = 'mainnet';
    // If not found, try testnet
    if (!lsp3 || typeof lsp3 !== 'object') {
      lsp3 = await tryFetch(testnetRpc);
      rpcTried = 'testnet';
    }
    if (lsp3 && typeof lsp3 === 'object') {
      // If the value is an object with a 'url', fetch and parse it as JSON from multiple gateways
      if ('url' in lsp3 && typeof lsp3.url === 'string') {
        let ipfsUrl = lsp3.url;
        if (ipfsUrl.startsWith('ipfs://')) {
          const ipfsHash = ipfsUrl.replace('ipfs://', '');
          try {
            const profileJson = await fetchIpfsJson(ipfsHash);
            // If the profile JSON has a nested LSP3Profile, use it
            const profile = profileJson.LSP3Profile || profileJson;
            const username = profile.name || '';
            let image = '';
            if (Array.isArray(profile.profileImage) && profile.profileImage.length > 0) {
              let url = profile.profileImage[0].url;
              if (url && url.startsWith('ipfs://')) {
                url = await resolveIpfsUrl(url);
              }
              image = url;
            }
            console.log(`[fetchProfile] Loaded and parsed profile JSON for ${address}:`, profileJson);
            return { username, image };
          } catch (err) {
            console.error(`[fetchProfile] Failed to fetch/parse profile JSON from all gateways for ${ipfsUrl}:`, err);
            // fallback: just show the first gateway's URL as image
            return { username: '', image: IPFS_GATEWAYS[0] + ipfsHash };
          }
        }
      }
      // Otherwise, handle as a normal LSP3Profile object
      const profile = lsp3.LSP3Profile || lsp3;
      const username = profile.name || '';
      let image = '';
      if (Array.isArray(lsp3.profileImage) && lsp3.profileImage.length > 0) {
        let url = lsp3.profileImage[0].url;
        if (url && url.startsWith('ipfs://')) {
          url = 'https://ipfs.lukso.network/ipfs/' + url.replace('ipfs://', '');
        }
        image = url;
      }
      console.log(`[fetchProfile] Profile for ${address} (${rpcTried}):`, { username, image, raw: lsp3 });
      return { username, image };
    }
    console.warn(`[fetchProfile] No valid LSP3Profile found for ${address} on mainnet or testnet`);
    return { username: '', image: '' };
  }

  // 4. Fetch both profiles on change, but only for valid addresses
  useEffect(() => {
    if (isValidAddress(gridOwner)) {
      setOwnerProfile(p => ({ ...p, loading: true }));
      fetchProfile(gridOwner)
        .then(res => setOwnerProfile({ ...res, loading: false }))
        .catch(() => setOwnerProfile({ username: '', image: '', loading: false }));
    } else {
      setOwnerProfile({ username: '', image: '', loading: false });
    }
    if (isValidAddress(connectedUP)) {
      setConnectedProfile(p => ({ ...p, loading: true }));
      fetchProfile(connectedUP)
        .then(res => setConnectedProfile({ ...res, loading: false }))
        .catch(() => setConnectedProfile({ username: '', image: '', loading: false }));
    } else {
      setConnectedProfile({ username: '', image: '', loading: false });
    }
  }, [gridOwner, connectedUP]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {contextAccounts.length === 0 && (
        <div className="mb-8 p-4 rounded-lg bg-warning text-warning-content shadow w-full max-w-xl">
          Loading Universal Profile context... (Make sure your UP extension is installed and connected)
        </div>
      )}
      <div className="mb-8 p-4 rounded-lg bg-base-200 shadow w-full max-w-xl">
        <div className="flex flex-col gap-6">
          {/* (Section removed; now grouped below header) */}
        </div>
      </div>
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">SpeedRunLUKSO</span>
          <span className="block text-4xl font-bold">Challenge #5: Grid Mini Dapp Challenge </span>
        </h1>
        <p className="text-center text-lg">
          This homepage demonstrates how to listen to Universal Profile (UP) events and fetch LSP3Profile data using <code>@erc725/erc725.js</code>.
        </p>
        <p className="text-center text-lg mt-2">
          Edit <code>packages/nextjs/app/page.tsx</code> to customize this logic for your dapp!
        </p>
      </div>
      {/* Grid Owner & Connected UP Section moved below header */}
      <div className="mb-8 p-4 rounded-lg bg-base-200 shadow w-full max-w-xl flex flex-col gap-8">
        {/* Grid Owner */}
        <div>
          <div className="font-bold">Grid Owner Address:</div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={ownerProfile.image || '/default-avatar.png'}
              alt="Grid Owner Avatar"
              className="w-10 h-10 rounded-full border"
              onError={e => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/default-avatar.jpg')) {
                  target.src = '/default-avatar.jpg';
                }
              }}
            />
            <span className="break-all text-base-content/80">{gridOwner}</span>
            <button
              className="btn btn-xs btn-outline ml-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(gridOwner);
                } catch (err) {
                  // Fallback for browsers where Clipboard API is blocked
                  const textArea = document.createElement('textarea');
                  textArea.value = gridOwner;
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                  } catch {}
                  document.body.removeChild(textArea);
                }
                setCopiedGridOwner(true);
                setTimeout(() => setCopiedGridOwner(false), 1200);
              }}
              title="Copy address"
            >
              {copiedGridOwner ? "Copied!" : "Copy"}
            </button>
          </div>
          {ownerProfile.username && (
            <div className="mt-1">
              <span className="font-bold">Username: </span>
              <span>{ownerProfile.username}</span>
            </div>
          )}
        </div>
        {/* Connected UP */}
        <div>
          <div className="font-bold">Connected UP Address:</div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={connectedProfile.image || '/default-avatar.png'}
              alt="Connected UP Avatar"
              className="w-10 h-10 rounded-full border"
              onError={e => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/default-avatar.jpg')) {
                  target.src = '/default-avatar.jpg';
                }
              }}
            />
            <span className="break-all text-base-content/80">{connectedUP}</span>
            <button
              className="btn btn-xs btn-outline ml-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(connectedUP);
                } catch (err) {
                  // Fallback for browsers where Clipboard API is blocked
                  const textArea = document.createElement('textarea');
                  textArea.value = connectedUP;
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                  } catch {}
                  document.body.removeChild(textArea);
                }
                setCopiedConnectedUP(true);
                setTimeout(() => setCopiedConnectedUP(false), 1200);
              }}
              title="Copy address"
            >
              {copiedConnectedUP ? "Copied!" : "Copy"}
            </button>
          </div>
          {connectedProfile.username && (
            <div className="mt-1">
              <span className="font-bold">Username: </span>
              <span>{connectedProfile.username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
