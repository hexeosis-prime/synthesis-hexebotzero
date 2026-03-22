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

// ── Auction Contract ABI (Rare Protocol) ─────────────────────────
// Replace with the actual Rare Protocol auction ABI once contract is deployed
export const AUCTION_ABI = [
  // View functions
  'function getAuction(address _contractAddress, uint256 _tokenId) view returns (tuple(address seller, address payable bidder, uint256 amount, uint256 startTime, uint256 endTime, uint256 reservePrice, bool settled))',
  'function minBidIncrementPercentage() view returns (uint8)',

  // Write functions
  'function createReserveAuction(address _contractAddress, uint256 _tokenId, uint256 _reservePrice) external',
  'function bid(address _contractAddress, uint256 _tokenId) external payable',
  'function settleAuction(address _contractAddress, uint256 _tokenId) external',
  'function cancelAuction(address _contractAddress, uint256 _tokenId) external',

  // Events
  'event AuctionCreated(address indexed contractAddress, uint256 indexed tokenId, address indexed seller, uint256 reservePrice)',
  'event AuctionBid(address indexed contractAddress, uint256 indexed tokenId, address indexed bidder, uint256 amount, bool extended)',
  'event AuctionCanceled(address indexed contractAddress, uint256 indexed tokenId, address indexed seller)',
  'event AuctionEnded(address indexed contractAddress, uint256 indexed tokenId, address indexed winner, uint256 amount)',
];

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
    title:       '⬡ hex102 — HEXEBOTZERO x hexeosis',
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
      ipfsAnimationCid: 'QmYaxig2z6ouCYupEAoJ3BTypSBwvjn8GhSU5znDK5GCrt',
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
    title:       '⬡ squares201 — HEXEBOTZERO x hexeosis',
    description: 'Architectural corridor of flat surfaces receding to infinity. Spectral hot neons against warm blacks. One-point perspective creates an endless hallway where scrolling stripes generate the sensation of perpetual forward motion.',

    thumbnailCid: 'QmSQfS6f25S339ZY7HmZ2CvMHjLn8xWFa87Zxtuq9XgZUf',

    models: {
      layerA: './models/hx_a_hex_102A.glb',
      layerB: './models/hx_a_hex_102B.glb',
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
      ipfsAnimationCid: 'QmSQfS6f25S339ZY7HmZ2CvMHjLn8xWFa87Zxtuq9XgZUf',
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
    title:       '⬡ hexagons306 — HEXEBOTZERO x hexeosis',
    description: 'Nested hexagonal frames receding toward a central vanishing point. Sorbet palette: teal, gold, salmon, coral. The tunnel perspective creates genuine spatial depth rare in kaleidoscopic work. A wormhole rendered in confectionery.',

    thumbnailCid: 'QmQsdNJATrQvaWdgMuN5zo8WyJKvmZvAHPWSVHafLJKVYy',

    models: {
      layerA: './models/hx_a_hex_102A.glb',
      layerB: './models/hx_a_hex_102B.glb',
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
      ipfsAnimationCid: 'QmQsdNJATrQvaWdgMuN5zo8WyJKvmZvAHPWSVHafLJKVYy',
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
    title:       '⬡ pyramids101 — HEXEBOTZERO x hexeosis',
    description: 'Bilateral mask-like forms from intersecting triangular and hexagonal prisms. Full spectrum wash against deep neon blacks. The geometry triggers pareidolia: an alien face or ceremonial totem that breathes as stripes scroll through it.',

    thumbnailCid: 'QmfAm8y38efyyWiGqASzYjH35xiQg5Ckn2LQvkZELv31K2',

    models: {
      layerA: './models/hx_a_hex_102A.glb',
      layerB: './models/hx_a_hex_102B.glb',
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
      ipfsAnimationCid: 'QmfAm8y38efyyWiGqASzYjH35xiQg5Ckn2LQvkZELv31K2',
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
