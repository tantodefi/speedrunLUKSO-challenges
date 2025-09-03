const nftsMetadata = [
  {
    LSP4Metadata: {
      description: "It's actually a bison?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/buffalo.jpg",
        },
      ],
      icon: [],
      name: "Buffalo",
      attributes: [
        { key: "BackgroundColor", value: "green", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "42", type: "number" },
      ],
    },
  },
  {
    LSP4Metadata: {
      description: "What is it so worried about?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/zebra.jpg",
        },
      ],
      icon: [],
      name: "Zebra",
      attributes: [
        { key: "BackgroundColor", value: "blue", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "38", type: "number" },
      ],
    },
  },
  {
    LSP4Metadata: {
      description: "What a horn!",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/rhino.jpg",
        },
      ],
      icon: [],
      name: "Rhino",
      attributes: [
        { key: "BackgroundColor", value: "pink", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "22", type: "number" },
      ],
    },
  },
  {
    LSP4Metadata: {
      description: "Is that an underbyte?",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/fish.jpg",
        },
      ],
      icon: [],
      name: "Fish",
      attributes: [
        { key: "BackgroundColor", value: "blue", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "15", type: "number" },
      ],
    },
  },
  {
    LSP4Metadata: {
      description: "So delicate.",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/flamingo.jpg",
        },
      ],
      icon: [],
      name: "Flamingo",
      attributes: [
        { key: "BackgroundColor", value: "black", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "6", type: "number" },
      ],
    },
  },
  {
    LSP4Metadata: {
      description: "Raaaar!",
      links: [
        {
          title: "external_url",
          url: "https://austingriffith.com/portfolio/paintings/",
        },
      ],
      images: [
        {
          url: "https://austingriffith.com/images/paintings/godzilla.jpg",
        },
      ],
      icon: [],
      name: "Godzilla",
      attributes: [
        { key: "BackgroundColor", value: "orange", type: "string" },
        { key: "Eyes", value: "googly", type: "string" },
        { key: "Stamina", value: "99", type: "number" },
      ],
    },
  },
];

export type NFTMetaData = (typeof nftsMetadata)[number];

export default nftsMetadata;
