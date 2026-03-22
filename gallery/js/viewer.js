// ═══════════════════════════════════════════════════════════════
// HEXEBOTZERO × hexeosis — SYNTHESIS Gallery
// viewer.js — Three.js scene: stripe shader, OrbitControls, vignette
// ═══════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';

// ── Stripe Shader ────────────────────────────────────────────────
const STRIPE_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Exact shader from the SYNTHESIS pipeline (spec)
const STRIPE_FRAG = /* glsl */`
uniform vec3  uStripes[12];
uniform float uTime;
uniform float uScrollSpeed;
varying vec2  vUv;

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
`;

// ── Vignette Shader ──────────────────────────────────────────────
const VIGNETTE_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const VIGNETTE_FRAG = /* glsl */`
uniform sampler2D tDiffuse;
uniform float     uIntensity;
varying vec2      vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  vec2 uv    = (vUv - 0.5) * 2.0;
  float dist = dot(uv * uIntensity, uv * uIntensity);
  float vig  = 1.0 - clamp(dist, 0.0, 1.0);
  vig = pow(vig, 0.6);
  gl_FragColor = vec4(color.rgb * vig, 1.0);
}
`;

// ─────────────────────────────────────────────────────────────────
export class Viewer {
  constructor(container, { onLoadStart, onLoadEnd, onLoadError } = {}) {
    this.container    = container;
    this.onLoadStart  = onLoadStart  || (() => {});
    this.onLoadEnd    = onLoadEnd    || (() => {});
    this.onLoadError  = onLoadError  || (() => {});

    this.renderer      = null;
    this.scene         = null;
    this.camera        = null;
    this.controls      = null;
    this.clock         = new THREE.Clock();
    this.animationId   = null;
    this.activeMats    = [];
    this.sceneGroup    = null;

    // Vignette post-process
    this.renderTarget  = null;
    this.vigScene      = null;
    this.vigCamera     = null;
    this.vigMesh       = null;

    this._init();
  }

  // ── Initialise renderer, scene, camera, controls, vignette ──
  _init() {
    const w = this.container.clientWidth  || 800;
    const h = this.container.clientHeight || 600;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    // Main scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
    this.camera.position.set(0, 1.8, 7);
    this.camera.lookAt(0, 0, 0);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping  = true;
    this.controls.dampingFactor  = 0.06;
    this.controls.minDistance    = 2;
    this.controls.maxDistance    = 20;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Render target for vignette pass
    this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    // Fullscreen vignette quad
    this.vigScene  = new THREE.Scene();
    this.vigCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const vigMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse:   { value: this.renderTarget.texture },
        uIntensity: { value: 0.55 },
      },
      vertexShader:   VIGNETTE_VERT,
      fragmentShader: VIGNETTE_FRAG,
      depthWrite: false,
    });

    this.vigMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vigMat);
    this.vigScene.add(this.vigMesh);

    // Resize
    this._resizeObs = new ResizeObserver(() => this._onResize());
    this._resizeObs.observe(this.container);

    // Start loop
    this._animate();
  }

  // ── Resize handler ───────────────────────────────────────────
  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;

    this.renderer.setSize(w, h);
    this.renderTarget.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ── Parse hex string → THREE.Vector3 (0-1 RGB) ──────────────
  _hexToVec3(hex) {
    const c = hex.replace('#', '');
    return new THREE.Vector3(
      parseInt(c.slice(0, 2), 16) / 255,
      parseInt(c.slice(2, 4), 16) / 255,
      parseInt(c.slice(4, 6), 16) / 255,
    );
  }

  // ── Create stripe ShaderMaterial ─────────────────────────────
  _createStripeMat(palette, scrollSpeed) {
    const stripes = palette.slice(0, 12).map(c => this._hexToVec3(c));
    // Pad to 12 if needed
    while (stripes.length < 12) stripes.push(new THREE.Vector3(1, 1, 1));

    return new THREE.ShaderMaterial({
      uniforms: {
        uStripes:     { value: stripes },
        uTime:        { value: 0 },
        uScrollSpeed: { value: scrollSpeed },
      },
      vertexShader:   STRIPE_VERT,
      fragmentShader: STRIPE_FRAG,
      side: THREE.DoubleSide,
    });
  }

  // ── Apply material to all meshes in a group ──────────────────
  _applyMat(obj, mat) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = mat;
        child.castShadow    = false;
        child.receiveShadow = false;
      }
    });
  }

  // ── Fallback geometry (hex prism) when GLB fails to load ─────
  _makeFallbackHex(isB) {
    const group = new THREE.Group();

    // Outer hex prism
    const geo = new THREE.CylinderGeometry(1.2, 1.2, 3.0, 6, 32);
    const mesh = new THREE.Mesh(geo);
    group.add(mesh);

    if (isB) {
      // B layer: slightly smaller, rotated 30°
      group.rotation.y = Math.PI / 6;
      group.scale.setScalar(0.82);
      group.position.set(0.15, -0.1, 0);
    }

    return group;
  }

  // ── Clear scene group ────────────────────────────────────────
  _clearScene() {
    if (this.sceneGroup) {
      this.scene.remove(this.sceneGroup);
      this.sceneGroup.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.sceneGroup = null;
    }
    this.activeMats = [];
  }

  // ── Load a GLB; resolve with its scene or null on failure ────
  _loadGLB(url) {
    return new Promise(resolve => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        gltf => resolve(gltf.scene),
        undefined,
        err  => { console.warn('[viewer] GLB load failed:', url, err); resolve(null); }
      );
    });
  }

  // ── Load piece config + build scene ─────────────────────────
  async loadPiece(piece) {
    this.onLoadStart();
    this._clearScene();

    const group = new THREE.Group();
    this.sceneGroup = group;
    this.scene.add(group);

    // Build stripe materials
    const matA = this._createStripeMat(piece.palette, piece.scrollSpeedA ?? 0.2);
    const matB = this._createStripeMat(piece.palette, piece.scrollSpeedB ?? -0.15);
    this.activeMats.push(matA, matB);

    let usedFallback = false;

    if (piece.models) {
      const [objA, objB, objRoom] = await Promise.all([
        piece.models.layerA ? this._loadGLB(piece.models.layerA) : Promise.resolve(null),
        piece.models.layerB ? this._loadGLB(piece.models.layerB) : Promise.resolve(null),
        piece.models.room   ? this._loadGLB(piece.models.room)   : Promise.resolve(null),
      ]);

      if (objA) {
        this._applyMat(objA, matA);
        group.add(objA);
      }
      if (objB) {
        this._applyMat(objB, matB);
        group.add(objB);
      }
      if (objRoom) {
        const roomMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side:  THREE.BackSide,
        });
        this._applyMat(objRoom, roomMat);
        group.add(objRoom);
      }

      if (!objA && !objB) {
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // Fallback geometry when models unavailable
    if (usedFallback) {
      const fbA = this._makeFallbackHex(false);
      const fbB = this._makeFallbackHex(true);
      this._applyMat(fbA, matA);
      this._applyMat(fbB, matB);
      group.add(fbA);
      group.add(fbB);
    }

    // Set camera to composition position
    if (piece.cameraPosition) {
      const p = piece.cameraPosition;
      this.camera.position.set(p.x, p.y, p.z);
    }
    if (piece.cameraTarget) {
      const t = piece.cameraTarget;
      this.controls.target.set(t.x, t.y, t.z);
    }
    this.controls.update();

    this.onLoadEnd(usedFallback);
  }

  // ── Animation loop ───────────────────────────────────────────
  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());

    const t = this.clock.getElapsedTime();

    // Update stripe uniforms
    for (const mat of this.activeMats) {
      mat.uniforms.uTime.value = t;
    }

    this.controls.update();

    // Render scene → render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // Vignette pass → screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.vigScene, this.vigCamera);
  }

  // ── Fullscreen ───────────────────────────────────────────────
  toggleFullscreen() {
    const el = this.container.closest('#section-detail') || this.container;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  }

  // ── Dispose ──────────────────────────────────────────────────
  dispose() {
    cancelAnimationFrame(this.animationId);
    this._clearScene();
    this._resizeObs?.disconnect();
    this.renderTarget.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
