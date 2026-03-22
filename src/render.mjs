/**
 * render.mjs — Headless three.js renderer via Puppeteer
 * 
 * Loads hexeosis GLBs, applies procedural stripe shader (or texture fallback),
 * captures frames, composites to GIF/MP4.
 * 
 * Scroll speed auto-syncs to animation duration for perfect loops.
 * 
 * Usage:
 *   node render.mjs --test                    # quick 30-frame test
 *   node render.mjs --preset hex102           # named composition
 *   node render.mjs --preset all              # render all presets
 *   node render.mjs --gif --mp4               # output both formats
 *   node render.mjs --config scene.json       # custom config
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, readdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output');
const FRAME_DIR = join(OUTPUT_DIR, 'frames');
const ASSET_BASE = '/Users/hexebotzero/hexeosis_asset_kit';

// --- Palette Library (extracted from hexeosis stripe textures) ---
const PALETTES = JSON.parse(readFileSync(join(__dirname, 'palettes.json'), 'utf-8')).palettes;

// --- Composition Presets ---
const PRESETS = {
  // hex_102: classic hexagonal geometry, neon vs earthy
  hex102: {
    layerA: 'hx_models/animated/hx_a_hex_102A.glb',
    layerB: 'hx_models/animated/hx_a_hex_102B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.A1_neon_black,
    paletteB: PALETTES.K1_earthy,
    scrollSpeedA: null,  // auto-sync
    scrollSpeedB: null,
    scrollDirectionB: -1,
    cameraPos: [0, 2, 8],
    cameraLookAt: [0, 0, -5],
    cameraFOV: 55,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.6,
  },

  // hex_102 variant: deep neon + aurora
  hex102_deep: {
    layerA: 'hx_models/animated/hx_a_hex_102A.glb',
    layerB: 'hx_models/animated/hx_a_hex_102B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.N1_deep_neon,
    paletteB: PALETTES.N3_aurora,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: -1,
    cameraPos: [0, 2, 8],
    cameraLookAt: [0, 0, -5],
    cameraFOV: 55,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.6,
  },

  // pyramids: sharp geometry + spectrum wash
  pyramids101: {
    layerA: 'hx_models/animated/hx_a_pyramids_101A.glb',
    layerB: 'hx_models/animated/hx_a_pyramids_101B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.S1_spectrum,
    paletteB: PALETTES.A2_neon_black_alt,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: 1,
    cameraPos: [0, 3, 10],
    cameraLookAt: [0, 0, -8],
    cameraFOV: 50,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.5,
  },

  // diamonds: dense pair, candy + jewel
  diamonds202: {
    layerA: 'hx_models/animated/hx_a_diamonds_202A.glb',
    layerB: 'hx_models/animated/hx_a_diamonds_202B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.tv1_candy,
    paletteB: PALETTES.K2_jewel,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: -1,
    cameraPos: [0, 1, 6],
    cameraLookAt: [0, 0, -8],
    cameraFOV: 60,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.65,
  },

  // squares: large flat surfaces, spectral hot + warm neon
  squares201: {
    layerA: 'hx_models/animated/hx_a_squares_201A.glb',
    layerB: 'hx_models/animated/hx_a_squares_201B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.N2_spectral_hot,
    paletteB: PALETTES.A3_warm_neon,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: 1,
    cameraPos: [0, 0, 5],
    cameraLookAt: [0, 0, -10],
    cameraFOV: 65,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.55,
  },

  // diamond_205: single diamond variant + tropical
  diamond205: {
    layerA: 'hx_models/animated/hx_a_diamond_205A.glb',
    layerB: 'hx_models/animated/hx_a_diamond_205B.glb',
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.tv2_tropical,
    paletteB: PALETTES.K3_soft_industrial,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: -1,
    cameraPos: [0, 2, 7],
    cameraLookAt: [0, 0, -6],
    cameraFOV: 55,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.6,
  },

  // sphere tunnel: immersive solo, deep look
  sphereTunnel: {
    layerA: 'hx_models/animated/hx_a_sphere-tunnel.glb',
    layerB: null,
    room: null,
    paletteA: PALETTES.S1_spectrum,
    paletteB: null,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: 1,
    cameraPos: [0, 0, 2],
    cameraLookAt: [0, 0, -20],
    cameraFOV: 70,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.7,
  },

  // hexagons_306: solo hexagonal field, sorbet
  hexagons306: {
    layerA: 'hx_models/animated/hx_a_hexagons_306.glb',
    layerB: null,
    room: 'hx_models/static/hex_room_enclose.glb',
    paletteA: PALETTES.tv3_sorbet,
    paletteB: null,
    scrollSpeedA: null,
    scrollSpeedB: null,
    scrollDirectionB: 1,
    cameraPos: [0, 2, 8],
    cameraLookAt: [0, 0, -5],
    cameraFOV: 55,
    bgColor: 0x000000,
    vignette: true,
    vignetteIntensity: 0.6,
  },
};

// --- CLI ---
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(`--${name}`);

const PRESET_NAME = getArg('preset', 'hex102');
const WIDTH = parseInt(getArg('width', '1024'));
const HEIGHT = parseInt(getArg('height', '1024'));
const FPS = parseInt(getArg('fps', '30'));
const SCENE_FILE = join(__dirname, 'scene.html');
const OUTPUT_GIF = hasFlag('gif') || (!hasFlag('mp4') && !hasFlag('still'));
const OUTPUT_MP4 = hasFlag('mp4');
const OUTPUT_STILL = hasFlag('still');
const CUSTOM_CONFIG = getArg('config', null);
const IS_TEST = hasFlag('test');

function buildConfig(presetName) {
  let config;
  if (CUSTOM_CONFIG) {
    config = JSON.parse(readFileSync(CUSTOM_CONFIG, 'utf-8'));
  } else {
    config = PRESETS[presetName || PRESET_NAME];
    if (!config) {
      console.error(`Unknown preset: ${presetName || PRESET_NAME}`);
      console.error(`Available: ${Object.keys(PRESETS).join(', ')}`);
      process.exit(1);
    }
  }
  config.assetBase = ASSET_BASE;
  return config;
}

async function renderPreset(presetName) {
  const config = buildConfig(presetName);

  // Animation is 3 seconds. For perfect loop: frames = duration * FPS
  // Auto-detect from GLB, but default to 3s
  const ANIM_DURATION = 3.0;
  const FRAMES = IS_TEST ? 30 : parseInt(getArg('frames', String(ANIM_DURATION * FPS)));

  console.log('⬡ HEXEBOTZERO Art Machine');
  console.log(`  Preset: ${presetName}`);
  console.log(`  Resolution: ${WIDTH}x${HEIGHT}`);
  console.log(`  Frames: ${FRAMES} @ ${FPS}fps (${(FRAMES / FPS).toFixed(1)}s)`);
  console.log(`  Mode: ${config.paletteA ? 'PROCEDURAL' : 'TEXTURE'}`);
  console.log(`  Layer A: ${config.layerA}`);
  console.log(`  Layer B: ${config.layerB || 'none'}`);
  console.log('');

  // Clean frame directory
  mkdirSync(FRAME_DIR, { recursive: true });
  const oldFrames = readdirSync(FRAME_DIR).filter(f => f.endsWith('.png'));
  for (const f of oldFrames) unlinkSync(join(FRAME_DIR, f));

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=metal',
      '--disable-web-security',
      '--allow-file-access-from-files',
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // Inject config
  await page.evaluateOnNewDocument((w, h, f, fps, cfg) => {
    window.__RENDER_WIDTH = w;
    window.__RENDER_HEIGHT = h;
    window.__TOTAL_FRAMES = f;
    window.__FPS = fps;
    window.__SCENE_CONFIG = cfg;
  }, WIDTH, HEIGHT, FRAMES, FPS, config);

  // Load scene
  console.log('  Loading scene...');
  await page.goto(`file://${SCENE_FILE}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });

  const initError = await page.evaluate(() => window.__initError);
  if (initError) {
    console.error(`  ❌ Scene init error: ${initError}`);
    await browser.close();
    return null;
  }

  // Get actual animation duration from scene
  const actualDuration = await page.evaluate(() => window.__animationDuration ? window.__animationDuration() : 3.0);
  console.log(`  Animation duration: ${actualDuration}s`);
  console.log(`  Rendering ${FRAMES} frames...`);

  const startTime = Date.now();

  for (let i = 0; i < FRAMES; i++) {
    await page.evaluate((frame) => window.__renderFrame(frame), i);
    const framePath = join(FRAME_DIR, `frame_${String(i).padStart(4, '0')}.png`);
    const canvas = await page.$('canvas');
    await canvas.screenshot({ path: framePath, type: 'png' });

    if (i % 10 === 0 || i === FRAMES - 1) {
      process.stdout.write(`\r  Frame ${i + 1}/${FRAMES}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Rendered ${FRAMES} frames in ${elapsed}s`);

  await browser.close();

  // Save provenance
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(
    join(OUTPUT_DIR, `config_${presetName}_${timestamp}.json`),
    JSON.stringify({
      preset: presetName,
      config,
      width: WIDTH,
      height: HEIGHT,
      frames: FRAMES,
      fps: FPS,
      animDuration: actualDuration,
      rendered: new Date().toISOString(),
    }, null, 2)
  );

  // Composite
  const outputs = [];

  if (OUTPUT_GIF) {
    const gifPath = join(OUTPUT_DIR, `hexebotzero_${presetName}_${timestamp}.gif`);
    try {
      console.log('  Compositing GIF via gifski...');
      execSync(`gifski --fps ${FPS} --quality 90 --width ${WIDTH} -o "${gifPath}" "${FRAME_DIR}/frame_"*.png`, { stdio: 'pipe' });
      const size = (parseInt(execSync(`stat -f%z "${gifPath}"`, { encoding: 'utf-8' }).trim()) / 1024 / 1024).toFixed(2);
      console.log(`  ✅ GIF: ${gifPath} (${size} MB)`);
      outputs.push(gifPath);
    } catch {
      console.log('  gifski unavailable, using ffmpeg...');
      execSync(`ffmpeg -y -framerate ${FPS} -i "${FRAME_DIR}/frame_%04d.png" -vf "split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=none" "${gifPath}"`, { stdio: 'pipe' });
      console.log(`  ✅ GIF: ${gifPath}`);
      outputs.push(gifPath);
    }
  }

  if (OUTPUT_MP4) {
    const mp4Path = join(OUTPUT_DIR, `hexebotzero_${presetName}_${timestamp}.mp4`);
    execSync(`ffmpeg -y -framerate ${FPS} -i "${FRAME_DIR}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${mp4Path}"`, { stdio: 'pipe' });
    console.log(`  ✅ MP4: ${mp4Path}`);
    outputs.push(mp4Path);
  }

  if (OUTPUT_STILL) {
    console.log(`  ✅ Still: ${join(FRAME_DIR, 'frame_0000.png')}`);
  }

  return outputs;
}

async function main() {
  if (PRESET_NAME === 'all') {
    console.log(`Rendering all ${Object.keys(PRESETS).length} presets...\n`);
    for (const name of Object.keys(PRESETS)) {
      await renderPreset(name);
      console.log('');
    }
  } else {
    await renderPreset(PRESET_NAME);
  }
  console.log('\n⬡ Done.');
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
