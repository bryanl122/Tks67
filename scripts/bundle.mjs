// =============================================================================
//  bundle.mjs — Génère un fichier HTML 100 % autonome (jouable hors-ligne).
//  Tout (Three.js, addons, modules du jeu, CSS) est embarqué en data-URL, donc
//  aucun serveur ni connexion n'est requis : il suffit d'ouvrir le .html.
// =============================================================================
import { readFileSync, writeFileSync } from 'fs';

const root = new URL('..', import.meta.url).pathname;
const read = p => readFileSync(root + p, 'utf8');
const b64 = s => Buffer.from(s, 'utf8').toString('base64');
const dataUrl = s => 'data:text/javascript;base64,' + b64(s);

// Réécrit les imports relatifs './x.js' en specifiers 'app/x.js' (mappés plus bas)
const rewrite = src => src.replace(/from\s+'\.\/([\w.-]+)'/g, "from 'app/$1'");

const APP_MODULES = ['data.js', 'i18n.js', 'state.js', 'systems.js', 'audio.js', 'scene3d.js', 'ui.js', 'game.js'];

const imports = {
  three: dataUrl(read('vendor/three/three.module.js')),
  'three/addons/controls/OrbitControls.js': dataUrl(read('vendor/three/jsm/controls/OrbitControls.js')),
  'three/addons/environments/RoomEnvironment.js': dataUrl(read('vendor/three/jsm/environments/RoomEnvironment.js')),
};
for (const m of APP_MODULES) imports['app/' + m] = dataUrl(rewrite(read('src/' + m)));

const css = read('css/styles.css');

// On part de l'index.html et on remplace le <link> CSS, l'importmap et le <script> d'entrée.
let html = read('index.html');
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>\n${css}\n</style>`);
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, `<script type="importmap">\n${JSON.stringify({ imports }, null, 0)}\n</script>`);
html = html.replace(/<script type="module" src="\.\/src\/game\.js"><\/script>/, `<script type="module">import 'app/game.js';</script>`);

writeFileSync(root + 'ecoparc.html', html);
const mb = (Buffer.byteLength(html) / 1048576).toFixed(2);
console.log(`ecoparc.html généré (${mb} Mo) — ouvrable hors-ligne.`);
