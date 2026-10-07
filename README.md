# La Estación 365 — carta digital

Carta pública creada con Angular. Contiene 46 productos en 6 categorías, con una imagen distinta para cada ficha, búsqueda, carrito y preparación del pedido por WhatsApp.

## Estado actual

Este proyecto funciona **solo con el frontend**. Los platos y precios se leen de `src/app/data/menu.data.ts` y las imágenes de `public/images/menu/`. No hay API, Laravel, PostgreSQL ni panel de administración activo. Sanity aún no está conectado; hasta integrarlo, cualquier cambio en la carta requiere editar el archivo local y volver a publicar el sitio.

## Desarrollo y publicación

Requiere Node.js y npm. En la raíz del proyecto:

1. `npm install`
2. `npm start` y abre `http://localhost:4200/`
3. `npm run build` para generar el sitio estático en `dist/sabor-a-mar/browser/`

El sitio compilado puede publicarse en un alojamiento para archivos estáticos. No necesita un proceso PHP ni una base de datos.

## Editar la carta mientras se conecta Sanity

En `src/app/data/menu.data.ts`, modifica el `price` del producto en `MENU_ENTRIES`. Para retirarlo temporalmente de la carta, agrega `active: false`; quita esa propiedad o usa `active: true` para mostrarlo de nuevo. Las imágenes se encuentran en `public/images/menu/`. Los precios de bebidas son sugeridos: confirma con el restaurante el tamaño de cada presentación y el precio final antes de publicar.

Los productos ocultos no aparecen en la carta ni pueden permanecer en un carrito restaurado. Al conectar Sanity, estos campos pasarán a editarse desde su panel y dejarán de requerir una nueva publicación para cada cambio.

## Cambiar el número de WhatsApp

El contacto configurado actualmente es el **WhatsApp de IntegraTech: +51 902 586 908**. Los pedidos llegarán a ese número hasta que se configure el del restaurante. El pie de página y el pedido usan `BUSINESS_CONFIG` en `src/app/data/menu.data.ts`:

- `whatsapp`: código de país y número, solo dígitos, sin `+`, espacios ni guiones. Ejemplo: `51987654321`.
- `displayWhatsapp`: el mismo número con formato legible. Ejemplo: `+51 987 654 321`.

Vuelve a compilar o publicar después del cambio y prueba un pedido. La carta prepara el mensaje; el cliente debe pulsar **Enviar** en WhatsApp. El pedido queda pendiente de confirmación.
