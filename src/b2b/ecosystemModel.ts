/**
 * نَمَاء | NAMA — 3D B2B Revenue Intelligence & Kinetic Funnel Scene
 * Photorealistic Three.js WebGL visualization:
 * - 5 Holographic Funnel Conversion Rings (stacked Stages 0 to 4)
 * - Central Luminous B2B Revenue Reactor Core & Vertical Energy Pillar
 * - 6 Orbiting Enterprise Sector Nodes with Realtime Photon Data Feeds
 * - 22 Descending Kinetic Deal Orbs with Closed-Won Flash
 * - Interactive Camera Presets, GSAP Transitions & Raycasting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import {
  DealParams,
  DealMetrics,
  PIPELINE_STAGES,
  ECOSYSTEM_NODES,
  playStageSound
} from './dealEngine';

export type CameraPreset = 'orbit' | 'ecosystem' | 'funnel' | 'radar' | 'core';

interface FunnelRingObject {
  stageIndex: number;
  ringMesh: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
  coneMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
  hitMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  y: number;
  radius: number;
  colorHex: string;
}

interface PhotonPacket {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  curve: THREE.QuadraticBezierCurve3;
  progress: number;
  speed: number;
}

interface DealOrb {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  progress: number;     // 0.0 (top) to 1.0 (bottom)
  angle: number;        // radians
  speed: number;
  radiusOffset: number;
  baseColor: THREE.Color;
}

interface BurstParticle {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  lifetime: number;
  age: number;
}

export class B2BEcosystemScene {
  private container: HTMLElement;
  private onStageSelect?: (stageIndex: number) => void;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  // Scene lighting & environment
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private corePointLight: THREE.PointLight;
  private gridHelper: THREE.GridHelper;
  private radarRingsGroup: THREE.Group;
  private starsParticles: THREE.Points;

  // Central Revenue Reactor Core
  private reactorGroup: THREE.Group;
  private reactorInnerMesh!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshStandardMaterial>;
  private reactorCageMesh!: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>;
  private energyPillarMesh!: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;

  // Funnel Rings
  private funnelGroup: THREE.Group;
  private funnelRings: FunnelRingObject[] = [];
  private interactiveMeshes: THREE.Object3D[] = [];

  // Orbiting Sector Nodes & Data Beams
  private sectorsGroup: THREE.Group;
  private photonPackets: PhotonPacket[] = [];

  // Descending Deal Orbs
  private dealOrbsGroup: THREE.Group;
  private dealOrbs: DealOrb[] = [];

  // Closed-won celebratory shockwave
  private shockwaveMesh!: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private burstParticles: BurstParticle[] = [];

  // State & Metrics
  private activeStageIndex = 0;
  private isLightMode = false;
  private reactorSpinSpeed = 1.0;
  private orbVelocityMultiplier = 1.0;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isPointerDown = false;
  private pointerDownPos = new THREE.Vector2();

  constructor(container: HTMLElement, onStageSelect?: (stageIndex: number) => void) {
    this.container = container;
    this.onStageSelect = onStageSelect;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b16);
    this.scene.fog = new THREE.FogExp2(0x060b16, 0.022);

    // 2. Camera setup
    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 100);
    this.camera.position.set(12, 8.5, 13.5);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 32;
    this.controls.minDistance = 3.5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.08; // Allow slight under-horizon look
    this.controls.target.set(0, 0.5, 0);

    // 5. Lighting
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.dirLight.position.set(12, 22, 10);
    this.scene.add(this.dirLight);

    this.corePointLight = new THREE.PointLight(0x10b981, 2.8, 22);
    this.corePointLight.position.set(0, 0.6, 0);
    this.scene.add(this.corePointLight);

    // Secondary colored accent light
    const cyanLight = new THREE.PointLight(0x06b6d4, 1.8, 25);
    cyanLight.position.set(-10, 4, -8);
    this.scene.add(cyanLight);

    // 6. Environment Floor & Radar Rings
    this.gridHelper = new THREE.GridHelper(32, 32, 0x1e3a8a, 0x0f172a);
    this.gridHelper.position.y = -3.5;
    this.scene.add(this.gridHelper);

    this.radarRingsGroup = new THREE.Group();
    this.radarRingsGroup.position.y = -3.48;
    this.radarRingsGroup.rotation.x = -Math.PI / 2;
    [3.5, 6.0, 9.0, 12.0].forEach((r) => {
      const ringGeom = new THREE.RingGeometry(r - 0.03, r + 0.03, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      this.radarRingsGroup.add(ring);
    });
    this.scene.add(this.radarRingsGroup);

    // 7. Ambient Data Dust Particles
    const starCount = 350;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 36;
      starPos[i + 1] = Math.random() * 18 - 4;
      starPos[i + 2] = (Math.random() - 0.5) * 36;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.45
    });
    this.starsParticles = new THREE.Points(starGeom, starMat);
    this.scene.add(this.starsParticles);

    // 8. Build Scene Subsystems
    this.reactorGroup = new THREE.Group();
    this.funnelGroup = new THREE.Group();
    this.sectorsGroup = new THREE.Group();
    this.dealOrbsGroup = new THREE.Group();

    this.scene.add(this.reactorGroup);
    this.scene.add(this.funnelGroup);
    this.scene.add(this.sectorsGroup);
    this.scene.add(this.dealOrbsGroup);

    this.buildReactorCore();
    this.buildKineticFunnel();
    this.buildOrbitingSectors();
    this.buildDescendingDealOrbs();
    this.buildShockwaveMesh();

    // 9. Event Listeners
    this.setupInteractions();

    // 10. Start loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // ==========================================
  // Subsystem 1: Central Revenue Reactor Core
  // ==========================================
  private buildReactorCore(): void {
    // Inner pulsating crystal core
    const innerGeom = new THREE.IcosahedronGeometry(0.85, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: false
    });
    this.reactorInnerMesh = new THREE.Mesh(innerGeom, innerMat);
    this.reactorInnerMesh.position.y = 0.6;
    this.reactorGroup.add(this.reactorInnerMesh);

    // Outer geometric containment cage
    const cageGeom = new THREE.OctahedronGeometry(1.28, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.9
    });
    this.reactorCageMesh = new THREE.Mesh(cageGeom, cageMat);
    this.reactorCageMesh.position.y = 0.6;
    this.reactorGroup.add(this.reactorCageMesh);

    // Vertical luminous energy pillar
    const pillarGeom = new THREE.CylinderGeometry(0.08, 0.22, 7.8, 16);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.energyPillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
    this.energyPillarMesh.position.y = 0.6;
    this.reactorGroup.add(this.energyPillarMesh);
  }

  // ==========================================
  // Subsystem 2: Kinetic Funnel (5 Stages)
  // ==========================================
  private buildKineticFunnel(): void {
    const stageY = [3.2, 1.9, 0.6, -0.7, -2.0];
    const stageRadius = [4.2, 3.5, 2.8, 2.1, 1.4];

    PIPELINE_STAGES.forEach((stage, idx) => {
      const y = stageY[idx];
      const r = stageRadius[idx];
      const nextR = idx < 4 ? stageRadius[idx + 1] : r * 0.75;
      const height = idx < 4 ? stageY[idx] - stageY[idx + 1] : 1.1;

      // 1. Glowing Torus Ring
      const ringGeom = new THREE.TorusGeometry(r, 0.08, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(stage.colorHex),
        emissive: new THREE.Color(stage.colorHex),
        emissiveIntensity: idx === 0 ? 1.4 : 0.6,
        roughness: 0.25,
        metalness: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = y;
      this.funnelGroup.add(ringMesh);

      // 2. Translucent Holographic Cone Frustum Segment
      const coneGeom = new THREE.CylinderGeometry(r, nextR, height, 32, 1, true);
      const coneMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(stage.colorHex),
        emissive: new THREE.Color(stage.colorHex),
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.14,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      const coneMesh = new THREE.Mesh(coneGeom, coneMat);
      coneMesh.position.y = y - height / 2;
      this.funnelGroup.add(coneMesh);

      // 3. Invisible Thick Hit Cylinder for Easy Clicking
      const hitGeom = new THREE.CylinderGeometry(r + 0.35, nextR + 0.35, height, 16, 1, false);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeom, hitMat);
      hitMesh.position.y = y - height / 2;
      hitMesh.userData = { stageIndex: idx };
      this.funnelGroup.add(hitMesh);
      this.interactiveMeshes.push(hitMesh);

      this.funnelRings.push({
        stageIndex: idx,
        ringMesh,
        coneMesh,
        hitMesh,
        y,
        radius: r,
        colorHex: stage.colorHex
      });
    });
  }

  // ==========================================
  // Subsystem 3: Orbiting Enterprise Sectors
  // ==========================================
  private buildOrbitingSectors(): void {
    const topFunnelY = 3.2;

    ECOSYSTEM_NODES.forEach((node, nodeIdx) => {
      const nodeGroup = new THREE.Group();
      const x = Math.cos(node.angle) * node.dist;
      const z = Math.sin(node.angle) * node.dist;
      const y = node.y;

      nodeGroup.position.set(x, y, z);

      // Node mesh: faceted dual crystal
      const nodeGeom = new THREE.OctahedronGeometry(0.38, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.colorHex),
        emissive: new THREE.Color(node.colorHex),
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.9
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeGroup.add(nodeMesh);

      // Orbital halo ring around node
      const haloGeom = new THREE.TorusGeometry(0.55, 0.025, 8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.colorHex),
        transparent: true,
        opacity: 0.45
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.rotation.x = Math.PI / 2.3;
      nodeGroup.add(haloMesh);

      this.sectorsGroup.add(nodeGroup);

      // Bezier curve feeder into top of funnel
      const startPoint = new THREE.Vector3(x, y, z);
      // Entry point into top funnel ring (r = 4.2)
      const entryAngle = node.angle;
      const endPoint = new THREE.Vector3(
        Math.cos(entryAngle) * 4.2,
        topFunnelY,
        Math.sin(entryAngle) * 4.2
      );
      // Control point curved outwards and upwards
      const midPoint = new THREE.Vector3(
        (startPoint.x + endPoint.x) * 0.55,
        Math.max(startPoint.y, endPoint.y) + 0.8,
        (startPoint.z + endPoint.z) * 0.55
      );

      const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);
      const points = curve.getPoints(36);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(node.colorHex),
        transparent: true,
        opacity: 0.35
      });
      const feederLine = new THREE.Line(lineGeom, lineMat);
      this.sectorsGroup.add(feederLine);

      // 3 Traveling Photon Data Packets per feeder curve
      for (let p = 0; p < 3; p++) {
        const photonGeom = new THREE.SphereGeometry(0.09, 12, 12);
        const photonMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.colorHex),
          blending: THREE.AdditiveBlending
        });
        const photonMesh = new THREE.Mesh(photonGeom, photonMat);
        this.sectorsGroup.add(photonMesh);

        this.photonPackets.push({
          mesh: photonMesh,
          curve,
          progress: (p / 3) + nodeIdx * 0.12,
          speed: 0.0045 + Math.random() * 0.002
        });
      }
    });
  }

  // ==========================================
  // Subsystem 4: Descending Deal Orbs
  // ==========================================
  private buildDescendingDealOrbs(): void {
    const orbCount = 22;
    const stageColors = [
      new THREE.Color(PIPELINE_STAGES[0].colorHex),
      new THREE.Color(PIPELINE_STAGES[1].colorHex),
      new THREE.Color(PIPELINE_STAGES[2].colorHex),
      new THREE.Color(PIPELINE_STAGES[3].colorHex),
      new THREE.Color(PIPELINE_STAGES[4].colorHex)
    ];

    for (let i = 0; i < orbCount; i++) {
      const geom = new THREE.SphereGeometry(0.13, 16, 16);
      const baseColor = stageColors[i % 5];
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.8
      });
      const mesh = new THREE.Mesh(geom, mat);
      this.dealOrbsGroup.add(mesh);

      this.dealOrbs.push({
        mesh,
        progress: (i / orbCount) + Math.random() * 0.05,
        angle: (i / orbCount) * Math.PI * 8, // Spiral winding
        speed: 0.0018 + Math.random() * 0.0012,
        radiusOffset: (Math.random() - 0.5) * 0.28,
        baseColor
      });
    }
  }

  // ==========================================
  // Subsystem 5: Closed-Won Shockwave & Burst
  // ==========================================
  private buildShockwaveMesh(): void {
    const ringGeom = new THREE.RingGeometry(0.5, 0.75, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.shockwaveMesh = new THREE.Mesh(ringGeom, ringMat);
    this.shockwaveMesh.rotation.x = -Math.PI / 2;
    this.shockwaveMesh.position.y = -2.0; // Stage 4 exit
    this.scene.add(this.shockwaveMesh);
  }

  // ==========================================
  // Interaction & Raycasting
  // ==========================================
  private setupInteractions(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    dom.addEventListener('pointerup', (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      const dx = Math.abs(e.clientX - this.pointerDownPos.x);
      const dy = Math.abs(e.clientY - this.pointerDownPos.y);

      // If user dragged more than 5px, it's an orbit rotation, not a click
      if (dx > 5 || dy > 5) return;

      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const stageIndex = hit.userData.stageIndex;
        if (typeof stageIndex === 'number') {
          this.setHighlightedStage(stageIndex);
          playStageSound(stageIndex);
          if (this.onStageSelect) {
            this.onStageSelect(stageIndex);
          }
        }
      }
    });

    window.addEventListener('resize', () => this.resize());
  }

  // ==========================================
  // Public API Methods
  // ==========================================

  public updateDealParams(params: DealParams, metrics: DealMetrics): void {
    this.activeStageIndex = Math.max(0, Math.min(4, params.activeStage));

    // Dynamic reactor reactivity: spin & emission scale with Win Probability & ACV
    const winRatio = metrics.winProbability / 100;
    this.reactorSpinSpeed = 0.8 + winRatio * 2.2;
    this.orbVelocityMultiplier = 0.8 + (1 - metrics.salesCycleDays / 240) * 1.5;

    // Reactor Core Glow
    const activeColor = new THREE.Color(PIPELINE_STAGES[this.activeStageIndex].colorHex);
    this.reactorInnerMesh.material.emissive.copy(activeColor);
    this.reactorInnerMesh.material.color.copy(activeColor);
    this.corePointLight.color.copy(activeColor);
    this.corePointLight.intensity = 2.0 + winRatio * 2.0;

    // Highlight the active stage funnel ring
    this.setHighlightedStage(this.activeStageIndex);
  }

  public setHighlightedStage(stageIndex: number): void {
    this.activeStageIndex = Math.max(0, Math.min(4, stageIndex));

    this.funnelRings.forEach((item, idx) => {
      const isSelected = idx === this.activeStageIndex;
      const targetEmissive = isSelected ? 1.6 : 0.45;
      const targetOpacity = isSelected ? 0.32 : 0.12;
      const targetScale = isSelected ? 1.04 : 1.0;

      gsap.to(item.ringMesh.material, {
        emissiveIntensity: targetEmissive,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to(item.coneMesh.material, {
        opacity: targetOpacity,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to(item.ringMesh.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.4,
        ease: 'back.out(1.5)'
      });
    });
  }

  public setCameraPreset(preset: CameraPreset): void {
    const presets: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      orbit: {
        pos: new THREE.Vector3(12.0, 8.5, 13.5),
        target: new THREE.Vector3(0, 0.5, 0)
      },
      ecosystem: {
        pos: new THREE.Vector3(0.1, 16.5, 8.5),
        target: new THREE.Vector3(0, 1.2, 0)
      },
      funnel: {
        pos: new THREE.Vector3(8.5, 2.2, 8.5),
        target: new THREE.Vector3(0, 0.5, 0)
      },
      radar: {
        pos: new THREE.Vector3(0.01, 19.5, 0.1),
        target: new THREE.Vector3(0, 0, 0)
      },
      core: {
        pos: new THREE.Vector3(4.2, 1.2, 4.2),
        target: new THREE.Vector3(0, 0.6, 0)
      }
    };

    const targetConfig = presets[preset] || presets.orbit;

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    gsap.to(this.camera.position, {
      x: targetConfig.pos.x,
      y: targetConfig.pos.y,
      z: targetConfig.pos.z,
      duration: 1.3,
      ease: 'power2.inOut'
    });

    gsap.to(this.controls.target, {
      x: targetConfig.target.x,
      y: targetConfig.target.y,
      z: targetConfig.target.z,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => this.controls.update()
    });
  }

  public triggerContractClosedWave(): void {
    // 1. Expanding Golden/Emerald Shockwave Ring
    this.shockwaveMesh.scale.set(1, 1, 1);
    this.shockwaveMesh.material.opacity = 0.95;
    this.shockwaveMesh.material.color.setHex(0x10b981);

    gsap.to(this.shockwaveMesh.scale, {
      x: 18,
      y: 18,
      z: 1,
      duration: 1.6,
      ease: 'power2.out'
    });

    gsap.to(this.shockwaveMesh.material, {
      opacity: 0,
      duration: 1.6,
      ease: 'power2.out'
    });

    // 2. Reactor explosive scale pulse
    gsap.fromTo(
      this.reactorInnerMesh.scale,
      { x: 1.0, y: 1.0, z: 1.0 },
      {
        x: 1.6,
        y: 1.6,
        z: 1.6,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      }
    );

    // 3. Emit 28 golden victory burst particles
    for (let i = 0; i < 28; i++) {
      const pGeom = new THREE.SphereGeometry(0.09, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x10b981 : 0xf59e0b,
        blending: THREE.AdditiveBlending
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.position.set(0, -2.0, 0);
      this.scene.add(pMesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.12;
      const vY = 0.03 + Math.random() * 0.08;

      this.burstParticles.push({
        mesh: pMesh,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, vY, Math.sin(angle) * speed),
        lifetime: 1.4,
        age: 0
      });
    }
  }

  public setTheme(isLight: boolean): void {
    this.isLightMode = isLight;
    const bgColor = isLight ? 0xf8fafc : 0x060b16;
    const fogColor = isLight ? 0xf8fafc : 0x060b16;

    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(fogColor, 0.022);

    this.ambientLight.color.setHex(isLight ? 0xffffff : 0xdbeafe);
    this.ambientLight.intensity = isLight ? 1.0 : 0.7;

    // Update floor grid
    this.scene.remove(this.gridHelper);
    this.gridHelper = new THREE.GridHelper(
      32,
      32,
      isLight ? 0x94a3b8 : 0x1e3a8a,
      isLight ? 0xe2e8f0 : 0x0f172a
    );
    this.gridHelper.position.y = -3.5;
    this.scene.add(this.gridHelper);
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.resize());
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  // ==========================================
  // Main Render & Animation Loop
  // ==========================================
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Spin Reactor Core & Containment Cage
    if (this.reactorInnerMesh && this.reactorCageMesh) {
      this.reactorInnerMesh.rotation.y += delta * 0.9 * this.reactorSpinSpeed;
      this.reactorInnerMesh.rotation.x += delta * 0.4 * this.reactorSpinSpeed;

      this.reactorCageMesh.rotation.y -= delta * 0.6 * this.reactorSpinSpeed;
      this.reactorCageMesh.rotation.z += delta * 0.3 * this.reactorSpinSpeed;

      // Pulse reactor energy scale subtly
      const pulse = 1.0 + Math.sin(elapsedTime * 3.5) * 0.04;
      this.reactorInnerMesh.scale.set(pulse, pulse, pulse);
    }

    // 2. Animate Sector Halo rotation & Traveling Photon Packets
    this.sectorsGroup.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        child.rotation.y = elapsedTime * 0.3 + i;
      }
    });

    this.photonPackets.forEach((p) => {
      p.progress += p.speed * this.reactorSpinSpeed;
      if (p.progress >= 1.0) {
        p.progress = 0.0;
      }
      const pt = p.curve.getPointAt(p.progress);
      p.mesh.position.copy(pt);
      // Small scale oscillation along path
      const s = 0.08 + Math.sin(p.progress * Math.PI) * 0.06;
      p.mesh.scale.set(s, s, s);
    });

    // 3. Animate Descending Deal Orbs spiralling through the funnel
    const topY = 3.2;
    const bottomY = -2.0;
    const totalHeight = topY - bottomY;

    this.dealOrbs.forEach((orb) => {
      orb.progress += orb.speed * this.orbVelocityMultiplier;
      orb.angle += 0.02 * this.orbVelocityMultiplier;

      if (orb.progress >= 1.0) {
        // Exit Stage 4 at bottom: momentary flash before respawn at top
        orb.progress = 0.0;
        orb.angle = Math.random() * Math.PI * 2;
      }

      // Vertical position
      const y = topY - orb.progress * totalHeight;

      // Funnel cone radius at height y: linear interpolation from 4.2 down to 1.4
      const radiusAtY = 4.2 - orb.progress * 2.8 + orb.radiusOffset;

      const x = Math.cos(orb.angle) * radiusAtY;
      const z = Math.sin(orb.angle) * radiusAtY;

      orb.mesh.position.set(x, y, z);
    });

    // 4. Update Burst Particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.age += delta;
      if (bp.age >= bp.lifetime) {
        this.scene.remove(bp.mesh);
        bp.mesh.geometry.dispose();
        this.burstParticles.splice(i, 1);
      } else {
        bp.mesh.position.addScaledVector(bp.velocity, delta * 60);
        bp.velocity.y -= delta * 0.15; // gentle gravity
        const alpha = 1.0 - bp.age / bp.lifetime;
        bp.mesh.scale.set(alpha, alpha, alpha);
      }
    }

    // 5. Slowly rotate dust field
    if (this.starsParticles) {
      this.starsParticles.rotation.y = elapsedTime * 0.015;
    }

    // 6. Update controls & render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
