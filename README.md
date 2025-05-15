# 🚩 Challenge 4: 🆙 Universal Profile Extension

Learn how to use the Universal Profile Extension for se2 to bootstrap new builds on LUKSO.

🌟 The final deliverable is an app that supports LUKSO Universal Profiles and properly diplsays users metadata.
Deploy your contracts to a testnet then build and upload your app to a public web server. Submit the url on [SpeedRunLUKSO.com](https://speedrunlukso.com)!

💬 Meet other builders working on this challenge and get help in the {challengeTelegramLink}

---

## Checkpoint 0: 📦 Environment 📚

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

To bootstrap a new LUKSO build with the [Universal Profile Extension](https://github.com/ValentineCodes/universal-profile-extension), run:

```sh
npx create-eth@latest -e ValentineCodes/universal-profile-extension
```

> Choose your project name and solidity framework.
Once your project is created, install the dependencies:

```sh
yarn install
```

> after thats done in the same terminal, start your local network (a blockchain emulator in your computer):

```sh
yarn chain
```

> in a second terminal window, 🛰 deploy your contract (locally):

```sh
yarn deploy
```

> in a third terminal window, start your 📱 frontend:

```sh
yarn start
```

📱 Open http://localhost:3000 to see the app.

Final step is Add `images` to `packages/nextjs/next.config.js`

```javascript
...
const nextConfig = {
  images: {
    /** Allow images from all domains
     *  @next/image
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Wildcard for all hostnames
        pathname: "**", // Wildcard for all paths
      },
    ],
  },
};
```

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend, update your current contracts with changes, or re-deploy it to get a fresh contract address.

🔏 Now you are ready to start building your lusko dapp with these new features:

- `useProfile` - A hook to query profile data
- `UniversalProfile` - A card component to display user's profile data
- `UPRainbowKitCustomConnectButton` - A connect button to display user's profile name and image
- `UniversalProviderAddress` - A component to display a connected user's profile name and image

---

For this challenge - build anything you want with a fresh se2 install using the Universal Profile Extension. If you need inspiration checkout other buidlguidl builds [here](https://app.buidlguidl.com/builds).

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [LUKSO developers chat]()
