import {defineField, defineType} from 'sanity'

export const dailyMenuDish = defineType({
  name: 'dailyMenuDish',
  title: 'Menú del día',
  type: 'document',
  fields: [
    defineField({name: 'key', title: 'Identificador original', type: 'string', hidden: true, readOnly: true}),
    defineField({name: 'name', title: 'Nombre del plato', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'course', title: 'Tipo', type: 'string', options: {list: [
      {title: 'Entrada', value: 'starter'},
      {title: 'Plato de fondo', value: 'main'},
    ]}, validation: Rule => Rule.required()}),
    defineField({name: 'price', title: 'Precio del menú (S/)', type: 'number', description: 'Se cobra por la entrada y el fondo elegidos. Solo para platos de fondo.', hidden: ({document}) => document?.course !== 'main', validation: Rule => Rule.custom((value, context) => context.document?.course === 'main' && (typeof value !== 'number' || value < 0) ? 'Indica un precio válido para este fondo' : true)}),
    defineField({name: 'active', title: 'Disponible hoy', type: 'boolean', initialValue: true, description: 'Desactiva el plato para ocultarlo de la carta pública.'}),
    defineField({name: 'sortOrder', title: 'Orden', type: 'number', validation: Rule => Rule.integer().min(0)}),
  ],
  preview: {
    select: {title: 'name', course: 'course', price: 'price', active: 'active'},
    prepare: ({title, course, price, active}) => ({
      title: active === false ? `Agotado · ${title}` : title,
      subtitle: course === 'main' ? `Fondo · S/ ${price ?? '—'}` : 'Entrada',
    }),
  },
})
