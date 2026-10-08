# Bitácora — webapp de entradas

Qué se hizo y qué se probó de verdad en cada fase.

## W0 — Base instalable y sin conexión (07/10/2026, v1)

### Qué se hizo

- `index.html` con las variables de color, familias y medidas de `DISENO.md`, y una pantalla de muestra (título y un pedazo de "papel") para ver las tres fuentes.
- Fuentes en `fonts/`: Barlow 400/600/700, Barlow Condensed 700, IBM Plex Mono 400/600, en `woff2`, subconjunto latino (incluye ñ, tildes, ¿, °, · y −). Bajadas de Fontsource (paquetes npm de Google Fonts, versión 5.0.13). Licencias OFL en `fonts/OFL-*.txt`.
- `manifest.json`: vertical, `fullscreen`, fondo `#EEF0EA`, color de barra `#12161C`.
- Íconos 192 y 512: un ticket amarillo `#F2B33D` que dice ENTRADA sobre fondo tinta. Dibujados con Chrome usando la misma Barlow Condensed. El 512 sirve también como ícono adaptable (el dibujo queda dentro de la zona segura).
- `sw.js` (`CACHE_NAME = 'entradas-v1'`): al instalarse guarda los 11 archivos (página, manifiesto, íconos, fuentes). Responde **siempre primero con lo guardado**; abrir la app con o sin parámetros devuelve el `index.html` guardado.
- Versión nueva: la página busca una al abrir y cada vez que se vuelve a la app. Si la hay, se instala por detrás y aparece "Hay una versión nueva. Tocá para actualizar." Solo al tocar se activa y recarga, para que nunca se recargue en medio de una venta.
- `APP_VERSION = 'v1'` abajo a la derecha, en chico.
- Pide almacenamiento persistente (`navigator.storage.persist()`).
- Funciones de formato en `<script id="reglas">` (para que `tests.html` las cargue en W1): `plata`, `enPlural`, `cantidadDe`, `fechaTxt`, `horaTxt`, `fechaHoraTxt`.

### Decisiones

- "Actualiza por detrás" se resolvió con el service worker y no guardando por detrás cada archivo que se pide: así nunca se mezcla un `index.html` nuevo con archivos viejos. Por eso hay que subir `APP_VERSION` y `CACHE_NAME` juntas en cada cambio, como ya dice el plan.
- `display: fullscreen` porque el plan dice "pantalla completa". Esconde la barra del teléfono (hora y batería). Si M prefiere verla, se cambia a `standalone`.

### Qué se probó

Con Chrome sin interfaz, ventana 390 × 844, servidor local:

- La página queda controlada por el service worker y guarda los 11 archivos.
- Las seis fuentes cargan con red.
- **Sin red:** la página abre, en la misma pestaña y en una nueva, con las seis fuentes, y no pide nada al servidor.
- Simulando una versión nueva del service worker: aparece el aviso; al tocarlo recarga y queda solo la versión nueva guardada.
- Formatos: `$ 10.000`, `$ 0`, `$ 1.234.567`, `-$ 19.000`, 1 Hombre / 2 Hombres / 2 Mujeres / 3 Jugadores / 2 Tribunas / 2 Menores, `07/10/2026 18:41`.
- Sin errores en la consola.

### En el teléfono

- M hizo commit, la publicó en GitHub Pages y la instaló como app. W0 queda hecha.

## W1 — Reglas y guardado (07/10/2026, v2)

### Qué se hizo

- En `<script id="reglas">` de `index.html`, funciones que no tocan la página:
  - Botones: `botonesDeFabrica`, `ordenarBotones` (por grupo y orden), `botonesParaVender` (de visitante sin extras), `precioDe`, `totalCarrito`, `resumenLineas`.
  - Venta: `armarVenta` (líneas copiadas, tickets combinado e individuales, numeración), `medioTxt`, `avisosDeVenta`, `sugerenciasDePago`, `numeroTicket`.
  - Caja: `nuevaCaja`, `anularVenta`, `calcularCierre`.
  - Guardado: `crearGuardado(almacen)` con las tres claves, cada una como `{ formato: 1, datos }`. La primera vez guarda la configuración con los botones de fábrica. Si no puede guardar, devuelve `false` para que la pantalla avise. Si lo guardado está roto, aparta una copia en `{clave}_danado` y sigue.
- `tests.html`: lee las reglas del mismo `index.html` (no hay una copia aparte) y muestra los casos 1 a 11 en verde o rojo, más formatos y guardado. El guardado se prueba con un almacén de mentira, porque en GitHub Pages las pruebas y la app comparten los datos del navegador.
- `sw.js`: `tests.html` va siempre a la red. Antes, abrirla en el sitio publicado mostraba la app.
- `APP_VERSION` v2 / `CACHE_NAME` entradas-v2.

### Decisiones

- **La caja guarda una copia de los botones al abrirse** (`caja.botones`). Así el cierre de una caja cerrada no cambia si después se agregan, ocultan o renombran botones (casos 10 y 11). No estaba en la forma de datos del plan; se agregó ahí.
- Cada línea guarda también el `titulo` del botón.
- Venta de socio con títulos distintos en el combinado: sale `COMPROBANTE · SOCIO`, para que la marca de socio no se pierda.
- Ticket individual de socio cuyo nombre es igual al título: el detalle dice solo `SOCIO`.

### Qué se probó

- `tests.html` en Chrome sin interfaz, con el service worker ya activo: **75 comprobaciones, todas en verde**.
  - Casos 1 a 4 (tickets, numeración, avisos, sugerencias, vuelto), el cierre completo después de 1 a 4, y los casos 5 a 11.
  - Guardado: botones de fábrica la primera vez, ida y vuelta de la caja con sus ventas, historial, datos rotos, almacenamiento lleno.
- Prueba de que las pruebas sirven: con dos reglas rotas a propósito (sugerencias con `>=` y anuladas sumando en el cierre), `tests.html` marcó 4 en rojo. Esto hizo ver que faltaba un caso de sugerencias con total justo ($ 20.000), y se agregó.
- La app sigue abriendo sin red.

### No se probó todavía

- El caso 12 (cerrar la app a la fuerza y volver) necesita las pantallas: va en W2.
- Que la venta siguiente arranque en "No socio" (caso 7) es de la pantalla: va en W5.

## W2 — Abrir caja, vender y cobrar (07/10/2026, v3)

### Qué se hizo

- Se sacó la pantalla de muestra de W0. La app arranca en **Abrir caja**, o directo en **Vender** si hay una caja abierta.
- **Abrir caja:** Local / Visitante con su ayuda, Rival, Plata para dar vuelto, Precios de hoy (cambian según Local o Visitante) y "Abrir caja". La versión, en chico, abajo de todo. Todavía no hay botón Configurar: llega en W5.
- **Vender:** barra con el partido, "Local · Caja abierta", Alias y cuántos ingresaron. Botones por grupo con contador y "−", resumen, total, Borrar, Efectivo / Transferencia (apagados con el carrito vacío) y "Anotar sin cargo" cuando el total es $ 0.
- **Panel Cobrado:** Cobrado / Anotado, medio y total; "Entregá N tickets de papel" y los tickets como saldrían; avisos; "¿Quién transfirió?" (se guarda con cada letra); "¿Con cuánto paga?" con las sugerencias y el vuelto; "Siguiente".
- **Panel Alias:** a transferir, alias en grande, a nombre de, banco. Si no hay alias cargado: "Todavía no se cargó el alias. Se carga en Configurar, con la caja cerrada."
- **La venta se guarda antes de mostrar el panel.** Si no se puede guardar, no se muestra Cobrado: aparece "No se pudo guardar la venta. Probá de nuevo." y el carrito queda para reintentar.
- **Doble cobro:** al primer toque se apagan los botones de cobrar, y no se vuelve a cobrar hasta tocar "Siguiente".
- La pantalla no se apaga con la caja abierta (`wakeLock`, si el navegador lo permite).
- Sin zoom por doble toque y sin selección de texto (salvo en los campos).
- `APP_VERSION` v3 / `CACHE_NAME` entradas-v3.

### Cambio de diseño respecto del prototipo (para que M lo apruebe)

En el prototipo, con algo cargado, el contador y el "−" **tapan el nombre** en los extras (TRIBUNA) y en los que no pagan (JUGADOR). En dos columnas de 178 px no entran el nombre y los controles uno al lado del otro. Se cambió lo mínimo:

- **Extras:** el número y el "−" van uno arriba del otro, contra el borde derecho. Mismo tamaño de botón y siguen en dos columnas.
- **No pagan:** un botón por fila, a lo ancho. Así el nombre queda a la izquierda y los controles a la derecha.

M lo aprobó. Quedó anotado en `DISENO.md`, en los dos repos.

### Qué se probó

Con Chrome sin interfaz, emulando un teléfono táctil de 390 × 844, tocando la pantalla como lo haría una persona: **58 comprobaciones, todas bien.**

- Abrir caja: precios de local y de visitante, lo escrito no se pierde, caja guardada con local, rival y $ 20.000.
- **Ventas 1 a 4 de la especificación:** totales, tickets y numeración (N° 0001 a 0005), "Entregá 3 tickets de papel" / "Entregá 1 ticket de papel", sugerencias 40.000 / 50.000 / 100.000 y vuelto $ 19.000, avisos, "Juan" guardado mientras se escribe, "Anotar sin cargo" con $ 0, "Entregá números del sorteo: 3". Ingresaron 7.
- Alias sin datos y con datos de ejemplo. Cerrar Alias no borra el carrito.
- Tres toques seguidos en Efectivo: una sola venta.
- **Caso 12:** cerrar la página y volver a abrir: la misma caja, en Vender, con todas las ventas.
- Sin red: abre en Vender, cobra y guarda.
- Almacenamiento lleno: avisa, no muestra Cobrado, y al reintentar cobra.
- Con 12 de cada botón, ningún contador tapa un nombre. Ningún botón mide menos de 44 px y nada se sale de la pantalla a lo ancho.
- `tests.html` sigue con las 75 en verde. Sin errores en la consola.

### Falta

- Hacer las ventas 1 a 4 en el teléfono ("Listo cuando" de W2).
- **Todavía no se puede cerrar la caja** desde la app: eso llega en W4. Una caja de prueba abierta en el teléfono queda abierta hasta entonces.

## W3 — Ventas y anulación (07/10/2026, v4)

### Qué se hizo

- **Pestañas** Vender / Ventas / Cierre, abajo, con la caja abierta. La elegida va en tinta.
- **Ventas:** tarjetas, la más nueva arriba, con resumen, hora, medio ("Transferencia de Juan", "Sin cargo") y total. Arriba dice cuántas ventas hay, sin contar las anuladas. Sin ventas: "Todavía no hay ventas."
- **Anular** con confirmación en el mismo botón: el primer toque lo pone en rojo con "¿Anular?", el segundo anula. Tocar cualquier otra cosa (otra pestaña, otro botón) cancela la pregunta, y tocar Anular en otra venta pasa la pregunta a esa. La anulada queda en la lista, en gris, tachada, con "Anulada" y sin botón. Se guarda apenas se anula; si no se puede, avisa "No se pudo anular. Probá de nuevo."
- **Cierre en modo lectura**, con forma de ticket (sección 9). Hacía falta para verificar el caso 5. En W4 se agregan el efectivo contado, compartir, descargar y cerrar la caja.
- Cada pantalla recuerda hasta dónde se bajó: anular no hace saltar la lista arriba.
- M aprobó el cambio de los contadores de W2. Quedó en `DISENO.md`, en los dos repos.
- `APP_VERSION` v4 / `CACHE_NAME` entradas-v4.

### Qué se probó

Con Chrome sin interfaz, emulando un teléfono táctil de 390 × 844: **36 comprobaciones de W3, todas bien**. Además se volvieron a correr las 58 de W2 y las 75 de `tests.html`, también bien.

- Ventas 1 a 4 hechas tocando la pantalla. La lista muestra las cuatro en orden, con "Transferencia de Juan" y "Sin cargo".
- **Cierre después de 1 a 4**, igual a la tabla de la especificación: Hombres 3 $ 30.000, Mujeres 2 $ 14.000, Subtotal 5 $ 44.000, Tribunas 2 $ 4.000, Sorteos 3 $ 6.000, Jugadores 1, Menores 1, Ingresaron 7, Efectivo $ 47.000, Transferencia $ 7.000 (detalle con hora y Juan), TOTAL $ 54.000, Tiene que haber $ 67.000.
- **Caso 5**, anulando la venta 4: Hombres 2 ($ 20.000), Sorteos 0, Efectivo $ 31.000, TOTAL $ 38.000, Ingresaron 6, Tiene que haber $ 51.000, Ventas anuladas 1 ($ 16.000). La venta siguiente da el **N° 0006**.
- El "¿Anular?": no anula al primer toque, se cancela al cambiar de pestaña, pasa a otra venta, y el segundo toque anula solo esa.
- Cerrar y volver a entrar: la anulada sigue anulada. Sin red se anula y se guarda.
- Con 18 ventas la lista se desplaza, y anular no la hace saltar. Ningún botón de menos de 44 px y nada se sale a lo ancho.

### Falta

- Probarlo en el teléfono.
- Cerrar la caja sigue sin estar: llega en W4.

## Cambios pedidos por M después de W3 (07/10/2026, v5)

- **Socio:** se confirma `COMPROBANTE · SOCIO` cuando el combinado junta títulos distintos. Anotado en `ESPECIFICACION.md` (sección 5), en los dos repos.
- **El cierre ya no lista las transferencias una por una:** pueden ser muchas y queda muy largo. Se sacaron del cierre en pantalla, del texto para compartir y de `calcularCierre`. `ESPECIFICACION.md` (secciones 9 y 13), en los dos repos.
- **Filtro en Ventas:** Todas / Efectivo / Transferencia. Arriba muestra cuántas ventas y cuánto suman las que se ven, sin anuladas (por ejemplo, "1 venta · $ 7.000"). Las anuladas se siguen viendo en la lista, tachadas. Con "Transferencia" se ve quién transfirió cada una, para controlar contra el extracto. Las "sin cargo" aparecen solo en "Todas", porque no son un medio de cobro. `ESPECIFICACION.md` (sección 7), en los dos repos.

## W4 — Cierre y compartir (07/10/2026, v5)

### Qué se hizo

- **Efectivo contado** en la pantalla Cierre. Se guarda mientras se escribe y muestra al instante "Coincide con lo esperado." en verde, o "Sobran $ x." / "Faltan $ x." en rojo.
- **Compartir cierre:** abre el menú de compartir del teléfono con el texto listo para WhatsApp (con *negritas*). Si el teléfono no tiene ese menú, lo copia y avisa "Se copió el cierre. Pegalo en WhatsApp." Si la persona cancela el menú, no pasa nada. Queda anotado que se compartió (`compartidoEn`).
- **Descargar detalle:** CSV con `;` y BOM, una fila por línea de venta: fecha, hora, número de venta, medio, quién transfirió, qué, tipo, cantidad, precio, subtotal, total de la venta y si está anulada. Los importes van sin puntos, para que Excel los sume. Se llama `entradas-AAAA-MM-DD-rival.csv`.
- **Cerrar caja** con confirmación en un panel: "¿Cerrar la caja?", qué significa y "Volver". Si no se compartió, recuerda "Compartí el cierre antes de cerrar." con el botón para compartir ahí mismo. Primero se guarda el historial y después se saca la caja abierta; si algo falla, avisa y la caja sigue abierta, sin duplicarse.
- **Cajas cerradas:** botón en Abrir caja, que aparece cuando hay alguna. Muestra la lista (partido, fecha, local o visitante, ventas, total) y el cierre de cada una en modo lectura, con el efectivo contado, Compartir y Descargar.
- Reglas nuevas en `<script id="reglas">`, probadas en `tests.html`: `arqueo`, `textoCierre`, `csvDetalle`, `nombreArchivo`, `cerrarCaja`.
- No hay botón "Imprimir cierre": esta prueba no tiene impresora.
- `APP_VERSION` v5 / `CACHE_NAME` entradas-v5.

### Qué se probó

- `tests.html`: **87 comprobaciones en verde**. Incluyen el texto completo para WhatsApp después del caso 5, el CSV (BOM, columnas, una fila por línea, nombres con `;` o comillas) y que la suma del CSV sin anuladas da el TOTAL del cierre.
- Prueba de punta a punta de W4, con Chrome sin interfaz emulando un teléfono táctil: **59 comprobaciones, todas bien.**
  - Filtro: Todas 4 ventas · $ 54.000; Transferencia 1 venta · $ 7.000 con "Transferencia de Juan"; Efectivo 2 ventas · $ 47.000. Anulada, sigue a la vista y no suma. El filtro se mantiene al cambiar de pestaña.
  - Cierre sin el detalle de transferencias. Contado 60.000 / 50.000 / 51.000: Sobran $ 9.000 / Faltan $ 1.000 / Coincide.
  - Compartir con el menú del teléfono (simulado): el texto es el esperado. Cancelado: nada. Sin menú: se copia el mismo texto.
  - CSV bajado de verdad: 8 filas, la suma sin anuladas da $ 38.000 y el efectivo $ 31.000, igual que el cierre.
  - Cerrar: Volver no cierra, cerrar pasa la caja al historial, y la caja nueva arranca en el ticket N° 0001. El recordatorio de compartir aparece solo si no se compartió, y se va al compartir desde ahí. Con el almacenamiento lleno avisa y no cierra. Sin red se cierra igual.
  - Cajas cerradas: lista, cierre en lectura (sin campo, sin Cerrar, sin pestañas), mismo texto y mismo archivo. Sigue después de recargar.
- Se volvieron a correr las pruebas de W2 (58) y W3 (36), ajustadas a los cambios pedidos: todo bien.

### Falta

- En el teléfono: que el texto llegue bien por WhatsApp y que el CSV abra en Excel con los mismos totales ("Listo cuando" de W4).

## W5 — Configurar (07/10/2026, v6)

### Qué se hizo

- Botón **Configurar** en la tarjeta "Precios de hoy" de Abrir caja. Solo existe con la caja cerrada; aunque se intente forzar, con la caja abierta no se abre.
- **Configurar:** barra con "Listo". Botones agrupados en "Entradas", "Solo cuando se juega de local" y "No pagan entrada". Cada fila muestra el precio (y el de socios, si están activados) y el modo de ticket, con "Cambiar" a la derecha; las ocultas van en gris con "Oculto". Cada grupo tiene "Agregar entrada" / "Agregar otro" con borde punteado.
- **Cambiar un botón** (panel): nombre (el título del panel lo sigue mientras se escribe), precio (no en los que no pagan), precio para socios (solo con socios activados y en entradas), modo de ticket con su explicación, título del ticket (solo si imprime, siempre en mayúsculas) y "Se muestra para vender" Sí / No. "Listo" no deja salir sin nombre ("Poné un nombre.") ni sin título si imprime ("Poné el título del ticket.").
- **Agregar:** crea el botón con los valores de la especificación (`botonNuevo`) y abre el panel. **No se borra nada:** solo se oculta.
- El precio para socios acompaña al precio mientras sean iguales; si se lo cambia, queda aparte.
- **Socios:** interruptor "Precio distinto para socios". Encendido, Vender muestra "No socio / Socio" arriba de los botones; con Socio, las entradas muestran y cobran el precio de socio; después de cobrar vuelve a "No socio".
- **Datos para transferir:** alias, a nombre de, banco o billetera. Se guardan mientras se escriben y se ven en el panel Alias.
- Todo se guarda con cada cambio. Si no se puede guardar, aparece "No se pudo guardar. Probá de nuevo."
- Arreglo: en las listas que se desplazan, los botones con alto fijo (como "Agregar") se achicaban a menos de 44 px. Ahora no se achican.
- `APP_VERSION` v6 / `CACHE_NAME` entradas-v6.

### Qué se probó

- `tests.html`: **90 comprobaciones en verde** (incluye los valores de un botón nuevo).
- **Casos 6 a 11 hechos tocando la pantalla**, con Chrome sin interfaz emulando un teléfono táctil: **51 comprobaciones, todas bien.**
  - 6: de visitante no aparecen Tribuna, Sorteo ni el extra nuevo, ni en Vender ni en el cierre.
  - 7: socios encendido, Hombre a $ 8.000 para socios. La venta arranca en "No socio"; con "Socio" el botón muestra $ 8.000; Hombre + Tribuna cobra $ 10.000 (la tribuna no cambia), el ticket dice "ENTRADA GENERAL · SOCIO" y la venta siguiente vuelve a "No socio".
  - 8: Hombre "uno por persona" y Tribuna "uno por venta": primero el combinado TRIBUNA, después dos ENTRADA GENERAL / HOMBRE.
  - 9: los dos "uno por venta": un solo ticket COMPROBANTE.
  - 10: Hombre a $ 12.000 después de cerrar una caja con ventas: el cierre de esa caja no cambia y la caja nueva cobra $ 12.000.
  - 11: Mujer oculta después de venderle: no aparece para vender ni en Precios de hoy, sigue en el cierre de la caja vieja, y en una caja sin ventas de Mujer no aparece.
  - También: agregar "Platea" (aparece en Configurar, en Precios de hoy y en Vender), no salir sin nombre, título en mayúsculas, datos para transferir en el Alias, la configuración sigue al volver a entrar, y sin red se configura igual.
- Se volvieron a correr W2 (58), W3 (36) y W4 (59): todo bien.

## W6 — Publicar e instalar (en curso)

### Hecho en la compu

- **Revisión de textos:** se recorrieron todas las pantallas y paneles (Abrir caja, Configurar, Cambiar un botón, Vender, Alias, Cobrado en efectivo, transferencia y sin cargo, Ventas con filtro y anulada, Cierre con contado, ¿Cerrar la caja?, Cajas cerradas y su cierre) juntando todo el texto visible, las ayudas de los campos y lo que lee un lector de pantalla. No aparecen IDs, nombres internos ni jerga. El único dato técnico es la versión ("v6"), en chico, en Abrir caja.
- **Sin conexión:** cada prueba de W2 a W5 incluye un tramo sin red (cobrar, anular, cerrar, ver cajas cerradas, configurar), y todo funcionó.

### Falta (lo hace M)

- Publicar en GitHub Pages.
- Instalar en el teléfono de la cancha y cargar precios, alias y rival.
- Hacer una caja completa en modo avión con ese teléfono y compartir el cierre.

## Pedido de M: atrás dos veces para salir, e instalar (07/10/2026, v7)

### Qué se hizo

- **Atrás dos veces para salir.** El primer "atrás" no cierra la app: muestra abajo "Tocá atrás otra vez para salir." durante 2,5 segundos, y lo que estaba en pantalla no cambia. Si se toca atrás otra vez mientras se ve el aviso, la app se cierra. Pasado ese tiempo, el próximo "atrás" vuelve a avisar.
  - Cómo: se agrega un paso al historial del navegador que el primer "atrás" consume. Chrome ignora los pasos agregados sin que la persona toque la pantalla, así que el paso se vuelve a poner al primer toque y cuando se va el aviso.
  - Anotado en `ESPECIFICACION.md` (sección 8, "Salir"), en los dos repos: la APK también lo necesita.
- **Instalar.** Se le preguntó a Chrome qué le falta a la app para ser instalable, tanto en la compu como en la versión publicada en GitHub Pages: **no le falta nada**. El manifiesto no tiene errores, y el service worker y los íconos están bien. La única observación fue que la prueba corre en modo incógnito.
  - Para que no dependa de encontrar la opción en el menú de Chrome, se agregó el botón **"Instalar la app"** en Abrir caja. Aparece solo cuando Chrome ofrece instalarla; al tocarlo abre el pedido de instalación de Chrome; no aparece si ya está instalada.
- `APP_VERSION` v7 / `CACHE_NAME` entradas-v7.

### Qué se probó

- Con Chrome sin interfaz, emulando un teléfono táctil: **15 comprobaciones, todas bien.**
  - Primer atrás: la app sigue y avisa, sin perder lo elegido. El aviso se va solo. Después de eso, atrás vuelve a avisar. Segundo atrás con el aviso a la vista: sale. Con la caja abierta, en Ventas, atrás avisa y la app sigue ahí.
  - Instalar (con el pedido de Chrome simulado): sin pedido no hay botón; con pedido aparece "Instalar la app"; al tocarlo se abre el pedido de Chrome y el botón se va; ya instalada no aparece; si el pedido llega mientras se escribe, no se pierde el foco.
- Se volvieron a correr W2 (58), W3 (36), W4 (59) y W5 (51): todo bien.

### Falta

- Probar "atrás" en el teléfono, con la app instalada. Chrome de escritorio no tiene botón atrás de teléfono, así que el cierre real de la app solo se puede ver en Android.
- Ver el botón "Instalar la app" en el teléfono. Chrome lo ofrece solo si la app todavía no está instalada. Si antes se agregó como acceso directo ("Agregar a pantalla principal"), conviene borrar ese acceso directo.

## Pedido de M: contar billetes en el cierre (07/10/2026, v8)

### Qué se hizo

- En Cierre de caja, "Efectivo contado" pasó a ser una **tabla de billetes**: $ 20.000, $ 10.000, $ 2.000, $ 1.000, $ 500, $ 200 y $ 100.
  - Para cada uno se pone cuántos hay, y al lado aparece el subtotal.
  - Abajo, **Total contado** con la suma.
  - Ese total es el efectivo contado: se compara con "Tiene que haber" y muestra Coincide / Sobran / Faltan, igual que antes. Mientras no se cargue ningún billete, no se muestra la comparación.
- Se guarda con cada número (`caja.billetes`) y sigue ahí al volver a entrar.
- "Siguiente" en el teclado del teléfono pasa al billete de abajo.
- El **cierre compartido** trae, debajo de "Contado", los billetes cargados (por ejemplo `$ 20.000 x 2 = $ 40.000`). El cierre de una caja cerrada también los muestra.
- Se reemplazó el campo único de efectivo contado: ahora el contado sale siempre de los billetes.
- Reglas nuevas en `<script id="reglas">`: `BILLETES`, `sumarBilletes`, `hayBilletes`.
- `ESPECIFICACION.md` (sección 9) actualizada en los dos repos. En `PLAN.md` se agregó `billetes` a la forma de la caja.
- `APP_VERSION` v8 / `CACHE_NAME` entradas-v8.

### Qué se probó

- `tests.html`: **96 comprobaciones en verde** (suma de billetes, uno de cada uno = $ 33.800, texto compartido con billetes, caja nueva sin billetes).
- Prueba de punta a punta de W4, escribiendo con el teclado como una persona: **66 comprobaciones, todas bien.**
  - 3 de $ 20.000: subtotal y total $ 60.000, "Sobran $ 9.000."
  - 2 de $ 20.000 y 1 de $ 10.000: "Faltan $ 1.000.", en rojo.
  - Sumando $ 500 + 2 de $ 200 + $ 100: total $ 51.000, "Coincide con lo esperado.", en verde.
  - "Siguiente" pasa al billete de abajo. Borrar una cantidad la descuenta.
  - Se guarda y sigue después de recargar. El texto compartido trae los billetes. La caja cerrada los muestra en modo lectura.
- Se volvieron a correr W2 (58), W3 (36), W5 (51) y atrás/instalar (15): todo bien.
- Arreglo visto en la captura: los valores de los billetes salían en letra chica, porque les ganaba el estilo de las etiquetas de los campos.
