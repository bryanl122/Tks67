// =============================================================================
//  scene3d.js — Rendu 3D du parc à conteneurs (Three.js).
//  Monde procédural : sol, clôtures, conteneurs, bâtiments, véhicules animés,
//  arbres, cycle jour/nuit, météo (pluie/neige/brouillard).
// =============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FRACTIONS } from './data.js';

const TILE = 4;                 // taille d'une case (m)
const GROUND = 80;              // côté de la dalle (m)

export class Scene3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.containers = new Map();   // logicId -> mesh group
    this.buildings = new Map();
    this.vehicles = [];            // entités animées
    this.parkingSlots = [];        // { pos, busy }
    this.clock = new THREE.Clock();
    this.smoke = [];               // panaches (incendie)
    this._initRenderer();
    this._initScene();
    this._initLights();
    this._buildStaticWorld();
    this._initWeather();
    this._initParking();
    window.addEventListener('resize', () => this._resize());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9cc3e0);
    this.scene.fog = new THREE.Fog(0x9cc3e0, 90, 200);

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(45, 42, 55);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 18;
    this.controls.maxDistance = 120;
    this.controls.update();
  }

  _initLights() {
    this.hemi = new THREE.HemisphereLight(0xbfd9ff, 0x4a5d3a, 0.9);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    this.sun.position.set(40, 60, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const d = 70;
    this.sun.shadow.camera.left = -d; this.sun.shadow.camera.right = d;
    this.sun.shadow.camera.top = d; this.sun.shadow.camera.bottom = -d;
    this.sun.shadow.camera.far = 250;
    this.sun.shadow.bias = -0.0004;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambient);
  }

  // --- Monde statique : dalle, route d'entrée, clôtures ----------------------
  _buildStaticWorld() {
    // Terrain herbeux
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: 1 });
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(GROUND * 2.4, GROUND * 2.4), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.02;
    grass.receiveShadow = true;
    this.scene.add(grass);

    // Dalle bétonnée du parc
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x8a8d92, roughness: 0.95 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(GROUND, 0.4, GROUND), concreteMat);
    slab.position.y = -0.2;
    slab.receiveShadow = true;
    this.scene.add(slab);
    this.slab = slab;

    // Marquage de la dalle (lignes claires)
    const grid = new THREE.GridHelper(GROUND, GROUND / TILE, 0xffffff, 0xb8bcc2);
    grid.material.opacity = 0.18; grid.material.transparent = true;
    grid.position.y = 0.02;
    this.scene.add(grid);

    // Route d'entrée (au sud)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x33363b, roughness: 0.9 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(8, 0.42, 60), roadMat);
    road.position.set(0, -0.18, GROUND / 2 + 18);
    road.receiveShadow = true;
    this.scene.add(road);
    // Ligne médiane pointillée
    for (let z = 0; z < 30; z += 4) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 2), new THREE.MeshStandardMaterial({ color: 0xf5d33a }));
      dash.position.set(0, 0.05, GROUND / 2 + z);
      this.scene.add(dash);
    }

    // Barrière d'entrée
    this._buildBarrier(0, GROUND / 2 - 1);

    // Clôtures sur 3 côtés
    this._buildFences();

    // Petit poste d'accueil par défaut près de l'entrée
    const booth = this._makeBuildingMesh('bureau');
    booth.position.set(-14, 0, GROUND / 2 - 6);
    this.scene.add(booth);
  }

  _buildBarrier(x, z) {
    const grp = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    post.position.set(4, 0.8, 0); post.castShadow = true;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: 0xff3b30 }));
    arm.position.set(0.5, 1.4, 0); arm.castShadow = true;
    // bandes blanches
    for (let i = -3; i <= 3; i += 1.5) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.26), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      s.position.set(i + 0.5, 1.4, 0); grp.add(s);
    }
    grp.add(post, arm);
    grp.position.set(x, 0, z);
    this.scene.add(grp);
  }

  _buildFences() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x7a8088, metalness: 0.4, roughness: 0.6 });
    const half = GROUND / 2;
    const addRun = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const fence = new THREE.Mesh(new THREE.BoxGeometry(len, 2, 0.1), mat);
      fence.position.set((x1 + x2) / 2, 1, (z1 + z2) / 2);
      fence.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      fence.castShadow = true; this.scene.add(fence);
      // poteaux
      const n = Math.floor(len / 5);
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6), mat);
        p.position.set(x1 + (x2 - x1) * t, 1.1, z1 + (z2 - z1) * t);
        this.scene.add(p);
      }
    };
    addRun(-half, -half, half, -half); // nord
    addRun(-half, -half, -half, half); // ouest
    addRun(half, -half, half, half);   // est
    // sud : laisser l'entrée
    addRun(-half, half, -6, half);
    addRun(6, half, half, half);
  }

  _initParking() {
    // Rangée de places face à la zone de déchargement
    const rows = [-1, 1];
    let i = 0;
    for (const row of rows) {
      for (let c = -3; c <= 3; c++) {
        const pos = new THREE.Vector3(c * 5, 0, row * 8 + 8);
        this.parkingSlots.push({ pos, busy: false });
        // marquage place
        const m = new THREE.Mesh(new THREE.BoxGeometry(4, 0.01, 6),
          new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
        m.position.set(pos.x, 0.03, pos.z); this.scene.add(m);
        i++;
      }
    }
  }

  // --- Météo : pluie & neige (Points), brouillard via fog --------------------
  _initWeather() {
    const N = 4000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * GROUND * 1.4;
      pos[i * 3 + 1] = Math.random() * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * GROUND * 1.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rain = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xaaccff, size: 0.18, transparent: true, opacity: 0.6 }));
    this.snow = new THREE.Points(geo.clone(), new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.85 }));
    this.rain.visible = false; this.snow.visible = false;
    this.scene.add(this.rain); this.scene.add(this.snow);
  }

  // ===========================================================================
  //  ENTITÉS DYNAMIQUES
  // ===========================================================================

  // --- Conteneur (benne trapézoïdale) ----------------------------------------
  _makeContainerMesh(fraction) {
    const grp = new THREE.Group();
    const col = new THREE.Color((FRACTIONS[fraction] && FRACTIONS[fraction].color) || '#4caf50');
    const mat = new THREE.MeshStandardMaterial({ color: col, metalness: 0.55, roughness: 0.55 });
    // corps (légèrement évasé)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.0, 2.2, 4), mat);
    body.rotation.y = Math.PI / 4; body.position.y = 1.1;
    body.castShadow = true; body.receiveShadow = true;
    grp.add(body);
    // rebord
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.12, 6, 4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    rim.rotation.x = Math.PI / 2; rim.rotation.z = Math.PI / 4; rim.position.y = 2.2; grp.add(rim);
    // matière à l'intérieur (jauge de remplissage)
    const fillMat = new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(0.7), roughness: 1 });
    const fill = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1, 3.0), fillMat);
    fill.position.y = 0.5; fill.scale.y = 0.02; grp.add(fill);
    grp.userData.fill = fill;
    // panneau d'identification
    const label = this._makeLabelSprite(FRACTIONS[fraction] ? FRACTIONS[fraction].name : fraction);
    label.position.set(0, 3.4, 0); grp.add(label);
    grp.userData.kind = 'container';
    return grp;
  }

  addContainer(container) {
    const mesh = this._makeContainerMesh(container.fraction);
    mesh.position.set(container.x, 0, container.z);
    mesh.userData.logicId = container.id;
    this.scene.add(mesh);
    this.containers.set(container.id, mesh);
    this._spawnPlacePuff(mesh.position);
    return mesh;
  }

  updateContainerFill(container) {
    const mesh = this.containers.get(container.id);
    if (!mesh) return;
    const ratio = Math.max(0, Math.min(1, container.fill / container.capacity));
    const fill = mesh.userData.fill;
    fill.scale.y = Math.max(0.02, ratio * 1.6);
    fill.position.y = 0.3 + fill.scale.y / 2;
    // clignote en rouge si plein
    if (ratio >= 0.98) mesh.userData.full = true; else mesh.userData.full = false;
  }

  removeContainer(id) {
    const mesh = this.containers.get(id);
    if (mesh) { this.scene.remove(mesh); this.containers.delete(id); }
  }

  // --- Bâtiments / décor ------------------------------------------------------
  _makeBuildingMesh(type) {
    const grp = new THREE.Group();
    const wall = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    switch (type) {
      case 'bureau': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), wall(0xe8eaed)); b.position.y = 2; b.castShadow = true; grp.add(b);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.4, 6.4), wall(0x2563eb)); roof.position.y = 4.2; grp.add(roof);
        for (let i = -2; i <= 2; i += 2) { const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1e3a8a })); win.position.set(i, 2.2, 3.01); grp.add(win); }
        break;
      }
      case 'hangar': case 'entrepot': {
        const c = type === 'hangar' ? 0xbfc3c8 : 0xc9a36a;
        const b = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 12), wall(c)); b.position.y = 3; b.castShadow = true; grp.add(b);
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 14, 16, 1, false, 0, Math.PI), wall(0x9aa0a6));
        roof.rotation.z = Math.PI / 2; roof.position.set(0, 6, 0); roof.scale.z = 0.86; grp.add(roof);
        break;
      }
      case 'poste_secu': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), wall(0xf59e0b)); b.position.y = 1.5; b.castShadow = true; grp.add(b);
        break;
      }
      case 'zone_charge': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), wall(0xfde68a)); b.position.y = 0.25; grp.add(b);
        break;
      }
      case 'arbre': {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.4, 7), wall(0x6b4226)); trunk.position.y = 1.2; trunk.castShadow = true; grp.add(trunk);
        const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), new THREE.MeshStandardMaterial({ color: 0x2f7d32, flatShading: true })); foliage.position.y = 3.4; foliage.castShadow = true; grp.add(foliage);
        break;
      }
      case 'haie': {
        const h = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1), new THREE.MeshStandardMaterial({ color: 0x3a7d34, flatShading: true })); h.position.y = 0.6; h.castShadow = true; grp.add(h);
        break;
      }
      case 'lampadaire': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6, 8), wall(0x555a60)); pole.position.y = 3; grp.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), wall(0x333)); head.position.set(0.6, 6, 0); grp.add(head);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffe27a, emissiveIntensity: 1 })); bulb.position.set(1.1, 5.9, 0); grp.add(bulb);
        const light = new THREE.PointLight(0xffe9a8, 0, 16); light.position.set(1.1, 5.9, 0); grp.add(light);
        grp.userData.lamp = light; grp.userData.bulb = bulb;
        break;
      }
      case 'parking': {
        const m = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x3a3d42 })); m.position.y = 0.05; grp.add(m); break;
      }
      case 'route': {
        const m = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0x33363b })); m.position.y = 0.05; grp.add(m); break;
      }
      case 'cloture': {
        const m = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.1), new THREE.MeshStandardMaterial({ color: 0x7a8088, metalness: 0.4 })); m.position.y = 1; grp.add(m); break;
      }
      default: {
        const b = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), wall(0x9aa0a6)); b.position.y = 1.5; grp.add(b);
      }
    }
    grp.userData.kind = 'building';
    return grp;
  }

  addBuilding(building) {
    const mesh = this._makeBuildingMesh(building.type);
    mesh.position.set(building.x, 0, building.z);
    mesh.userData.logicId = building.id;
    this.scene.add(mesh);
    this.buildings.set(building.id, mesh);
    if (building.type !== 'route' && building.type !== 'parking') this._spawnPlacePuff(mesh.position);
    return mesh;
  }

  // --- Véhicules visiteurs ----------------------------------------------------
  _makeVehicleMesh(v) {
    const grp = new THREE.Group();
    const col = new THREE.Color(v.color);
    const bodyMat = new THREE.MeshStandardMaterial({ color: col, metalness: 0.5, roughness: 0.4 });
    const cabH = v.h * 0.6;
    // châssis
    const body = new THREE.Mesh(new THREE.BoxGeometry(v.w, v.h * 0.55, v.l), bodyMat);
    body.position.y = v.h * 0.45; body.castShadow = true; grp.add(body);
    // cabine / toit
    const cab = new THREE.Mesh(new THREE.BoxGeometry(v.w * 0.92, cabH, v.l * 0.45),
      new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(1.1), metalness: 0.3, roughness: 0.3 }));
    cab.position.set(0, v.h * 0.45 + cabH / 2, v.l * 0.15); cab.castShadow = true; grp.add(cab);
    // vitres
    const glass = new THREE.Mesh(new THREE.BoxGeometry(v.w * 0.94, cabH * 0.7, v.l * 0.46),
      new THREE.MeshStandardMaterial({ color: 0x1b2a3a, metalness: 0.6, roughness: 0.1 }));
    glass.position.copy(cab.position); glass.position.y += 0.02; glass.scale.set(1.01, 1, 1.01); grp.add(glass);
    // roues
    const wheelGeo = new THREE.CylinderGeometry(v.h * 0.22, v.h * 0.22, 0.3, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wy = v.h * 0.22;
    const xoff = v.w / 2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx * xoff, wy, sz * v.l * 0.32);
      grp.add(wheel);
    }
    // phares
    for (const sx of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xfff7d0, emissive: 0xfff0a0 }));
      h.position.set(sx * v.w * 0.3, v.h * 0.4, v.l / 2); grp.add(h);
    }
    grp.userData.kind = 'vehicle';
    return grp;
  }

  spawnVehicle(visitor, callbacks) {
    const slot = this.parkingSlots.find(s => !s.busy);
    const mesh = this._makeVehicleMesh(visitor.vehicle);
    // point de départ : bas de la route
    const start = new THREE.Vector3(0, 0, GROUND / 2 + 30);
    mesh.position.copy(start);
    this.scene.add(mesh);

    const ent = {
      visitor, mesh, callbacks, state: 'enter',
      slot, t: 0, unloadTimer: 0, callbacks,
      waypoints: [], wpIndex: 0,
    };
    if (slot) {
      slot.busy = true;
      ent.waypoints = [
        new THREE.Vector3(0, 0, GROUND / 2 - 4),
        new THREE.Vector3(slot.pos.x, 0, GROUND / 2 - 4),
        slot.pos.clone(),
      ];
    } else {
      // pas de place : fait demi-tour (visiteur mécontent)
      ent.state = 'leaving';
      ent.waypoints = [start.clone().add(new THREE.Vector3(0, 0, 6))];
      if (callbacks.onRejected) callbacks.onRejected(visitor);
    }
    this.vehicles.push(ent);
    return ent;
  }

  _stepVehicle(ent, dt) {
    const m = ent.mesh;
    const speed = 9; // m/s
    if (ent.state === 'enter' || ent.state === 'leaving' || ent.state === 'exit') {
      const target = ent.waypoints[ent.wpIndex];
      if (!target) {
        if (ent.state === 'enter') { ent.state = 'unload'; ent.unloadTimer = 2.5 + Math.random() * 2; }
        else { this._despawn(ent); }
        return;
      }
      const dir = target.clone().sub(m.position); dir.y = 0;
      const dist = dir.length();
      if (dist < 0.4) { ent.wpIndex++; return; }
      dir.normalize();
      m.position.addScaledVector(dir, Math.min(speed * dt, dist));
      const targetAngle = Math.atan2(dir.x, dir.z);
      m.rotation.y += this._angleLerp(m.rotation.y, targetAngle) * Math.min(1, dt * 6);
      // rotation des roues : visuel léger
    } else if (ent.state === 'unload') {
      ent.unloadTimer -= dt;
      // petite secousse de déchargement
      m.position.y = Math.sin(performance.now() / 90) * 0.04;
      if (ent.unloadTimer <= 0) {
        m.position.y = 0;
        if (ent.callbacks.onUnload) ent.callbacks.onUnload(ent.visitor);
        this._spawnDropPile(m.position, ent.visitor);
        ent.state = 'exit';
        ent.wpIndex = 0;
        ent.waypoints = [
          new THREE.Vector3(m.position.x, 0, GROUND / 2 - 4),
          new THREE.Vector3(0, 0, GROUND / 2 - 4),
          new THREE.Vector3(0, 0, GROUND / 2 + 30),
        ];
        if (ent.slot) ent.slot.busy = false;
      }
    }
  }

  _angleLerp(a, b) {
    let diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  _despawn(ent) {
    this.scene.remove(ent.mesh);
    if (ent.slot) ent.slot.busy = false;
    if (ent.callbacks.onLeave) ent.callbacks.onLeave(ent.visitor);
    this.vehicles = this.vehicles.filter(v => v !== ent);
  }

  // --- Petits effets ----------------------------------------------------------
  _spawnDropPile(pos, visitor) {
    const c = visitor.cargo[0];
    const col = new THREE.Color(0x886644);
    const pile = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), new THREE.MeshStandardMaterial({ color: col, flatShading: true }));
    pile.position.set(pos.x + (Math.random() - 0.5) * 2, 0.3, pos.z - 2);
    pile.castShadow = true; this.scene.add(pile);
    setTimeout(() => this.scene.remove(pile), 4000);
  }

  _spawnPlacePuff(pos) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    puff.position.copy(pos); puff.position.y = 1;
    this.scene.add(puff);
    const start = performance.now();
    const anim = () => {
      const k = (performance.now() - start) / 500;
      if (k >= 1) { this.scene.remove(puff); return; }
      puff.scale.setScalar(1 + k * 2); puff.material.opacity = 0.5 * (1 - k);
      requestAnimationFrame(anim);
    };
    anim();
  }

  spawnFire(pos) {
    const grp = new THREE.Group();
    const light = new THREE.PointLight(0xff6622, 3, 20); light.position.set(0, 3, 0); grp.add(light);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff8800 : 0xffcc00 }));
      f.position.set((Math.random() - 0.5) * 2, 1 + Math.random(), (Math.random() - 0.5) * 2);
      grp.add(f);
    }
    grp.position.copy(pos);
    grp.userData.expire = performance.now() + 6000;
    this.scene.add(grp); this.smoke.push(grp);
  }

  // --- Sprite texte (étiquette de conteneur) ---------------------------------
  _makeLabelSprite(text) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; this._roundRect(ctx, 0, 0, 256, 64, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 16), 128, 34);
    const tex = new THREE.CanvasTexture(cv);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    spr.scale.set(4, 1, 1);
    return spr;
  }
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // ===========================================================================
  //  CYCLE JOUR/NUIT & MÉTÉO
  // ===========================================================================
  setTimeOfDay(hour, weatherMod = 1) {
    // position du soleil sur un arc
    const t = (hour - 6) / 12; // 0 au lever (6h), 1 au coucher (18h)
    const angle = Math.PI * Math.max(0, Math.min(1, t));
    const elev = Math.sin(angle);
    this.sun.position.set(Math.cos(angle) * 60, Math.max(2, elev * 70), 20);
    const isNight = hour < 6.5 || hour > 19.5;
    const dayK = Math.max(0, Math.min(1, elev)) * weatherMod;
    this.sun.intensity = isNight ? 0.05 : 0.4 + dayK * 1.2;
    this.hemi.intensity = isNight ? 0.18 : 0.5 + dayK * 0.5;
    this.ambient.intensity = isNight ? 0.08 : 0.2;
    // couleur du ciel
    const sky = new THREE.Color();
    if (isNight) sky.setHSL(0.62, 0.5, 0.08);
    else {
      const warm = (hour < 8 || hour > 17) ? 1 : 0;
      sky.setHSL(0.58 - warm * 0.06, 0.5, (0.35 + dayK * 0.35));
    }
    this.scene.background.lerp(sky, 0.1);
    if (this.scene.fog) this.scene.fog.color.copy(this.scene.background);
    this.sun.color.setHSL(0.1, 0.6, isNight ? 0.4 : 0.55 + (hour < 8 || hour > 17 ? -0.1 : 0.1));
    this._night = isNight;
  }

  setWeather(weatherId) {
    this._weather = weatherId;
    this.rain.visible = (weatherId === 'pluie' || weatherId === 'orage');
    this.snow.visible = (weatherId === 'neige');
    const fogNear = { brouillard: 25, pluie: 55, orage: 40, neige: 45 }[weatherId] || 90;
    if (this.scene.fog) this.scene.fog.near = fogNear;
  }

  _stepWeather(dt) {
    const fall = (pts, speed) => {
      if (!pts.visible) return;
      const arr = pts.geometry.attributes.position.array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] -= speed * dt;
        if (arr[i] < 0) arr[i] = 55;
      }
      pts.geometry.attributes.position.needsUpdate = true;
    };
    fall(this.rain, 40); fall(this.snow, 8);
  }

  // Allume/éteint les lampadaires selon la nuit
  _updateLamps() {
    this.buildings.forEach(mesh => {
      if (mesh.userData.lamp) {
        mesh.userData.lamp.intensity = this._night ? 1.6 : 0;
        mesh.userData.bulb.material.emissiveIntensity = this._night ? 1.4 : 0.2;
      }
    });
  }

  // ===========================================================================
  //  INTERACTION (raycast)
  // ===========================================================================
  raycastContainers(clientX, clientY) {
    const ray = this._ray(clientX, clientY);
    const meshes = [...this.containers.values()];
    const hits = ray.intersectObjects(meshes, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.logicId) o = o.parent;
      return o ? o.userData.logicId : null;
    }
    return null;
  }

  raycastGround(clientX, clientY) {
    const ray = this._ray(clientX, clientY);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const pt = new THREE.Vector3();
    if (ray.ray.intersectPlane(plane, pt)) {
      // accroche à la grille
      pt.x = Math.round(pt.x / TILE) * TILE;
      pt.z = Math.round(pt.z / TILE) * TILE;
      return pt;
    }
    return null;
  }

  _ray(clientX, clientY) {
    const rc = new THREE.Raycaster();
    const ndc = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
    rc.setFromCamera(ndc, this.camera);
    return rc;
  }

  setGhost(type, pos) {
    if (!this._ghost) {
      this._ghost = new THREE.Mesh(new THREE.BoxGeometry(TILE, 2, TILE),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.35 }));
      this.scene.add(this._ghost);
    }
    if (pos) { this._ghost.visible = true; this._ghost.position.set(pos.x, 1, pos.z); }
    else this._ghost.visible = false;
  }

  clearGhost() { if (this._ghost) this._ghost.visible = false; }

  // ===========================================================================
  //  BOUCLE
  // ===========================================================================
  update(dt) {
    this.controls.update();
    for (const ent of [...this.vehicles]) this._stepVehicle(ent, dt);
    this._stepWeather(dt);
    this._updateLamps();
    // conteneurs pleins : pulsation
    const pulse = 1 + Math.sin(performance.now() / 200) * 0.04;
    this.containers.forEach(mesh => { if (mesh.userData.full) mesh.scale.y = pulse; else mesh.scale.y = 1; });
    // feux
    const now = performance.now();
    for (const s of [...this.smoke]) {
      s.children.forEach(c => { if (c.scale) c.position.y += dt * 0.5; });
      if (s.userData.expire < now) { this.scene.remove(s); this.smoke = this.smoke.filter(x => x !== s); }
    }
  }

  render() { this.renderer.render(this.scene, this.camera); }

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
