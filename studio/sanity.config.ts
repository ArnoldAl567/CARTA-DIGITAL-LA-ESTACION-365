import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {menuCategory} from './schemaTypes/menuCategory'
import {menuProduct} from './schemaTypes/menuProduct'

export default defineConfig({
  name: 'la-estacion-365',
  title: 'La Estación 365 · Carta',
  projectId: '10djriog',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: [menuCategory, menuProduct]},
})
