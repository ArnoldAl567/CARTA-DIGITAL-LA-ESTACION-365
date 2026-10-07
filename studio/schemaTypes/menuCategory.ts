import {defineField, defineType} from 'sanity'

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Categoría',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nombre', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'shortName', title: 'Nombre corto', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'description', title: 'Descripción', type: 'text', rows: 2}),
    defineField({name: 'sortOrder', title: 'Orden en la carta', type: 'number', validation: Rule => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Mostrar categoría', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'name', subtitle: 'description'}},
})
