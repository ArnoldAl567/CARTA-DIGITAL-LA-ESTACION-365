# La Estación 365 — carta digital

Carta pública creada con Angular. Incluye platos a la carta, menú del día, búsqueda, carrito y preparación del pedido por WhatsApp. Los datos y las imágenes se sirven desde este proyecto; no hay conexión a un CMS, API ni base de datos.

## Ejecutar el proyecto

Requiere Node.js y npm. En la raíz del proyecto:

1. `npm install`
2. `npm start` y abre `http://127.0.0.1:4200/`
3. `npm run build` para generar el sitio estático en `dist/sabor-a-mar/browser/`
4. `npm test -- --watch=false --browsers=ChromeHeadless` para ejecutar las pruebas

El sitio compilado puede publicarse en un alojamiento para archivos estáticos. Los cambios de la carta requieren volver a compilar y publicar el frontend.

## Editar platos y disponibilidad

- **Platos a la carta y bebidas:** modifica `src/app/data/menu.data.ts`. Cada producto tiene nombre, precio, imagen y categoría. Para ocultar un producto, establece `active: false`; para mostrarlo, usa `active: true` o elimina esa propiedad. Sus imágenes están en `public/images/menu/`.
- **Menú del día:** modifica `src/app/data/daily-menu.data.ts`. Las entradas están en `DAILY_STARTERS` y los fondos en `DAILY_MAINS`. Cada fondo puede pedirse como menú Económico (S/ 12) o Ejecutivo (S/ 14); el tipo se elige para cada ración. Se puede ocultar con `active: false`. Sus imágenes están en `public/images/daily/`.
- Las fotografías del menú del día son ilustrativas. Sustitúyelas por fotografías reales del restaurante cuando estén disponibles.

El menú Económico cuesta S/ 12 y el Ejecutivo S/ 14, con cualquiera de los fondos disponibles. Los precios de bebidas son provisionales.

Al elegir **retiro en local** o **entrega a domicilio**, el pedido suma **S/ 1 por táper por cada plato** (incluidos los menús del día). Las bebidas y los pedidos para mesa no generan este cargo. El carrito muestra el desglose y envía el mismo total por WhatsApp. Para modificar el importe, cambia `packagingFeePerDish` en `BUSINESS_CONFIG`, dentro de `src/app/data/menu.data.ts`.

El pedido ofrece **retiro en local**, **entrega a domicilio** y **pedido para mesa**. La opción de mesa se indica en el mensaje de WhatsApp sin solicitar un número de mesa y sin cargo por táper.

El menú del día aparece primero al abrir la carta. Puedes buscar los fondos por nombre incluso si se escribe sin tildes. Los fondos tienen tarjetas con **Agregar** y controles **− cantidad +**. En celular, el tipo (Económico o Ejecutivo) y la entrada aparecen debajo del plato seleccionado, y cada plato se añade al carrito desde allí. En escritorio, todas las raciones se editan juntas en un único panel lateral y se añaden al pedido con un solo botón. Cada ración puede tener una entrada diferente. Al bajar la cantidad, se retira la última ración añadida de ese fondo.

## Cambiar el número de WhatsApp

El contacto configurado actualmente es el **WhatsApp de IntegraTech: +51 902 586 908**. Los pedidos llegarán a ese número hasta que se configure el del restaurante. El pie de página y el pedido usan `BUSINESS_CONFIG` en `src/app/data/menu.data.ts`:

- `whatsapp`: código de país y número, solo dígitos, sin `+`, espacios ni guiones. Ejemplo: `51987654321`.
- `displayWhatsapp`: el mismo número con formato legible. Ejemplo: `+51 987 654 321`.

Vuelve a compilar o publicar después del cambio y prueba un pedido. La carta prepara el mensaje; el cliente debe pulsar **Enviar** en WhatsApp. El pedido queda pendiente de confirmación.
