import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TrajectoryPlayer, SimData } from '../rocket/trajectory_player';
import { LivePlots } from '../rocket/live_plots';
import {
  BOOSTER,
  STAGE0,
  ENGINE_TRANSFORMS,
  ENGINE_GIMBAL_OFFSET_Z,
} from '../rocket/assembly.config';

const BASE = import.meta.env.BASE_URL;

export default function RocketDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const trajectoryPlayerRef  = useRef<TrajectoryPlayer | null>(null);
  const resetCatchRef        = useRef<(() => void) | null>(null);
  const runDemoRef           = useRef<(() => void) | null>(null);
  const catchEnabledRef         = useRef(false);
  const catchEnableTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setTowerVisibilityRef   = useRef<((v: boolean) => void) | null>(null);
  const fadeTowerOutRef         = useRef<(() => void) | null>(null);
  const livePlotsRef            = useRef<LivePlots | null>(null);
  const animateCameraToRef      = useRef<((pos: [number,number,number], target: [number,number,number], ms?: number) => void) | null>(null);
  const hasSimulatedRef         = useRef(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [simStatus, setSimStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [simError,  setSimError]  = useState('');
  const [tooltip, setTooltip] = useState<'landing' | 'hover' | null>(null);

  const runDemo = useCallback((): void => {
    const tp    = trajectoryPlayerRef.current;
    const reset = resetCatchRef.current;
    if (!tp || !reset) return;
    setSimError('');
    setSimStatus('loading');
    if (catchEnableTimerRef.current) { clearTimeout(catchEnableTimerRef.current); catchEnableTimerRef.current = null; }
    tp.disconnect();
    catchEnabledRef.current = true;
    setTowerVisibilityRef.current?.(true);
    fetch(`${BASE}landing.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<SimData>; })
      .then((data) => {
        reset(); tp.reset();
        if (!hasSimulatedRef.current) {
          hasSimulatedRef.current = true;
          const delay = 1800;
          animateCameraToRef.current?.(
            [783213.69, 98589.40, -2094.49],
            [13775.86, 251592.34, -515.61],
            delay,
          );
          setTimeout(() => { tp.playFromData(data); setSimStatus('playing'); }, delay);
        } else {
          tp.playFromData(data); setSimStatus('playing');
        }
      })
      .catch((e) => { setSimStatus('error'); setSimError(String(e)); });
  }, []);

  const runHover = useCallback((): void => {
    const tp    = trajectoryPlayerRef.current;
    const reset = resetCatchRef.current;
    if (!tp || !reset) return;
    setSimError('');
    setSimStatus('loading');
    // Clear any previous catch-enable timer and disable catch until phase 4
    if (catchEnableTimerRef.current) clearTimeout(catchEnableTimerRef.current);
    catchEnabledRef.current = false;
    setTowerVisibilityRef.current?.(true);
    reset(); tp.reset();
    // Enable catch at ~100s into playback — booster is descending toward (0,0,48)
    catchEnableTimerRef.current = setTimeout(() => { catchEnabledRef.current = true; }, 72_000);
    livePlotsRef.current?.setSlidingWindow(0);
    fetch(`${BASE}hover.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<SimData>; })
      .then((data) => { tp.playFromData(data); setSimStatus('playing'); })
      .catch((e) => { setSimStatus('error'); setSimError(String(e)); });
  }, []);

  useEffect(() => { runDemoRef.current = runDemo; }, [runDemo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────────────────
    // Everything below is verbatim from rendering/src/main.ts.
    // Only changes:
    //   • document.body.appendChild  →  container.appendChild
    //   • "/models/..."              →  `${BASE}models/...`
    //   • buildControlPanel removed  (portfolio doesn't need sliders)
    //   • keydown listener removed   (no ws reconnect in portfolio)
    //   • trajectory player connects via playFromData(demo.json) instead of WS
    // ─────────────────────────────────────────────────────────────────────────

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0e10);
    scene.fog = new THREE.FogExp2(0x0d0e10, 0.0008);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 60, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);      // ← only change from main.ts

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
controls.minDistance = 2;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI;

    function makeGrid(size: number, divisions: number, color: number, opacity: number, y = 0): THREE.GridHelper {
      const grid = new THREE.GridHelper(size, divisions, color, color);
      (grid.material as THREE.LineBasicMaterial).opacity = opacity;
      (grid.material as THREE.LineBasicMaterial).transparent = true;
      (grid.material as THREE.LineBasicMaterial).depthWrite = false;
      grid.position.y = y;
      return grid;
    }

    scene.add(new THREE.AmbientLight(0x8090a0, 0.02));

    const sun = new THREE.DirectionalLight(0xffe8c0, 6.0);
    sun.position.set(300, 220, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 100000;
    sun.shadow.camera.left = -50000;
    sun.shadow.camera.right = 50000;
    sun.shadow.camera.top = 50000;
    sun.shadow.camera.bottom = -50000;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    scene.add(sun.target);

    const rim = new THREE.DirectionalLight(0x6090c0, 0.6);
    rim.position.set(-120, 80, -100);
    scene.add(rim);

    const bounce = new THREE.HemisphereLight(0x5080b0, 0x1a1c1e, 0.5);
    scene.add(bounce);

    const loader = new GLTFLoader();

    const CATCH_CLOSE_DIST = 50;
    const CATCH_LAND_DIST  = 2;

    let boosterModel: THREE.Object3D | null = null;

    const gimbalPivots:   (THREE.Group | null)[]  = [null, null, null];
    const gimbalBaseQuat: THREE.Quaternion[]       = [new THREE.Quaternion(), new THREE.Quaternion(), new THREE.Quaternion()];
    let trajectoryPlayer: TrajectoryPlayer | null  = null;
    const livePlots = new LivePlots();
      livePlotsRef.current = livePlots;

    const thrustArrows: THREE.ArrowHelper[] = [];
    const THRUST_REF_N = 1_000_000;
    let simSetpoint: [number, number, number] | null = null;
    let catchPhase1Done = false;
    let catchPhase2Done = false;

    type ModuleAnim = { startTime: number; startVal: number; endVal: number; duration: number; onUpdate: (v: number) => void; onDone?: () => void };
    const moduleAnims: ModuleAnim[] = [];

    function tickModuleAnims() {
      const now = performance.now();
      for (let i = moduleAnims.length - 1; i >= 0; i--) {
        const a = moduleAnims[i];
        const t = Math.min(1, (now - a.startTime) / (a.duration * 1000));
        a.onUpdate(a.startVal + (a.endVal - a.startVal) * t);
        if (t >= 1) { a.onDone?.(); moduleAnims.splice(i, 1); }
      }
    }

    let leftChopstick:  THREE.Object3D | null = null;
    let rightChopstick: THREE.Object3D | null = null;
    let chopConnector:  THREE.Object3D | null = null;
    const leftChopstickBaseQ  = new THREE.Quaternion();
    const rightChopstickBaseQ = new THREE.Quaternion();
    let leftChopAngleDeg   = 0;
    let rightChopAngleDeg  = 0;

    const CHOP_AMP_PER_DEGPS = 0.12;
    const CHOP_AMP_MAX       = 6.0;
    const CHOP_GAMMA         = 0.7;
    const CHOP_OMEGA         = 5.0;
    const CHOP_ROT_SPEED_REF = 10;
    type ChopOsc = { active: boolean; startTime: number; baseAngle: number; amp: number };
    const leftOsc:  ChopOsc = { active: false, startTime: 0, baseAngle: 0, amp: CHOP_AMP_PER_DEGPS * CHOP_ROT_SPEED_REF };
    const rightOsc: ChopOsc = { active: false, startTime: 0, baseAngle: 0, amp: CHOP_AMP_PER_DEGPS * CHOP_ROT_SPEED_REF };

    const _chopQa = new THREE.Quaternion();
    const _chopQb = new THREE.Quaternion();

    function oscOffset(osc: ChopOsc, sign: number): number {
      if (!osc.active) return 0;
      const t = (performance.now() - osc.startTime) / 1000;
      const env = Math.exp(-CHOP_GAMMA * t);
      if (env < 0.005) { osc.active = false; return 0; }
      return sign * osc.amp * env * Math.sin(CHOP_OMEGA * t);
    }

    function tickChopstick(obj: THREE.Object3D | null, baseQ: THREE.Quaternion, sliderDeg: number, oscY: ChopOsc, oscX: ChopOsc, signX: number, minDeg: number, maxDeg: number) {
      if (!obj || !(oscY.active || oscX.active)) return;
      const degY = Math.min(maxDeg, Math.max(minDeg, sliderDeg + oscOffset(oscY, 1)));
      const degX = oscOffset(oscX, signX);
      _chopQa.setFromAxisAngle(CHOP_LOCAL_Y, degY * (Math.PI / 180));
      _chopQb.setFromAxisAngle(CHOP_LOCAL_X, degX * (Math.PI / 180));
      obj.quaternion.copy(baseQ).multiply(_chopQa).multiply(_chopQb);
    }

    const CHOP_LOCAL_Y = new THREE.Vector3(0, 1, 0);
    const CHOP_LOCAL_X = new THREE.Vector3(1, 0, 0);

    const leftOscX:  ChopOsc = { active: false, startTime: 0, baseAngle: 0, amp: 0.8 };
    const rightOscX: ChopOsc = { active: false, startTime: 0, baseAngle: 0, amp: 0.8 };

    const CHOP_TRANS_AMP_PER_MPS = 0.5;
    const CHOP_TRANS_AMP_MAX     = 4.0;
    const CHOP_TRANS_SPEED_REF   = 5;
    const CHOP_TRANS_OMEGA       = 3.5;
    type TransOsc = { active: boolean; startTime: number; basePos: number; amp: number };
    const connTransOsc: TransOsc = { active: false, startTime: 0, basePos: 0, amp: CHOP_TRANS_AMP_PER_MPS * CHOP_TRANS_SPEED_REF };

    function tickTransOscillation(osc: TransOsc, obj: THREE.Object3D | null) {
      if (!osc.active || !obj) return;
      const t = (performance.now() - osc.startTime) / 1000;
      const offset = -osc.amp * Math.exp(-CHOP_GAMMA * t) * Math.sin(CHOP_TRANS_OMEGA * t);
      obj.position.y = osc.basePos + offset;
      if (Math.exp(-CHOP_GAMMA * t) < 0.005) { osc.active = false; obj.position.y = osc.basePos; }
    }

    function triggerLeftWobble(rotSpeed = CHOP_ROT_SPEED_REF) {
      leftOsc.amp = Math.min(CHOP_AMP_MAX, CHOP_AMP_PER_DEGPS * rotSpeed);
      leftOsc.baseAngle = leftChopAngleDeg; leftOsc.startTime = performance.now(); leftOsc.active = true;
    }
    function triggerLeftStopWobble(rotSpeed = CHOP_ROT_SPEED_REF) {
      leftOsc.amp = Math.min(CHOP_AMP_MAX, CHOP_AMP_PER_DEGPS * rotSpeed);
      leftOsc.baseAngle = leftChopAngleDeg; leftOsc.startTime = performance.now(); leftOsc.active = true;
    }
    function triggerRightWobble(rotSpeed = CHOP_ROT_SPEED_REF) {
      rightOsc.amp = Math.min(CHOP_AMP_MAX, CHOP_AMP_PER_DEGPS * rotSpeed);
      rightOsc.baseAngle = rightChopAngleDeg; rightOsc.startTime = performance.now(); rightOsc.active = true;
    }
    function triggerRightStopWobble(rotSpeed = CHOP_ROT_SPEED_REF) {
      rightOsc.amp = Math.min(CHOP_AMP_MAX, CHOP_AMP_PER_DEGPS * rotSpeed);
      rightOsc.baseAngle = rightChopAngleDeg; rightOsc.startTime = performance.now(); rightOsc.active = true;
    }
    function triggerTransWobble(transSpeed = CHOP_TRANS_SPEED_REF) {
      if (!chopConnector) return;
      const now  = performance.now();
      const xAmp = Math.min(CHOP_AMP_MAX, CHOP_AMP_PER_DEGPS * transSpeed * 0.5);
      connTransOsc.amp      = Math.min(CHOP_TRANS_AMP_MAX, CHOP_TRANS_AMP_PER_MPS * transSpeed);
      connTransOsc.basePos  = chopConnector.position.y;
      connTransOsc.startTime = now; connTransOsc.active = true;
      leftOscX.amp  = xAmp; leftOscX.startTime  = now; leftOscX.active  = true;
      rightOscX.amp = xAmp; rightOscX.startTime = now; rightOscX.active = true;
    }

    // ── Stage 0 ───────────────────────────────────────────────────────────────
    loader.load(`${BASE}models/stage0.glb`, (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(1000);
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      model.position.y -= box.min.y;
      model.position.x = STAGE0.position.x;
      model.position.z = STAGE0.position.z;
      model.rotation.y = STAGE0.rotationY;
      scene.add(model);

      const chopstickMat  = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.3, metalness: 0.85, envMapIntensity: 1.8 });
      const concreteMat   = new THREE.MeshStandardMaterial({ color: 0x52575c, roughness: 0.75, metalness: 0.05, envMapIntensity: 0.8 });
      const launchPadMat2 = new THREE.MeshStandardMaterial({ color: 0x52575c, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.5 });

      const towerObjects: THREE.Mesh[] = [];

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        if (["left_chopstick", "right_chopstick", "QDBoosterClaw2001", "Chopstick_TowerConnector002"].includes(mesh.name)) {
          if (mesh.name === "left_chopstick")  { leftChopstick = mesh;  leftChopstickBaseQ.copy(mesh.quaternion); }
          if (mesh.name === "right_chopstick") { rightChopstick = mesh; rightChopstickBaseQ.copy(mesh.quaternion); }
          mesh.material = chopstickMat;
          towerObjects.push(mesh);
        } else if (["Tower_base", "top-section", "mid-section"].includes(mesh.name)) {
          mesh.material = concreteMat;
          towerObjects.push(mesh);
        } else if (mesh.name === "launch_pad") {
          mesh.material = launchPadMat2;
        }
      });

      // Collect unique materials
      const towerMats = Array.from(new Set(towerObjects.map((m) => m.material as THREE.MeshStandardMaterial)));

      // Immediate show — used when switching back to demo mode
      setTowerVisibilityRef.current = (visible: boolean) => {
        for (const mat of towerMats) {
          mat.transparent = false; mat.depthWrite = true; mat.opacity = 1; mat.needsUpdate = true;
        }
        for (const obj of towerObjects) obj.visible = visible;
      };

      // Smooth fade-out via its own rAF loop — no dependency on moduleAnims
      let fadeRafId = 0;
      fadeTowerOutRef.current = () => {
        cancelAnimationFrame(fadeRafId);
        for (const obj of towerObjects) obj.visible = true;
        for (const mat of towerMats) {
          mat.transparent = true; mat.depthWrite = false; mat.opacity = 1; mat.needsUpdate = true;
        }
        const DURATION = 700;
        const t0 = performance.now();
        const tick = () => {
          const p = Math.min(1, (performance.now() - t0) / DURATION);
          const opacity = 1 - p;
          for (const mat of towerMats) mat.opacity = opacity;
          if (p < 1) {
            fadeRafId = requestAnimationFrame(tick);
          } else {
            for (const obj of towerObjects) obj.visible = false;
            for (const mat of towerMats) {
              mat.transparent = false; mat.depthWrite = true; mat.opacity = 1; mat.needsUpdate = true;
            }
          }
        };
        fadeRafId = requestAnimationFrame(tick);
      };

      const connNode = model.getObjectByName("Chopstick_TowerConnector002");
      if (connNode) { chopConnector = connNode; }
    }, undefined, (err) => console.error("Stage0 load error:", err));

    // ── Booster ───────────────────────────────────────────────────────────────
    loader.load(`${BASE}models/booster_asm.glb`, (gltf) => {
      const model = gltf.scene;
      model.rotation.z = BOOSTER.rotationZ;

      const steel = new THREE.MeshLambertMaterial({
        color: 0x6a7075,
      });
      const engineBlack = new THREE.MeshLambertMaterial({
        color: 0x080808,
      });

      model.updateMatrixWorld(true);
      const modelBox     = new THREE.Box3().setFromObject(model);
      const modelMinY    = modelBox.min.y;
      const modelHeight  = modelBox.max.y - modelBox.min.y;
      const engineThreshold = modelMinY + modelHeight * 0.25;

      const meshBox = new THREE.Box3();
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshBox.setFromObject(child);
          const centerY = (meshBox.min.y + meshBox.max.y) / 2;
          (child as THREE.Mesh).material = centerY < engineThreshold ? engineBlack : steel;
          (child as THREE.Mesh).castShadow = false;
          (child as THREE.Mesh).receiveShadow = false;
        }
      });

      scene.add(model);

      const box    = new THREE.Box3().setFromObject(model);
      const size   = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.set(BOOSTER.position.x, BOOSTER.position.y, BOOSTER.position.z);
      model.updateMatrixWorld(true);

      const modelRotInv = new THREE.Quaternion();
      model.getWorldQuaternion(modelRotInv);
      modelRotInv.invert();
      const oldModelWorldPos = new THREE.Vector3(-center.x, -box.min.y, -center.z);

      const toModelLocal = (wx: number, wy: number, wz: number): THREE.Vector3 =>
        new THREE.Vector3(wx - oldModelWorldPos.x, wy - oldModelWorldPos.y, wz - oldModelWorldPos.z)
          .applyQuaternion(modelRotInv);

      const toModelLocalQuat = (rx: number, ry: number, rz: number): THREE.Quaternion =>
        modelRotInv.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));

      const radius = size.length() / 2;
      const fov    = (camera.fov * Math.PI) / 180;
      const dist   = (radius / Math.sin(fov / 2)) * 1.5;
      camera.position.set(228329.07, 79901.72, 3450.99);
      camera.lookAt(2983.92, 84485.80, 3912.83);
      controls.target.set(2983.92, 84485.80, 3912.83);

      camera.near = dist * 0.001;
      camera.far  = dist * 20;
      camera.updateProjectionMatrix();
      scene.fog = new THREE.FogExp2(0x0d0e10, 0.6 / (dist * 8));
      controls.maxDistance = dist * 8;
      controls.update();

      const gridSize = radius * 17.3;
      const fine     = Math.round(gridSize / radius) * 10;
      scene.add(makeGrid(gridSize, fine, 0x555555, 0.5, 0));
      scene.add(makeGrid(gridSize, Math.round(fine / 10), 0x777777, 0.85, 0));

      const groundDisc = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 4, radius * 4),
        new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.9, metalness: 0.1 }),
      );
      groundDisc.rotation.x = -Math.PI / 2;
      groundDisc.position.y = -0.5;
      groundDisc.receiveShadow = true;
      scene.add(groundDisc);

      const s = size.y * 1.5;
      sun.shadow.camera.left   = -s;
      sun.shadow.camera.right  = s;
      sun.shadow.camera.top    = s * 2;
      sun.shadow.camera.bottom = -s;
      sun.shadow.camera.far    = size.y * 10;
      sun.target.position.set(model.position.x, size.y / 2, model.position.z);
      sun.target.updateMatrixWorld();
      sun.shadow.camera.updateProjectionMatrix();

      // ── Grid fins ──────────────────────────────────────────────────────────
      const finMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const FIN_TRANSFORMS: [number, number, number, number, number, number][] = [
        [    0, 65860.3,  4520, -Math.PI / 2, Math.PI,            0],
        [-4520, 65860.0,     0, -Math.PI / 2, Math.PI, Math.PI / 2],
        [ 4520, 65860.0,     0, -Math.PI / 2, Math.PI,-Math.PI / 2],
      ];
      FIN_TRANSFORMS.forEach(([px, py, pz, rx, ry, rz], i) => {
        loader.load(`${BASE}models/grid_fin_ass_asm.glb`, (gltfFin) => {
          const fin = gltfFin.scene;
          fin.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = finMat;
              (child as THREE.Mesh).castShadow = false;
              (child as THREE.Mesh).receiveShadow = false;
            }
          });
          fin.position.copy(toModelLocal(px, py, pz));
          fin.quaternion.copy(toModelLocalQuat(rx, ry, rz));
          model.add(fin);
        }, undefined, (err) => console.error(`Failed to load grid fin ${i + 1}:`, err));
      });

      // ── Engines ────────────────────────────────────────────────────────────
      const engMat = new THREE.MeshLambertMaterial({ color: 0x7a3010 });
      ENGINE_TRANSFORMS.forEach(([px, py, pz, rx, ry, rz], i) => {
        loader.load(`${BASE}models/engine.glb`, (gltfEng) => {
          const eng = gltfEng.scene;
          eng.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = engMat;
              (child as THREE.Mesh).castShadow = false;
              (child as THREE.Mesh).receiveShadow = false;
            }
          });
          eng.position.z = ENGINE_GIMBAL_OFFSET_Z;

          const pivot    = new THREE.Group();
          const thrustLen = size.z * 4.0;
          if (trajectoryPlayer) trajectoryPlayer.thrustArrowBaseLen = thrustLen;
          const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), thrustLen, 0xff0000, thrustLen * 0.08, thrustLen * 0.04);
          thrustArrows.push(arrow);
          pivot.add(arrow);
          pivot.add(eng);

          pivot.position.copy(toModelLocal(px, py, pz));
          pivot.quaternion.copy(toModelLocalQuat(rx, ry, rz));
          model.add(pivot);

          gimbalPivots[i]   = pivot;
          gimbalBaseQuat[i].copy(pivot.quaternion);
        }, undefined, (err) => console.error(`Failed to load engine ${i + 1}:`, err));
      });

      boosterModel = model;
      setSceneReady(true);

      // ── Trajectory player ──────────────────────────────────────────────────
      const _chopQtmp  = new THREE.Quaternion();
      const _chopLocalY = new THREE.Vector3(0, 1, 0);

      function openChopsticks() {
        leftChopAngleDeg  = 30;
        rightChopAngleDeg = -30;
        _chopQtmp.setFromAxisAngle(_chopLocalY,  30 * (Math.PI / 180));
        leftChopstick?.quaternion.copy(leftChopstickBaseQ).multiply(_chopQtmp);
        _chopQtmp.setFromAxisAngle(_chopLocalY, -30 * (Math.PI / 180));
        rightChopstick?.quaternion.copy(rightChopstickBaseQ).multiply(_chopQtmp);
      }

      function resetCatchSequence() {
        catchPhase1Done = false;
        catchPhase2Done = false;
        moduleAnims.length = 0;
        if (boosterModel && boosterModel.parent !== scene) scene.attach(boosterModel);
        if (trajectoryPlayer) trajectoryPlayer.frozen = false;
        for (const arrow of thrustArrows) arrow.visible = true;
        openChopsticks();
      }

      trajectoryPlayer = new TrajectoryPlayer(model, gimbalPivots, gimbalBaseQuat, scene);
      trajectoryPlayer.onMeta            = (total, sp) => { livePlots.setMeta(total, sp); simSetpoint = sp; };
      trajectoryPlayer.onSetpointChange  = (sp) => { livePlots.updateSetpoint(sp); simSetpoint = sp; };
      trajectoryPlayer.onFrame = (t, pos, eng, omega, u_cart) => livePlots.addFrame(t, pos, eng, omega, u_cart);
      trajectoryPlayer.thrustArrows = thrustArrows;
      trajectoryPlayer.thrustRefN   = THRUST_REF_N;
      trajectoryPlayerRef.current = trajectoryPlayer;
      resetCatchRef.current       = resetCatchSequence;

      // ── Catch sequence checker @ 5 Hz ──────────────────────────────────────
      const catchIntervalId = setInterval(() => {
        if (!catchEnabledRef.current) return;
        if (!trajectoryPlayer || !simSetpoint) return;
        const pos = trajectoryPlayer.latestPos;
        if (!pos) return;

        const dx = pos[0] - simSetpoint[0];
        const dy = pos[1] - simSetpoint[1];
        const dz = pos[2] - simSetpoint[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (!catchPhase1Done && dist < CATCH_CLOSE_DIST) {
          catchPhase1Done = true;
          const now      = performance.now();
          const duration = 6.0;
          const startLeft  = leftChopAngleDeg;
          const startRight = rightChopAngleDeg;
          const localChopYv = new THREE.Vector3(0, 1, 0);
          const qTmp        = new THREE.Quaternion();
          triggerLeftWobble();
          triggerRightWobble();
          moduleAnims.push({
            startTime: now, startVal: startLeft, endVal: -4, duration,
            onUpdate: (v) => {
              leftChopAngleDeg = v;
              if (leftChopstick && !leftOsc.active && !leftOscX.active) {
                qTmp.setFromAxisAngle(localChopYv, v * (Math.PI / 180));
                leftChopstick.quaternion.copy(leftChopstickBaseQ).multiply(qTmp);
              }
            },
            onDone: () => triggerLeftStopWobble(),
          });
          moduleAnims.push({
            startTime: now, startVal: startRight, endVal: 7, duration,
            onUpdate: (v) => {
              rightChopAngleDeg = v;
              if (rightChopstick && !rightOsc.active && !rightOscX.active) {
                qTmp.setFromAxisAngle(localChopYv, v * (Math.PI / 180));
                rightChopstick.quaternion.copy(rightChopstickBaseQ).multiply(qTmp);
              }
            },
            onDone: () => triggerRightStopWobble(),
          });
        }

        if (!catchPhase2Done && Math.abs(dz) < CATCH_LAND_DIST) {
          catchPhase2Done = true;
          for (const arrow of thrustArrows) arrow.visible = false;
          if (trajectoryPlayer) trajectoryPlayer.frozen = true;
          if (boosterModel && chopConnector) chopConnector.attach(boosterModel);
          triggerTransWobble();
        }
      }, 200);

      // Store IDs for cleanup
      (renderer as any).__catchIntervalId    = catchIntervalId;
      (renderer as any).__trajectoryPlayer   = trajectoryPlayer;
      (renderer as any).__livePlots          = livePlots;
      (renderer as any).__resetCatchSequence = resetCatchSequence;

      openChopsticks();

    }, undefined, (err) => console.error("Failed to load booster:", err));

    // ── FPS counter ───────────────────────────────────────────────────────────
    const fpsEl = document.createElement("div");
    fpsEl.style.cssText = [
      'position:fixed', 'bottom:1.25rem', 'left:1.25rem', 'z-index:1000',
      "font:500 0.6rem/1 'JetBrains Mono', ui-monospace, monospace",
      'letter-spacing:0.16em', 'text-transform:uppercase',
      'color:rgba(255,255,255,0.45)',
      'background:rgba(7,7,11,0.80)',
      '-webkit-backdrop-filter:blur(14px)', 'backdrop-filter:blur(14px)',
      'border:1px solid rgba(255,255,255,0.10)', 'border-radius:999px',
      'padding:0.45rem 0.8rem', 'pointer-events:none',
    ].join(';');
    document.body.appendChild(fpsEl);
    let fpsFrames = 0, fpsLast = performance.now();

    // ── Camera fly-to ─────────────────────────────────────────────────────────
    type CamAnim = { fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; startMs: number; durationMs: number } | null;
    let camAnim: CamAnim = null;
    animateCameraToRef.current = (pos, target, ms = 1800) => {
      camAnim = {
        fromPos:    camera.position.clone(),
        toPos:      new THREE.Vector3(...pos),
        fromTarget: controls.target.clone(),
        toTarget:   new THREE.Vector3(...target),
        startMs:    performance.now(),
        durationMs: ms,
      };
    };

    // ── Animate ───────────────────────────────────────────────────────────────
    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);

      if (camAnim) {
        const t = Math.min((performance.now() - camAnim.startMs) / camAnim.durationMs, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out quad
        camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, ease);
        controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, ease);
        if (t >= 1) camAnim = null;
      }

      controls.update();
      tickModuleAnims();
      trajectoryPlayer?.tick();
      tickChopstick(leftChopstick,  leftChopstickBaseQ,  leftChopAngleDeg,  leftOsc,  leftOscX,   1, -8,  60);
      tickChopstick(rightChopstick, rightChopstickBaseQ, rightChopAngleDeg, rightOsc, rightOscX, -1, -60,  8);
      tickTransOscillation(connTransOsc, chopConnector);
      renderer.render(scene, camera);
      livePlots.render();
      fpsFrames++;
      const now = performance.now();
      if (now - fpsLast >= 500) {
        fpsEl.textContent = `${Math.round(fpsFrames * 1000 / (now - fpsLast))} FPS`;
        fpsFrames = 0; fpsLast = now;
      }
    }
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Space → replay demo ───────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        runDemoRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      clearInterval((renderer as any).__catchIntervalId);
      ((renderer as any).__trajectoryPlayer as TrajectoryPlayer | undefined)?.dispose();
      livePlotsRef.current?.dispose();
      livePlotsRef.current = null;
      if (fpsEl.parentNode) fpsEl.parentNode.removeChild(fpsEl);
      renderer.dispose();
      envTexture.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  const isLoading = simStatus === 'loading';

  // ── Overlay ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0d0e10] font-sans">
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading overlay */}
      {!sceneReady && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-[#0d0e10]">
          <div className="h-10 w-10 animate-spin rounded-full border border-sand/25 border-t-sand" />
          <p className="eyebrow">Loading scene</p>
        </div>
      )}

      {/* Top bar — mirrors the site nav */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-ink/70 backdrop-blur-xl">
        <div className="flex h-[var(--nav-h)] items-center justify-between gap-6 px-6 lg:px-10">
          <Link
            to="/downloadsPage"
            className="group pointer-events-auto flex items-center gap-2.5 font-mono text-[0.62rem]
                       uppercase tracking-[0.18em] text-white/50 transition-colors duration-300 hover:text-sand"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Portfolio</span>
          </Link>

          <div className="min-w-0 text-center">
            <p className="eyebrow mb-0.5">Live 3D Demo</p>
            <h1 className="truncate text-sm font-light tracking-display text-white">
              LQR Full State Feedback &amp; 6 DOF Body Integrator
            </h1>
          </div>

          <Link
            to="/downloadsPage#lqr"
            state={{ openSection: 'lqr' }}
            className="group pointer-events-auto flex items-center gap-2.5 font-mono text-[0.62rem]
                       uppercase tracking-[0.18em] text-white/50 transition-colors duration-300 hover:text-sand"
          >
            <span className="hidden sm:inline">Read the Study</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Simulation control — bottom right */}
      <div
        className="panel absolute bottom-5 right-5 z-[1000] w-[262px] p-5"
        style={{ background: 'rgba(7,7,11,0.82)' }}
      >
        <p className="eyebrow mb-4">Simulation control</p>

        {/* Simulate Landing */}
        <div className="relative">
          <button
            onClick={runDemo}
            disabled={isLoading}
            className="w-full rounded-lg border border-white/15 py-2.5 font-mono text-[0.62rem] uppercase
                       tracking-[0.18em] text-white/85 transition-all duration-300
                       hover:border-white/35 hover:bg-white/[0.07]
                       disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Simulate landing
          </button>
          <span
            onMouseEnter={() => setTooltip('landing')}
            onMouseLeave={() => setTooltip(null)}
            className="absolute right-2.5 top-1/2 flex h-[15px] w-[15px] -translate-y-1/2 items-center
                       justify-center rounded-full border border-white/25 font-mono text-[8px]
                       leading-none text-white/40"
          >
            ?
          </span>
          {tooltip === 'landing' && (
            <Tooltip title="Booster Landing: Final Phase">
              <p>
                A real booster landing has several distinct phases: a hypersonic reentry burn with all
                13 engines, a grid-fin descent, then a landing burn. This simulation focuses on that
                last phase: the booster comes in at low altitude with only 3 center engines lit,
                corrects its attitude and velocity, and touches down on the catch pad.
              </p>
              <p>
                The mechazilla chopstick arms close automatically as the booster enters the final
                approach corridor.
              </p>
              <SpecList
                rows={[
                  ['Engines', '3 center engines (landing burn)'],
                  ['Actuation', 'TVC: gimbal α, β + throttle'],
                  ['Integrator', 'RK4 @ 5000 Hz'],
                ]}
              />
            </Tooltip>
          )}
        </div>

        <p className="mt-3 text-center font-mono text-[0.58rem] uppercase tracking-[0.14em] text-white/40">
          or press Space
        </p>
        <p className="mt-1.5 text-center font-mono text-[0.58rem] leading-relaxed tracking-[0.06em] text-sand/70">
          scroll to zoom out if the rocket isn't visible
        </p>

        <div className="my-4 h-px bg-white/[0.08]" />

        {/* Simulate Hover */}
        <div className="relative">
          <button
            onClick={runHover}
            disabled={isLoading}
            className="w-full rounded-lg border border-sand/40 py-2.5 font-mono text-[0.62rem] uppercase
                       tracking-[0.18em] text-sand transition-all duration-300
                       hover:border-sand/70 hover:bg-sand/10
                       disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {isLoading ? 'Running…' : 'Simulate Hover Test'}
          </button>
          <span
            onMouseEnter={() => setTooltip('hover')}
            onMouseLeave={() => setTooltip(null)}
            className="absolute right-2.5 top-1/2 flex h-[15px] w-[15px] -translate-y-1/2 items-center
                       justify-center rounded-full border border-sand/35 font-mono text-[8px]
                       leading-none text-sand/60"
          >
            ?
          </span>
          {tooltip === 'hover' && (
            <Tooltip title="Multi-Waypoint LQR Setpoint Tracking">
              <p>
                Starting from rest at the origin, the same LQR controller tracks a sequence of 3D
                position setpoints in free space. At each waypoint the controller relinearises around
                the new target and drives the booster there from any initial condition.
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  ['Phase 1', '(0, 0, 0) to (70, 70, 100) m'],
                  ['Phase 2', 'to (−70, 70, 200) m'],
                  ['Phase 3', 'to (70, 131, 300) m'],
                  ['Phase 4', 'to (0, 0, 48) m: autonomous catch'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-3 text-[0.62rem]">
                    <span className="min-w-[3.4rem] font-mono uppercase tracking-[0.12em] text-sand/80">
                      {k}
                    </span>
                    <span className="font-light text-white/50">{v}</span>
                  </div>
                ))}
              </div>
              <p>
                On the final approach the chopstick arms close and the booster is caught — identical
                catch logic to the landing scenario.
              </p>
              <SpecList
                rows={[
                  ['Engines', '3 center engines (hover thrust)'],
                  ['Actuation', 'TVC: gimbal α, β + throttle'],
                  ['Integrator', 'RK4 @ 5000 Hz'],
                ]}
              />
            </Tooltip>
          )}
        </div>

        {simError && (
          <p className="mt-3 break-words font-mono text-[0.6rem] font-light text-[#e06c75]">
            {simError}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Overlay helpers ───────────────────────────────────────────────────────────

function Tooltip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="panel pointer-events-none absolute bottom-[calc(100%+10px)] right-0 z-10 w-[310px]
                 animate-fade-in space-y-2.5 p-4 text-[0.68rem] font-light leading-relaxed text-white/55"
      style={{ background: 'rgba(7,7,11,0.96)' }}
    >
      <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-white/85">
        {title}
      </p>
      {children}
    </div>
  );
}

function SpecList({ rows }: { rows: string[][] }) {
  return (
    <div className="flex flex-col gap-1 border-t border-white/[0.08] pt-2.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 text-[0.6rem]">
          <span className="whitespace-nowrap font-mono uppercase tracking-[0.12em] text-white/30">
            {k}
          </span>
          <span className="text-right font-light text-sand/80">{v}</span>
        </div>
      ))}
    </div>
  );
}
