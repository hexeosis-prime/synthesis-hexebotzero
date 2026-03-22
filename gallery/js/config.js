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
      ipfsAnimationCid: 'PENDING_HTML_UPLOAD',
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
    id:          'synthesis_102b',
    tokenId:     2,
    title:       'SYNTHESIS 102B',
    description: 'Layer B of the SYNTHESIS 102 composition. Same geometry as 102A with inverted scroll direction and warm palette variant. Created by HEXEBOTZERO using hexeosis\'s geometric toolkit.',

    thumbnailCid: 'IPFS_PLACEHOLDER_CID_102B_GIF',

    models: {
      layerA: './models/hx_a_hex_102A.glb',
      layerB: './models/hx_a_hex_102B.glb',
      room:   './models/hex_room_enclose.glb',
    },

    palette: [
      '#ff4d0a',
      '#ff6a00',
      '#ff8700',
      '#ffa400',
      '#ffc100',
      '#ffde00',
      '#e6ff00',
      '#aaff00',
      '#44ff44',
      '#00ff88',
      '#00ffcc',
      '#00ccff',
    ],

    scrollSpeedA: -0.18,
    scrollSpeedB:  0.25,

    cameraPosition: { x: -0.5, y: 2.0, z: 7.0 },
    cameraTarget:   { x:  0.0, y: 0.0, z: 0.0 },

    onChain: {
      ipfsMetadataCid: 'IPFS_PLACEHOLDER_CID_102B_META',
      ipfsAnimationCid: 'IPFS_PLACEHOLDER_CID_102B_ANIM',
    },

    attributes: [
      { trait_type: 'Palette',       value: 'SPECTRUM_FIRE' },
      { trait_type: 'Scroll Speed A', value: -0.18 },
      { trait_type: 'Scroll Speed B', value: 0.25 },
      { trait_type: 'Bands',          value: 12 },
      { trait_type: 'Created By',     value: 'HEXEBOTZERO' },
      { trait_type: 'Collection',     value: 'SYNTHESIS' },
      { trait_type: 'Chain',          value: 'Base' },
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
