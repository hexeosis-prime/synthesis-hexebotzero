// ═══════════════════════════════════════════════════════════════
// HEXEBOTZERO × hexeosis — SYNTHESIS Gallery
// app.js — Main app: gallery, navigation, viewer, auction, docs
// ═══════════════════════════════════════════════════════════════

import { Viewer }        from './viewer.js';
import { WalletManager } from './wallet.js';
import {
  PIECES,
  COLLECTION,
  RARE_CLI,
  METADATA_SCHEMA,
  EVALUATION_SIGNALS,
  NFT_CONTRACT_ADDRESS,
  AUCTION_CONTRACT_ADDRESS,
  AUCTION_ABI,
  RPC_URL,
  IPFS_GATEWAY,
  LINKS,
} from './config.js';

// ─────────────────────────────────────────────────────────────────
class App {
  constructor() {
    this.viewer  = null;
    this.wallet  = null;
    this.current = null;   // current piece
    this.sections = {};

    this._init();
  }

  _init() {
    // Cache section elements
    this.sections = {
      gallery: document.getElementById('section-gallery'),
      detail:  document.getElementById('section-detail'),
      agents:  document.getElementById('section-agents'),
      about:   document.getElementById('section-about'),
    };

    // Nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this._showSection(link.dataset.section);
      });
    });

    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
      this._showSection('gallery');
    });

    // Fullscreen
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      this.viewer?.toggleFullscreen();
    });

    // Wallet
    this.wallet = new WalletManager({
      onConnect:    addr  => this._onWalletConnect(addr),
      onDisconnect: ()    => this._onWalletDisconnect(),
      onBidPlaced:  info  => this._onBidPlaced(info),
      onError:      msg   => this._setBidStatus(msg, 'error'),
    });

    document.getElementById('btn-connect').addEventListener('click', () => {
      this.wallet.connect();
    });

    // Bid form
    document.getElementById('btn-bid').addEventListener('click', () => {
      this._submitBid();
    });

    document.getElementById('bid-input').addEventListener('input', () => {
      const val = parseFloat(document.getElementById('bid-input').value);
      document.getElementById('btn-bid').disabled = !(val > 0 && this.wallet.isConnected);
    });

    // Settle button
    document.getElementById('btn-settle').addEventListener('click', () => {
      this._submitSettle();
    });

    // Build gallery
    this._buildGallery();

    // Populate static docs
    this._buildAgentDocs();
    this._buildAbout();

    // Show gallery by default
    this._showSection('gallery');
  }

  // ── Navigation ───────────────────────────────────────────────
  _showSection(name) {
    Object.entries(this.sections).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== name);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === name);
    });

    // Destroy viewer when leaving detail
    if (name !== 'detail' && this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
      this.wallet.stopCountdown();
    }

    window.scrollTo(0, 0);
  }

  // ── Gallery ──────────────────────────────────────────────────
  _buildGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    PIECES.forEach(piece => {
      const card = document.createElement('div');
      card.className = 'piece-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${piece.title}`);

      // Thumbnail
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'piece-thumb-wrap';

      if (piece.thumbnailCid && !piece.thumbnailCid.startsWith('IPFS_PLACEHOLDER')) {
        const img = document.createElement('img');
        img.className = 'piece-thumb';
        img.src = `${IPFS_GATEWAY}${piece.thumbnailCid}`;
        img.alt = piece.title;
        img.loading = 'lazy';
        thumbWrap.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'piece-thumb-placeholder';
        placeholder.innerHTML = '⬡';
        // Tint the placeholder background with the first palette colour
        if (piece.palette?.[0]) {
          thumbWrap.style.background = piece.palette[0] + '18';
        }
        thumbWrap.appendChild(placeholder);
      }

      // Hover overlay
      const overlay = document.createElement('div');
      overlay.className = 'piece-thumb-overlay';
      overlay.innerHTML = '<span class="piece-thumb-overlay-label">VIEW ⬡</span>';
      thumbWrap.appendChild(overlay);
      card.appendChild(thumbWrap);

      // Info
      const info = document.createElement('div');
      info.className = 'piece-info';
      info.innerHTML = `
        <div class="piece-title">${piece.title}</div>
        <div class="piece-palette">${piece.palette.map(c =>
          `<div class="palette-chip" style="background:${c}" title="${c}"></div>`
        ).join('')}</div>
        <div class="piece-auction-row">
          <span class="piece-auction-status" id="card-status-${piece.id}">
            <span class="auction-live-dot"></span>
            RESERVE 0.005 ETH
          </span>
          <span class="piece-bid" id="card-bid-${piece.id}">—</span>
        </div>
      `;
      card.appendChild(info);

      card.addEventListener('click', () => this._openPiece(piece));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._openPiece(piece);
        }
      });

      grid.appendChild(card);
    });

    // Kick off read-only auction fetches for gallery cards
    PIECES.forEach(piece => this._fetchCardAuction(piece));
  }

  async _fetchCardAuction(piece) {
    const auc = await this.wallet.getAuction(piece.tokenId);
    const bidEl    = document.getElementById(`card-bid-${piece.id}`);
    const statusEl = document.getElementById(`card-status-${piece.id}`);
    if (!bidEl) return;

    if (auc?.hasBid && parseFloat(auc.amount) > 0) {
      bidEl.textContent = `${parseFloat(auc.amount).toFixed(3)} ETH`;
      if (statusEl) {
        if (auc.expired) {
          statusEl.innerHTML = '<span class="auction-live-dot expired"></span> ENDED — SETTLE';
        } else {
          statusEl.innerHTML = '<span class="auction-live-dot live"></span> AUCTION LIVE';
        }
      }
    } else if (auc && !auc.pending) {
      bidEl.textContent = 'NO BIDS';
      if (statusEl) {
        statusEl.innerHTML = `<span class="auction-live-dot awaiting"></span> RESERVE ${parseFloat(auc.reservePrice || '0.005').toFixed(3)} ETH`;
      }
    }
  }

  // ── Open Piece Detail ────────────────────────────────────────
  _openPiece(piece) {
    this.current = piece;
    this._showSection('detail');

    // Set title
    document.getElementById('detail-title').textContent = piece.title;

    // Palette strip
    const strip = document.getElementById('palette-strip');
    strip.innerHTML = piece.palette.map(c =>
      `<div class="palette-strip-chip" style="background:${c}"></div>`
    ).join('');

    // Piece metadata
    this._renderPieceMeta(piece);

    // IPFS links
    const animLink = document.getElementById('link-animation');
    const imgLink = document.getElementById('link-image');
    if (piece.onChain?.ipfsAnimationCid) {
      animLink.href = `${IPFS_GATEWAY}${piece.onChain.ipfsAnimationCid}`;
      animLink.style.display = '';
    } else {
      animLink.style.display = 'none';
    }
    if (piece.thumbnailCid) {
      imgLink.href = `${IPFS_GATEWAY}${piece.thumbnailCid}`;
    }

    // Boot viewer
    const container = document.getElementById('viewer-container');
    container.innerHTML = '';
    document.getElementById('viewer-loading').classList.remove('hidden');
    document.getElementById('viewer-error').classList.add('hidden');

    this.viewer = new Viewer(container, {
      onLoadStart: () => {
        document.getElementById('viewer-loading').classList.remove('hidden');
      },
      onLoadEnd: (usedFallback) => {
        document.getElementById('viewer-loading').classList.add('hidden');
        if (usedFallback) {
          document.getElementById('viewer-error').classList.remove('hidden');
          setTimeout(() => {
            document.getElementById('viewer-error').classList.add('hidden');
          }, 4000);
        }
      },
      onLoadError: () => {
        document.getElementById('viewer-loading').classList.add('hidden');
      },
    });

    this.viewer.loadPiece(piece);

    // Auction state
    this._loadAuction(piece);
  }

  // ── Auction ──────────────────────────────────────────────────
  async _loadAuction(piece) {
    const auc = await this.wallet.getAuction(piece.tokenId);
    this._renderAuction(auc);

    if (auc?.live && auc.endTime > 0) {
      this.wallet.startCountdown(auc.endTime, remaining => {
        document.getElementById('stat-time').textContent =
          WalletManager.formatTime(remaining);
      });
    }

    // Bid history
    const history = await this.wallet.getBidHistory(piece.tokenId);
    this._renderBidHistory(history);
  }

  _renderAuction(auc) {
    const bidEl      = document.getElementById('stat-bid');
    const reserveEl  = document.getElementById('stat-reserve');
    const timeEl     = document.getElementById('stat-time');
    const durationEl = document.getElementById('stat-duration');
    const bannerEl   = document.getElementById('auction-status-banner');
    const minInfoEl  = document.getElementById('bid-min-info');
    const settleWrap = document.getElementById('settle-block');
    const bidBlock   = document.getElementById('bid-block');

    // Hide settle by default, show bid form by default
    settleWrap.classList.add('hidden');
    bidBlock.classList.remove('hidden');

    if (!auc) {
      bidEl.textContent      = '—';
      reserveEl.textContent  = '—';
      timeEl.textContent     = '—';
      durationEl.textContent = '—';
      bannerEl.textContent   = '';
      minInfoEl.textContent  = '';
      return;
    }

    if (auc.pending) {
      bidEl.textContent      = '—';
      reserveEl.textContent  = '—';
      timeEl.textContent     = '—';
      durationEl.textContent = '—';
      bannerEl.textContent   = 'AUCTION NOT YET CONFIGURED';
      bannerEl.className     = 'auction-status-banner status-pending';
      minInfoEl.textContent  = '';
      return;
    }

    const reserve = parseFloat(auc.reservePrice);
    const bidAmt  = parseFloat(auc.amount);
    const hasBid  = auc.hasBid || bidAmt > 0;

    // Reserve price
    reserveEl.textContent = `${reserve.toFixed(4)} ETH`;

    // Duration
    durationEl.textContent = '24 HOURS';

    // Current bid (with bidder name)
    if (hasBid) {
      bidEl.textContent = `${bidAmt.toFixed(4)} ETH`;
      // Async resolve bidder name
      if (auc.bidder) {
        this.wallet.displayName(auc.bidder).then(name => {
          const bidderEl = document.getElementById('stat-bidder');
          if (bidderEl) bidderEl.textContent = name;
        });
      }
    } else {
      bidEl.textContent = 'NO BIDS YET';
    }

    // Status banner + time
    if (auc.settled) {
      bannerEl.textContent = 'AUCTION SETTLED';
      bannerEl.className   = 'auction-status-banner status-settled';
      timeEl.textContent   = 'ENDED';
      minInfoEl.textContent = '';
      bidBlock.classList.add('hidden');
    } else if (auc.expired) {
      // Auction ended but not yet settled — show settle button
      bannerEl.textContent = '⬡ AUCTION ENDED — READY TO SETTLE';
      bannerEl.className   = 'auction-status-banner status-expired';
      timeEl.textContent   = 'ENDED';
      minInfoEl.textContent = '';
      bidBlock.classList.add('hidden');
      settleWrap.classList.remove('hidden');
    } else if (hasBid && auc.endTime > 0) {
      bannerEl.textContent = '⬡ AUCTION LIVE';
      bannerEl.className   = 'auction-status-banner status-live';
      // Countdown handled by startCountdown
      // Min bid info
      const minNext = (bidAmt * 1.05).toFixed(4);
      const minFee = (bidAmt * 1.05 * 0.03).toFixed(4);
      minInfoEl.textContent = `Minimum bid: ${minNext} ETH (5% above current). A 3% marketplace fee (${minFee} ETH) is added automatically.`;
    } else {
      bannerEl.textContent = 'AWAITING FIRST BID';
      bannerEl.className   = 'auction-status-banner status-awaiting';
      timeEl.textContent   = 'STARTS ON FIRST BID';
      // Min bid info
      const reserveFee = (reserve * 0.03).toFixed(4);
      minInfoEl.textContent = `Minimum first bid: ${reserve.toFixed(4)} ETH (reserve price). A 3% marketplace fee (${reserveFee} ETH) is added automatically. 24h countdown begins when first bid is placed.`;
    }
  }

  _renderBidHistory(bids) {
    const el = document.getElementById('bid-history');
    if (!bids || bids.length === 0) {
      el.innerHTML = '<div class="bid-empty">No bids yet</div>';
      return;
    }
    el.innerHTML = bids.map(b => {
      const timeStr = b.timestamp
        ? new Date(b.timestamp * 1000).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })
        : '';
      const txUrl = `https://basescan.org/tx/${b.txHash}`;
      return `
        <div class="bid-entry">
          <div class="bid-entry-top">
            <a class="bid-entry-name" href="https://basescan.org/address/${b.bidder}" target="_blank" rel="noopener" title="${b.bidder}">${b.displayName}</a>
            <span class="bid-entry-amount">${parseFloat(b.amount).toFixed(4)} ETH</span>
          </div>
          <div class="bid-entry-bottom">
            <span class="bid-entry-time">${timeStr}</span>
            <a class="bid-entry-tx" href="${txUrl}" target="_blank" rel="noopener" title="View on BaseScan">tx ↗</a>
          </div>
        </div>
      `;
    }).join('');
  }

  _renderPieceMeta(piece) {
    const el = document.getElementById('piece-meta');
    const rows = [
      ['TOKEN ID',    piece.tokenId],
      ['COLLECTION',  'SYNTHESIS'],
      ['CHAIN',       'Base (8453)'],
      ['CREATOR',     'HEXEBOTZERO'],
      ['PALETTE',     piece.attributes?.find(a => a.trait_type === 'Palette A')?.value || piece.attributes?.find(a => a.trait_type === 'Palette')?.value || '—'],
      ['SCROLL A',    piece.scrollSpeedA],
      ['SCROLL B',    piece.scrollSpeedB],
      ['BANDS',       '12'],
      ['CONTRACT',    NFT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
                        ? 'TBD'
                        : NFT_CONTRACT_ADDRESS.slice(0,10) + '…'],
    ];
    el.innerHTML = rows.map(([k, v]) => `
      <div class="meta-row">
        <span class="meta-key">${k}</span>
        <span class="meta-val">${v}</span>
      </div>
    `).join('');
  }

  // ── Bid submission ───────────────────────────────────────────
  async _submitBid() {
    if (!this.current) return;
    const input = document.getElementById('bid-input');
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0) {
      this._setBidStatus('Enter a valid amount.', 'error');
      return;
    }

    document.getElementById('btn-bid').disabled = true;
    this._setBidStatus('Awaiting wallet confirmation…');

    const receipt = await this.wallet.placeBid(this.current.tokenId, amount);
    if (receipt) {
      input.value = '';
      this._setBidStatus(`Bid confirmed ✓  tx: ${receipt.hash.slice(0, 14)}…`, 'success');
    }

    document.getElementById('btn-bid').disabled = false;
  }

  // ── Settle auction ────────────────────────────────────────
  async _submitSettle() {
    if (!this.current) return;
    const btn = document.getElementById('btn-settle');
    const statusEl = document.getElementById('settle-status');

    btn.disabled = true;
    statusEl.textContent = 'Awaiting wallet confirmation…';
    statusEl.className = 'bid-status';

    const receipt = await this.wallet.settleAuction(this.current.tokenId);
    if (receipt) {
      statusEl.textContent = `Settled ✓  tx: ${receipt.hash.slice(0, 14)}…`;
      statusEl.className = 'bid-status success';
      // Reload auction state to reflect settlement
      setTimeout(() => this._loadAuction(this.current), 2000);
    } else {
      statusEl.className = 'bid-status error';
    }

    btn.disabled = false;
  }

  _onBidPlaced(info) {
    this._setBidStatus(`Bid of ${info.amount} ETH placed ✓`, 'success');
    this._loadAuction(this.current);
  }

  _setBidStatus(msg, type = '') {
    const el = document.getElementById('bid-status');
    el.textContent = msg;
    el.className = 'bid-status' + (type ? ` ${type}` : '');
  }

  // ── Wallet callbacks ─────────────────────────────────────────
  _onWalletConnect(address) {
    document.getElementById('btn-connect').classList.add('hidden');
    document.getElementById('wallet-connected').classList.remove('hidden');
    document.getElementById('wallet-addr').textContent =
      this.wallet.shortAddress(address);

    // Unlock bid button if amount is filled
    const val = parseFloat(document.getElementById('bid-input').value);
    document.getElementById('btn-bid').disabled = !(val > 0);
  }

  _onWalletDisconnect() {
    document.getElementById('btn-connect').classList.remove('hidden');
    document.getElementById('wallet-connected').classList.add('hidden');
    document.getElementById('btn-bid').disabled = true;
  }

  // ── Agent Documentation ──────────────────────────────────────
  _buildAgentDocs() {
    // CLI commands
    const cliEl = document.getElementById('cli-commands');
    if (cliEl) {
      const piece = PIECES[0];
      const cmds = Object.entries(RARE_CLI)
        .map(([action, tmpl]) => {
          const cmd = tmpl
            .replace('{tokenId}',    piece.tokenId)
            .replace('{nftContract}', NFT_CONTRACT_ADDRESS)
            .replace('{eth}',        '0.1');
          return `# ${action.toUpperCase()}\n${cmd}`;
        })
        .join('\n\n');
      cliEl.textContent = cmds;
    }

    // ABI display
    const abiEl = document.getElementById('abi-display');
    if (abiEl) {
      const abiObj = {
        contractAddress: AUCTION_CONTRACT_ADDRESS,
        functions: AUCTION_ABI
          .filter(item => item.startsWith('function'))
          .map(f => f),
        events: AUCTION_ABI
          .filter(item => item.startsWith('event'))
          .map(e => e),
      };
      abiEl.textContent = JSON.stringify(abiObj, null, 2);
    }

    // Metadata schema
    const schemaEl = document.getElementById('schema-display');
    if (schemaEl) {
      schemaEl.textContent = JSON.stringify(METADATA_SCHEMA, null, 2);
    }

    // Ethers.js example
    const exEl = document.getElementById('ethers-example');
    if (exEl) {
      exEl.textContent = `import { JsonRpcProvider, Contract } from 'ethers';

const provider = new JsonRpcProvider('${RPC_URL}');

const auction = new Contract(
  '${AUCTION_CONTRACT_ADDRESS}',
  ['function getAuction(address,uint256) view returns (tuple(...))'],
  provider
);

// Read auction state for token 1
const state = await auction.getAuction(
  '${NFT_CONTRACT_ADDRESS}',
  1n
);

console.log({
  bidder:       state.bidder,
  amount:       formatEther(state.amount),
  endTime:      new Date(Number(state.endTime) * 1000),
  settled:      state.settled,
});`;
    }

    // Evaluation signals
    const sigEl = document.getElementById('signal-list');
    if (sigEl) {
      sigEl.innerHTML = EVALUATION_SIGNALS.map(s =>
        `<li>${s}</li>`
      ).join('');
    }
  }

  // ── About ────────────────────────────────────────────────────
  _buildAbout() {
    const srEl = document.getElementById('link-superrare');
    if (srEl && LINKS.superrare) {
      srEl.href = LINKS.superrare;
    }
    const hkEl = document.getElementById('link-hackathon');
    if (hkEl && LINKS.hackathon) {
      hkEl.href = LINKS.hackathon;
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new App();
});
