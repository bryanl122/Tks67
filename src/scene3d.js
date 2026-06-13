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
    this.emptyAnims = [];          // séquences de vidage (camion ampliroll)
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

    // Dalle bétonnée du parc (épaisseur) + surface texturée
    const slab = new THREE.Mesh(new THREE.BoxGeometry(GROUND, 0.4, GROUND), new THREE.MeshStandardMaterial({ color: 0x6f7378, roughness: 0.95 }));
    slab.position.y = -0.2; slab.receiveShadow = true;
    this.scene.add(slab); this.slab = slab;
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(GROUND, GROUND),
      new THREE.MeshStandardMaterial({ map: this._concreteTexture(), roughness: 0.95, metalness: 0.02 }));
    surface.rotation.x = -Math.PI / 2; surface.position.y = 0.011; surface.receiveShadow = true;
    this.scene.add(surface);

    // Grille de placement discrète
    const grid = new THREE.GridHelper(GROUND, GROUND / TILE, 0xffffff, 0xb8bcc2);
    grid.material.opacity = 0.06; grid.material.transparent = true;
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

    // Détails de site : plots le long de la voie, cônes, panneau d'accueil
    for (let z = GROUND / 2 - 10; z < GROUND / 2 + 16; z += 4) {
      for (const sx of [-1, 1]) { const b = this._makeBuildingMesh('bollard'); b.position.set(sx * 5.2, 0, z); this.scene.add(b); }
    }
    [['cone', -6, GROUND / 2 - 3], ['cone', 6, GROUND / 2 - 3], ['cone', -3, GROUND / 2 - 9], ['cone', 3, GROUND / 2 - 9]]
      .forEach(([t, x, z]) => { const m = this._makeBuildingMesh(t); m.position.set(x, 0, z); this.scene.add(m); });
    const sign = this._makeBuildingMesh('panneau'); sign.position.set(-12, 0, GROUND / 2 - 13); sign.rotation.y = 0.4; this.scene.add(sign);

    // Quai surélevé fixe (mur de soutènement) au fond du parc, comme en recyparc :
    // les usagers s'y garent en hauteur et basculent leurs déchets dans les bennes.
    for (let x = -16; x <= 16; x += 8) {
      const q = this._makeBuildingMesh('quai'); q.position.set(x, 0, -GROUND / 2 + 8); q.rotation.y = Math.PI; this.scene.add(q);
    }
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
  // Benne roll-off (conteneur ampliroll) à toit ouvert, façon recyparc belge.
  _makeContainerMesh(fraction) {
    const grp = new THREE.Group();
    const base = new THREE.Color((FRACTIONS[fraction] && FRACTIONS[fraction].color) || '#2f6b3a');
    // teinte « acier peint » : couleur de fraction franche, juste assombrie
    const steel = base.clone().multiplyScalar(0.88);
    const mat = new THREE.MeshStandardMaterial({ color: steel, metalness: 0.55, roughness: 0.5 });
    const dark = new THREE.MeshStandardMaterial({ color: steel.clone().multiplyScalar(0.72), metalness: 0.55, roughness: 0.55 });
    const black = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.5, roughness: 0.6 });

    const L = 4.8, W = 2.4, H = 2.0, FY = 0.5, t = 0.12;
    // plancher
    const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, W), dark);
    floor.position.y = FY; floor.receiveShadow = true; grp.add(floor);
    // parois longues texturées (tôle ondulée + bande réfléchissante + nom + rouille)
    const sideTex = this._skipTexture('#' + base.getHexString(), FRACTIONS[fraction] ? FRACTIONS[fraction].name : fraction);
    const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, metalness: 0.5, roughness: 0.55 });
    for (const sz of [-1, 1]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(L, H, t), sideMat);
      s.position.set(0, FY + H / 2, sz * (W / 2 - t / 2)); s.castShadow = true; s.receiveShadow = true; grp.add(s);
    }
    // parois courtes (acier peint uni)
    for (const sx of [-1, 1]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(t, H, W), mat);
      s.position.set(sx * (L / 2 - t / 2), FY + H / 2, 0); s.castShadow = true; grp.add(s);
    }
    // rebord supérieur (4 barres) — laisse le dessus ouvert
    for (const sz of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(L + 0.12, 0.14, 0.16), black); r.position.set(0, FY + H, sz * (W / 2)); grp.add(r); }
    for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, W + 0.12), black); r.position.set(sx * (L / 2), FY + H, 0); grp.add(r); }
    // barre + crochet d'ampliroll à l'avant (+X)
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.3, 0.16), black); bar.position.set(L / 2 + 0.12, FY + H * 0.45, 0); grp.add(bar);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 10, Math.PI), black); hook.rotation.x = Math.PI / 2; hook.position.set(L / 2 + 0.12, FY + H * 0.45 + 0.65, 0); grp.add(hook);
    // galets/roues arrière (-X) caractéristiques du roll-off
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, W * 0.9, 12), black);
    roller.rotation.x = Math.PI / 2; roller.position.set(-L / 2 + 0.4, 0.26, 0); grp.add(roller);
    // matière à l'intérieur (jauge de remplissage, visible par le dessus ouvert)
    const fill = new THREE.Mesh(new THREE.BoxGeometry(L - 0.4, 1, W - 0.4),
      new THREE.MeshStandardMaterial({ color: base.clone().multiplyScalar(0.85), roughness: 1, flatShading: true }));
    fill.position.y = FY + 0.1; fill.scale.y = 0.02; grp.add(fill);
    grp.userData.fill = fill;
    // bandeau d'identification (panneau réfléchissant) sur la paroi avant
    const label = this._makeLabelSprite(FRACTIONS[fraction] ? FRACTIONS[fraction].name : fraction);
    label.position.set(0, FY + H + 0.7, 0); grp.add(label);
    // gyrophare « plein » (clignote quand saturé)
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff0000, emissiveIntensity: 0 }));
    beacon.position.set(L / 2 - 0.3, FY + H + 0.16, W / 2 - 0.3); grp.add(beacon);
    grp.userData.beacon = beacon;
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
    fill.scale.y = Math.max(0.02, ratio * 1.8);
    fill.position.y = 0.58 + fill.scale.y / 2;
    // gyrophare « plein »
    mesh.userData.full = ratio >= 0.98;
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
      case 'cone': {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 16), new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.5 })); c.position.y = 0.6; c.castShadow = true; grp.add(c);
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xffffff })); band.position.y = 0.55; grp.add(band);
        const baseP = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.66), new THREE.MeshStandardMaterial({ color: 0xdd5500 })); baseP.position.y = 0.04; grp.add(baseP); break;
      }
      case 'bollard': {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.0, 12), new THREE.MeshStandardMaterial({ color: 0xd11a1a, metalness: 0.3 })); p.position.y = 0.5; p.castShadow = true; grp.add(p);
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xffffff })); ring.position.y = 0.82; grp.add(ring); break;
      }
      case 'panneau': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), wall(0x9aa0a6)); pole.position.y = 1.2; pole.castShadow = true; grp.add(pole);
        const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.08), new THREE.MeshStandardMaterial({ color: 0x1463c2 })); board.position.set(0, 2.2, 0); board.castShadow = true; grp.add(board);
        const lbl = this._makeLabelSprite('TRI DES DÉCHETS'); lbl.position.set(0, 2.2, 0.1); lbl.scale.set(2.0, 0.5, 1); grp.add(lbl); break;
      }
      case 'rambarde': {
        const m = new THREE.MeshStandardMaterial({ color: 0xf4c20d, metalness: 0.3, roughness: 0.6 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 0.1), m); top.position.y = 1.05; top.castShadow = true; grp.add(top);
        const mid = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 0.08), m); mid.position.y = 0.62; grp.add(mid);
        for (const px of [-1, -0.33, 0.33, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.15, 0.1), m); p.position.set(px * 2, 0.55, 0); grp.add(p); } break;
      }
      case 'quai': {
        // Quai surélevé : plateforme béton + mur de soutènement + garde-corps (côté +Z)
        const concrete = new THREE.MeshStandardMaterial({ color: 0x9a9ea3, roughness: 0.95 });
        const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 1.6, 4), concrete);
        plat.position.set(0, 0.8, -2); plat.castShadow = true; plat.receiveShadow = true; grp.add(plat);
        // bordure jaune anti-chute au bord avant (+Z)
        const kerb = new THREE.Mesh(new THREE.BoxGeometry(8, 0.18, 0.4), new THREE.MeshStandardMaterial({ color: 0xf4c20d })); kerb.position.set(0, 1.6, 0); grp.add(kerb);
        // garde-corps le long du bord avant
        const m = new THREE.MeshStandardMaterial({ color: 0xf4c20d, metalness: 0.3, roughness: 0.6 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.1), m); top.position.set(0, 2.7, 0); top.castShadow = true; grp.add(top);
        const mid = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.08), m); mid.position.set(0, 2.2, 0); grp.add(mid);
        for (const px of [-1, -0.5, 0, 0.5, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), m); p.position.set(px * 3.8, 2.1, 0); p.castShadow = true; grp.add(p); }
        break;
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
  // Véhicules procéduraux réalistes (berline, break, camionnette, camion, remorque).
  // L'avant du véhicule pointe vers +Z (sens de marche).
  _makeVehicleMesh(v) {
    const grp = new THREE.Group();
    const col = new THREE.Color(v.color);
    const paint = new THREE.MeshStandardMaterial({ color: col, metalness: 0.55, roughness: 0.32 });
    const paint2 = new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(0.92), metalness: 0.55, roughness: 0.32 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x0d1722, metalness: 0.9, roughness: 0.08 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.7, metalness: 0.3 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xccd2d8, metalness: 0.9, roughness: 0.25 });
    const lightF = new THREE.MeshStandardMaterial({ color: 0xfff6d5, emissive: 0xfff0b0, emissiveIntensity: 0.85 });
    const lightR = new THREE.MeshStandardMaterial({ color: 0x6e0d0d, emissive: 0xff2222, emissiveIntensity: 0.55 });
    const green = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, metalness: 0.5, roughness: 0.6 });

    const W = v.w, L = v.l, H = v.h;
    const wheelR = Math.max(0.3, H * 0.21);
    let cl = L, cz = 0; // longueur/centre de la caisse (modifiables pour la remorque)

    const addWheel = (x, z, r = wheelR) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.32, 16), trim);
      tire.rotation.z = Math.PI / 2; tire.position.set(x, r, z); tire.castShadow = true; grp.add(tire);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.34, 8), chrome);
      hub.rotation.z = Math.PI / 2; hub.position.set(x, r, z); grp.add(hub);
    };
    const addLights = (frontZ, backZ) => {
      for (const sx of [-1, 1]) {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.07), lightF); hl.position.set(sx * W * 0.32, wheelR + 0.28, frontZ); grp.add(hl);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.07), lightR); tl.position.set(sx * W * 0.32, wheelR + 0.32, backZ); grp.add(tl);
      }
    };

    const buildCar = (wagon) => {
      const bH = 0.5, bY = wheelR + 0.04;
      const lower = new THREE.Mesh(new THREE.BoxGeometry(W, bH, cl * 0.98), paint);
      lower.position.set(0, bY + bH / 2, cz); lower.castShadow = true; grp.add(lower);
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(W * 1.01, 0.18, cl * 0.99), trim);
      skirt.position.set(0, bY, cz); grp.add(skirt);
      const cabL = wagon ? cl * 0.55 : cl * 0.44;
      const cabZ = cz + (wagon ? -cl * 0.02 : -cl * 0.05);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.46, cabL), paint2);
      cab.position.set(0, bY + bH + 0.22, cabZ); cab.castShadow = true; grp.add(cab);
      const gb = new THREE.Mesh(new THREE.BoxGeometry(W * 0.93, 0.34, cabL * 0.95), glass);
      gb.position.set(0, bY + bH + 0.22, cabZ); grp.add(gb);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(W * 0.82, 0.1, cabL * 0.9), paint2);
      roof.position.set(0, bY + bH + 0.46, cabZ); grp.add(roof);
      for (const sz of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(W * 0.98, 0.2, 0.16), trim); b.position.set(0, bY + 0.04, cz + sz * cl * 0.49); grp.add(b); }
      addWheel(W / 2 - 0.04, cz + cl * 0.3); addWheel(-W / 2 + 0.04, cz + cl * 0.3);
      addWheel(W / 2 - 0.04, cz - cl * 0.3); addWheel(-W / 2 + 0.04, cz - cl * 0.3);
      addLights(cz + cl * 0.49, cz - cl * 0.49);
    };

    const buildVan = () => {
      const bY = wheelR + 0.02;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.6, L * 0.3), paint);
      cab.position.set(0, bY + H * 0.3, L * 0.33); cab.castShadow = true; grp.add(cab);
      const ws = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, H * 0.32, 0.08), glass);
      ws.position.set(0, bY + H * 0.4, L * 0.48); grp.add(ws);
      for (const sx of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.06, H * 0.26, L * 0.22), glass); sw.position.set(sx * W * 0.5, bY + H * 0.4, L * 0.34); grp.add(sw); }
      const box = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.92, L * 0.64), paint2);
      box.position.set(0, bY + H * 0.46, -L * 0.12); box.castShadow = true; grp.add(box);
      const door = new THREE.Mesh(new THREE.BoxGeometry(W * 0.97, H * 0.86, 0.05), trim);
      door.position.set(0, bY + H * 0.46, -L * 0.44); grp.add(door);
      addWheel(W / 2 - 0.04, L * 0.3); addWheel(-W / 2 + 0.04, L * 0.3);
      addWheel(W / 2 - 0.04, -L * 0.3); addWheel(-W / 2 + 0.04, -L * 0.3);
      addLights(L * 0.49, -L * 0.46);
    };

    const buildTruck = () => {
      const bY = wheelR + 0.12;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.66, L * 0.24), paint);
      cab.position.set(0, bY + H * 0.33, L * 0.36); cab.castShadow = true; grp.add(cab);
      const ws = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, H * 0.36, 0.08), glass);
      ws.position.set(0, bY + H * 0.42, L * 0.48); grp.add(ws);
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.22, L * 0.72), trim);
      chassis.position.set(0, bY - 0.02, -L * 0.1); grp.add(chassis);
      // benne verte transportée (ampliroll)
      const skip = new THREE.Mesh(new THREE.BoxGeometry(W * 0.92, H * 0.5, L * 0.6), green);
      skip.position.set(0, bY + H * 0.32, -L * 0.12); skip.castShadow = true; grp.add(skip);
      for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, H * 0.46, 0.05), new THREE.MeshStandardMaterial({ color: 0x244f2c })); r.position.set(-W * 0.4 + i * (W * 0.8 / 5), bY + H * 0.32, L * 0.18); grp.add(r); }
      addWheel(W / 2 - 0.04, L * 0.34); addWheel(-W / 2 + 0.04, L * 0.34);
      addWheel(W / 2 - 0.04, -L * 0.16); addWheel(-W / 2 + 0.04, -L * 0.16);
      addWheel(W / 2 - 0.04, -L * 0.34); addWheel(-W / 2 + 0.04, -L * 0.34);
      addLights(L * 0.48, -L * 0.46);
    };

    const buildCarTrailer = () => {
      cl = 3.5; cz = L * 0.28; buildCar(false);
      const tz = -L * 0.27, tW = W * 0.95;
      const bed = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.18, L * 0.46), trim); bed.position.set(0, wheelR + 0.14, tz); bed.castShadow = true; grp.add(bed);
      for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, L * 0.46), paint2); side.position.set(sx * tW * 0.5, wheelR + 0.37, tz); grp.add(side); }
      const f = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.42, 0.07), paint2); f.position.set(0, wheelR + 0.37, tz + L * 0.23); grp.add(f);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.42, 0.07), paint2); bk.position.set(0, wheelR + 0.37, tz - L * 0.23); grp.add(bk);
      const tow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, L * 0.18), chrome); tow.position.set(0, wheelR + 0.06, tz + L * 0.33); grp.add(tow);
      addWheel(W / 2 - 0.08, tz, wheelR * 0.85); addWheel(-W / 2 + 0.08, tz, wheelR * 0.85);
    };

    switch (v.id) {
      case 'break': buildCar(true); break;
      case 'utilitaire': case 'camionnette': buildVan(); break;
      case 'camion': buildTruck(); break;
      case 'remorque': buildCarTrailer(); break;
      case 'voiture': default: buildCar(false);
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
        if (ent.state === 'enter') { ent.state = 'unload'; ent.unloadTimer = 2.5 + Math.random() * 2; this._spawnVisitorCharacter(ent); }
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
      // animation du personnage : il jette ses déchets (bras qui balancent)
      if (ent.character) {
        const a = performance.now() / 130;
        ent.character.userData.arms.forEach((arm, i) => { arm.rotation.x = -0.4 + Math.sin(a + i * Math.PI) * 1.3; });
        ent.character.position.y = Math.abs(Math.sin(a)) * 0.04;
      }
      if (ent.unloadTimer <= 0) {
        m.position.y = 0;
        if (ent.character) { this.scene.remove(ent.character); ent.character = null; }
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
    if (ent.character) { this.scene.remove(ent.character); ent.character = null; }
    if (ent.slot) ent.slot.busy = false;
    if (ent.callbacks.onLeave) ent.callbacks.onLeave(ent.visitor);
    this.vehicles = this.vehicles.filter(v => v !== ent);
  }

  // Petit personnage bas-poly (visiteur qui décharge à côté de son véhicule)
  _spawnVisitorCharacter(ent) {
    const g = this._makeCharacter();
    const p = ent.mesh.position;
    g.position.set(p.x + (ent.visitor.vehicle.w / 2 + 0.8), 0, p.z - 0.5);
    this.scene.add(g);
    ent.character = g;
  }

  _makeCharacter() {
    const g = new THREE.Group();
    const cloth = new THREE.Color().setHSL(Math.random(), 0.5, 0.45);
    const shirt = new THREE.MeshStandardMaterial({ color: cloth });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2a3550 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xe0b48c });
    const hairCols = [0x3b2a1a, 0x111111, 0x6b4226, 0x999999];
    const hair = new THREE.MeshStandardMaterial({ color: hairCols[Math.floor(Math.random() * hairCols.length)] });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.26), shirt); torso.position.y = 1.05; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), skin); head.position.y = 1.46; head.castShadow = true; g.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.165, 10, 10, 0, 7, 0, 1.3), hair); cap.position.y = 1.48; g.add(cap);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.18), pants); legL.position.set(-0.1, 0.46, 0); legL.castShadow = true; g.add(legL);
    const legR = legL.clone(); legR.position.x = 0.1; g.add(legR);
    const armGeo = new THREE.BoxGeometry(0.12, 0.52, 0.12); armGeo.translate(0, -0.26, 0);
    const armL = new THREE.Mesh(armGeo, shirt); armL.position.set(-0.27, 1.28, 0); g.add(armL);
    const armR = new THREE.Mesh(armGeo.clone(), shirt); armR.position.set(0.27, 1.28, 0); g.add(armR);
    g.userData.arms = [armL, armR];
    return g;
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

  // --- Camion ampliroll de service (bras articulé) qui vient vider une benne --
  _makeServiceTruck() {
    const grp = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.4 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.7, metalness: 0.3 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xccd2d8, metalness: 0.9, roughness: 0.25 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x0d1722, metalness: 0.9, roughness: 0.08 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x333a44, metalness: 0.6, roughness: 0.5 });
    const W = 2.5, L = 8, H = 3.0, r = 0.7;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.66, L * 0.22), paint); cab.position.set(0, r + H * 0.33, L * 0.36); cab.castShadow = true; grp.add(cab);
    const ws = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, H * 0.34, 0.08), glass); ws.position.set(0, r + H * 0.45, L * 0.46); grp.add(ws);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.3, L * 0.72), trim); chassis.position.set(0, r, -L * 0.08); grp.add(chassis);
    // bras ampliroll articulé (pivote autour de l'arrière du châssis)
    const arm = new THREE.Group();
    const a1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, L * 0.5), steel); a1.position.set(0, 0, L * 0.2); arm.add(a1);
    const a2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.7, 0.2), steel); a2.position.set(0, 0.85, L * 0.42); arm.add(a2);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 10, Math.PI), chrome); hook.rotation.x = Math.PI / 2; hook.position.set(0, 1.6, L * 0.42); arm.add(hook);
    arm.position.set(0, r + 0.35, -L * 0.32); grp.add(arm); grp.userData.arm = arm;
    const addWheel = (x, z) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.34, 16), trim); t.rotation.z = Math.PI / 2; t.position.set(x, r, z); t.castShadow = true; grp.add(t);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.36, 8), chrome); h.rotation.z = Math.PI / 2; h.position.set(x, r, z); grp.add(h);
    };
    for (const z of [L * 0.34, -L * 0.16, -L * 0.34]) { addWheel(W / 2 - 0.05, z); addWheel(-W / 2 + 0.05, z); }
    for (const sx of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.07), new THREE.MeshStandardMaterial({ color: 0xfff6d5, emissive: 0xfff0b0, emissiveIntensity: 0.8 })); hl.position.set(sx * W * 0.32, r + 0.3, L * 0.47); grp.add(hl); }
    // gyrophare orange
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff7700, emissiveIntensity: 1 }));
    beacon.position.set(0, r + H * 0.66, L * 0.28); grp.add(beacon);
    grp.userData.kind = 'service';
    return grp;
  }

  // Lance la séquence : un camion arrive, lève son bras, bascule la benne, repart.
  playEmptyAnimation(containerId) {
    const cont = this.containers.get(containerId);
    if (!cont) return;
    if (this.emptyAnims.some(a => a.containerId === containerId)) return;
    const truck = this._makeServiceTruck();
    truck.position.set(0, 0, GROUND / 2 + 30);
    this.scene.add(truck);
    // se gare côté crochet de la benne (-X), face à elle
    const target = new THREE.Vector3(cont.position.x - 6.5, 0, cont.position.z);
    this.emptyAnims.push({ containerId, truck, cont, phase: 'in', t: 0, target, baseRot: cont.rotation.z });
  }

  _stepEmptyAnims(dt) {
    const speed = 13;
    for (const a of [...this.emptyAnims]) {
      const { truck, cont } = a;
      if (a.phase === 'in' || a.phase === 'out') {
        let target = a.phase === 'in' ? a.target : (a.wp && a.wp[a.wi]);
        if (a.phase === 'out' && !target) { this.scene.remove(truck); this.emptyAnims = this.emptyAnims.filter(x => x !== a); continue; }
        const dir = target.clone().sub(truck.position); dir.y = 0; const d = dir.length();
        if (d < 0.6) { if (a.phase === 'in') { a.phase = 'tip'; a.t = 0; } else a.wi++; }
        else { dir.normalize(); truck.position.addScaledVector(dir, Math.min(speed * dt, d)); truck.rotation.y += this._angleLerp(truck.rotation.y, Math.atan2(dir.x, dir.z)) * Math.min(1, dt * 5); }
      } else if (a.phase === 'tip') {
        a.t += dt; const k = Math.min(1, a.t / 1.0);
        cont.rotation.z = a.baseRot - 0.85 * k;
        truck.userData.arm.rotation.x = -0.95 * k;
        if (k >= 1) { a.phase = 'hold'; a.t = 0; this._spawnDropPile(cont.position, { cargo: [{}] }); }
      } else if (a.phase === 'hold') {
        a.t += dt; if (a.t > 0.6) { a.phase = 'untip'; a.t = 0; }
      } else if (a.phase === 'untip') {
        a.t += dt; const k = Math.min(1, a.t / 0.8);
        cont.rotation.z = a.baseRot - 0.85 * (1 - k);
        truck.userData.arm.rotation.x = -0.95 * (1 - k);
        if (k >= 1) {
          cont.rotation.z = a.baseRot; truck.userData.arm.rotation.x = 0;
          a.phase = 'out'; a.wi = 0;
          a.wp = [new THREE.Vector3(truck.position.x, 0, GROUND / 2 - 4), new THREE.Vector3(0, 0, GROUND / 2 - 4), new THREE.Vector3(0, 0, GROUND / 2 + 30)];
        }
      }
    }
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

  // --- Textures procédurales (aucune image externe) --------------------------
  // Tôle de benne : ondulations + bande réfléchissante + nom + rouille/usure.
  _skipTexture(hex, name) {
    this._skipTexCache = this._skipTexCache || {};
    const key = hex + '|' + name;
    if (this._skipTexCache[key]) return this._skipTexCache[key];
    const cv = document.createElement('canvas'); cv.width = 600; cv.height = 250;
    const ctx = cv.getContext('2d');
    const base = new THREE.Color(hex).multiplyScalar(0.9);
    // fond
    ctx.fillStyle = '#' + base.getHexString(); ctx.fillRect(0, 0, 600, 250);
    // ondulations verticales (clair/sombre)
    for (let x = 0; x < 600; x += 14) {
      const g = ctx.createLinearGradient(x, 0, x + 14, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0.0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = g; ctx.fillRect(x, 0, 14, 250);
    }
    // rouille / coulures
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * 600, w = 4 + Math.random() * 10, h = 30 + Math.random() * 120;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(120,60,20,0.45)'); g.addColorStop(1, 'rgba(90,45,15,0)');
      ctx.fillStyle = g; ctx.fillRect(x, Math.random() * 40, w, h);
    }
    // bande réfléchissante hachurée (haut)
    ctx.save();
    ctx.fillStyle = '#f4c20d'; ctx.fillRect(0, 18, 600, 30);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    for (let x = -30; x < 600; x += 40) { ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x + 18, 18); ctx.lineTo(x + 38, 48); ctx.lineTo(x + 20, 48); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // plaque + nom de la fraction
    ctx.fillStyle = 'rgba(10,15,20,0.78)'; this._roundRect(ctx, 150, 95, 300, 70, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♻ ' + name.toUpperCase().slice(0, 14), 300, 132);
    // rivets
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    for (let x = 14; x < 600; x += 28) { ctx.beginPath(); ctx.arc(x, 60, 2.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x, 200, 2.2, 0, 7); ctx.fill(); }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    this._skipTexCache[key] = tex; return tex;
  }

  // Dalle béton : teinte, joints de dilatation, taches, fissures, marquages.
  _concreteTexture() {
    if (this._concreteTex) return this._concreteTex;
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#8d9197'; ctx.fillRect(0, 0, 1024, 1024);
    // grain
    for (let i = 0; i < 26000; i++) {
      const v = Math.random() * 40 - 20;
      ctx.fillStyle = `rgba(${128 + v},${130 + v},${135 + v},0.25)`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
    // taches d'huile
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 1024, y = Math.random() * 1024, r = 20 + Math.random() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(20,20,25,0.5)'); g.addColorStop(1, 'rgba(20,20,25,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    // joints de dilatation
    ctx.strokeStyle = 'rgba(40,42,46,0.7)'; ctx.lineWidth = 4;
    for (let i = 0; i <= 1024; i += 256) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke(); }
    // fissures
    ctx.strokeStyle = 'rgba(30,30,34,0.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) { ctx.beginPath(); let x = Math.random() * 1024, y = Math.random() * 1024; ctx.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (Math.random() - 0.5) * 90; y += (Math.random() - 0.5) * 90; ctx.lineTo(x, y); } ctx.stroke(); }
    // marquages au sol (flèche + lignes effacées)
    ctx.strokeStyle = 'rgba(240,240,240,0.35)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(512, 760); ctx.lineTo(512, 880); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(512, 760); ctx.lineTo(480, 800); ctx.moveTo(512, 760); ctx.lineTo(544, 800); ctx.stroke();
    // bande blanche pointillée
    ctx.fillStyle = 'rgba(240,240,240,0.25)';
    for (let y = 100; y < 400; y += 60) ctx.fillRect(160, y, 12, 34);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3); tex.anisotropy = 4;
    this._concreteTex = tex; return tex;
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
    this._stepEmptyAnims(dt);
    this._stepWeather(dt);
    this._updateLamps();
    // conteneurs pleins : gyrophare clignotant
    const blink = 0.5 + 0.5 * Math.sin(performance.now() / 150);
    this.containers.forEach(mesh => {
      const b = mesh.userData.beacon;
      if (b) b.material.emissiveIntensity = mesh.userData.full ? blink : 0;
    });
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
