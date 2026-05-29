import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Dish, LightThemeType } from '../types';

interface ThreeCanvasProps {
  selectedDish: Dish;
  lightTheme: LightThemeType;
  explodeLevel: number; // 0 (combined) to 1 (fully separated)
  wireframe: boolean;
  onHoverIngredient?: (ingredientName: string | null) => void;
  hoveredIngredientName?: string | null;
}

// Helper to generate a procedural canvas texture for meat bump/roughness
function createMeatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Fill dark brown base
  ctx.fillStyle = '#2c1611';
  ctx.fillRect(0, 0, 256, 256);

  // Add noise/meat grain
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = 1 + Math.random() * 3;
    const val = Math.random();
    if (val > 0.6) {
      ctx.fillStyle = '#1e0e0b'; // charred black
    } else if (val > 0.3) {
      ctx.fillStyle = '#49261a'; // roasted crimson
    } else {
      ctx.fillStyle = '#59392c'; // light cooked fibers
    }
    ctx.fillRect(x, y, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural texture for marbled Salmon Sashimi
function createSalmonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Salmon orange-pink background
  ctx.fillStyle = '#ff7139';
  ctx.fillRect(0, 0, 512, 256);

  // Draw marble fat lines (wavy white lines)
  ctx.strokeStyle = 'rgba(255, 235, 225, 0.85)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    const startX = -50 + i * 45;
    ctx.moveTo(startX, 0);

    for (let y = 0; y <= 256; y += 10) {
      const offsetX = Math.sin(y / 20) * 12 + (y * 0.4);
      ctx.lineTo(startX + offsetX, y);
    }
    ctx.stroke();
  }

  // Draw sashimi gloss gradients
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, 'rgba(255,100,50,0.15)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  gradient.addColorStop(1, 'rgba(30,0,0,0.25)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural texture for Marble Plate
function createMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f6f6f6';
  ctx.fillRect(0, 0, 512, 512);

  // Draw natural gray veins
  ctx.strokeStyle = 'rgba(120, 120, 125, 0.25)';
  for (let k = 0; k < 6; k++) {
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 512) {
      x += (Math.random() - 0.5) * 20;
      y += 10 + Math.random() * 15;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural texture for Seared Chashu Pork
function createChashuTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Fill roasted brown
  ctx.fillStyle = '#7a4224';
  ctx.fillRect(0, 0, 256, 256);

  // Concentric fat rings
  ctx.strokeStyle = 'rgba(240, 220, 200, 0.4)';
  ctx.lineWidth = 8;
  for (let r = 20; r < 120; r += 24) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sear marks/char marks
  ctx.fillStyle = 'rgba(20, 10, 5, 0.7)';
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate(angle + 0.3);
    ctx.fillRect(-60, -8, 120, 16);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function ThreeCanvas({
  selectedDish,
  lightTheme,
  explodeLevel,
  wireframe,
  onHoverIngredient,
  hoveredIngredientName,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Store various active 3D meshes to animate in `explode` mode dynamically
  const burgerGroupRef = useRef<THREE.Group | null>(null);
  const ramenGroupRef = useRef<THREE.Group | null>(null);
  const sushiGroupRef = useRef<THREE.Group | null>(null);
  const dessertGroupRef = useRef<THREE.Group | null>(null);

  // Particle systems
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const ambientSparklesRef = useRef<THREE.Points | null>(null);

  // ThreeJS runtime variables
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Light references to transition styles
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Initialize Scene, Camera, Lights, Renderer, and Controls
  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 12, 18);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Lock camera from going below table
    controls.minDistance = 8;
    controls.maxDistance = 28;
    controlsRef.current = controls;

    // --- PROCEDURAL BASE STAGE ---
    // A luxury pedestal/tabletop
    const tableGeo = new THREE.CylinderGeometry(8, 8.2, 0.4, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.15,
      metalness: 0.8,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -1.2;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // --- INITIALIZE LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);
    directionalLightRef.current = dirLight;

    const spotLight = new THREE.SpotLight(0xffe3b3, 1.5, 30, Math.PI / 6, 0.5, 1);
    spotLight.position.set(0, 15, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    spotLightRef.current = spotLight;

    // Rim light from behind dish for crispy outlines (glamour food shot)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-10, 6, -10);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // --- STEAM PARTICLES ---
    const steamCount = 60;
    const steamGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(steamCount * 3);
    const life = new Float32Array(steamCount);

    for (let i = 0; i < steamCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      life[i] = Math.random();
    }

    steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // Soft transparent square for steam
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const steamTex = new THREE.CanvasTexture(canvas);

    const steamMat = new THREE.PointsMaterial({
      size: 0.8,
      map: steamTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const steamPoints = new THREE.Points(steamGeo, steamMat);
    scene.add(steamPoints);
    steamParticlesRef.current = steamPoints;

    setLoading(false);

    // Dynamic resize handler
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = entry.contentRect.height || 500;
      if (rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Slowly rotate active dish unless user is dragging
      const currentGroup = 
        selectedDish.id === 'shroom-burger' ? burgerGroupRef.current :
        selectedDish.id === 'helix-ramen' ? ramenGroupRef.current :
        selectedDish.id === 'obsidian-sushi' ? sushiGroupRef.current :
        dessertGroupRef.current;

      if (currentGroup) {
        // Slow lazy hover spin
        currentGroup.rotation.y += delta * 0.08;
      }

      // Animate Steam upward
      if (steamParticlesRef.current) {
        const positions = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < steamCount; i++) {
          positions[i * 3 + 1] += delta * 0.45; // climb up
          // Wobble slightly
          positions[i * 3] += Math.sin(time * 2 + i) * 0.005;

          // Recycle particles that go too high
          if (positions[i * 3 + 1] > 4.5) {
            positions[i * 3 + 1] = 0.2 + Math.random() * 0.5;
            positions[i * 3] = (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // RENDER
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selectedDish]);

  // Handle visual lighting theme updates dynamic changes
  useEffect(() => {
    const dir = directionalLightRef.current;
    const spot = spotLightRef.current;
    const rim = rimLightRef.current;
    if (!dir || !spot || !rim) return;

    if (lightTheme === 'warm') {
      dir.color.setHex(0xfff3e0);
      dir.intensity = 0.9;
      spot.color.setHex(0xffaa44);
      spot.intensity = 2.0;
      rim.color.setHex(0xfff1ea);
      rim.intensity = 1.0;
    } else if (lightTheme === 'cool') {
      dir.color.setHex(0xe3f2fd);
      dir.intensity = 1.2;
      spot.color.setHex(0xffffff);
      spot.intensity = 1.0;
      rim.color.setHex(0xd0e8ff);
      rim.intensity = 1.3;
    } else if (lightTheme === 'cyberpunk') {
      dir.color.setHex(0xe040fb); // Pink
      dir.intensity = 1.1;
      spot.color.setHex(0x00e5ff); // Neon Cyan
      spot.intensity = 2.4;
      rim.color.setHex(0x00ff88); // Neon Jade
      rim.intensity = 1.5;
    } else if (lightTheme === 'candle') {
      dir.color.setHex(0xff8f00);
      dir.intensity = 0.4;
      spot.color.setHex(0xffbb55);
      spot.intensity = 2.8;
      rim.color.setHex(0x8d5c00);
      rim.intensity = 0.6;
    }
  }, [lightTheme, selectedDish]);

  // Build the 3D assets for the selected dish
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up older custom dish groups
    if (burgerGroupRef.current) scene.remove(burgerGroupRef.current);
    if (ramenGroupRef.current) scene.remove(ramenGroupRef.current);
    if (sushiGroupRef.current) scene.remove(sushiGroupRef.current);
    if (dessertGroupRef.current) scene.remove(dessertGroupRef.current);

    // Initial groups
    burgerGroupRef.current = new THREE.Group();
    ramenGroupRef.current = new THREE.Group();
    sushiGroupRef.current = new THREE.Group();
    dessertGroupRef.current = new THREE.Group();

    // ------------------------------------
    // TRUFFLE PORTOBELLO EMPEROR (Burger)
    // ------------------------------------
    const buildBurger = () => {
      const g = burgerGroupRef.current!;
      g.position.set(0, 0, 0);

      // Materials
      const bunMaterial = new THREE.MeshStandardMaterial({
        color: 0xaa6027, // Glossy glaze brown
        roughness: 0.16,
        metalness: 0.1,
      });

      const meatMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d1b14,
        roughness: 0.85,
        bumpMap: createMeatTexture(),
        bumpScale: 0.08,
      });

      const cheeseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa000, // Molten gold cheese
        roughness: 0.2,
        metalness: 0.05,
      });

      const lettuceMaterial = new THREE.MeshStandardMaterial({
        color: 0x55ff33,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });

      const shroomMaterial = new THREE.MeshStandardMaterial({
        color: 0x221814,
        roughness: 0.1,
        metalness: 0.2,
      });

      const tomatoMaterial = new THREE.MeshStandardMaterial({
        color: 0xdd2211,
        roughness: 0.1,
        opacity: 0.85,
        transparent: true,
      });

      // 1. Bottom Bun (Cylinder + Spheroid bottom)
      const bBun = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.45, 32), bunMaterial);
      bBun.castShadow = true;
      bBun.receiveShadow = true;
      bBun.name = 'Golden Brioche Bun (Base)';
      g.add(bBun);

      // 2. Lettuce layers
      const lettuce = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.08, 16), lettuceMaterial);
      lettuce.position.y = 0.35;
      lettuce.rotation.x = 0.1;
      lettuce.rotation.z = -0.15;
      lettuce.castShadow = true;
      lettuce.name = 'Crisp Butter Lettuce & Heirloom Tomato';
      g.add(lettuce);

      // 3. Thick Smoked Angus Patty
      const patty = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.55, 32), meatMaterial);
      patty.position.y = 0.75;
      patty.castShadow = true;
      patty.receiveShadow = true;
      patty.name = 'Aged Prime Angus Beef Patty';
      g.add(patty);

      // 4. Molten Cheddar Cheese
      const cheese = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 2.3), cheeseMaterial);
      cheese.position.y = 1.05;
      cheese.rotation.y = Math.PI / 4;
      cheese.castShadow = true;
      cheese.name = 'Sharp Aged White Cheddar';
      g.add(cheese);

      // 5. Truffle Portobello Crown Cap
      const shroomCap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.3, 16), shroomMaterial);
      shroomCap.position.y = 1.3;
      shroomCap.castShadow = true;
      shroomCap.receiveShadow = true;
      shroomCap.name = 'Shiitake-infused Roasted Portobello';
      g.add(shroomCap);

      // 6. Tomato Slice
      const tomato = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 16), tomatoMaterial);
      tomato.position.y = 1.55;
      tomato.castShadow = true;
      tomato.name = 'Fresh Heirloom Tomato';
      g.add(tomato);

      // 7. Top Bun Dome
      const tBunGeom = new THREE.SphereGeometry(1.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const tBun = new THREE.Mesh(tBunGeom, bunMaterial);
      tBun.position.y = 1.65;
      tBun.scale.set(1, 0.8, 1);
      tBun.castShadow = true;
      tBun.receiveShadow = true;
      tBun.name = 'Golden Brioche Bun (Top)';
      g.add(tBun);

      // 8. Scattered Sesame Seeds on Top Bun
      const sesameGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const sesameMat = new THREE.MeshStandardMaterial({ color: 0xfffedd, roughness: 0.9 });
      sesameGeom.scale(1, 0.4, 2.2);

      for (let i = 0; i < 30; i++) {
        const seed = new THREE.Mesh(sesameGeom, sesameMat);
        // Position randomly over top hemisphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * (Math.PI / 3); // top third
        const r = 1.66;

        seed.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          1.65 + r * Math.cos(phi) * 0.8,
          r * Math.sin(phi) * Math.sin(theta)
        );
        seed.lookAt(new THREE.Vector3(0, 1.65, 0));
        g.add(seed);
      }

      scene.add(g);
    };

    // ------------------------------------
    // INFINITE HELIX RAMEN (Bowl)
    // ------------------------------------
    const buildRamen = () => {
      const g = ramenGroupRef.current!;

      // 1. Bowl Pot (Glossy deep indigo glazed pottery)
      const bowlShape = new THREE.CylinderGeometry(3.2, 1.8, 2.0, 32, 1, true);
      const bowlOuterMat = new THREE.MeshStandardMaterial({
        color: 0x070c1a,
        roughness: 0.08,
        metalness: 0.9,
        side: THREE.DoubleSide,
      });
      const bowl = new THREE.Mesh(bowlShape, bowlOuterMat);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      bowl.name = 'Hand-Glazed Ceramic Ramen Bowl';
      g.add(bowl);

      // Bowl bottom block
      const bowlBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.8, 0.25, 32), bowlOuterMat);
      bowlBottom.position.y = -1.0;
      bowlBottom.receiveShadow = true;
      g.add(bowlBottom);

      // 2. Tonkotsu Broth Surface (Amber transluscent gloss)
      const brothGeom = new THREE.CylinderGeometry(2.82, 2.8, 0.1, 32);
      const brothMat = new THREE.MeshStandardMaterial({
        color: 0xc18136, // savory fatty orange-brown
        roughness: 0.02,
        transparent: true,
        opacity: 0.9,
      });
      const broth = new THREE.Mesh(brothGeom, brothMat);
      broth.position.y = 0.55;
      broth.receiveShadow = true;
      broth.name = '12-Hour Smoked Tonkotsu Broth';
      g.add(broth);

      // 3. Bundles of Noodles (Golden spiral tubes)
      const noodleMat = new THREE.MeshStandardMaterial({
        color: 0xffe0a3,
        roughness: 0.4,
      });

      for (let i = 0; i < 18; i++) {
        // Curve path
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.8 + i * 0.15, 0.45, -1.5 + Math.sin(i) * 0.5),
          new THREE.Vector3(-1.4 + i * 0.15, 0.6, -0.4 + Math.cos(i) * 0.4),
          new THREE.Vector3(-0.6 + i * 0.05, 0.65, 0.8 + Math.sin(i * 1.5) * 0.6),
          new THREE.Vector3(0.5 + i * 0.1, 0.55, 1.2),
        ]);
        const noodleGeo = new THREE.TubeGeometry(curve, 20, 0.065, 8, false);
        const noodleMesh = new THREE.Mesh(noodleGeo, noodleMat);
        noodleMesh.name = 'Hand-Rolled Alkaline Noodles';
        g.add(noodleMesh);
      }

      // 4. Slow-braised Chashu Pork slices
      const chashuMat = new THREE.MeshStandardMaterial({
        map: createChashuTexture(),
        roughness: 0.75,
      });
      const chashu1 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.14, 16), chashuMat);
      chashu1.position.set(-1.1, 0.75, -0.6);
      chashu1.rotation.set(0.18, 0.1, -0.4);
      chashu1.castShadow = true;
      chashu1.name = 'Slow-Braised Kurobuta Chashu Pork';
      g.add(chashu1);

      const chashu2 = chashu1.clone();
      chashu2.position.set(-1.4, 0.7, -0.15);
      chashu2.rotation.set(0.2, -0.2, -0.6);
      g.add(chashu2);

      // 5. Hard Cured Molten Egg
      const eggOuterGeo = new THREE.SphereGeometry(0.72, 32, 16);
      eggOuterGeo.scale(1, 1.3, 1);
      const eggOuterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });

      // Build half-cut egg
      const eggGroup = new THREE.Group();
      eggGroup.position.set(0.8, 0.75, -0.3);
      eggGroup.rotation.set(-0.3, -0.5, 0.3);

      const whiteHalf = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 16, 0, Math.PI), eggOuterMat);
      whiteHalf.name = 'Egg White';
      eggGroup.add(whiteHalf);

      const yolkMat = new THREE.MeshStandardMaterial({
        color: 0xff8d00, // Vibrant glowing orange liquid
        roughness: 0.05,
        metalness: 0.1,
      });
      const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), yolkMat);
      yolk.position.set(0, 0.05, 0);
      yolk.scale.set(1, 0.5, 1);
      yolk.name = 'Molten Marinated Ajitama Egg';
      eggGroup.add(yolk);

      g.add(eggGroup);

      // 6. Nori seaweed sheet (standing slate)
      const noriMat = new THREE.MeshStandardMaterial({
        color: 0x1a1c18,
        roughness: 0.95,
      });
      const nori = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 2.2), noriMat);
      nori.position.set(-0.3, 1.5, -1.85);
      nori.rotation.set(1.1, 0.2, -0.2);
      nori.castShadow = true;
      nori.name = 'Crisp Nori seaweed';
      g.add(nori);

      // 7. Scallion and green shoots
      const greenShootMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.5 });
      const shootGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
      for (let i = 0; i < 22; i++) {
        const shoot = new THREE.Mesh(shootGeo, greenShootMat);
        shoot.position.set(0.2 + (Math.random() - 0.5) * 0.8, 0.78, 0.4 + (Math.random() - 0.5) * 0.8);
        shoot.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        shoot.name = 'Fresh scallion tops';
        g.add(shoot);
      }

      scene.add(g);
    };

    // ------------------------------------
    // KYOTO OBSIDIAN SUSHI TRIO (Nigiri)
    // ------------------------------------
    const buildSushi = () => {
      const g = sushiGroupRef.current!;

      // 1. Obsidian Plate Base (Rustic dark stone board)
      const boardGeo = new THREE.BoxGeometry(6.4, 0.22, 4.4);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0x161616,
        roughness: 0.88,
        metalness: 0.1,
      });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.y = -1.0;
      board.receiveShadow = true;
      board.castShadow = true;
      board.name = 'Kyoto Obsidian Slate Plate';
      g.add(board);

      // Rice pillows and Salmon slices
      const riceMat = new THREE.MeshStandardMaterial({
        color: 0xfffefa,
        roughness: 0.65,
      });

      const createNigiriPiece = (xOffset: number, fishTexture: THREE.CanvasTexture | null, fishColor: number, name: string) => {
        const nigiri = new THREE.Group();
        nigiri.position.x = xOffset;
        nigiri.position.y = -0.7;

        // Rice block (pillow)
        const ricePillow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.9), riceMat);
        ricePillow.name = 'Seasoned Koshihikari Rice';
        nigiri.add(ricePillow);

        // Fish slice drape
        const fishMat = new THREE.MeshStandardMaterial({
          color: fishColor,
          map: fishTexture || null,
          roughness: 0.13,
          metalness: 0.1,
        });
        const fishSlice = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 1.15), fishMat);
        fishSlice.position.y = 0.42;
        fishSlice.name = name;
        fishSlice.castShadow = true;
        nigiri.add(fishSlice);

        // Gold foil flakes on top (sparkles)
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.05,
          metalness: 0.98,
        });
        const goldGeo = new THREE.BoxGeometry(0.12, 0.005, 0.12);
        for (let i = 0; i < 4; i++) {
          const gold = new THREE.Mesh(goldGeo, goldMat);
          gold.position.set((Math.random() - 0.5) * 1.0, 0.53, (Math.random() - 0.5) * 0.6);
          gold.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
          nigiri.add(gold);
        }

        return nigiri;
      };

      // Piece 1: Fatty Faroe Salmon (Stripped orange-pink)
      const salmonNigiri = createNigiriPiece(-1.9, createSalmonTexture(), 0xffffff, 'Faroe Salmon Belly Nigiri');
      g.add(salmonNigiri);

      // Piece 2: Bluefin Otoro Tuna (Rich deep ruby red)
      const tunaNigiri = createNigiriPiece(0, null, 0xd50000, 'Premium Bluefin Otoro Tuna Nigiri');
      g.add(tunaNigiri);

      // Piece 3: Butter Kyoto Yellowtail (Hamachi - pale pink)
      const hamachiNigiri = createNigiriPiece(1.9, null, 0xffebec, 'Kyoto Yellowtail Hamachi Nigiri');
      g.add(hamachiNigiri);

      // 3. Wasabi Mound and Ginger folds
      const wasabiMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.9 });
      const wasabi = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), wasabiMat);
      wasabi.position.set(2.4, -0.7, -1.5);
      wasabi.scale.set(1, 0.7, 1);
      wasabi.castShadow = true;
      wasabi.name = 'Hand-Grated Wasabi Root';
      g.add(wasabi);

      const gingerMat = new THREE.MeshStandardMaterial({ color: 0xffebee, roughness: 0.65 });
      for (let i = 0; i < 3; i++) {
        const gingerPetal = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), gingerMat);
        gingerPetal.position.set(1.5 + i * 0.25, -0.75, -1.5);
        gingerPetal.scale.set(1.2, 0.1, 1.2);
        gingerPetal.rotation.z = 0.4 + i * 0.5;
        gingerPetal.castShadow = true;
        gingerPetal.name = 'Pickled Ginger';
        g.add(gingerPetal);
      }

      scene.add(g);
    };

    // ------------------------------------
    // NEBULA MATCHA FONDANT (Dessert)
    // ------------------------------------
    const buildDessert = () => {
      const g = dessertGroupRef.current!;

      // 1. Pristine Marble plate (reflective white stone disc)
      const marbleMat = new THREE.MeshStandardMaterial({
        map: createMarbleTexture(),
        roughness: 0.1,
        metalness: 0.1,
      });
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.1, 0.25, 48), marbleMat);
      plate.position.y = -1.0;
      plate.receiveShadow = true;
      plate.castShadow = true;
      plate.name = 'Polished Marble Side Plate';
      g.add(plate);

      // 2. Matcha lava cake cylinder
      const cakeMat = new THREE.MeshStandardMaterial({
        color: 0x4e7a3c, // organic matcha moss green
        roughness: 0.92,
      });
      const cake = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 1.2, 32), cakeMat);
      cake.position.set(0, -0.3, 0);
      cake.castShadow = true;
      cake.receiveShadow = true;
      cake.name = 'Uji Matcha Cake Fondant Dome';
      g.add(cake);

      // 3. Matcha cream glaze / lava oozing out onto plate
      const lavaMat = new THREE.MeshStandardMaterial({
        color: 0x599042, // glossy matcha lava
        roughness: 0.05,
        metalness: 0.1,
      });

      // Drool block extending out
      const lavaFlow = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.8, 0.14, 16), lavaMat);
      lavaFlow.position.set(-0.8, -0.82, 0.8);
      lavaFlow.scale.set(1, 1, 1.8);
      lavaFlow.rotation.y = 0.4;
      lavaFlow.receiveShadow = true;
      lavaFlow.name = 'Oozing Molten White Chocolate Lava';
      g.add(lavaFlow);

      // 4. Garnishing Raspberries (red tiny sphere groups)
      const rberryMat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.45 });
      const rberryGroup = new THREE.Group();
      rberryGroup.position.set(2.0, -0.75, 1.2);

      // Construct a small cluster of bubbles
      const bubbleGeo = new THREE.SphereGeometry(0.08, 8, 8);
      for (let i = 0; i < 20; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const bubble = new THREE.Mesh(bubbleGeo, rberryMat);
        bubble.position.set(
          0.3 * Math.sin(phi) * Math.cos(theta),
          0.18 + 0.3 * Math.cos(phi),
          0.3 * Math.sin(phi) * Math.sin(theta)
        );
        rberryGroup.add(bubble);
      }
      rberryGroup.name = 'Fresh Raspberry Garnish';
      g.add(rberryGroup);

      // Clone secondary berry
      const rberryGroup2 = rberryGroup.clone();
      rberryGroup2.position.set(1.6, -0.75, 1.8);
      g.add(rberryGroup2);

      // 5. Elegant mint leaf (curved emerald plane)
      const mintMat = new THREE.MeshStandardMaterial({
        color: 0x00c853,
        roughness: 0.65,
        side: THREE.DoubleSide,
      });
      const mintGeo = new THREE.BoxGeometry(0.8, 0.02, 0.5);
      const mint = new THREE.Mesh(mintGeo, mintMat);
      mint.position.set(-0.8, 0.4, 0.2);
      mint.rotation.set(0.6, 1.2, 0.8);
      mint.castShadow = true;
      mint.name = 'Fresh Organic Mint Leaves';
      g.add(mint);

      scene.add(g);
    };

    // Load active builder
    if (selectedDish.id === 'shroom-burger') {
      buildBurger();
    } else if (selectedDish.id === 'helix-ramen') {
      buildRamen();
    } else if (selectedDish.id === 'obsidian-sushi') {
      buildSushi();
    } else if (selectedDish.id === 'matcha-lava') {
      buildDessert();
    }
  }, [selectedDish]);

  // Handle Explode-level and Wireframe changes
  useEffect(() => {
    // 1. Apply Wireframe view
    const toggleWireframe = (group: THREE.Group | null) => {
      if (!group) return;
      group.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (Array.isArray(node.material)) {
            node.material.forEach((mat) => {
              mat.wireframe = wireframe;
            });
          } else if (node.material) {
            node.material.wireframe = wireframe;
          }
        }
      });
    };

    toggleWireframe(burgerGroupRef.current);
    toggleWireframe(ramenGroupRef.current);
    toggleWireframe(sushiGroupRef.current);
    toggleWireframe(dessertGroupRef.current);

    // 2. Explode individual layers in 3D Space
    // Explodes elements outwards vertically based on `explodeLevel` (0 to 1)
    if (selectedDish.id === 'shroom-burger' && burgerGroupRef.current) {
      const g = burgerGroupRef.current;
      g.children.forEach((child) => {
        const name = child.name || '';
        // Reset base
        child.position.y = 0;

        if (name.includes('Bun (Top)')) {
          child.position.y = 1.65 + explodeLevel * 2.8;
        } else if (name.includes('sesame')) {
          // Sesame seeds follow the top bun
          child.position.y = (1.65 + explodeLevel * 2.8) + (child.position.y - 1.65);
        } else if (name.includes('Tomato')) {
          child.position.y = 1.55 + explodeLevel * 2.1;
        } else if (name.includes('Portobello')) {
          child.position.y = 1.3 + explodeLevel * 1.5;
        } else if (name.includes('cheese')) {
          child.position.y = 1.05 + explodeLevel * 0.9;
        } else if (name.includes('Patty')) {
          child.position.y = 0.75 + explodeLevel * 0.4;
        } else if (name.includes('Lettuce')) {
          child.position.y = 0.35 + explodeLevel * 0.15;
        } else if (name.includes('Bun (Base)')) {
          child.position.y = 0 - explodeLevel * 0.55;
        }
      });
    } else if (selectedDish.id === 'helix-ramen' && ramenGroupRef.current) {
      const g = ramenGroupRef.current;
      g.children.forEach((child) => {
        const name = child.name || '';
        // Reset base
        if (name.includes('Bowl')) {
          child.position.y = child.position.y <= -0.9 ? -1.0 : 0;
          child.position.y -= explodeLevel * 1.5;
        } else if (name.includes('Broth')) {
          child.position.y = 0.55 - explodeLevel * 0.4;
        } else if (name.includes('Chashu')) {
          // Chashu pork lift up
          child.position.y = 0.7 + explodeLevel * 1.8;
        } else if (name.includes('Egg')) {
          // Soft yolk egg lift up high
          child.position.y = 0.75 + explodeLevel * 2.3;
        } else if (name.includes('Nori')) {
          child.position.y = 1.5 + explodeLevel * 2.8;
        } else if (name.includes('shoot') || name.includes('scallion')) {
          child.position.y = 0.78 + explodeLevel * 1.0;
        }
      });
    } else if (selectedDish.id === 'obsidian-sushi' && sushiGroupRef.current) {
      const g = sushiGroupRef.current;
      g.children.forEach((child, idx) => {
        // Individual Nigiri pieces
        if (child instanceof THREE.Group) {
          // Reset base
          child.position.y = -0.7;
          // Explode nigiri parts upward
          child.children.forEach((subChild) => {
            if (subChild.name.includes('Rice')) {
              subChild.position.y = 0 - explodeLevel * 0.5;
            } else if (subChild.name.includes('Nigiri')) {
              subChild.position.y = 0.42 + explodeLevel * 1.3;
            }
          });
        } else if (child.name.includes('Wasabi') || child.name.includes('Ginger')) {
          child.position.y = -0.7 - explodeLevel * 0.5;
        } else if (child.name.includes('Plate')) {
          child.position.y = -1.0 - explodeLevel * 1.0;
        }
      });
    } else if (selectedDish.id === 'matcha-lava' && dessertGroupRef.current) {
      const g = dessertGroupRef.current;
      g.children.forEach((child) => {
        const name = child.name || '';
        if (name.includes('Plate')) {
          child.position.y = -1.0 - explodeLevel * 1.5;
        } else if (name.includes('Cake')) {
          child.position.y = -0.3 + explodeLevel * 0.8;
        } else if (name.includes('Lava') || name.includes('Chocolate')) {
          child.position.y = -0.82 - explodeLevel * 0.1;
        } else if (name.includes('Raspberry')) {
          child.position.y = -0.75 + explodeLevel * 1.6;
        } else if (name.includes('Mint')) {
          child.position.y = 0.4 + explodeLevel * 2.4;
        }
      });
    }
  }, [explodeLevel, wireframe, selectedDish]);

  // Handle item hovering effects
  useEffect(() => {
    // Traverse meshes and highlights specific hovered layers
    const highlightIngredient = (group: THREE.Group | null) => {
      if (!group) return;
      group.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const isMatch = hoveredIngredientName 
            ? node.name.toLowerCase().includes(hoveredIngredientName.toLowerCase()) ||
              (hoveredIngredientName.toLowerCase().includes('patty') && node.name.toLowerCase().includes('patty')) ||
              (hoveredIngredientName.toLowerCase().includes('bun') && node.name.toLowerCase().includes('bun')) ||
              (hoveredIngredientName.toLowerCase().includes('egg') && node.name.toLowerCase().includes('egg')) ||
              (hoveredIngredientName.toLowerCase().includes('salmon') && node.name.toLowerCase().includes('salmon')) ||
              (hoveredIngredientName.toLowerCase().includes('tuna') && node.name.toLowerCase().includes('tuna')) ||
              (hoveredIngredientName.toLowerCase().includes('hamachi') && node.name.toLowerCase().includes('hamachi')) ||
              (hoveredIngredientName.toLowerCase().includes('wasabi') && node.name.toLowerCase().includes('wasabi')) ||
              (hoveredIngredientName.toLowerCase().includes('matcha') && node.name.toLowerCase().includes('matcha')) ||
              (hoveredIngredientName.toLowerCase().includes('lava') && node.name.toLowerCase().includes('lava'))
            : false;

          if (node.material && 'emissive' in node.material) {
            const mat = node.material as THREE.MeshStandardMaterial;
            if (isMatch) {
              mat.emissive.setHex(0x503300); // Amber highlight glow
            } else {
              mat.emissive.setHex(0x000000); // Standard off
            }
          }
        }
      });
    };

    highlightIngredient(burgerGroupRef.current);
    highlightIngredient(ramenGroupRef.current);
    highlightIngredient(sushiGroupRef.current);
    highlightIngredient(dessertGroupRef.current);

  }, [hoveredIngredientName, selectedDish]);

  return (
    <div className="relative w-full h-full bg-radial from-slate-900 to-black select-none overflow-hidden" id="three-stage-overlay">
      {/* 3D Container render target */}
      <div ref={containerRef} className="w-full h-full" id="threejs-canvas-render-viewport" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md" id="threejs-canvas-loading">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono tracking-wider text-amber-500 animate-pulse">
            INITIATING PHOTOREALISTIC RENDERING...
          </p>
        </div>
      )}

      {/* Interactive Floating Stage Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 max-w-xs bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl transition hover:border-slate-700" id="threejs-canvas-floating-controls">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <span className="text-xs font-mono font-medium tracking-wide text-slate-400">STAGE HUD</span>
          <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Explode Layers</span>
            <span className="text-amber-500 font-medium">{Math.round(explodeLevel * 100)}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-0.5 leading-relaxed">
            Drag mouse/touch to orbit camera. Roll wheel to zoom.
          </p>
        </div>

        <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-2">
          <span>Active Dish:</span>
          <span className="text-amber-500 text-right truncate font-medium max-w-[130px]">{selectedDish.name}</span>
        </div>
      </div>
    </div>
  );
}
