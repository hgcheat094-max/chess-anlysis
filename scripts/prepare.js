// Copies the Lite and Full single-thread Stockfish builds from node_modules into dist/engines
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), pkgDir = path.join(root, 'node_modules', 'stockfish'), out = path.join(root, 'dist');
if (!fs.existsSync(pkgDir)) { console.error('Run "npm install" first.'); process.exit(1); }
const ver = require(path.join(pkgDir, 'package.json')).version;
const walk = (d, o = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, o); } else o.push(p); } return o; };
const wasmEngines = walk(pkgDir).filter(f => f.endsWith('.js') && fs.existsSync(f.replace(/\.js$/, '.wasm')));
const single = wasmEngines.filter(f => /single/i.test(path.basename(f)));
const pool = single.length ? single : wasmEngines;
const lite = pool.find(f => /lite/i.test(path.basename(f)));
const full = pool.find(f => !/lite/i.test(path.basename(f)));
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'engines'), { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
const manifest = {};
for (const [key, file, name] of [['lite', lite, 'Lite'], ['full', full, 'Full']]) {
  if (!file) continue;
  const base = path.basename(file, '.js');
  fs.copyFileSync(file, path.join(out, 'engines', base + '.js'));
  fs.copyFileSync(file.replace(/\.js$/, '.wasm'), path.join(out, 'engines', base + '.wasm'));
  manifest[key] = { label: 'Stockfish ' + ver + ' ' + name, js: base + '.js' };
}
fs.writeFileSync(path.join(out, 'engines', 'engines.json'), JSON.stringify(manifest, null, 2));
console.log('Engines ready:', Object.keys(manifest).join(', ') || 'none (Classic only)');
