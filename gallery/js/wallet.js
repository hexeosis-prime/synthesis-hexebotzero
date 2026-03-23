// ═══════════════════════════════════════════════════════════════
// HEXEBOTZERO × hexeosis — SYNTHESIS Gallery
// wallet.js — Wallet connection + Rare Protocol auction via ethers v6
// ═══════════════════════════════════════════════════════════════

import {
  BrowserProvider,
  Contract,
  formatEther,
  parseEther,
  JsonRpcProvider,
} from 'ethers';

import {
  CHAIN_ID,
  RPC_URL,
  NFT_CONTRACT_ADDRESS,
  AUCTION_CONTRACT_ADDRESS,
  NFT_ABI,
  AUCTION_ABI,
  ETH_ADDRESS,
} from './config.js';

// ─────────────────────────────────────────────────────────────────
export class WalletManager {
  constructor({ onConnect, onDisconnect, onBidPlaced, onError } = {}) {
    this.onConnect    = onConnect    || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
    this.onBidPlaced  = onBidPlaced  || (() => {});
    this.onError      = onError      || (() => {});

    this.provider     = null;  // BrowserProvider (wallet)
    this.signer       = null;
    this.address      = null;
    this.readProvider = null;  // JsonRpcProvider (read-only)
    this.nftContract  = null;
    this.auctionContract = null;

    // Timer for auction countdown
    this._countdownInterval = null;

    // Read-only provider for view calls without wallet
    this._initReadProvider();
  }

  // ── Read-only provider ───────────────────────────────────────
  _initReadProvider() {
    try {
      this.readProvider = new JsonRpcProvider(RPC_URL);
      this.nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        this.readProvider,
      );
      this.auctionContract = new Contract(
        AUCTION_CONTRACT_ADDRESS,
        AUCTION_ABI,
        this.readProvider,
      );
    } catch (err) {
      console.warn('[wallet] read provider init failed:', err.message);
    }
  }

  // ── Connect MetaMask ─────────────────────────────────────────
  async connect() {
    if (!window.ethereum) {
      this.onError('No wallet detected. Install MetaMask or a Base-compatible wallet.');
      return false;
    }

    try {
      // Request account access first — must happen before any RPC calls
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.provider = new BrowserProvider(window.ethereum);

      // Check/switch network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId:          `0x${CHAIN_ID.toString(16)}`,
                chainName:        'Base',
                nativeCurrency:   { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls:          [RPC_URL],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          } else {
            throw switchErr;
          }
        }
      }

      this.signer  = await this.provider.getSigner();
      this.address = await this.signer.getAddress();

      // Upgrade contracts to use signer
      this.auctionContract = new Contract(
        AUCTION_CONTRACT_ADDRESS,
        AUCTION_ABI,
        this.signer,
      );

      // Listen for account changes
      window.ethereum.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          this._handleDisconnect();
        } else {
          this.address = accounts[0];
          this.onConnect(this.address);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      this.onConnect(this.address);
      return true;

    } catch (err) {
      console.error('[wallet] connect failed:', err);
      this.onError(err.message || 'Wallet connection failed.');
      return false;
    }
  }

  _handleDisconnect() {
    this.provider = null;
    this.signer   = null;
    this.address  = null;
    this.onDisconnect();
  }

  get isConnected() {
    return !!this.address;
  }

  // ── Format address for display ───────────────────────────────
  shortAddress(addr) {
    if (!addr) return '';
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  // ── Read auction state ────────────────────────────────────────
  async getAuction(tokenId) {
    if (!this.auctionContract) return null;

    // If contract address is placeholder, return mock state
    if (
      AUCTION_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' ||
      NFT_CONTRACT_ADDRESS     === '0x0000000000000000000000000000000000000000'
    ) {
      return this._mockAuctionState(tokenId);
    }

    try {
      // Read auction config
      const auction = await this.auctionContract.tokenAuctions(
        NFT_CONTRACT_ADDRESS,
        tokenId,
      );
      // Read current bid
      const bidData = await this.auctionContract.auctionBids(
        NFT_CONTRACT_ADDRESS,
        tokenId,
      );

      const hasAuction = auction.auctionCreator !== '0x0000000000000000000000000000000000000000';
      const hasBid = bidData.bidder !== '0x0000000000000000000000000000000000000000';
      const lengthOfAuction = Number(auction.lengthOfAuction); // in seconds
      const startTime = Number(auction.startTime); // unix timestamp (NOT a block number)

      // Compute end time if auction has bids
      let endTime = 0;
      let live = false;
      if (hasBid && startTime > 0 && lengthOfAuction > 0) {
        endTime = startTime + lengthOfAuction;
        live = endTime > Math.floor(Date.now() / 1000);
      }

      return {
        seller:       auction.auctionCreator,
        bidder:       hasBid ? bidData.bidder : null,
        amount:       formatEther(bidData.amount),
        amountRaw:    bidData.amount,
        startTime:    0,
        endTime:      endTime,
        reservePrice: formatEther(auction.minimumBid),
        settled:      false,
        live:         hasAuction && (hasBid ? live : true),
        hasBid:       hasBid,
        pending:      !hasAuction,
      };
    } catch (err) {
      console.warn('[wallet] getAuction failed:', err.message);
      return this._mockAuctionState(tokenId);
    }
  }

  _mockAuctionState(tokenId) {
    // Returns a placeholder state when contract is not yet deployed
    return {
      seller:       '0x0000000000000000000000000000000000000000',
      bidder:       null,
      amount:       '0.0',
      amountRaw:    0n,
      startTime:    0,
      endTime:      0,
      reservePrice: '0.1',
      settled:      false,
      live:         false,
      pending:      true, // flag: contract not deployed yet
    };
  }

  // ── Get bid history from events ───────────────────────────────
  async getBidHistory(tokenId, limit = 20) {
    if (
      !this.auctionContract ||
      AUCTION_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
    ) {
      return [];
    }

    try {
      const filter = this.auctionContract.filters.AuctionBid(
        NFT_CONTRACT_ADDRESS,
        null,
        tokenId,
      );
      const events = await this.auctionContract.queryFilter(filter, -50000);
      return events.slice(-limit).reverse().map(e => ({
        bidder: e.args._bidder,
        amount: formatEther(e.args._amount),
        blockNumber: e.blockNumber,
        txHash: e.transactionHash,
      }));
    } catch (err) {
      console.warn('[wallet] getBidHistory failed:', err.message);
      return [];
    }
  }

  // ── Place bid ─────────────────────────────────────────────────
  async placeBid(tokenId, ethAmount) {
    if (!this.isConnected) {
      this.onError('Connect wallet first.');
      return null;
    }
    if (AUCTION_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      this.onError('Contract not deployed yet. Check back soon.');
      return null;
    }

    try {
      const bidAmount = parseEther(String(ethAmount));
      // Rare Protocol charges 3% marketplace fee on top of bid
      const fee = bidAmount * 3n / 100n;
      const totalValue = bidAmount + fee;
      const tx = await this.auctionContract.bid(
        NFT_CONTRACT_ADDRESS,
        tokenId,
        ETH_ADDRESS,
        bidAmount,
        { value: totalValue },
      );
      const receipt = await tx.wait();
      this.onBidPlaced({ txHash: receipt.hash, amount: ethAmount, tokenId });
      return receipt;
    } catch (err) {
      console.error('[wallet] placeBid failed:', err);
      const msg = err.reason || err.shortMessage || err.message || 'Bid failed.';
      this.onError(msg);
      return null;
    }
  }

  // ── Countdown timer helpers ───────────────────────────────────
  startCountdown(endTime, onTick) {
    clearInterval(this._countdownInterval);
    const tick = () => {
      const remaining = Math.max(0, endTime - Math.floor(Date.now() / 1000));
      onTick(remaining);
    };
    tick();
    this._countdownInterval = setInterval(tick, 1000);
  }

  stopCountdown() {
    clearInterval(this._countdownInterval);
    this._countdownInterval = null;
  }

  // ── Format seconds → HH:MM:SS ────────────────────────────────
  static formatTime(seconds) {
    if (!seconds || seconds <= 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2,'0')}s`;
    return `${s}s`;
  }

  dispose() {
    this.stopCountdown();
  }
}
