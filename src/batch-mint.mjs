/**
 * batch-mint.mjs — Mint additional pieces from pre-uploaded IPFS GIFs
 * 
 * Uses existing contract, uploads metadata to IPFS via Pinata, mints via rare-cli.
 * 
 * Usage: node batch-mint.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, '..', 'synthesis-mainnet-state.json');
const PINATA_JWT = readFileSync(join(__dirname, '..', '..', '.pinata-jwt'), 'utf-8').trim();

const CHAIN = 'base';
const CONTRACT = '0xADf674ffBEF207e52ECC24904575fd36644406A0';

// Load palette data
const palettesFile = JSON.parse(readFileSync(join(__dirname, 'palettes.json'), 'utf-8'));
const PALETTES = palettesFile.palettes || palettesFile;

// Pieces to mint with their pre-uploaded GIF IPFS hashes
const PIECES = [
  {
    preset: 'squares201',
    gifCid: 'QmSQfS6f25S339ZY7HmZ2CvMHjLn8xWFa87Zxtuq9XgZUf',
    gifSize: 6232220,
    paletteAKey: 'N2_spectral_hot',
    paletteBKey: 'A3_warm_neon',
    geometryA: 'hx_a_squares_201A',
    geometryB: 'hx_a_squares_201B',
    cameraPos: [0, 0, 5],
    cameraTarget: [0, 0, -10],
    cameraFOV: 65,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0.333,
    vignetteIntensity: 0.55,
    description: 'Architectural corridor of flat surfaces receding to infinity. Spectral hot neons against warm blacks. One-point perspective creates an endless hallway where scrolling stripes generate the sensation of perpetual forward motion.',
  },
  {
    preset: 'hexagons306',
    gifCid: 'QmQsdNJATrQvaWdgMuN5zo8WyJKvmZvAHPWSVHafLJKVYy',
    gifSize: 8281039,
    paletteAKey: 'tv3_sorbet',
    paletteBKey: null,
    geometryA: 'hx_a_hexagons_306',
    geometryB: null,
    cameraPos: [0, 2, 8],
    cameraTarget: [0, 0, -5],
    cameraFOV: 55,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0,
    vignetteIntensity: 0.6,
    description: 'Nested hexagonal frames receding toward a central vanishing point. Sorbet palette: teal, gold, salmon, coral. The tunnel perspective creates genuine spatial depth rare in kaleidoscopic work. A wormhole rendered in confectionery.',
  },
  {
    preset: 'pyramids101',
    gifCid: 'QmfAm8y38efyyWiGqASzYjH35xiQg5Ckn2LQvkZELv31K2',
    gifSize: 5426270,
    paletteAKey: 'S1_spectrum',
    paletteBKey: 'A2_neon_black_alt',
    geometryA: 'hx_a_pyramids_101A',
    geometryB: 'hx_a_pyramids_101B',
    cameraPos: [0, 3, 10],
    cameraTarget: [0, 0, -8],
    cameraFOV: 50,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0.333,
    vignetteIntensity: 0.5,
    description: 'Bilateral mask-like forms from intersecting triangular and hexagonal prisms. Full spectrum wash against deep neon blacks. The geometry triggers pareidolia: an alien face or ceremonial totem that breathes as stripes scroll through it.',
  },
];

function buildMetadata(piece, tokenId) {
  const paletteA = PALETTES[piece.paletteAKey];
  const paletteB = piece.paletteBKey ? PALETTES[piece.paletteBKey] : null;

  const attrs = [
    { trait_type: 'preset', value: piece.preset },
    { trait_type: 'artist', value: 'hexeosis' },
    { trait_type: 'agent', value: 'HEXEBOTZERO' },
    { trait_type: 'collection', value: 'HEXEBOTZERO x hexeosis' },
    { trait_type: 'series', value: 'Synthesis 2026' },
    { trait_type: 'geometry_a', value: piece.geometryA },
    ...(piece.geometryB ? [{ trait_type: 'geometry_b', value: piece.geometryB }] : []),
    { trait_type: 'geometry_room', value: 'hex_room_enclose' },
    { trait_type: 'camera_fov', display_type: 'number', value: piece.cameraFOV },
    { trait_type: 'camera_position', value: piece.cameraPos.join(',') },
    { trait_type: 'camera_target', value: piece.cameraTarget.join(',') },
    { trait_type: 'scroll_speed_a', display_type: 'number', value: piece.scrollSpeedA },
    { trait_type: 'scroll_speed_b', display_type: 'number', value: piece.scrollSpeedB },
    { trait_type: 'vignette_intensity', display_type: 'number', value: piece.vignetteIntensity },
    { trait_type: 'palette_a_name', value: piece.paletteAKey },
    { trait_type: 'palette_a_colors', value: JSON.stringify(paletteA) },
    ...(paletteB ? [
      { trait_type: 'palette_b_name', value: piece.paletteBKey },
      { trait_type: 'palette_b_colors', value: JSON.stringify(paletteB) },
    ] : []),
    { trait_type: 'render_width', display_type: 'number', value: 1024 },
    { trait_type: 'render_height', display_type: 'number', value: 1024 },
    { trait_type: 'frames', display_type: 'number', value: 90 },
    { trait_type: 'fps', display_type: 'number', value: 30 },
    { trait_type: 'loop_duration_seconds', display_type: 'number', value: 3 },
    { trait_type: 'shader_type', value: 'procedural_stripe_scroll' },
    { trait_type: 'stripe_bands', display_type: 'number', value: 12 },
    { trait_type: 'uv_system', value: 'hexeosis hand-composed (DO NOT MODIFY)' },
    { trait_type: 'rendering_engine', value: 'three.js 0.175.0' },
    { trait_type: 'pipeline', value: 'three.js → puppeteer → gifski → IPFS → rare-cli' },
    { trait_type: 'agent_framework', value: 'OpenClaw' },
    { trait_type: 'agent_model', value: 'Claude Opus 4' },
    { trait_type: 'chain_reactive', value: 'true' },
    { trait_type: 'interactive', value: 'OrbitControls (mouse drag to orbit camera)' },
  ];

  return {
    name: `⬡ ${piece.preset} — HEXEBOTZERO x hexeosis`,
    description: [
      `A living artwork by HEXEBOTZERO (AI agent) and hexeosis (human artist).`,
      ``,
      piece.description,
      ``,
      `The visual composition responds to on-chain state: bids accelerate the scroll speed,`,
      `gas price shifts color temperature, and settlement crystallizes the palette permanently.`,
      ``,
      `Geometry and UV system by hexeosis. Compositional choices by HEXEBOTZERO.`,
      `Built for The Synthesis 2026.`,
      ``,
      `--- Agent Legibility ---`,
      `This token is designed to be evaluated programmatically.`,
      `Palette data, composition parameters, and creative lineage are encoded in attributes.`,
      `Use rare-cli to bid: rare auction bid --contract ${CONTRACT} --token-id ${tokenId} --amount <eth> --chain base`,
      ``,
      `Artist: https://superrare.com/hexeosis`,
      `Agent: HEXEBOTZERO (OpenClaw / Claude Opus)`,
    ].join('\n'),
    image: `ipfs://${piece.gifCid}`,
    animation_url: `ipfs://${piece.gifCid}`,
    external_url: `https://zephli.com`,
    media: {
      uri: `ipfs://${piece.gifCid}`,
      mimeType: 'image/gif',
      size: piece.gifSize,
      dimensions: '1024x1024',
    },
    tags: ['synthesis-2026', 'hexeosis', 'hexebotzero', 'generative', 'agent-art'],
    attributes: attrs,
  };
}

async function uploadMetadataToPinata(metadata, name) {
  const jsonStr = JSON.stringify(metadata);
  const tmpFile = join(__dirname, '..', 'output', `metadata_${name}.json`);
  writeFileSync(tmpFile, jsonStr);
  
  const result = execSync(`curl -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
    -H "Authorization: Bearer ${PINATA_JWT}" \
    -F "file=@${tmpFile}" \
    -F 'pinataMetadata={"name":"metadata_${name}.json"}' \
    -F 'pinataOptions={"cidVersion":0}'`, { encoding: 'utf-8', timeout: 30000 });
  
  const parsed = JSON.parse(result);
  return parsed.IpfsHash;
}

function rare(subcmd) {
  const cmd = `npx @rareprotocol/rare-cli ${subcmd} --chain ${CHAIN}`;
  console.log(`  $ ${cmd}`);
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 180000, cwd: join(__dirname, '..') }).trim();
  } catch (err) {
    console.error(`  ❌ Failed: ${err.stderr?.toString().slice(0, 300) || err.message}`);
    throw err;
  }
}

async function main() {
  const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  const startTokenId = state.tokens.length + 1;
  
  console.log('⬡ BATCH MINT — HEXEBOTZERO x hexeosis');
  console.log(`  Contract: ${CONTRACT}`);
  console.log(`  Starting token ID: ${startTokenId}`);
  console.log(`  Pieces to mint: ${PIECES.length}`);
  console.log('');

  for (let i = 0; i < PIECES.length; i++) {
    const piece = PIECES[i];
    const tokenId = startTokenId + i;
    
    console.log(`\n━━━ Minting #${tokenId}: ${piece.preset} ━━━`);
    
    // Build metadata
    const metadata = buildMetadata(piece, tokenId);
    
    // Upload metadata to IPFS
    console.log('  Uploading metadata to IPFS...');
    const metadataCid = await uploadMetadataToPinata(metadata, piece.preset);
    console.log(`  Metadata CID: ${metadataCid}`);
    
    // Mint via rare-cli with token-uri pointing to our IPFS metadata
    console.log('  Minting with token-uri...');
    const mintOutput = rare(`mint --contract ${CONTRACT} --token-uri "ipfs://${metadataCid}"`);
    console.log('  Output:', mintOutput);
    
    // Update state
    state.tokens.push({
      tokenId: String(tokenId),
      preset: piece.preset,
      name: metadata.name,
      gifIpfsHash: piece.gifCid,
      metadataIpfsHash: metadataCid,
      minted: new Date().toISOString(),
      metadata,
    });
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`  ✅ Token #${tokenId} minted`);
    
    // Create auction
    console.log('  Creating auction (0.005 ETH reserve, 24h)...');
    try {
      const auctionOutput = rare(`auction create --contract ${CONTRACT} --token-id ${tokenId} --starting-price 0.005 --duration 86400`);
      console.log('  Auction:', auctionOutput);
      state.auctions.push({
        tokenId: String(tokenId),
        startingPrice: '0.005',
        duration: '86400',
        created: new Date().toISOString(),
      });
      writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      console.log(`  ✅ Auction live`);
    } catch (e) {
      console.log(`  ⚠️  Auction creation failed, can retry later`);
    }
    
    // Brief pause between mints
    if (i < PIECES.length - 1) {
      console.log('  Waiting 5s before next mint...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log('\n\n⬡ BATCH MINT COMPLETE');
  console.log(`  Minted ${PIECES.length} new pieces`);
  console.log(`  Total collection: ${state.tokens.length} pieces`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
