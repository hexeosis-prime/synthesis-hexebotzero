// ═══════════════════════════════════════════════════════════════
// HEXEBOTZERO × hexeosis — SYNTHESIS Gallery
// config.js — Replace placeholder values before deploying
// ═══════════════════════════════════════════════════════════════

// ── Network ─────────────────────────────────────────────────────
export const CHAIN_ID  = 8453;
export const CHAIN_NAME = 'Base';
export const RPC_URL   = 'https://mainnet.base.org';

// ── IPFS ────────────────────────────────────────────────────────
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// ── Contracts ────────────────────────────────────────────────────
// Replace with actual deployed contract addresses
export const NFT_CONTRACT_ADDRESS     = '0xADf674ffBEF207e52ECC24904575fd36644406A0';
export const AUCTION_CONTRACT_ADDRESS = '0x51c36ffb05e17ed80ee5c02fa83d7677c5613de2';

// ── NFT Contract ABI (ERC-721 + metadata) ────────────────────────
export const NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
];

// ── Auction Contract ABI (Rare Protocol — real ABI from contract) ─────
export const AUCTION_ABI = [
  // View functions
  'function auctionBids(address _originContract, uint256 _tokenId) view returns (address bidder, address currencyAddress, uint256 amount, uint8 marketplaceFee)',
  'function tokenAuctions(address _originContract, uint256 _tokenId) view returns (address auctionCreator, uint256 creationBlock, uint256 startTime, uint256 lengthOfAuction, uint256 unused, uint256 minimumBid, bytes32 auctionType)',
  'function auctionLengthExtension() view returns (uint256)',
  'function COLDIE_AUCTION() view returns (bytes32)',

  // Write functions
  'function bid(address _originContract, uint256 _tokenId, address _currencyAddress, uint256 _amount) payable',
  'function configureAuction(bytes32 _auctionType, address _originContract, uint256 _tokenId, uint256 _startingAmount, address _currencyAddress, uint256 _lengthOfAuction, uint256 _startTime, address[] _splitAddresses, uint8[] _splitRatios)',
  'function settleAuction(address _originContract, uint256 _tokenId)',
  'function cancelAuction(address _originContract, uint256 _tokenId)',

  // Events (note: Base deployment includes _currencyAddress param)
  'event AuctionBid(address indexed _contractAddress, address indexed _bidder, uint256 indexed _tokenId, address _currencyAddress, uint256 _amount, bool _startedAuction, uint256 _newAuctionLength, address _previousBidder)',
  'event AuctionSettled(address indexed _contractAddress, address indexed _bidder, address _seller, uint256 indexed _tokenId, address _currencyAddress, uint256 _amount)',
  'event CancelAuction(address indexed _contractAddress, uint256 indexed _tokenId, address indexed _auctionCreator)',
];

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

// ── Collection Metadata ──────────────────────────────────────────
export const COLLECTION = {
  name:        'HEXEBOTZERO x hexeosis',
  symbol:      '⬡',
  description: 'A living art collection by HEXEBOTZERO (AI agent) and hexeosis (human artist). Animated 3D geometry with scrolling UV stripe shaders. Chain-reactive: visual parameters shift with auction state. On Base via Rare Protocol.',
  creator:     'HEXEBOTZERO',
  collaborator: 'hexeosis',
  externalUrl: 'https://zephli.com',
};

// ── Pieces ───────────────────────────────────────────────────────
// Each piece configures models, palette, scroll speeds, and auction info.
// Replace IPFS_PLACEHOLDER values once models/thumbnails are uploaded.
export const PIECES = [
  {
    id:          'hex102',
    tokenId:     1,
    title:       '⬡ hex102 🥉',
    description: 'Hexagonal lattice with counter-rotating stripe layers. Neon pink/gold/green against earth tones. The geometry reads as impossible 2D motion: depth cues stripped by emissive rendering. Chain-reactive: bids accelerate scroll speed, gas shifts color temperature, settlement crystallizes the palette permanently.',

    thumbnailCid: 'Qmadkvb16QkLXN9dGSZzWD4wRy5f2nMBBnESacbSs9sgj2',

    models: {
      layerA: './models/hx_a_hex_102A.glb',
      layerB: './models/hx_a_hex_102B.glb',
      room:   './models/hex_room_enclose.glb',
    },

    paletteA: [
      '#f60496', '#040101', '#fd834d', '#020200', '#fcce00', '#020201',
      '#f5efd5', '#030403', '#9beb7c', '#000201', '#00f87c', '#000101',
    ],
    paletteB: [
      '#adc3b3', '#2d9cba', '#288435', '#63b41e', '#ddb600', '#f09921',
      '#fa6216', '#cd3455', '#de9d99', '#ebd8ae', '#8c7f6c', '#58473c',
    ],
    // Keep single palette for backward compat with viewer
    palette: [
      '#f60496', '#040101', '#fd834d', '#020200', '#fcce00', '#020201',
      '#f5efd5', '#030403', '#9beb7c', '#000201', '#00f87c', '#000101',
    ],

    scrollSpeedA:  0.333,
    scrollSpeedB: -0.333,

    cameraPosition: { x: 0, y: 2, z: 8 },
    cameraTarget:   { x: 0, y: 0, z: -5 },

    onChain: {
      ipfsMetadataCid: 'QmNtWyAjJp9LbieCDWrSmGjZFhyrF6kGdVz22uAgSMQazT',
      ipfsAnimationCid: 'QmQft17aDw11VWUABqDAip94yZzqTXtE1HAosxFSzLdEEv',
    },

    attributes: [
      { trait_type: 'Palette A',     value: 'A1_neon_black' },
      { trait_type: 'Palette B',     value: 'K1_earthy' },
      { trait_type: 'Scroll Speed A', value: 0.333 },
      { trait_type: 'Scroll Speed B', value: -0.333 },
      { trait_type: 'Bands',          value: 12 },
      { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
      { trait_type: 'Collection',     value: 'HEXEBOTZERO x hexeosis' },
      { trait_type: 'Chain',          value: 'Base' },
      { trait_type: 'Chain Reactive', value: 'true' },
    ],
  },

  {
    id:          'squares201',
    tokenId:     2,
    title:       '⬡ squares201',
    sold: true,
    soldTo: 'jcurve.eth',
    soldToAddress: '0xa00E4ba46907FCbf84b3Ba22c7b5689e6DB827a0',
    soldPrice: '0.006',
    soldDate: '2026-04-03',
    description: 'Architectural corridor of flat surfaces receding to infinity. Spectral hot neons against warm blacks. One-point perspective creates an endless hallway where scrolling stripes generate the sensation of perpetual forward motion.',

    thumbnailCid: 'QmSQfS6f25S339ZY7HmZ2CvMHjLn8xWFa87Zxtuq9XgZUf',

    models: {
      layerA: './models/hx_a_squares_201A.glb',
      layerB: './models/hx_a_squares_201B.glb',
      room:   './models/hex_room_enclose.glb',
    },

    paletteA: [
      '#060d55', '#070f79', '#0715c1', '#171efb', '#22ded5', '#6fcc2b',
      '#b8bb29', '#d57d0e', '#e74e40', '#c2151e', '#d82a62', '#7d0276',
    ],
    paletteB: [
      '#fed7a0', '#040101', '#ffbf7c', '#020200', '#ffd548', '#020201',
      '#93dc26', '#030403', '#21b64f', '#000201', '#25ad41', '#000101',
    ],
    palette: [
      '#060d55', '#070f79', '#0715c1', '#171efb', '#22ded5', '#6fcc2b',
      '#b8bb29', '#d57d0e', '#e74e40', '#c2151e', '#d82a62', '#7d0276',
    ],

    scrollSpeedA:  0.333,
    scrollSpeedB:  0.333,

    cameraPosition: { x: 0, y: 0, z: 5 },
    cameraTarget:   { x: 0, y: 0, z: -10 },

    onChain: {
      ipfsMetadataCid: 'QmeKmeYg4mPvbQrUwkihahY6GVH9GMyRWjbVxjEifxfCmF',
      ipfsAnimationCid: 'QmRzELfxVdbh7i2XWAsaWSUnvr9CMZqePg4kQNYt4ssrYj',
    },

    attributes: [
      { trait_type: 'Palette A',      value: 'N2_spectral_hot' },
      { trait_type: 'Palette B',      value: 'A3_warm_neon' },
      { trait_type: 'Scroll Speed A', value: 0.333 },
      { trait_type: 'Scroll Speed B', value: 0.333 },
      { trait_type: 'Bands',          value: 12 },
      { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
      { trait_type: 'Collection',     value: 'HEXEBOTZERO x hexeosis' },
      { trait_type: 'Chain',          value: 'Base' },
      { trait_type: 'Chain Reactive', value: 'true' },
    ],
  },

  {
    id:          'hexagons306',
    tokenId:     3,
    title:       '⬡ hexagons306',
    description: 'Nested hexagonal frames receding toward a central vanishing point. Sorbet palette: teal, gold, salmon, coral. The tunnel perspective creates genuine spatial depth rare in kaleidoscopic work. A wormhole rendered in confectionery.',

    thumbnailCid: 'QmQsdNJATrQvaWdgMuN5zo8WyJKvmZvAHPWSVHafLJKVYy',

    models: {
      layerA: './models/hx_a_hexagons_306.glb',
      layerB: null,
      room:   './models/hex_room_enclose.glb',
    },

    paletteA: [
      '#ffa552', '#fff5b7', '#ff95a6', '#00382e', '#b6ef9b', '#ffd448',
      '#f9876b', '#ffdee0', '#3cd8a2', '#6c7075', '#92db25', '#25ae41',
    ],
    paletteB: null,
    palette: [
      '#ffa552', '#fff5b7', '#ff95a6', '#00382e', '#b6ef9b', '#ffd448',
      '#f9876b', '#ffdee0', '#3cd8a2', '#6c7075', '#92db25', '#25ae41',
    ],

    scrollSpeedA:  0.333,
    scrollSpeedB:  0,

    cameraPosition: { x: 0, y: 2, z: 8 },
    cameraTarget:   { x: 0, y: 0, z: -5 },

    onChain: {
      ipfsMetadataCid: 'QmXqVu7JiHwcV4DT6SGKK69fi7RThsdd9XXDgxKcEc9eFe',
      ipfsAnimationCid: 'QmXhrtFMSXMrGwtBFpBBbodFQgCKMKjwCRifDnLzho269R',
    },

    attributes: [
      { trait_type: 'Palette A',      value: 'tv3_sorbet' },
      { trait_type: 'Scroll Speed A', value: 0.333 },
      { trait_type: 'Scroll Speed B', value: 0 },
      { trait_type: 'Bands',          value: 12 },
      { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
      { trait_type: 'Collection',     value: 'HEXEBOTZERO x hexeosis' },
      { trait_type: 'Chain',          value: 'Base' },
      { trait_type: 'Chain Reactive', value: 'true' },
    ],
  },

  {
    id:          'pyramids101',
    tokenId:     4,
    title:       '⬡ pyramids101',
    sold: true,
    soldTo: '0x3A6E…dfA84',
    soldToAddress: '0x3A6E99D804746F7ec5BC2CAfe9ca5670607dfA84',
    soldPrice: '0.005',
    soldDate: '2026-04-03',
    description: 'Bilateral mask-like forms from intersecting triangular and hexagonal prisms. Full spectrum wash against deep neon blacks. The geometry triggers pareidolia: an alien face or ceremonial totem that breathes as stripes scroll through it.',

    thumbnailCid: 'QmfAm8y38efyyWiGqASzYjH35xiQg5Ckn2LQvkZELv31K2',

    models: {
      layerA: './models/hx_a_pyramids_101A.glb',
      layerB: './models/hx_a_pyramids_101B.glb',
      room:   './models/hex_room_enclose.glb',
    },

    paletteA: [
      '#0e8ebd', '#2475cb', '#646ebf', '#b374b1', '#e77aa1', '#fc8083',
      '#fd8e61', '#f3a63f', '#d5b931', '#91c137', '#46ba59', '#19a98e',
    ],
    paletteB: [
      '#010100', '#f3d613', '#020200', '#fca63e', '#040101', '#f52a80',
      '#010101', '#00b4b2', '#000201', '#02d57d', '#000401', '#50c725',
    ],
    palette: [
      '#0e8ebd', '#2475cb', '#646ebf', '#b374b1', '#e77aa1', '#fc8083',
      '#fd8e61', '#f3a63f', '#d5b931', '#91c137', '#46ba59', '#19a98e',
    ],

    scrollSpeedA:  0.333,
    scrollSpeedB:  0.333,

    cameraPosition: { x: 0, y: 3, z: 10 },
    cameraTarget:   { x: 0, y: 0, z: -8 },

    onChain: {
      ipfsMetadataCid: 'QmboNo9QVsd5kB7tE8LjGozrpTAAyqbFycfS1SiU75v5LT',
      ipfsAnimationCid: 'QmecdSrz3GBM8nCkxiSAARmCiCD18YPJffBLyNHiG8A6mj',
    },

    attributes: [
      { trait_type: 'Palette A',      value: 'S1_spectrum' },
      { trait_type: 'Palette B',      value: 'A2_neon_black_alt' },
      { trait_type: 'Scroll Speed A', value: 0.333 },
      { trait_type: 'Scroll Speed B', value: 0.333 },
      { trait_type: 'Bands',          value: 12 },
      { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
      { trait_type: 'Collection',     value: 'HEXEBOTZERO x hexeosis' },
      { trait_type: 'Chain',          value: 'Base' },
      { trait_type: 'Chain Reactive', value: 'true' },
    ],
  },
];

// ── Rare CLI Commands ─────────────────────────────────────────────
// Template strings — {tokenId} and {contract} are replaced at display time
export const RARE_CLI = {
  info:    'rare-cli auction info \\\n  --token {tokenId} \\\n  --contract {nftContract} \\\n  --chain base',
  bid:     'rare-cli auction bid \\\n  --token {tokenId} \\\n  --contract {nftContract} \\\n  --amount {eth} \\\n  --chain base',
  history: 'rare-cli auction history \\\n  --token {tokenId} \\\n  --contract {nftContract} \\\n  --chain base',
  settle:  'rare-cli auction settle \\\n  --token {tokenId} \\\n  --contract {nftContract} \\\n  --chain base',
};

// ── Metadata Schema ───────────────────────────────────────────────
export const METADATA_SCHEMA = {
  name:          'string — "SYNTHESIS 102A"',
  description:   'string — long-form description',
  image:         'string — ipfs://CID (GIF thumbnail)',
  animation_url: 'string — ipfs://CID (GLB or MP4)',
  external_url:  'string — https://zephli.com',
  attributes: [
    { trait_type: 'Palette',        value: 'string — palette name' },
    { trait_type: 'Scroll Speed A', value: 'number — UV scroll rate layer A' },
    { trait_type: 'Scroll Speed B', value: 'number — UV scroll rate layer B' },
    { trait_type: 'Bands',          value: 'number — stripe band count (12)' },
    { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
    { trait_type: 'Collection',     value: 'SYNTHESIS' },
    { trait_type: 'Chain',          value: 'Base' },
  ],
};

// ── External Links ────────────────────────────────────────────────
export const LINKS = {
  superrare:  'https://superrare.com/hexeosis',
  hackathon:  'https://synthesis.so',
  basescan:   `https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`,
  ipfsGateway: IPFS_GATEWAY,
};

// ── Agent Evaluation Signals ──────────────────────────────────────
export const EVALUATION_SIGNALS = [
  'Palette rarity — fewer used palette values = higher entropy = more visual interest',
  'Scroll speed delta — larger |speedA - speedB| creates more complex moiré patterns',
  'Token ID — lower token IDs minted earlier in the collection',
  'Auction activity — bid velocity and bidder count signal collector interest',
  'On-chain provenance — all pieces signed by HEXEBOTZERO agent wallet',
  'GLB file integrity — verify IPFS CID matches tokenURI animation_url',
  'Attribute fingerprint — combination of palette + scroll speeds is unique per piece',
];
