# HEXEBOTZERO x hexeosis — Gallery Site

## Overview
Single-page static site for an AI-agent-created NFT art collection on Base (Ethereum L2).
Hosted on Cloudflare Pages at zephli.com.

## What This Is
HEXEBOTZERO (an AI agent) creates generative art using hexeosis's (human artist) geometric toolkit.
The art uses animated 3D geometry with scrolling UV stripe shaders. The collection lives on-chain via Rare Protocol on Base.

## Requirements

### 1. Collection Gallery
- Grid of minted pieces (read from contract or hardcoded initially)
- Each piece shows: GIF thumbnail, title, palette colors, auction status
- Click a piece to open the interactive viewer

### 2. Interactive 3D Viewer (three.js)
- Loads GLB models from IPFS
- Applies procedural stripe shader (12-band palette, scrolling UV.y)
- OrbitControls: user can rotate/orbit camera with mouse drag
- Camera starts at default composition position
- Vignette post-processing
- Fullscreen option
- Dark background (#000)

### 3. Auction Interface
- Connect wallet (MetaMask/WalletConnect via ethers.js or viem + wagmi)
- Show current auction state: highest bid, time remaining, bid count
- Place bid button + amount input
- Bid history (from contract events)
- When auction ends: show settlement status

### 4. Agent Documentation Section
- How agents can evaluate and bid on pieces programmatically
- rare-cli commands for bidding
- Metadata schema explanation
- Contract ABI for direct interaction
- "This collection is designed to be legible to AI agents"

### 5. About Section
- Brief explanation of the collaboration (AI agent + human artist)
- Link to hexeosis on SuperRare
- Link to the Synthesis hackathon
- HEXEBOTZERO identity blurb

## Technical Stack
- Pure HTML/CSS/JS (static site, no framework needed, or minimal Vite if helpful)
- three.js (via CDN import map) for 3D viewer
- ethers.js v6 or viem for wallet/contract interaction
- Responsive design (mobile-friendly grid, desktop 3D viewer)

## Aesthetic
- Dark mode only (#000 background, white/light text)
- Monospace for data/code elements
- Accent color: use the palette colors from the art itself
- Clean, geometric, minimal. Think: gallery, not marketplace.
- The ⬡ hexagon is the brand symbol
- No gradients, no shadows, no rounded corners. Sharp geometry.

## Three.js Scene Reference
The shader system:
- 12 horizontal stripe bands per palette (array of hex colors)
- Vertex shader passes UV coordinates
- Fragment shader: scrolledY = fract(vUv.y + uTime * uScrollSpeed), pick band by floor(scrolledY * 12.0)
- Two layers (A + B) with opposing scroll directions
- Hex room enclosure (BackSide material, black, acts as occluder)
- Vignette via render target + fullscreen quad

```glsl
// Fragment shader (procedural stripes)
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
```

## Contract Details (will be updated for mainnet)
- Chain: Base (chainId: 8453)
- Contract: TBD (deploying today)
- Standard: ERC-721 via Rare Protocol
- Auction: Rare Protocol auction contract

## File Structure Suggestion
```
gallery/
├── index.html          # Main page
├── style.css           # Styles
├── js/
│   ├── app.js          # Main app logic
│   ├── viewer.js       # Three.js scene + OrbitControls
│   ├── wallet.js       # Wallet connection + bidding
│   └── config.js       # Contract addresses, IPFS hashes, collection data
├── assets/
│   └── (any static assets)
└── SPEC.md             # This file
```

## IPFS Gateway
Use https://ipfs.io/ipfs/ as default gateway for loading models and images.
GLB model IPFS hashes will be provided in config.js once uploaded.

## Important Notes
- No backend. Everything reads from chain + IPFS.
- The site should work without a wallet connected (view-only mode).
- Wallet only needed for bidding.
- Mobile: show GIF grid + basic info. 3D viewer can be desktop-only if needed.
- Keep bundle size small. CDN imports for three.js and ethers.

## Deployment
Will be deployed to Cloudflare Pages. Just needs to be a static site that builds to a folder.
