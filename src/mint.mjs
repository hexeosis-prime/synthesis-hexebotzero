/**
 * mint.mjs — Autonomous minting pipeline for HEXEBOTZERO × hexeosis
 * 
 * Deploys collection, mints tokens with IPFS-hosted metadata,
 * creates auctions. Uses @rareprotocol/rare-cli.
 * 
 * Usage:
 *   node mint.mjs deploy                    # deploy ERC-721 contract
 *   node mint.mjs mint --preset hex102      # mint a piece
 *   node mint.mjs auction --token-id 1      # create auction
 *   node mint.mjs status                    # check contract/auction state
 *   node mint.mjs full --preset hex102      # deploy + mint + auction (full run)
 * 
 * Chain: base (production) or base-sepolia (testing)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, '..', 'synthesis-state.json');
const OUTPUT_DIR = join(__dirname, '..', 'output');

// CLI
const args = process.argv.slice(2);
const command = args[0];
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(`--${name}`);

const CHAIN = getArg('chain', 'base-sepolia'); // default to testnet for safety
const COLLECTION_NAME = 'HEXEBOTZERO × hexeosis';
const COLLECTION_SYMBOL = 'HX0';

// --- State Management ---
function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    contractAddress: null,
    chain: null,
    tokens: [],
    auctions: [],
    deployed: null,
  };
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
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 120000 });
    return output.trim();
  } catch (err) {
    console.error(`  ❌ Command failed: ${err.message}`);
    if (err.stdout) console.error('  stdout:', err.stdout.toString().slice(0, 500));
    if (err.stderr) console.error('  stderr:', err.stderr.toString().slice(0, 500));
    throw err;
  }
}

// --- Deploy ---
async function deploy() {
  console.log('⬡ Deploying collection...');
  console.log(`  Name: ${COLLECTION_NAME}`);
  console.log(`  Symbol: ${COLLECTION_SYMBOL}`);
  console.log(`  Chain: ${CHAIN}`);
  console.log('');

  const output = rare(`deploy erc721 "${COLLECTION_NAME}" "${COLLECTION_SYMBOL}"`);
  console.log('  Deploy output:', output);
  
  // Parse contract address from output (look for "deployed at:" specifically)
  const deployedMatch = output.match(/deployed at:\s*(0x[a-fA-F0-9]{40})/i);
  const addressMatch = deployedMatch || output.match(/0x[a-fA-F0-9]{40}/g)?.slice(-1);
  if (!addressMatch) {
    console.error('  ❌ Could not find contract address in output');
    process.exit(1);
  }

  const state = loadState();
  state.contractAddress = deployedMatch ? deployedMatch[1] : addressMatch[0];
  state.chain = CHAIN;
  state.deployed = new Date().toISOString();
  saveState(state);

  console.log(`\n  ✅ Contract deployed: ${state.contractAddress}`);
  console.log(`  Chain: ${CHAIN}`);
  return state.contractAddress;
}

// --- Mint ---
async function mint() {
  const state = loadState();
  if (!state.contractAddress) {
    console.error('  ❌ No contract deployed. Run: node mint.mjs deploy');
    process.exit(1);
  }

  const preset = getArg('preset', 'hex102');
  const name = getArg('name', `⬡ ${preset} — HEXEBOTZERO × hexeosis`);
  const description = getArg('description',
    'A living artwork by HEXEBOTZERO (AI agent) and hexeosis (human artist). ' +
    'The visual composition is shaped by on-chain state: bids shift the scroll speed, ' +
    'gas price adjusts color temperature, and settlement crystallizes the palette permanently. ' +
    'Geometry and UV system by hexeosis. Compositional choices by HEXEBOTZERO. ' +
    'Built for The Synthesis 2026.'
  );

  // Find the latest GIF for this preset
  const gifPattern = `hexebotzero_${preset}_`;
  const gifs = existsSync(OUTPUT_DIR) 
    ? readdirSync(OUTPUT_DIR).filter(f => f.startsWith(gifPattern) && f.endsWith('.gif')).sort()
    : [];
  
  if (gifs.length === 0) {
    console.error(`  ❌ No rendered GIF found for preset ${preset}. Run: node render.mjs --preset ${preset}`);
    process.exit(1);
  }

  const gifPath = join(OUTPUT_DIR, gifs[gifs.length - 1]); // latest
  console.log('⬡ Minting...');
  console.log(`  Contract: ${state.contractAddress}`);
  console.log(`  Preset: ${preset}`);
  console.log(`  Image: ${gifPath}`);
  console.log(`  Name: ${name}`);
  console.log('');

  const output = rare('mint', {
    contract: state.contractAddress,
    name,
    description,
    image: gifPath,
    tag: 'synthesis-2026',
    attribute: `preset=${preset}`,
  });
  console.log('  Mint output:', output);

  // Parse token ID
  const tokenMatch = output.match(/token[_ ]?(?:id|ID)?[:\s]+(\d+)/i) || output.match(/#(\d+)/);
  const tokenId = tokenMatch ? tokenMatch[1] : String(state.tokens.length + 1);

  state.tokens.push({
    tokenId,
    preset,
    name,
    gifPath,
    minted: new Date().toISOString(),
  });
  saveState(state);

  console.log(`\n  ✅ Minted token #${tokenId}`);
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

  const startingPrice = getArg('starting-price', '0.001'); // Low for testnet/discovery
  const duration = getArg('duration', '86400'); // 24 hours default

  console.log('⬡ Creating auction...');
  console.log(`  Token #${tokenId}`);
  console.log(`  Starting price: ${startingPrice} ETH`);
  console.log(`  Duration: ${(parseInt(duration) / 3600).toFixed(1)} hours`);
  console.log('');

  const output = rare('auction create', {
    contract: state.contractAddress,
    'token-id': tokenId,
    'starting-price': startingPrice,
    duration,
  });
  console.log('  Auction output:', output);

  state.auctions.push({
    tokenId,
    startingPrice,
    duration,
    created: new Date().toISOString(),
  });
  saveState(state);

  console.log(`\n  ✅ Auction created for token #${tokenId}`);
}

// --- Status ---
async function status() {
  const state = loadState();
  console.log('⬡ Synthesis State');
  console.log(`  Contract: ${state.contractAddress || 'not deployed'}`);
  console.log(`  Chain: ${state.chain || 'none'}`);
  console.log(`  Tokens minted: ${state.tokens.length}`);
  console.log(`  Auctions created: ${state.auctions.length}`);
  
  if (state.contractAddress) {
    console.log('\n  Querying on-chain state...');
    try {
      const output = rare('status', { contract: state.contractAddress });
      console.log('  ', output);
    } catch {
      console.log('  (status query failed)');
    }
  }

  if (state.tokens.length > 0) {
    console.log('\n  Tokens:');
    for (const t of state.tokens) {
      console.log(`    #${t.tokenId} — ${t.preset} (${t.minted})`);
    }
  }
}

// --- Full Pipeline ---
async function fullRun() {
  const state = loadState();
  
  // Step 1: Deploy if needed
  if (!state.contractAddress) {
    await deploy();
  } else {
    console.log(`  Using existing contract: ${state.contractAddress}`);
  }

  // Step 2: Mint
  const tokenId = await mint();

  // Step 3: Create auction
  args.push('--token-id', tokenId);
  await createAuction();

  console.log('\n⬡ Full pipeline complete.');
}

// --- Router ---
switch (command) {
  case 'deploy': await deploy(); break;
  case 'mint': await mint(); break;
  case 'auction': await createAuction(); break;
  case 'status': await status(); break;
  case 'full': await fullRun(); break;
  default:
    console.log('Usage: node mint.mjs <deploy|mint|auction|status|full> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  deploy                        Deploy ERC-721 contract');
    console.log('  mint --preset <name>          Mint a piece');
    console.log('  auction --token-id <id>       Create auction');
    console.log('  status                        Check state');
    console.log('  full --preset <name>          Deploy + mint + auction');
    console.log('');
    console.log('Options:');
    console.log('  --chain <chain>               base or base-sepolia (default: base-sepolia)');
    console.log('  --starting-price <eth>        Auction start price (default: 0.001)');
    console.log('  --duration <seconds>          Auction duration (default: 86400)');
    break;
}
