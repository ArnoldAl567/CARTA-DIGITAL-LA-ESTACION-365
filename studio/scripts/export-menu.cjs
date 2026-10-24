const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const sourcePath = path.resolve(__dirname, '../../src/app/data/menu.data.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText
const context = {exports: {}}
vm.runInNewContext(compiled, context, {filename: sourcePath})
const {CATEGORIES, PRODUCTS} = context.exports

const dailySourcePath = path.resolve(__dirname, '../../src/app/data/daily-menu.data.ts')
const dailyCompiled = ts.transpileModule(fs.readFileSync(dailySourcePath, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText
const dailyContext = {exports: {}}
vm.runInNewContext(dailyCompiled, dailyContext, {filename: dailySourcePath})
const {DAILY_STARTERS, DAILY_MAINS} = dailyContext.exports

const categories = CATEGORIES.map((category, index) => ({
  _id: category.id,
  _type: 'menuCategory',
  name: category.name,
  shortName: category.shortName,
  description: category.description,
  sortOrder: index,
  active: category.active !== false,
}))

const products = PRODUCTS.map((product, index) => ({
  _id: product.id,
  _type: 'menuProduct',
  name: product.name,
  category: {_type: 'reference', _ref: product.categoryId},
  price: product.price,
  ...(product.description ? {description: product.description} : {}),
  ...(product.image ? {fallbackImage: `/${product.image.replace(/^\/+/, '')}`} : {}),
  imageAlt: product.imageAlt || product.name,
  featured: product.featured === true,
  ...(product.badge ? {badge: product.badge} : {}),
  sortOrder: index,
  active: product.active !== false,
}))

const dailyDishes = [
  ...DAILY_STARTERS.map((dish, index) => ({_id: `daily-starter-${dish.id}`, _type: 'dailyMenuDish', key: dish.id, name: dish.name, course: 'starter', sortOrder: index, active: true})),
  ...DAILY_MAINS.map((dish, index) => ({_id: `daily-main-${dish.id}`, _type: 'dailyMenuDish', key: dish.id, name: dish.name, course: 'main', price: dish.price, sortOrder: index, active: true})),
]

const documents = [...categories, ...products, ...dailyDishes, {_id: 'menuSettings', _type: 'menuSettings', initialized: true}]
const outputPath = path.resolve(__dirname, '../seed/menu.ndjson')
fs.mkdirSync(path.dirname(outputPath), {recursive: true})
fs.writeFileSync(outputPath, `${documents.map(doc => JSON.stringify(doc)).join('\n')}\n`)
console.log(`Exportados ${categories.length} categorías, ${products.length} productos y ${dailyDishes.length} opciones del menú del día a ${outputPath}`)
