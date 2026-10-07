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

const documents = [...categories, ...products, {_id: 'menuSettings', _type: 'menuSettings', initialized: true}]
const outputPath = path.resolve(__dirname, '../seed/menu.ndjson')
fs.mkdirSync(path.dirname(outputPath), {recursive: true})
fs.writeFileSync(outputPath, `${documents.map(doc => JSON.stringify(doc)).join('\n')}\n`)
console.log(`Exportados ${categories.length} categorías y ${products.length} productos a ${outputPath}`)
