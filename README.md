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
- **Menú del día:** modifica `src/app/data/daily-menu.data.ts`. Las entradas están en `DAILY_STARTERS` y los fondos en `DAILY_MAINS`. Cada fondo tiene su precio; se puede ocultar con `active: false`. Sus imágenes están en `public/images/daily/`.
- Las fotografías del menú del día son ilustrativas. Sustitúyelas por fotografías reales del restaurante cuando estén disponibles.

Los precios S/ 12 y S/ 14 del menú del día y los precios de bebidas son provisionales: confírmalos con el restaurante antes de publicar. La referencia del menú menciona S/ 1 por envase para llevar; no está incluido en el total porque falta definir cuántos envases corresponden a cada pedido.

El menú del día aparece primero al abrir la carta. Un buscador filtra los fondos por nombre, incluso si se escribe sin tildes. Los fondos tienen tarjetas con **Agregar** y controles **− cantidad +**. Cada ración permite elegir una entrada diferente. Al bajar la cantidad, se retira la última ración añadida de ese fondo. Después se agregan las combinaciones al carrito.

## Cambiar el número de WhatsApp

El contacto configurado actualmente es el **WhatsApp de IntegraTech: +51 902 586 908**. Los pedidos llegarán a ese número hasta que se configure el del restaurante. El pie de página y el pedido usan `BUSINESS_CONFIG` en `src/app/data/menu.data.ts`:

- `whatsapp`: código de país y número, solo dígitos, sin `+`, espacios ni guiones. Ejemplo: `51987654321`.
- `displayWhatsapp`: el mismo número con formato legible. Ejemplo: `+51 987 654 321`.

Vuelve a compilar o publicar después del cambio y prueba un pedido. La carta prepara el mensaje; el cliente debe pulsar **Enviar** en WhatsApp. El pedido queda pendiente de confirmación.
