# La Estación 365 — carta digital

Carta pública creada con Angular. Incluye platos a la carta, menú del día, búsqueda, carrito y preparación del pedido por WhatsApp. El panel `/panel-administrativo` permite actualizar el catálogo en PostgreSQL mediante Neon Auth y Data API, sin alojar un servidor Laravel.

## Ejecutar el proyecto

Requiere Node.js y npm. En la raíz del proyecto:

1. `npm install`
2. `npm start` y abre `http://127.0.0.1:4200/`
3. `npm run build` para generar el sitio estático en `dist/sabor-a-mar/browser/`
4. `npm test -- --watch=false --browsers=ChromeHeadless` para ejecutar las pruebas

El sitio se publica en Vercel. Cuando Neon está conectado, los cambios hechos en el panel aparecen en la carta sin recompilar el frontend. `vercel.json` permite abrir directamente `/panel-administrativo` en Vercel. La función `api/catalog-image.ts` guarda las fotografías en Vercel Blob; requiere que el almacén público Blob esté conectado al proyecto y que Vercel suministre `BLOB_READ_WRITE_TOKEN` a la función. El token nunca va en Angular ni en Git.

## Conexión actual con Neon

El proyecto Neon **`young-cell-49382492`**, rama **production**, base **neondb**, ya tiene Neon Auth, Data API, las tablas y las reglas de acceso. Se cargaron **47 productos a la carta, 16 opciones adicionales, 13 fondos y 7 entradas**. Las dos URL públicas están en [`src/app/config/neon.config.ts`](src/app/config/neon.config.ts). La carta lee los platos disponibles desde Neon al abrirse y comprueba cambios cada cinco minutos mientras la pestaña está visible. También comprueba al recuperar el foco si han pasado cinco minutos desde la última actualización.

Para acceder a `/panel-administrativo`, usa el usuario **Estacion365** y la contraseña configurada en Neon Auth. El alias y su correo asociado se encuentran en [`src/app/config/admin-login.config.ts`](src/app/config/admin-login.config.ts); ese archivo forma parte del frontend público, así que nunca guardes allí la contraseña. Para crear o cambiar la contraseña, pulsa **Crear o recuperar contraseña**: Neon envía un enlace al correo administrador y el dueño la establece directamente en la página. El enlace solo funciona si la dirección de la carta está autorizada en **Neon Auth → Domains**.

Si alguna vez se configura otro proyecto Neon:

1. Activa **Neon Auth (Managed Better Auth)** y **Postgres database → Data API** en la misma rama y base de datos.
2. Ejecuta [`neon/schema.sql`](neon/schema.sql) y luego [`neon/seed.sql`](neon/seed.sql) en SQL Editor. El segundo archivo carga los 83 productos sin sobrescribir ediciones existentes. Tras cambios de estructura, pulsa **Refresh schema cache** en Data API.
3. Crea la cuenta en Neon Auth y autoriza su identificador con `insert into public.catalog_admins (user_id) select id from neon_auth."user" where email = 'CORREO-ADMIN' on conflict do nothing;`. El panel no ofrece registro público y las reglas de PostgreSQL impiden que otras cuentas editen el catálogo.
4. Agrega `http://127.0.0.1:4200` y el dominio real de producción a **Neon Auth → Domains**. Copia las dos URL públicas en [`src/app/config/neon.config.ts`](src/app/config/neon.config.ts). Nunca pongas la contraseña PostgreSQL, una cadena `postgresql://` o una API key secreta en Angular o Git.

En el panel puedes agregar platos en **A la carta**, **Fondos del día** y **Entradas** con el botón **Agregar plato** o **Agregar entrada**. Escribe el nombre, sube una fotografía y, para platos a la carta, elige la categoría y el precio. También puedes editar nombre, foto, precio y disponibilidad de los productos existentes, así como los precios globales de los menús Económico y Ejecutivo. Las fotografías JPG, PNG o WebP de hasta 5 MB se convierten en WebP de máximo 180 KB y se guardan en **Vercel Blob**. PostgreSQL conserva únicamente la URL. La subida pasa por una función Vercel que comprueba el permiso de administrador en Neon antes de escribir el archivo. En desarrollo local, `proxy.conf.json` dirige `/api` a la función publicada. Los cambios se muestran al volver a abrir la carta; una pestaña ya abierta se actualiza cada cinco minutos mientras siga visible.

Si el panel muestra **Optimizar fotografías**, hay imágenes antiguas incrustadas en PostgreSQL. Pulsa **Mover fotografías** una vez con la sesión administradora abierta. La operación guarda una foto en Blob y actualiza su fila antes de pasar a la siguiente; si se interrumpe, vuelve a pulsar el botón para continuar con las pendientes. Revisa que el contador llegue a cero y que la carta siga mostrando todas las imágenes. No borres el almacén Blob mientras sus URL estén en el catálogo.

Para regenerar el archivo de carga a partir de los platos incluidos en Angular, ejecuta `node scripts/generate-neon-seed.cjs`. Si cambias el catálogo directamente en Neon, no vuelvas a ejecutar la carga: el archivo solo añade claves faltantes y no reemplaza filas editadas.

## Editar platos y disponibilidad

- **Con Neon conectado:** usa `/panel-administrativo` para editar los datos publicados; no hace falta desplegar otra vez la web para cada cambio.
- **Sin Neon:** los datos de respaldo están en `src/app/data/menu.data.ts` y `src/app/data/daily-menu.data.ts`. Editarlos requiere volver a compilar y publicar. Sus imágenes están en `public/images/menu/` y `public/images/daily/`.
- Las fotografías del menú del día son ilustrativas. Sustitúyelas por fotografías reales del restaurante cuando estén disponibles.

El menú Económico cuesta S/ 12 y el Ejecutivo S/ 14, con cualquiera de los fondos disponibles. Los precios de bebidas son provisionales.

Al elegir **retiro en local** o **entrega a domicilio**, el pedido suma **S/ 1 por táper por cada plato** (incluidos los menús del día). Las bebidas y los pedidos para mesa no generan este cargo. El carrito muestra el desglose y envía el mismo total por WhatsApp. Para modificar el importe, cambia `packagingFeePerDish` en `BUSINESS_CONFIG`, dentro de `src/app/data/menu.data.ts`.

El pedido ofrece **retiro en local**, **entrega a domicilio** y **pedido para mesa**. La opción de mesa se indica en el mensaje de WhatsApp sin solicitar un número de mesa y sin cargo por táper.

## Horario de pedidos

La carta muestra el horario de atención en la parte inferior: **lunes a domingo, 9:00 a. m. a 11:00 p. m.** Se evalúa siempre con la zona horaria de Perú (`America/Lima`). Fuera de esas horas aparece «Restaurante cerrado» y se deshabilita el envío del pedido por WhatsApp. La comprobación se repite justo al pulsar el botón para impedir que se abra WhatsApp si el horario cambió mientras la carta estaba abierta.

El menú del día aparece primero al abrir la carta. Puedes buscar los fondos por nombre incluso si se escribe sin tildes. Los fondos tienen tarjetas con **Agregar** y controles **− cantidad +**. En celular, el tipo (Económico o Ejecutivo) y la entrada aparecen debajo del plato seleccionado, y cada plato se añade al carrito desde allí. En escritorio, todas las raciones se editan juntas en un único panel lateral y se añaden al pedido con un solo botón. Cada ración puede tener una entrada diferente. Al bajar la cantidad, se retira la última ración añadida de ese fondo.

Al final del **Menú del día** aparecen **Entradas adicionales** (7 opciones a S/ 5). Al final de **Platos a la carta** aparecen **Guarniciones** (9 opciones: Huevo frito a S/ 2, Sopa de dieta a S/ 15 y las demás a S/ 5). Se pueden agregar por separado al carrito. Se guardan como productos del catálogo Neon, con categorías propias, y sus nombres, precios y disponibilidad se editan desde el panel. Tras actualizar el código en una instalación existente, ejecuta [`neon/seed.sql`](neon/seed.sql) en el SQL Editor de Neon para insertar solo las claves faltantes sin sobrescribir platos ya editados.

## Cambiar el número de WhatsApp

El contacto configurado actualmente es el **WhatsApp del restaurante: +51 987 091 127**. El pie de página y el pedido usan `BUSINESS_CONFIG` en `src/app/data/menu.data.ts`:

- `whatsapp`: código de país y número, solo dígitos, sin `+`, espacios ni guiones. Ejemplo: `51987654321`.
- `displayWhatsapp`: el mismo número con formato legible. Ejemplo: `+51 987 654 321`.

Vuelve a compilar o publicar después del cambio y prueba un pedido. La carta prepara el mensaje; el cliente debe pulsar **Enviar** en WhatsApp. El pedido queda pendiente de confirmación.
