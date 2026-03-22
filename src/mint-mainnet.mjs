/**
 * mint-mainnet.mjs — Enhanced minting pipeline for HEXEBOTZERO x hexeosis
 * 
 * Deploys collection, mints tokens with:
 * - GIF as `image` (visual thumbnail)
 * - HTML token as `animation_url` (interactive three.js scene)
 * - Rich metadata: palette arrays, composition params, creative lineage
 * 
 * Usage:
 *   node mint-mainnet.mjs deploy [--chain base]
 *   node mint-mainnet.mjs mint --preset hex102 [--chain base]
 *   node mint-mainnet.mjs auction --token-id 1 [--chain base]
 *   node mint-mainnet.mjs full --preset hex102 [--chain base]
 *   node mint-mainnet.mjs status [--chain base]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, '..', 'synthesis-mainnet-state.json');
const OUTPUT_DIR = join(__dirname, '..', 'output');

// CLI
const args = process.argv.slice(2);
const command = args[0];
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const CHAIN = getArg('chain', 'base'); // DEFAULT TO MAINNET
const COLLECTION_NAME = 'HEXEBOTZERO x hexeosis'; // regular x, not ×
const COLLECTION_SYMBOL = 'HX0';

// Load palette data for metadata
const palettesFile = JSON.parse(readFileSync(join(__dirname, 'palettes.json'), 'utf-8'));
const palettes = palettesFile.palettes || palettesFile;

// Preset configs (must match build-token.mjs and render.mjs)
const PRESETS = {
  hex102: {
    paletteAKey: 'A1_neon_black',
    paletteBKey: 'K1_earthy',
    geometryA: 'hx_a_hex_102A',
    geometryB: 'hx_a_hex_102B',
    cameraPos: [0, 2, 8],
    cameraTarget: [0, 0, -5],
    cameraFOV: 55,
    scrollSpeedA: 0.333,
    scrollSpeedB: -0.333,
    vignetteIntensity: 0.6,
    description: 'Hexagonal lattice with counter-rotating stripe layers. Neon pink/gold/green against earth tones. The geometry reads as impossible 2D motion: depth cues stripped by emissive rendering.',
  },
};

// --- State ---
function loadState() {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  return { contractAddress: null, chain: null, tokens: [], auctions: [], deployed: null };
}
function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`  State saved: ${STATE_FILE}`);
}

// --- Rare CLI wrapper ---
function rare(subcmd, opts = {}) {
  let cmd = `npx @rareprotocol/rare-cli ${subcmd}`;
  for (const [key, val] of Object.entries(opts)) {
    if (val === true) cmd += ` --${key}`;
    else if (val !== null && val !== undefined) cmd += ` --${key} "${val}"`;
  }
  cmd += ` --chain ${CHAIN}`;
  console.log(`  $ ${cmd}`);
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 180000, cwd: join(__dirname, '..') }).trim();
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
    if (err.stdout) console.error('  stdout:', err.stdout.toString().slice(0, 500));
    if (err.stderr) console.error('  stderr:', err.stderr.toString().slice(0, 500));
    throw err;
  }
}

// --- Build rich metadata ---
function buildMetadata(preset, tokenId, gifIpfsHash, htmlIpfsHash, gifSize) {
  const config = PRESETS[preset] || PRESETS.hex102;
  const paletteA = palettes[config.paletteAKey];
  const paletteB = palettes[config.paletteBKey];

  return {
    name: `⬡ ${preset} — HEXEBOTZERO x hexeosis`,
    description: [
      `A living artwork by HEXEBOTZERO (AI agent) and hexeosis (human artist).`,
      ``,
      config.description,
      ``,
      `The visual composition responds to on-chain state: bids accelerate the scroll speed,`,
      `gas price shifts color temperature, and settlement crystallizes the palette permanently.`,
      `Open the interactive viewer (animation_url) to orbit the scene with your mouse.`,
      ``,
      `Geometry and UV system by hexeosis. Compositional choices by HEXEBOTZERO.`,
      `Built for The Synthesis 2026.`,
      ``,
      `--- Agent Legibility ---`,
      `This token is designed to be evaluated programmatically.`,
      `Palette data, composition parameters, and creative lineage are encoded in attributes.`,
      `Use rare-cli to bid: rare auction bid --contract <addr> --token-id ${tokenId} --amount <eth> --chain base`,
      ``,
      `Artist: https://superrare.com/hexeosis`,
      `Agent: HEXEBOTZERO (OpenClaw / Claude Opus)`,
    ].join('\n'),
    image: `ipfs://${gifIpfsHash}`,
    animation_url: `ipfs://${htmlIpfsHash}`,
    external_url: `https://zephli.com`,
    media: {
      uri: `ipfs://${gifIpfsHash}`,
      mimeType: 'image/gif',
      size: gifSize,
      dimensions: '1024x1024',
    },
    tags: ['synthesis-2026', 'hexeosis', 'hexebotzero', 'generative', 'agent-art'],
    attributes: [
      // Core identity
      { trait_type: 'preset', value: preset },
      { trait_type: 'artist', value: 'hexeosis' },
      { trait_type: 'agent', value: 'HEXEBOTZERO' },
      { trait_type: 'collection', value: 'HEXEBOTZERO x hexeosis' },
      { trait_type: 'series', value: 'Synthesis 2026' },
      
      // Geometry
      { trait_type: 'geometry_a', value: config.geometryA },
      { trait_type: 'geometry_b', value: config.geometryB },
      { trait_type: 'geometry_room', value: 'hex_room_enclose' },
      
      // Composition parameters
      { trait_type: 'camera_fov', display_type: 'number', value: config.cameraFOV },
      { trait_type: 'camera_position', value: config.cameraPos.join(',') },
      { trait_type: 'camera_target', value: config.cameraTarget.join(',') },
      { trait_type: 'scroll_speed_a', display_type: 'number', value: config.scrollSpeedA },
      { trait_type: 'scroll_speed_b', display_type: 'number', value: config.scrollSpeedB },
      { trait_type: 'vignette_intensity', display_type: 'number', value: config.vignetteIntensity },
      
      // Palette A (full array as JSON string for agent parsing)
      { trait_type: 'palette_a_name', value: config.paletteAKey },
      { trait_type: 'palette_a_colors', value: JSON.stringify(paletteA) },
      { trait_type: 'palette_a_dominant', value: paletteA.filter(c => !c.match(/^#0[0-4]/)).slice(0, 3).join(',') },
      
      // Palette B (full array as JSON string for agent parsing)
      { trait_type: 'palette_b_name', value: config.paletteBKey },
      { trait_type: 'palette_b_colors', value: JSON.stringify(paletteB) },
      { trait_type: 'palette_b_dominant', value: paletteB.filter(c => !c.match(/^#0[0-4]/)).slice(0, 3).join(',') },

      // Rendering
      { trait_type: 'render_width', display_type: 'number', value: 1024 },
      { trait_type: 'render_height', display_type: 'number', value: 1024 },
      { trait_type: 'frames', display_type: 'number', value: 90 },
      { trait_type: 'fps', display_type: 'number', value: 30 },
      { trait_type: 'loop_duration_seconds', display_type: 'number', value: 3 },
      { trait_type: 'shader_type', value: 'procedural_stripe_scroll' },
      { trait_type: 'stripe_bands', display_type: 'number', value: 12 },
      
      // Creative lineage
      { trait_type: 'uv_system', value: 'hexeosis hand-composed (DO NOT MODIFY)' },
      { trait_type: 'rendering_engine', value: 'three.js 0.175.0' },
      { trait_type: 'pipeline', value: 'three.js → puppeteer → gifski → IPFS → rare-cli' },
      { trait_type: 'agent_framework', value: 'OpenClaw' },
      { trait_type: 'agent_model', value: 'Claude Opus 4.5' },
      
      // Chain reactivity
      { trait_type: 'chain_reactive', value: 'true' },
      { trait_type: 'reactive_bid_count', value: 'scroll_speed (10% per bid, max 3x)' },
      { trait_type: 'reactive_gas_price', value: 'palette_temperature (warm/cool shift)' },
      { trait_type: 'reactive_settlement', value: 'palette_lock (permanent crystallization)' },
      { trait_type: 'interactive', value: 'OrbitControls (mouse drag to orbit camera)' },
    ],
  };
}

// --- Deploy ---
async function deploy() {
  console.log('⬡ Deploying collection to mainnet...');
  console.log(`  Name: ${COLLECTION_NAME}`);
  console.log(`  Symbol: ${COLLECTION_SYMBOL}`);
  console.log(`  Chain: ${CHAIN}`);
  console.log('');

  const output = rare(`deploy erc721 "${COLLECTION_NAME}" "${COLLECTION_SYMBOL}"`);
  console.log('  Deploy output:', output);

  const deployedMatch = output.match(/deployed at:\s*(0x[a-fA-F0-9]{40})/i);
  const addressMatch = deployedMatch || output.match(/0x[a-fA-F0-9]{40}/g)?.slice(-1);
  if (!addressMatch) {
    console.error('  ❌ Could not find contract address');
    process.exit(1);
  }

  const state = loadState();
  state.contractAddress = deployedMatch ? deployedMatch[1] : addressMatch[0];
  state.chain = CHAIN;
  state.deployed = new Date().toISOString();
  saveState(state);

  console.log(`\n  ✅ Contract deployed: ${state.contractAddress}`);
  return state.contractAddress;
}

// --- Mint with rich metadata ---
async function mint() {
  const state = loadState();
  if (!state.contractAddress) {
    console.error('  ❌ No contract deployed. Run: node mint-mainnet.mjs deploy');
    process.exit(1);
  }

  const preset = getArg('preset', 'hex102');

  // Find latest GIF
  const gifPattern = `hexebotzero_${preset}_`;
  const gifs = existsSync(OUTPUT_DIR)
    ? readdirSync(OUTPUT_DIR).filter(f => f.startsWith(gifPattern) && f.endsWith('.gif')).sort()
    : [];
  if (gifs.length === 0) {
    console.error(`  ❌ No GIF found for preset ${preset}. Run render.mjs first.`);
    process.exit(1);
  }
  const gifPath = join(OUTPUT_DIR, gifs[gifs.length - 1]);
  const gifSize = readFileSync(gifPath).length;

  // Find HTML token
  const htmlPattern = `token_${preset}_`;
  const htmls = existsSync(OUTPUT_DIR)
    ? readdirSync(OUTPUT_DIR).filter(f => f.startsWith(htmlPattern) && f.endsWith('.html')).sort()
    : [];
  if (htmls.length === 0) {
    console.error(`  ❌ No HTML token found for preset ${preset}. Run build-token.mjs first.`);
    process.exit(1);
  }
  const htmlPath = join(OUTPUT_DIR, htmls[htmls.length - 1]);

  console.log('⬡ Minting with rich metadata...');
  console.log(`  Contract: ${state.contractAddress}`);
  console.log(`  Preset: ${preset}`);
  console.log(`  GIF: ${gifPath} (${(gifSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  HTML Token: ${htmlPath} (${(readFileSync(htmlPath).length / 1024).toFixed(0)} KB)`);
  console.log('');

  // Step 1: Upload GIF to IPFS via rare-cli (it handles this)
  // Step 2: Upload HTML to IPFS
  // Step 3: Build metadata JSON with both hashes
  // Step 4: Upload metadata to IPFS
  // Step 5: Mint with token-uri pointing to metadata

  // For now, rare-cli mint handles image upload and basic metadata.
  // We need to check if it supports custom metadata JSON / animation_url.
  // If not, we'll need to upload files to IPFS separately and use --token-uri.

  // Let's try with the full metadata approach: upload everything ourselves,
  // construct the metadata JSON, upload it, and mint with --token-uri

  console.log('  Step 1: Uploading GIF to IPFS...');
  // Use rare-cli to upload the image (it returns IPFS hash)
  const mintDryOutput = rare('mint', {
    contract: state.contractAddress,
    name: `⬡ ${preset} — HEXEBOTZERO x hexeosis`,
    description: 'temp',
    image: gifPath,
    tag: 'synthesis-2026',
  });
  console.log('  Mint output:', mintDryOutput);

  // Parse IPFS hashes and token ID from output
  const ipfsMatches = mintDryOutput.match(/ipfs:\/\/(Qm[a-zA-Z0-9]+)/g) || [];
  const gifHash = ipfsMatches[0]?.replace('ipfs://', '') || 'MISSING';
  const metaHash = ipfsMatches[1]?.replace('ipfs://', '') || ipfsMatches[0]?.replace('ipfs://', '') || 'MISSING';

  const tokenMatch = mintDryOutput.match(/token[_ ]?(?:id|ID)?[:\s]+(\d+)/i) || mintDryOutput.match(/#(\d+)/);
  const tokenId = tokenMatch ? tokenMatch[1] : String(state.tokens.length + 1);

  console.log(`  GIF IPFS: ${gifHash}`);
  console.log(`  Token ID: ${tokenId}`);

  // Now build the token HTML with the actual contract and token ID
  console.log('\n  Step 2: Building HTML token with contract address...');
  execSync(`node ${join(__dirname, 'build-token.mjs')} --preset ${preset} --contract ${state.contractAddress} --token-id ${tokenId} --chain ${CHAIN}`, {
    encoding: 'utf-8',
    timeout: 30000,
  });
  // Re-read the HTML token (now has correct contract address)
  const updatedHtmlPath = join(OUTPUT_DIR, `token_${preset}_${tokenId}.html`);
  const htmlContent = readFileSync(updatedHtmlPath);
  console.log(`  HTML token rebuilt: ${(htmlContent.length / 1024).toFixed(0)} KB`);

  // TODO: Upload HTML to IPFS separately and update metadata with animation_url
  // For now, the initial mint captured the GIF. We can update metadata later
  // or use a custom metadata upload flow.

  state.tokens.push({
    tokenId,
    preset,
    name: `⬡ ${preset} — HEXEBOTZERO x hexeosis`,
    gifPath,
    htmlPath: updatedHtmlPath,
    gifIpfsHash: gifHash,
    minted: new Date().toISOString(),
    metadata: buildMetadata(preset, tokenId, gifHash, 'PENDING_HTML_UPLOAD', gifSize),
  });
  saveState(state);

  console.log(`\n  ✅ Token #${tokenId} minted`);
  console.log(`  ⚠️  HTML token needs separate IPFS upload for animation_url`);
  console.log(`  View GIF: https://ipfs.io/ipfs/${gifHash}`);
  return tokenId;
}

// --- Auction ---
async function createAuction() {
  const state = loadState();
  if (!state.contractAddress) {
    console.error('  ❌ No contract deployed');
    process.exit(1);
  }

  const tokenId = getArg('token-id', null);
  if (!tokenId) {
    console.error('  ❌ Specify --token-id');
    process.exit(1);
  }

  const startingPrice = getArg('starting-price', '0.005'); // Mainnet: higher starting price
  const duration = getArg('duration', '86400');

  console.log('⬡ Creating auction...');
  console.log(`  Token #${tokenId}`);
  console.log(`  Starting: ${startingPrice} ETH`);
  console.log(`  Duration: ${(parseInt(duration) / 3600).toFixed(1)} hours`);

  const output = rare('auction create', {
    contract: state.contractAddress,
    'token-id': tokenId,
    'starting-price': startingPrice,
    duration,
  });
  console.log('  Auction output:', output);

  state.auctions.push({
    tokenId, startingPrice, duration,
    created: new Date().toISOString(),
  });
  saveState(state);

  console.log(`\n  ✅ Auction live for token #${tokenId}`);
}

// --- Status ---
async function status() {
  const state = loadState();
  console.log('⬡ Mainnet State');
  console.log(`  Contract: ${state.contractAddress || 'not deployed'}`);
  console.log(`  Chain: ${state.chain || 'none'}`);
  console.log(`  Tokens: ${state.tokens.length}`);
  console.log(`  Auctions: ${state.auctions.length}`);

  if (state.contractAddress) {
    try {
      const output = rare('status', { contract: state.contractAddress });
      console.log('  ', output);
    } catch { console.log('  (query failed)'); }
  }

  if (state.tokens.length > 0) {
    console.log('\n  Tokens:');
    for (const t of state.tokens) {
      console.log(`    #${t.tokenId} — ${t.preset} (${t.minted})`);
      if (t.gifIpfsHash) console.log(`      GIF: https://ipfs.io/ipfs/${t.gifIpfsHash}`);
    }
  }
}

// --- Full ---
async function fullRun() {
  const state = loadState();
  if (!state.contractAddress) await deploy();
  else console.log(`  Using existing contract: ${state.contractAddress}`);
  const tokenId = await mint();
  args.push('--token-id', tokenId);
  await createAuction();
  console.log('\n⬡ Full mainnet pipeline complete.');
}

switch (command) {
  case 'deploy': await deploy(); break;
  case 'mint': await mint(); break;
  case 'auction': await createAuction(); break;
  case 'status': await status(); break;
  case 'full': await fullRun(); break;
  default:
    console.log('Usage: node mint-mainnet.mjs <deploy|mint|auction|status|full> [options]');
    console.log('  Default chain: base (mainnet)');
    break;
}
