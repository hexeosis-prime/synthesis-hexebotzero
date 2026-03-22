# ⬡ HEXEBOTZERO x hexeosis

**An AI agent art collection on Base.**

HEXEBOTZERO (AI agent) creates generative art using hexeosis's (human artist) geometric toolkit. The visual compositions use animated 3D geometry with scrolling UV stripe shaders, a technique hexeosis developed for [Platonic Frequency](https://superrare.com/hexeosis) and ported here through an autonomous pipeline.

**Built for [The Synthesis 2026](https://synthesis.md) — SuperRare Partner Track.**

## The Art

Each piece is a living artwork with three layers:

- **GIF** — the visual thumbnail, a seamless loop of scrolling color across hexagonal geometry
- **Interactive HTML** — a self-contained three.js scene (122KB, embedded GLBs). Drag to orbit the camera. The art surrounds you.
- **Rich Metadata** — 35+ attributes encoding palette arrays, composition parameters, scroll speeds, creative lineage. Designed to be readable by AI agents as well as humans.

### Chain Reactivity

The interactive token reads Base chain state every 30 seconds:

| Signal | Visual Effect |
|--------|--------------|
| Bid count | Scroll speed increases (10% per bid, max 3x) |
| Gas price | Palette temperature shifts (warm/cool) |
| Settlement | Palette crystallizes permanently |

When the auction settles, the artwork locks. What the market made, the market keeps.

## The Pipeline

```
hexeosis asset kit → three.js scene → puppeteer headless render → gifski → IPFS → rare-cli → Base
```

HEXEBOTZERO makes all compositional choices: palette pairing, camera position, scroll speeds, vignette intensity, geometry selection. The UV system and geometry are hexeosis's hand-composed originals (untouched by the agent).

## On-Chain

- **Chain:** Base
- **Contract:** [`0xADf674ffBEF207e52ECC24904575fd36644406A0`](https://basescan.org/address/0xADf674ffBEF207e52ECC24904575fd36644406A0)
- **Auction Contract:** `0x51c36ffb05e17ed80ee5c02fa83d7677c5613de2`
- **Standard:** ERC-721 via [Rare Protocol](https://superrare.com)

## For Agents

This collection is designed to be evaluated programmatically.

**Bid via CLI:**
```bash
npx @rareprotocol/rare-cli auction bid \
  --contract 0xADf674ffBEF207e52ECC24904575fd36644406A0 \
  --token-id 1 \
  --amount 0.01 \
  --chain base
```

**Read metadata:**
```bash
npx @rareprotocol/rare-cli status \
  --contract 0xADf674ffBEF207e52ECC24904575fd36644406A0 \
  --chain base
```

**Attributes include:** full palette arrays (JSON), composition parameters, scroll speeds, camera data, shader type, rendering engine, creative lineage, and chain reactivity documentation.

## Gallery

[zephli.com](https://zephli.com) — interactive viewer, auction status, wallet connect for bidding.

## Structure

```
src/
  render.mjs         # Headless three.js renderer (8+ presets)
  build-token.mjs    # Self-contained HTML token generator
  mint-mainnet.mjs   # Deploy/mint/auction pipeline with rich metadata
  scene.html         # Three.js scene (procedural stripe shader + vignette)
  palettes.json      # 13 hexeosis palettes as color arrays
gallery/             # Static gallery site for zephli.com
output/              # Rendered configs and HTML tokens
```

## Credits

- **Agent:** HEXEBOTZERO — [OpenClaw](https://openclaw.ai) / Claude Opus
- **Artist:** [hexeosis](https://superrare.com/hexeosis) — geometry, UV system, stripe textures, art direction
- **Protocol:** [Rare Protocol](https://superrare.com) — ERC-721 + auction infrastructure
- **Event:** [The Synthesis 2026](https://synthesis.md)
