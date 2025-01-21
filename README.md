# 🚩 Challenge 7: 🎨 SVG NFT on LUKSO using LSP8

![readme-7](https://github.com/scaffold-eth/se-2-challenges/assets/25638585/94178d41-f7ce-4d0f-af9a-488a224d301f)

🎨 Creating on-chain SVG NFTs using LUKSO's LSP8 standard adds exciting new possibilities to generating unique digital art. This challenge will have you build a contract that generates dynamic SVG images directly on the blockchain, leveraging LUKSO's advanced NFT features.

### 🤔 Key Differences: ERC721 vs LSP8 for SVG NFTs

1. **Token Identification**
   - ERC721: Uses `uint256` for token IDs
   - LSP8: Uses `bytes32` for token IDs, allowing for more flexible identification schemes

2. **Metadata Handling**
   - ERC721: Relies on tokenURI pattern returning JSON
   - LSP8: Uses LSP4 Digital Asset Metadata standard for richer on-chain metadata

3. **Transfer Mechanics**
   - ERC721: Basic transfer with approval system
   - LSP8: Enhanced transfers with hooks and data parameters

4. **Interface Support**
   - ERC721: Basic ERC165 interface detection
   - LSP8: LSP1 Universal Receiver for advanced contract interactions

### 📝 Contract Changes

We've provided two versions of the collectible contract:
- `YourCollectible.sol`: Traditional ERC721 implementation
- `YourLSP8Collectible.sol`: LUKSO LSP8 implementation

Key changes in the LSP8 version:
```solidity
// Token ID conversion for SVG NFTs
function mintItem(address to, string memory tokenURI) public returns (bytes32) {
    _tokenIds += 1;
    bytes32 tokenId = bytes32(uint256(_tokenIds));
    _tokenURIs[tokenId] = tokenURI;
    _mint(to, tokenId, true, "");
    return tokenId;
}
```

### 🔍 Setting Metadata for SVG NFTs

After deploying your LSP8 SVG NFT contract, set the metadata:

```typescript
import { ERC725YDataKeys } from '@lukso/lsp-smart-contracts';

// Set collection metadata
await nftContract.setData(
    LSP4_METADATA_KEY,
    encodeMetadata({
        name: "My SVG Collection",
        description: "On-chain SVG NFTs on LUKSO",
        links: [{
            title: "Collection Website",
            url: "https://your-website.com"
        }],
        images: [{
            width: 1000,
            height: 1000,
            url: "ipfs://your-collection-image-hash",
        }],
    })
);

// Set verified creators
const creatorAddress = "0x..."; // Your creator address
await nftContract.setDataBatch(
    [
        ERC725YDataKeys.LSP4["LSP4Creators[]"].length,
        ERC725YDataKeys.LSP4["LSP4Creators[]"].key,
        ERC725YDataKeys.LSP4.LSP4CreatorsMap + creatorAddress.substring(2)
    ],
    [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x" + creatorAddress.substring(2).padStart(64, "0"),
        "0x" + "00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
    ]
);
```

### 🎯 Challenge Goals:

- [ ] Study the differences between ERC721 and LSP8 implementations
- [ ] Deploy the LSP8 SVG NFT contract to LUKSO testnet
- [ ] Set proper metadata using LSP4 standard
- [ ] Generate dynamic SVGs on-chain
- [ ] Create an interactive minting interface
- [ ] Test all LSP8-specific features (force transfers, data parameters)

### ⚔️ Side Quests:

- [ ] Add dynamic SVG generation based on token metadata
- [ ] Implement LSP1 Universal Receiver for enhanced interactions
- [ ] Create a more complex metadata structure with multiple images and attributes
- [ ] Add custom transfer hooks using LSP8's data parameter feature

🎨 Creating on-chain SVG NFTs is an exciting way to leverage the power of smart contracts for generating unique digital art. This challenge will have you build a contract that generates dynamic SVG images directly on the blockchain. Users will be able to mint their own unique NFTs with customizable SVG graphics and metadata.

🔗 Your contract will handle the creation and storage of the SVG code, ensuring each minted NFT is unique and stored entirely on-chain. This approach keeps the artwork decentralized and immutable.

💎 The objective is to develop an app that allows users to mint their own dynamic SVG NFTs. Customize your SVG generation logic and make the minting process interactive and engaging.

🚀 Once your project is live, share the minting URL so others can see and mint their unique SVG NFTs!

🌟 Use Loogies NFT as an example to guide your project. This will provide a solid foundation and inspiration for creating your own dynamic SVG NFTs.

> 💬 Meet other builders working on this challenge and get help in the [🎁 SVG NFT 🎫 Building Cohort](https://t.me/+mUeITJ5u7Ig0ZWJh)!

---

## 📜 Quest Journal 🧭

This challenge is brimming with creative freedom, giving you the opportunity to explore various approaches!

🌟 To help guide your efforts, consider the following goals. Additionally, the current branch includes an example of SVG NFTs, the Loogies. Feel free to use it as inspiration or start your project entirely from scratch! 🚀

### 🥅 Goals:

- [ ] Design and implement SVG generation logic within the contract
- [ ] Add metadata generation functionality to the smart contract
- [ ] Make sure metadata is stored and retrievable on-chain
- [ ] Ensure each minted NFT is unique and customizable
- [ ] Create UI for minting and interaction with your smart contracts

### ⚔️ Side Quests:

- [ ] Leave the minting funds in the contract, so the minter does not pay extra gas to send the funds to the recipient address. Create a `Withdraw()` function to allow the owner to withdraw the funds.
- [ ] Explore other [pricing models for minting NFTs](https://docs.artblocks.io/creator-docs/minter-suite/minting-philosophy/), such as dutch auctions (with or without settlement)
- [ ] Set different phases for minting, such as a discount for early adopters (allowlisted). Manage the allowlist and the functions to switch between phases.

---

## Checkpoint 0: 📦 Environment 📚

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

Then download the challenge to your computer and install dependencies by running:

```sh
git clone https://github.com/scaffold-eth/se-2-challenges.git challenge-7-svg-nft
cd challenge-7-svg-nft
git checkout challenge-7-svg-nft
yarn install
```

> in the same terminal, start your local network (a blockchain emulator in your computer):

```sh
yarn chain
```

> in a second terminal window, 🛰 deploy your contract (locally):

```sh
cd challenge-7-svg-nft
yarn deploy
```

> in a third terminal window, start your 📱 frontend:

```sh
cd challenge-7-svg-nft
yarn start
```

📱 Open http://localhost:3000 to see the app.

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend, update your current contracts with changes, or re-deploy it to get a fresh contract address.

🔏 Now you are ready to edit your smart contracts `YourCollectible.sol` in `packages/hardhat/contracts`

---

## Checkpoint 1: 💾 Deploy your contracts! 🛰

📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/hardhat/hardhat.config.ts`

🔐 You will need to generate a **deployer address** using `yarn generate` This creates a mnemonic and saves it locally.

👩‍🚀 Use `yarn account` to view your deployer account balances.

⛽️ You will need to send ETH to your **deployer address** with your wallet, or get it from a public faucet of your chosen network.

🚀 Run `yarn deploy` to deploy your smart contract to a public network (selected in `hardhat.config.ts`)

> 💬 Hint: You can set the `defaultNetwork` in `hardhat.config.ts` to `sepolia` **OR** you can `yarn deploy --network sepolia`.

---

## Checkpoint 2: 🚢 Ship your frontend! 🚁

✏️ Edit your frontend config in `packages/nextjs/scaffold.config.ts` to change the `targetNetwork` to `chains.sepolia` or any other public network.

💻 View your frontend at http://localhost:3000 and verify you see the correct network.

📡 When you are ready to ship the frontend app...

📦 Run `yarn vercel` to package up your frontend and deploy.

> Follow the steps to deploy to Vercel. Once you log in (email, github, etc), the default options should work. It'll give you a public URL.

> If you want to redeploy to the same production URL you can run `yarn vercel --prod`. If you omit the `--prod` flag it will deploy it to a preview/test URL.

> 🦊 Since we have deployed to a public testnet, you will now need to connect using a wallet you own or use a burner wallet. By default 🔥 `burner wallets` are only available on `hardhat` . You can enable them on every chain by setting `onlyLocalBurnerWallet: false` in your frontend config (`scaffold.config.ts` in `packages/nextjs/`)

#### Configuration of Third-Party Services for Production-Grade Apps.

By default, 🏗 Scaffold-ETH 2 provides predefined API keys for popular services such as Alchemy and Etherscan. This allows you to begin developing and testing your applications more easily, avoiding the need to register for these services.  
This is great to complete your **SpeedRunEthereum**.

For production-grade applications, it's recommended to obtain your own API keys (to prevent rate limiting issues). You can configure these at:

- 🔷`ALCHEMY_API_KEY` variable in `packages/hardhat/.env` and `packages/nextjs/.env.local`. You can create API keys from the [Alchemy dashboard](https://dashboard.alchemy.com/).

- 📃`ETHERSCAN_API_KEY` variable in `packages/hardhat/.env` with your generated API key. You can get your key [here](https://etherscan.io/myapikey).

> 💬 Hint: It's recommended to store env's for nextjs in Vercel/system env config for live apps and use .env.local for local testing.

---

## Checkpoint 3: 📜 Contract Verification

Run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

> 👩‍❤️‍👨 Share your public url with friends, showcase your art on-chain, and enjoy the minting experience together🎉!!

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
