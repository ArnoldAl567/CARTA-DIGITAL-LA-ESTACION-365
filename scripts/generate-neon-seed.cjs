const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const cache = new Map();
function load(file) {
  const fullPath = path.resolve(file);
  if (cache.has(fullPath)) return cache.get(fullPath).exports;
  const module = { exports: {} };
  cache.set(fullPath, module);
  const source = fs.readFileSync(fullPath, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (specifier) => {
    if (!specifier.startsWith('.')) throw new Error(`Unexpected dependency: ${specifier}`);
    return load(path.resolve(path.dirname(fullPath), `${specifier}.ts`));
  };
  new Function('require', 'module', 'exports', js)(localRequire, module, module.exports);
  return module.exports;
}

const items = load(path.join(__dirname, '../src/app/data/catalog-seed.ts')).INITIAL_CATALOG;
const quote = (value) => value === null || value === undefined ? 'NULL' :
  typeof value === 'boolean' || typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
const rows = items.map((item) => `(${[
  item.item_key, item.kind, item.source_id, item.category_id, item.name,
  item.price, item.image_url, item.active, item.sort_order,
].map(quote).join(', ')})`);
const sql = `-- Catálogo inicial de La Estación 365. No modifica filas ya editadas.\n` +
  `insert into public.catalog_items (item_key, kind, source_id, category_id, name, price, image_url, active, sort_order) values\n` +
  `${rows.join(',\n')}\non conflict (item_key) do nothing;\n`;
fs.writeFileSync(path.join(__dirname, '../neon/seed.sql'), sql);
console.log(`Generated ${items.length} catalog entries.`);
