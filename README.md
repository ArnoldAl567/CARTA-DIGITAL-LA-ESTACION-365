# La Estación 365 — carta digital

Carta pública creada con Angular. Contiene 46 productos en 6 categorías, con una imagen distinta para cada ficha, búsqueda, carrito y preparación del pedido por WhatsApp.

## Estado actual

La carta pública está hecha en Angular y consulta el proyecto Sanity **carta-digital** (`10djriog`), dataset público `production`. No hay API, Laravel ni PostgreSQL propios. La conexión usa el cliente oficial sin token en el navegador.

El dataset ya contiene las 6 categorías y los 46 productos iniciales. Sanity controla los productos, precios, imágenes y disponibilidad. La carta consulta cambios al abrirse, al volver a la pestaña y cada minuto; no requiere volver a publicar Angular por cada cambio.

## Desarrollo y publicación

Requiere Node.js y npm. En la raíz del proyecto:

1. `npm install`
2. `npm start` y abre `http://localhost:4200/`
3. `npm run build` para generar el sitio estático en `dist/sabor-a-mar/browser/`

El sitio compilado puede publicarse en un alojamiento para archivos estáticos. No necesita un proceso PHP ni una base de datos.

## Preparar el panel de Sanity

El panel de edición está publicado en **https://la-estacion-365-carta.sanity.studio/**. Inicia sesión con GitHub y abre **Plato o bebida** para cambiar la carta. Su código está en `studio/` y utiliza el mismo proyecto y dataset. Para ejecutarlo o volver a publicarlo desde esa carpeta:

1. `npm install`
2. `npx sanity login` e inicia sesión con la cuenta propietaria del proyecto.
3. `npm run seed:export` para regenerar `seed/menu.ndjson` a partir de la carta local.
4. La importación inicial ya se realizó. Solo para recrear documentos faltantes, ejecuta `npx sanity datasets import seed/menu.ndjson --dataset production --missing`.
5. `npm run dev` para abrir el panel local en `http://localhost:3333/`, o `npm run deploy` para actualizar el panel publicado.

En el panel, abre **Plato o bebida**, cambia el precio o desactiva **Disponible en la carta**, y pulsa **Publish**. También puedes subir una imagen nueva; mientras un producto no tenga imagen en Sanity, la carta usa su fotografía local. Los cambios publicados se reflejan en la carta sin otro despliegue.

Los orígenes CORS `http://localhost:4200` y `https://carta-digital-la-estacion365.vercel.app` están autorizados para leer el dataset **sin credenciales**. Si cambias el dominio público, añade su origen en Sanity → API → CORS origins, sin habilitar credenciales para la carta pública. Nunca pongas un token de escritura en Angular.

## Editar el menú local de respaldo

En `src/app/data/menu.data.ts`, modifica el `price` del producto en `MENU_ENTRIES`. Para retirarlo temporalmente de la carta, agrega `active: false`; quita esa propiedad o usa `active: true` para mostrarlo de nuevo. Las imágenes se encuentran en `public/images/menu/`. Los precios de bebidas son sugeridos: confirma con el restaurante el tamaño de cada presentación y el precio final antes de publicar.

Este archivo sirve como respaldo si Sanity aún no tiene el menú inicial o no responde. Cuando el menú de Sanity está activo, cambiar el archivo local ya no modifica la carta pública. Los productos desactivados en Sanity no aparecen en la carta ni pueden permanecer en un carrito restaurado.

## Cambiar el número de WhatsApp

El contacto configurado actualmente es el **WhatsApp de IntegraTech: +51 902 586 908**. Los pedidos llegarán a ese número hasta que se configure el del restaurante. El pie de página y el pedido usan `BUSINESS_CONFIG` en `src/app/data/menu.data.ts`:

- `whatsapp`: código de país y número, solo dígitos, sin `+`, espacios ni guiones. Ejemplo: `51987654321`.
- `displayWhatsapp`: el mismo número con formato legible. Ejemplo: `+51 987 654 321`.

Vuelve a compilar o publicar después del cambio y prueba un pedido. La carta prepara el mensaje; el cliente debe pulsar **Enviar** en WhatsApp. El pedido queda pendiente de confirmación.
