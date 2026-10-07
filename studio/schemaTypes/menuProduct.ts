import {defineField, defineType} from 'sanity'

export const menuProduct = defineType({
  name: 'menuProduct',
  title: 'Plato o bebida',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nombre', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'category', title: 'Categoría', type: 'reference', to: [{type: 'menuCategory'}], validation: Rule => Rule.required()}),
    defineField({name: 'price', title: 'Precio en soles', type: 'number', validation: Rule => Rule.required().min(0)}),
    defineField({name: 'active', title: 'Disponible en la carta', type: 'boolean', initialValue: true, description: 'Desactívalo para ocultarlo y retirarlo de los pedidos.'}),
    defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
    defineField({name: 'imageAlt', title: 'Descripción de la imagen', type: 'string'}),
    defineField({name: 'description', title: 'Descripción del producto', type: 'text', rows: 2}),
    defineField({name: 'featured', title: 'Destacado', type: 'boolean', initialValue: false}),
    defineField({name: 'badge', title: 'Etiqueta', type: 'string'}),
    defineField({name: 'sortOrder', title: 'Orden en la carta', type: 'number', validation: Rule => Rule.integer().min(0)}),
    defineField({name: 'fallbackImage', title: 'Imagen original', type: 'string', hidden: true, readOnly: true}),
  ],
  preview: {
    select: {title: 'name', category: 'category.name', price: 'price', active: 'active', media: 'image'},
    prepare: ({title, category, price, active, media}) => ({
      title: active === false ? `Agotado · ${title}` : title,
      subtitle: `${category || 'Sin categoría'} · S/ ${price ?? '—'}`,
      media,
    }),
  },
})
