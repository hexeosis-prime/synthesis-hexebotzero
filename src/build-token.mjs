/**
 * build-token.mjs — Generates a self-contained HTML token for HEXEBOTZERO x hexeosis
 * 
 * Embeds GLB geometry as base64, includes three.js scene with OrbitControls,
 * chain-reactive parameters, procedural stripe shader, vignette post-processing.
 * 
 * The output HTML is a single file that can be uploaded to IPFS and referenced
 * as animation_url in the NFT metadata.
 * 
 * Usage: node build-token.mjs --preset hex102 --contract 0x... --token-id 1
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// CLI args
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const preset = getArg('preset', 'hex102');
const contractAddress = getArg('contract', '0x0000000000000000000000000000000000000000');
const tokenId = getArg('token-id', '1');
const chain = getArg('chain', 'base');
const rpcUrl = chain === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';

// Load GLB data
const glbData = JSON.parse(readFileSync(join(__dirname, 'glb-data.json'), 'utf-8'));

// Load palettes
const palettesFile = JSON.parse(readFileSync(join(__dirname, 'palettes.json'), 'utf-8'));
const palettes = palettesFile.palettes || palettesFile;

// Preset configurations
const PRESETS = {
  hex102: {
    geometryA: 'hex102A',
    geometryB: 'hex102B',
    paletteAKey: 'A1_neon_black',
    paletteBKey: 'K1_earthy',
    cameraPos: [0, 2, 8],
    cameraTarget: [0, 0, -5],
    cameraFOV: 55,
    scrollSpeedA: 0.333,
    scrollSpeedB: -0.333,
    vignetteIntensity: 0.6,
  },
  squares201: {
    geometryA: 'squares201A',
    geometryB: 'squares201B',
    paletteAKey: 'N2_spectral_hot',
    paletteBKey: 'A3_warm_neon',
    cameraPos: [0, 0, 5],
    cameraTarget: [0, 0, -10],
    cameraFOV: 65,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0.333,
    vignetteIntensity: 0.55,
  },
  hexagons306: {
    geometryA: 'hexagons306',
    geometryB: null,
    paletteAKey: 'tv3_sorbet',
    paletteBKey: 'tv3_sorbet',
    cameraPos: [0, 2, 8],
    cameraTarget: [0, 0, -5],
    cameraFOV: 55,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0,
    vignetteIntensity: 0.6,
  },
  pyramids101: {
    geometryA: 'pyramids101A',
    geometryB: 'pyramids101B',
    paletteAKey: 'S1_spectrum',
    paletteBKey: 'A2_neon_black_alt',
    cameraPos: [0, 3, 10],
    cameraTarget: [0, 0, -8],
    cameraFOV: 50,
    scrollSpeedA: 0.333,
    scrollSpeedB: 0.333,
    vignetteIntensity: 0.5,
  },
};

const config = PRESETS[preset] || PRESETS.hex102;
const paletteA = palettes[config.paletteAKey] || palettes.A1_neon_black;
const paletteB = palettes[config.paletteBKey] || palettes.K1_earthy;

// Get GLB base64 data
const glbA = glbData[config.geometryA];
const glbB = config.geometryB ? glbData[config.geometryB] : null;
const glbRoom = glbData.hexRoom;

if (!glbA || !glbRoom) {
  console.error('Missing GLB data for preset:', preset, '(need at least geometryA and room)');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>⬡ ${preset} — HEXEBOTZERO x hexeosis</title>
<style>
  * { margin: 0; padding: 0; }
  body { background: #000; overflow: hidden; cursor: grab; }
  body:active { cursor: grabbing; }
  canvas { display: block; width: 100vw; height: 100vh; }
  #info {
    position: fixed; bottom: 16px; left: 16px;
    font: 11px/1.4 monospace; color: #444;
    pointer-events: none; z-index: 10;
    transition: opacity 0.3s;
  }
  #info.hidden { opacity: 0; }
  #info span.val { color: #888; }
</style>
</head>
<body>
<!--
  ⬡ HEXEBOTZERO x hexeosis — Synthesis 2026
  
  Self-contained HTML artwork. Geometry embedded as base64.
  Chain-reactive: visual parameters shift with auction state.
  Camera: OrbitControls — drag to explore the hex room.
  
  Artist: hexeosis (https://superrare.com/hexeosis)
  Agent: HEXEBOTZERO
  Chain: Base (${chain})
  Contract: ${contractAddress}
  Token: #${tokenId}
  Preset: ${preset}
  
  Palette A: ${JSON.stringify(paletteA)}
  Palette B: ${JSON.stringify(paletteB)}
-->
<div id="info">
  ⬡ <span class="val">${preset}</span> — HEXEBOTZERO x hexeosis<br>
  chain: <span class="val" id="chain-status">reading...</span><br>
  camera: <span class="val" id="cam-info">drag to orbit</span>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.175.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.175.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === EMBEDDED GEOMETRY (base64-encoded GLB) ===
const GLB_A = '${glbA}';
const GLB_B = ${glbB ? `'${glbB}'` : 'null'};
const GLB_ROOM = '${glbRoom}';

// === TOKEN CONFIG ===
const CONFIG = {
  contractAddress: '${contractAddress}',
  tokenId: ${tokenId},
  rpcUrl: '${rpcUrl}',
  chain: '${chain}',
  basePaletteA: ${JSON.stringify(paletteA)},
  basePaletteB: ${JSON.stringify(paletteB)},
  scrollSpeedA: ${config.scrollSpeedA},
  scrollSpeedB: ${config.scrollSpeedB},
  cameraPos: ${JSON.stringify(config.cameraPos)},
  cameraTarget: ${JSON.stringify(config.cameraTarget)},
  cameraFOV: ${config.cameraFOV},
  vignetteIntensity: ${config.vignetteIntensity},
};

// === CHAIN STATE ===
const CHAIN_STATE = {
  highestBid: 0, bidCount: 0, settled: false,
  timeSinceLastBid: Infinity, gasPrice: 0,
};

async function readChainState() {
  if (!CONFIG.contractAddress || CONFIG.contractAddress === '0x0000000000000000000000000000000000000000') {
    document.getElementById('chain-status').textContent = 'no contract';
    return CHAIN_STATE;
  }
  const AUCTION_CONTRACT = '0x51c36ffb05e17ed80ee5c02fa83d7677c5613de2';
  try {
    const rpc = async (method, params = []) => {
      const res = await fetch(CONFIG.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
      });
      return (await res.json()).result;
    };

    // Gas price
    const gasHex = await rpc('eth_gasPrice');
    CHAIN_STATE.gasPrice = parseInt(gasHex, 16);

    // Auction bids: auctionBids(address,uint256) → (address bidder, address currency, uint256 amount, uint8 fee)
    // selector: 0x0cd87c68 for auctionBids
    const nftPadded = CONFIG.contractAddress.slice(2).toLowerCase().padStart(64, '0');
    const tokenPadded = CONFIG.tokenId.toString(16).padStart(64, '0');
    const bidCalldata = '0x0cd87c68' + nftPadded + tokenPadded;
    const bidResult = await rpc('eth_call', [{ to: AUCTION_CONTRACT, data: bidCalldata }, 'latest']);

    if (bidResult && bidResult.length >= 258) {
      const bidderHex = '0x' + bidResult.slice(26, 66);
      const amountHex = '0x' + bidResult.slice(130, 194);
      const hasBid = bidderHex !== '0x0000000000000000000000000000000000000000';
      const bidAmount = parseInt(amountHex, 16);
      CHAIN_STATE.highestBid = bidAmount / 1e18;
      CHAIN_STATE.bidCount = hasBid ? Math.max(1, CHAIN_STATE.bidCount) : 0;
      // Increment bid count if amount changed
      if (hasBid && bidAmount > (CHAIN_STATE._lastBidAmount || 0)) {
        CHAIN_STATE.bidCount++;
        CHAIN_STATE._lastBidAmount = bidAmount;
      }
    }

    // Auction config: tokenAuctions(address,uint256)
    // selector: 0xc47c35c1
    const auctionCalldata = '0xc47c35c1' + nftPadded + tokenPadded;
    const auctionResult = await rpc('eth_call', [{ to: AUCTION_CONTRACT, data: auctionCalldata }, 'latest']);

    if (auctionResult && auctionResult.length >= 450) {
      const startingBlock = parseInt('0x' + auctionResult.slice(130, 194), 16);
      const lengthOfAuction = parseInt('0x' + auctionResult.slice(194, 258), 16);
      if (startingBlock > 0 && lengthOfAuction > 0) {
        const blockHex = await rpc('eth_blockNumber');
        const currentBlock = parseInt(blockHex, 16);
        const elapsed = (currentBlock - startingBlock) * 2;
        CHAIN_STATE.settled = elapsed >= lengthOfAuction;
      }
    }

    // Status display
    const gwei = (CHAIN_STATE.gasPrice / 1e9).toFixed(1);
    const bidInfo = CHAIN_STATE.bidCount > 0 ? ' | ' + CHAIN_STATE.bidCount + ' bid' + (CHAIN_STATE.bidCount > 1 ? 's' : '') : '';
    const settledInfo = CHAIN_STATE.settled ? ' | SETTLED' : '';
    document.getElementById('chain-status').textContent = gwei + ' gwei' + bidInfo + settledInfo;
  } catch (err) {
    document.getElementById('chain-status').textContent = 'offline';
  }
  return CHAIN_STATE;
}

// === PARAMETER MAPPING ===
function mapChainToVisuals(state) {
  const params = {
    paletteA: [...CONFIG.basePaletteA],
    paletteB: [...CONFIG.basePaletteB],
    scrollSpeedA: CONFIG.scrollSpeedA,
    scrollSpeedB: CONFIG.scrollSpeedB,
    cameraFOV: CONFIG.cameraFOV,
    vignetteIntensity: CONFIG.vignetteIntensity,
  };
  if (state.settled) return params;
  if (state.bidCount > 0) {
    const mult = 1.0 + (state.bidCount * 0.1);
    params.scrollSpeedA = CONFIG.scrollSpeedA * Math.min(mult, 3.0);
    params.scrollSpeedB = CONFIG.scrollSpeedB * Math.min(mult, 3.0);
  }
  if (state.gasPrice > 0) {
    const warmth = Math.min((state.gasPrice / 1e9) / 50, 1.0);
    params.paletteA = shiftTemp(params.paletteA, warmth);
  }
  return params;
}

function shiftTemp(palette, warmth) {
  return palette.map(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const s = (warmth - 0.5) * 30;
    const nr = Math.max(0, Math.min(255, Math.round(r + s)));
    const nb = Math.max(0, Math.min(255, Math.round(b - s)));
    return '#' + [nr, g, nb].map(c => c.toString(16).padStart(2, '0')).join('');
  });
}

// === HELPERS ===
function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function hexToVec3(hex) {
  const c = hex.replace('#', '');
  return new THREE.Vector3(
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255
  );
}

// === SHADERS ===
const VERT = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

const FRAG = \`
  uniform vec3 uStripes[12];
  uniform float uTime;
  uniform float uScrollSpeed;
  varying vec2 vUv;
  void main() {
    float scrolledY = fract(vUv.y + uTime * uScrollSpeed);
    int band = int(floor(scrolledY * 12.0));
    band = clamp(band, 0, 11);
    vec3 color = uStripes[0];
    for (int i = 0; i < 12; i++) {
      if (i == band) color = uStripes[i];
    }
    gl_FragColor = vec4(color, 1.0);
  }
\`;

function createMaterial(palette, speed) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uStripes: { value: palette.map(hexToVec3) },
      uTime: { value: 0.0 },
      uScrollSpeed: { value: speed },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.DoubleSide,
  });
}

// === SCENE ===
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let camera, controls, renderTarget, vignetteScene, vignetteCamera, vignetteMat;
const mixers = [];
const scrollMaterials = [];
let clock;

function setupVignette(intensity) {
  renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  vignetteScene = new THREE.Scene();
  vignetteCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  vignetteMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: renderTarget.texture },
      uIntensity: { value: intensity },
    },
    vertexShader: \`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    \`,
    fragmentShader: \`
      uniform sampler2D tDiffuse;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        float dist = length(vUv - 0.5);
        float v = 1.0 - smoothstep(0.3, 0.85, dist) * uIntensity;
        gl_FragColor = vec4(color.rgb * v, 1.0);
      }
    \`,
    depthWrite: false, depthTest: false,
  });
  vignetteScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vignetteMat));
}

async function loadGLB(loader, base64Data) {
  const buffer = base64ToArrayBuffer(base64Data);
  return new Promise((res, rej) => {
    loader.parse(buffer, '', res, rej);
  });
}

async function init() {
  const chainState = await readChainState();
  const visuals = mapChainToVisuals(chainState);

  camera = new THREE.PerspectiveCamera(
    visuals.cameraFOV,
    window.innerWidth / window.innerHeight,
    0.1, 200
  );
  camera.position.set(...CONFIG.cameraPos);

  // OrbitControls for interactive camera
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...CONFIG.cameraTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 20;
  controls.enablePan = false;
  controls.update();

  setupVignette(visuals.vignetteIntensity);

  const matA = createMaterial(visuals.paletteA, visuals.scrollSpeedA);
  const matB = createMaterial(visuals.paletteB, visuals.scrollSpeedB);
  scrollMaterials.push(matA, matB);

  const loader = new GLTFLoader();

  // Load embedded geometry
  const gltfA = await loadGLB(loader, GLB_A);
  gltfA.scene.traverse(c => { if (c.isMesh) c.material = matA; });
  scene.add(gltfA.scene);
  if (gltfA.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(gltfA.scene);
    gltfA.animations.forEach(clip => mixer.clipAction(clip).setLoop(THREE.LoopRepeat).play());
    mixers.push(mixer);
  }

  if (GLB_B) {
    const gltfB = await loadGLB(loader, GLB_B);
    gltfB.scene.traverse(c => { if (c.isMesh) c.material = matB; });
    scene.add(gltfB.scene);
    if (gltfB.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltfB.scene);
      gltfB.animations.forEach(clip => mixer.clipAction(clip).setLoop(THREE.LoopRepeat).play());
      mixers.push(mixer);
    }
  }

  const gltfRoom = await loadGLB(loader, GLB_ROOM);
  gltfRoom.scene.traverse(c => {
    if (c.isMesh) c.material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
  });
  scene.add(gltfRoom.scene);

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderTarget.setSize(w, h);
  });

  clock = new THREE.Clock();
  animate();

  // Hide info after 5 seconds of no interaction
  let hideTimeout = setTimeout(() => document.getElementById('info').classList.add('hidden'), 5000);
  renderer.domElement.addEventListener('pointermove', () => {
    document.getElementById('info').classList.remove('hidden');
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => document.getElementById('info').classList.add('hidden'), 3000);
  });
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  controls.update();

  // Update camera info display
  const p = camera.position;
  document.getElementById('cam-info').textContent =
    p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);

  for (const mat of scrollMaterials) mat.uniforms.uTime.value = elapsed;
  for (const mixer of mixers) mixer.update(dt);

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(vignetteScene, vignetteCamera);
}

// Chain refresh every 30s
async function chainLoop() {
  while (true) {
    await new Promise(r => setTimeout(r, 30000));
    const state = await readChainState();
    const visuals = mapChainToVisuals(state);
    if (scrollMaterials[0]) scrollMaterials[0].uniforms.uScrollSpeed.value = visuals.scrollSpeedA;
    if (scrollMaterials[1]) scrollMaterials[1].uniforms.uScrollSpeed.value = visuals.scrollSpeedB;
    if (vignetteMat) vignetteMat.uniforms.uIntensity.value = visuals.vignetteIntensity;
    if (scrollMaterials[0]) scrollMaterials[0].uniforms.uStripes.value = visuals.paletteA.map(hexToVec3);
  }
}

init().then(() => chainLoop()).catch(err => {
  document.body.innerHTML = '<div style="color:#444;font:14px monospace;padding:2em">⬡ ' + err.message + '</div>';
});
</script>
</body>
</html>`;

// Write the token HTML
const outPath = join(__dirname, '..', 'output', `token_${preset}_${tokenId}.html`);
writeFileSync(outPath, html);

const sizeKB = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`⬡ Token HTML built`);
console.log(`  Preset: ${preset}`);
console.log(`  Contract: ${contractAddress}`);
console.log(`  Token ID: ${tokenId}`);
console.log(`  Size: ${sizeKB} KB`);
console.log(`  Output: ${outPath}`);
console.log(`  Embedded: ${glbB ? 3 : 2} GLB models (${(Buffer.byteLength(glbA + (glbB || '') + glbRoom, 'utf-8') / 1024).toFixed(0)} KB base64)`);
console.log(`  Features: OrbitControls, chain-reactive params, vignette, procedural stripes`);
