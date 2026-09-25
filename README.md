# La Estación 365 · Carta digital

Carta responsive hecha con Angular. El cliente explora platos, ajusta cantidades, escribe indicaciones y prepara un mensaje de pedido para WhatsApp. El negocio recibe el pedido cuando el cliente envía ese mensaje.

## Ejecutar

```bash
npm install
npm start
```

Abre `http://localhost:4200/` (o el puerto que indique Angular). Para generar la versión de producción:

```bash
npm run build
```

La compilación queda en `dist/sabor-a-mar/browser`; ese nombre interno se conserva para no alterar la configuración de despliegue existente.

## Contenido de la carta

- `src/app/data/menu.data.ts`: nombre, WhatsApp, categorías, platos y precios. Los 39 platos con precio y las siete opciones de bebidas se transcribieron de las tres capturas entregadas. Chaufa de mariscos figura en marinos y criollos, como en las capturas, pero comparte un mismo artículo en el carrito.
- Las capturas no indican precios para las bebidas. Por eso se muestran como “Precio por consultar” con un enlace a WhatsApp y no se pueden añadir al carrito hasta definir sus precios.
- `public/brand/`: versiones transparentes del logo extraídas del PDF proporcionado. La versión completa se usa en la cabecera y el isotipo como favicon y apoyo visual del carrito.
- `public/images/menu/`: 46 fotografías referenciales individuales, una por cada ficha de la carta, incluidas las bebidas. Las imágenes están optimizadas en WebP para que carguen bien en celular.
- `src/styles.scss`: colores generales adaptados al azul y verde del logo.

El número de WhatsApp usado es el que aparece en la captura: **+51 987 091 127**. La carta indica delivery gratis; la aplicación recomienda confirmar la cobertura y disponibilidad por WhatsApp.

El pedido se conserva en el navegador mediante `localStorage`. Esta versión funciona en el frontend; no procesa pagos ni guarda pedidos en un servidor.
