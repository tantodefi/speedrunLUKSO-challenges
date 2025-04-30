const nftsMetadata = [
  {
    LSP4Metadata: {
      description: "It's actually a bison?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/buffalo.jpg"
        }
      ],
      icon: [],
      name: "Buffalo",
      attributes: [
        { trait_type: "BackgroundColor", value: "green" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 42 }
      ]
    }
  },
  {
    LSP4Metadata: {
      description: "What is it so worried about?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/zebra.jpg"
        }
      ],
      icon: [],
      name: "Zebra",
      attributes: [
        { trait_type: "BackgroundColor", value: "blue" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 38 }
      ]
    }
  },
  {
    LSP4Metadata: {
      description: "What a horn!",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/rhino.jpg"
        }
      ],
      icon: [],
      name: "Rhino",
      attributes: [
        { trait_type: "BackgroundColor", value: "pink" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 22 }
      ]
    }
  },
  {
    LSP4Metadata: {
      description: "Is that an underbyte?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/fish.jpg"
        }
      ],
      icon: [],
      name: "Fish",
      attributes: [
        { trait_type: "BackgroundColor", value: "blue" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 15 }
      ]
    }
  },
  {
    LSP4Metadata: {
      description: "So delicate.",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/flamingo.jpg"
        }
      ],
      icon: [],
      name: "Flamingo",
      attributes: [
        { trait_type: "BackgroundColor", value: "black" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 6 }
      ]
    }
  },
  {
    LSP4Metadata: {
      description: "Raaaar!",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/"
        }
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/godzilla.jpg"
        }
      ],
      icon: [],
      name: "Godzilla",
      attributes: [
        { trait_type: "BackgroundColor", value: "orange" },
        { trait_type: "Eyes", value: "googly" },
        { trait_type: "Stamina", value: 99 }
      ]
    }
  }
];

export type NFTMetaData = (typeof nftsMetadata)[number];

export default nftsMetadata;
