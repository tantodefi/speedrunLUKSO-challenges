# 🏗 SpeedRunLUKSO Challenges

**Learn how to use 🏗 Scaffold-ETH 2 to create decentralized applications on LUKSO. 🚀**

**Learn the new NFT and Token standards (LSP8 + LSP7) and discover the superpowers of Universal Profiles. 🆙**

---

## 🚩 Challenge 0: 🎟 Simple NFT Example using LSP8 on LUKSO

🎫 Create a simple NFT using LSP8 on LUKSO. You'll use 👷‍♀️ HardHat to compile and deploy your first LSP8 smart contract learning the differences between an LSP8 (new NFT standard) and an ERC721 (old standard). Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to the public LUKSO testnet network to share with friends! 🚀

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/challenge-0-simple-nft

---

## 🚩 Challenge 1: 🔏 Decentralized Staking App with LYX

🦸 A superpower of LUKSO is allowing you, the builder, to create a simple set of rules that an adversarial group of players can use to work together. In this challenge, you create a decentralized application where users can coordinate a group funding effort. If the users cooperate, the money is collected in a second smart contract. If they defect, the worst that can happen is everyone gets their money back. The users only have to trust the code.

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/challenge-1-decentralized-staking

---

## 🚩 Challenge 2: 🏵 Token Vendor with LSP7

🤖 Smart contracts are kind of like "always on" vending machines that anyone can access. Let's make a decentralized, digital currency. Then, let's build an unstoppable vending machine that will buy and sell the currency. We'll learn about the new LSP7 token contract standard and how contract to contract interactions work.

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/challenge-2-token-vendor

---

## 🚩 Challenge 3: 🎨 SVG LSP8 NFT

🎨 Create an SVG NFT using LSP8 on LUKSO. You'll learn how to create an SVG NFT and how to use LSP8 to create a collection of NFTs. You'll also learn how to use the LSP8 contract to set the creators of the collection.

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/challenge-3-svg-lsp8-nft

---

## 🚩 Challenge 4: 🆙 Universal Profile Extension

🆙 Create a Universal Profile Extension. You'll learn how to create a Universal Profile Extension and how to use it to create a profile on LUKSO.

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/challenge-4-universal-profile-extension

---

## 🚩 Challenge 5: 🔗 Grid Dapp Challenge

🌐 Create a grid mini-app from one of the previous challenges builds using the @lukso/up-provider package and host the grid app on Universal Everything profile. The goal here is to get one of the previous starter builds live as a grid mini-app, be creative and maybe even ship them to mainnet!

- [ ] basic LSP8 nft example
- [ ] basic LSP7 token vending machine
- [ ] basic staking machine
- [ ] basic svg nft LSP8 example

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/Challenge-5-grid-mini-dapp

## 🚩 Challenge 6: 🔗 Build your own Grid Dapp Challenge

### 💡 Ideas to Build:

- [ ] Create a decentralized game board that lives on universaleverything.io
- [ ] Build a social trading interface where each grid cell represents a token pair
- [ ] Design an NFT gallery where each grid cell displays a different collection
- [ ] Develop a community voting system where grid cells represent proposals
- [ ] Build a DeFi dashboard where each cell shows different protocol metrics

Deploy your grid dapp to LUKSO testnet or mainnet and share it on [SpeedRunLUKSO.com](https://speedrunlukso.com)!

https://github.com/tantodefi/speedrunLUKSO-challenges/tree/Challenge-6-grid-mini-app-advanced

---

## 🎉 Checkpoint: Eligible to submit your own build on speedrunLUKSO.com

A place to show off your builds and meet other builders. Start crafting your Web3 portfolio by submitting your DEX, Multisig or SVG NFT build and shipping them on the lukso network!

https://speedrunlukso.com/

---

## 💡 Contributing: Guide and Hints to create New Challenges

- We'd use the [base-challenge-template](https://github.com/scaffold-eth/se-2-challenges/tree/base-challenge-template) as a starting point for each challenge.
- UI wise, we'll try to use the https://speedrunethereum.com/ design vibe.

Check out already migrated Challenges to get a better idea of the structure and how to create new ones.

A quick start guide.

### 1. Branch from [base-challenge-template](https://github.com/tantodefi/speedrunLUKSO-challenges/tree/base-challenge-template)

At `base-challenge-template` branch we will be adding the latest updates from Scaffold ETH 2. We'll also include the learnings we acquire during the Challenges we are adding, as well as the code that may be common to all the Challenges.

### 2. Edit `pages/index.tsx`

The main page should have a banner image (ask for it!) + the Challenge description.

> {challengeHeroImage}
>
> A {challengeDescription}.
>
> 🌟 The final deliverable is an app that {challengeDeliverable}.
> Deploy your contracts to a testnet then build and upload your app to a public web server. Submit the url on [SpeedRunLUKSO.com](https://speedrunlukso.com)!

### 3. Implement the Challenge

- Add the contract(s)
- Add pages / components as you need (UI following the [SpeedRunLUKSO.com](https://speedrunlukso.com/) design vibe)
- Create the test for the Smart Contract(s). The best starting point is to copy the tests from the SE1 Challenge you are migrating. The "envvar" logic there is used by the autograder, so don't remove them.

### 4. Adapt Header / MetaHeader component

Update the site title on `Header.tsx` and title and description of your challenge in `MetaHeader.tsx`.

### 5. Image assets for your Challenge

You will need to add the following image assets in `packages/nextjs/public` folder (ask the designers for it):

- **Thumbnail.** `thumbnail.png`
  Will be shown in your link previews when shared to others in chat or in social media.
- **Hero image.** `hero.png`
  It's a wider version of the Thumbnail with SRE logo at the bottom right. Used as README header, and as `pages/index.tsx` hero image.

### 6. Edit README adapting the [base template](https://github.com/tantodefi/speedrunLUKSO-challenges/tree/base-challenge-template#readme)

Adapt the base template README using the SE-1 version as a reference.

### 7. Create a PR against the challenge branch

We can iterate and test there.
