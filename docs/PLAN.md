# Entradas en la cancha — Plan de la webapp de prueba

Webapp para probar el flujo de cobro en uno o dos partidos, **sin impresora**. Los tickets de papel se siguen entregando como hoy; la app cuenta las ventas y hace el cierre.

Leer antes de empezar: `ESPECIFICACION.md` (qué hace) y `DISENO.md` (cómo se ve).

## Para qué sirve esta prueba

Para contestar, antes de invertir en la APK y en un equipo:

- ¿Los botones y el orden son los correctos? ¿Falta o sobra alguno?
- ¿Cuánto tarda una venta con gente haciendo cola?
- ¿El cierre coincide con la plata contada y con las transferencias?
- ¿Sirve anotar el nombre de quien transfiere, o demora?
- ¿Se usa la ayuda del vuelto?

Lo que se aprenda vuelve a `ESPECIFICACION.md` y de ahí a la APK.

## Límites, a propósito

- No imprime. Muestra en pantalla el ticket que saldría y recuerda entregar el de papel.
- Los datos viven en el navegador de ese teléfono. Si se borran los datos del sitio, se pierden. Por eso el cierre se comparte al terminar.
- Sin servidor. No sincroniza nada.
- Sin código de administrador.
- Es una prueba: simple y correcta. No sumar funciones que no estén en este plan.

## Cómo trabajar con este plan

1. Una fase por vez, en orden.
2. Al empezar una fase, marcarla "En curso" en la tabla de estado.
3. Al terminarla: probar en el navegador, verificar el "Listo cuando", marcarla "Hecha" y anotar en `docs/BITACORA.md` qué se hizo y qué se probó de verdad.
4. **Frenar al final de cada fase** y contarle a M qué se probó.
5. Subir `APP_VERSION` en `index.html` y `CACHE_NAME` en `sw.js` juntas, en cada cambio.
6. No hacer commit ni push salvo que M lo pida.

## Estado

| Fase | Nombre | Estado |
|---|---|---|
| W0 | Base instalable y sin conexión | Hecha |
| W1 | Reglas y guardado | Hecha |
| W2 | Abrir caja, vender y cobrar | Hecha en la compu. Falta probar en el teléfono |
| W3 | Ventas y anulación | Hecha en la compu. Falta probar en el teléfono |
| W4 | Cierre y compartir | Hecha en la compu. Falta probar en el teléfono (WhatsApp y Excel) |
| W5 | Configurar | Hecha en la compu. Falta probar en el teléfono |
| W6 | Publicar e instalar | En curso: revisión de textos hecha; falta publicar e instalar (M) |
| W7 | Prueba en un partido | Pendiente |
| W8 | Opcional: mandar el cierre a una planilla | Pendiente |

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Forma | La misma de las otras apps del club: un `index.html` con todo, sin frameworks ni compilación, más `sw.js`, `manifest.json` e íconos |
| Publicación | GitHub Pages, repo `entradas_webapp` |
| Datos | `localStorage`, guardando después de cada cambio |
| Fuentes | Archivos `woff2` dentro del repo (`fonts/`), guardados por el service worker. Nada de Google Fonts en línea |
| Sin conexión | El service worker sirve **primero lo guardado** y actualiza por detrás |
| Plata | Enteros en pesos |
| Fechas | Se guardan en ISO completo (`toISOString()`); se muestran `dd/mm/aaaa HH:MM` |

**Diferencia con el bingo:** allá el service worker intenta primero la red. Acá no: en la cancha la señal es mala y una red lenta dejaría la app colgada. Primero lo guardado, siempre.

### Archivos

```
index.html        # toda la app
sw.js
manifest.json
icon-192.png
icon-512.png
fonts/            # Barlow, Barlow Condensed, IBM Plex Mono (woff2)
tests.html        # pruebas de las reglas, se abre en el navegador
docs/
```

### Datos guardados

Tres claves en `localStorage`:

| Clave | Contenido |
|---|---|
| `entradas_config` | Botones, socios, datos para transferir, nombre del club |
| `entradas_caja` | La caja abierta, con sus ventas. `null` si no hay |
| `entradas_historial` | Cajas cerradas |

Formas:

```js
config = { club, sociosActivo, transf: { alias, titular, banco },
           botones: [{ id, nombre, grupo, precio, precioSocio, visible, ticket, titulo, aviso, orden }] }

caja = { id, abiertaEn, cerradaEn, condicion, rival, fondo, efectivoContado, compartidoEn, ultimoTicket,
         botones,   // copia de config.botones al abrir: el cierre de una caja vieja no cambia con la configuración
         ventas: [{ id, fechaHora, medio, total, socio, pagador, anuladaEn,
                    lineas:  [{ botonId, nombre, grupo, ticket, titulo, aviso, cantidad, precioUnitario, subtotal }],
                    tickets: [{ numero, clase, titulo, detalle, cuerpo: [{ texto, monto }], total }] }] }
```

- `condicion`: `local` o `visitante`. `medio`: `efectivo`, `transferencia` o `sin_cargo`. `clase`: `combinado` o `individual`.
- `numero` es un entero; se muestra con cuatro cifras. `total` del ticket: en el combinado, la suma; en el individual, el precio unitario.

Cada clave guarda `{ formato: 1, datos }`, para poder migrar si cambia la forma. Si lo guardado no se entiende, se aparta una copia en `{clave}_danado` y la app sigue.

---

## Fase W0 — Base instalable y sin conexión

**Objetivo:** una página vacía con la identidad visual que se instala en el teléfono y abre en modo avión.

Tareas:
- `index.html` con la estructura base, las variables de color y las medidas de `DISENO.md`.
- Fuentes `woff2` en `fonts/`, declaradas con `@font-face`.
- `manifest.json` (vertical, pantalla completa, color de fondo `#EEF0EA`) e íconos.
- `sw.js` que guarda de entrada `index.html`, el manifiesto, los íconos y las fuentes, y responde primero con lo guardado.
- `APP_VERSION` visible en chico. Aviso "Hay una versión nueva. Tocá para actualizar." cuando el service worker cambia.
- Pedir almacenamiento persistente al navegador (`navigator.storage.persist()`).
- Funciones de formato: plata, plurales, fecha.

**Listo cuando:** en Chrome de Android se instala como app, y con el teléfono en modo avión abre con las fuentes correctas.

## Fase W1 — Reglas y guardado

**Objetivo:** las reglas probadas antes de dibujar pantallas.

Tareas:
- Funciones puras, sin tocar la página: `armarVenta()`, `calcularCierre()`, `sugerenciasDePago()`. Referencia: `armar()` y `renderVals()` del prototipo.
- Guardado y lectura de las tres claves, con botones de fábrica la primera vez.
- `tests.html`: carga las funciones y muestra en verde o rojo los casos 1 a 11 de la sección 13 de la especificación.

**Listo cuando:** `tests.html` muestra todos los casos en verde.

## Fase W2 — Abrir caja, vender y cobrar

**Objetivo:** una venta completa.

Tareas:
- Pantalla Abrir caja. Si ya hay una caja abierta, ir directo a Vender.
- Pantalla Vender: botones por grupo, contador y "−", resumen, total, Borrar, Efectivo, Transferencia y "Anotar sin cargo".
- Panel Cobrado: tickets en pantalla, avisos, "¿Quién transfirió?", "¿Con cuánto paga?" y vuelto, "Siguiente".
- En lugar de "Se imprimen N tickets", el panel dice **"Entregá N tickets de papel"**.
- Panel Alias.
- Evitar el doble cobro: bloquear los botones de cobrar apenas se tocan.
- Evitar que la pantalla se apague con la caja abierta (`navigator.wakeLock`, si el navegador lo permite).
- Evitar el zoom por doble toque y la selección de texto en los botones.

**Listo cuando:** se hacen las ventas 1 a 4 de la especificación en un teléfono; cerrar el navegador y volver a entrar deja todo como estaba.

## Fase W3 — Ventas y anulación

Tareas:
- Barra de pestañas Vender / Ventas / Cierre.
- Lista de ventas con resumen, hora, medio ("Transferencia de {nombre}") y total.
- Anular con confirmación en el mismo botón.

**Listo cuando:** el caso 5 de la especificación da los números esperados.

## Fase W4 — Cierre y compartir

**Objetivo:** el informe final, y sacarlo del teléfono.

Tareas:
- Pantalla Cierre con el informe en aspecto de papel (sección 9 de la especificación).
- Efectivo contado y diferencia.
- **"Compartir cierre":** texto listo para WhatsApp con `navigator.share`; si no está disponible, copiar al portapapeles.
- **"Descargar detalle":** CSV con separador `;` y BOM, una fila por línea de venta, con hora, medio y nombre de quien transfirió.
- "Cerrar caja" con confirmación: pasa la caja al historial. Antes de cerrar, recordar "Compartí el cierre antes de cerrar." si todavía no se compartió.
- Historial de cajas cerradas desde Abrir caja, con su cierre en modo lectura y las mismas opciones de compartir.

**Listo cuando:** el cierre después de las ventas 1 a 4 coincide con la tabla de la especificación; el texto llega bien por WhatsApp; el CSV abre en Excel con los mismos totales.

## Fase W5 — Configurar

Tareas:
- Pantalla Configurar y panel Cambiar un botón (sección 10 de la especificación).
- Agregar y ocultar botones. Sin borrar.
- Interruptor de socios y selector Socio / No socio en Vender (sección 11).
- Datos para transferir.
- Configurar solo se abre con la caja cerrada.

**Listo cuando:** pasan los casos 6 a 11 de la especificación hechos a mano.

## Fase W6 — Publicar e instalar

Tareas:
- Revisar todas las pantallas buscando textos técnicos o datos internos a la vista.
- Recorrer todo el flujo con el navegador sin conexión.
- Publicar en GitHub Pages cuando M lo pida.
- Instalar en el teléfono que se va a usar en la cancha. Cargar precios, alias y rival.
- Probar una caja completa en modo avión con ese teléfono.

**Listo cuando:** M hizo una caja de prueba completa en su teléfono en modo avión y compartió el cierre.

## Fase W7 — Prueba en un partido

Antes:
- Abrir la app con señal una vez ese día, para que tome la última versión.
- Batería al 100 %. Brillo alto.
- Talonarios de papel como siempre.

Durante, anotar:
- Cuánto tarda una venta común.
- Qué botón faltó o sobró.
- Momentos en que la app molestó o demoró.
- Si se anotaron los nombres de las transferencias.

Después:
- Compartir el cierre y recién después cerrar la caja.
- Comparar el cierre con la plata contada, con los talonarios y con el extracto.
- Pasar las observaciones a la bitácora y los cambios de reglas a `ESPECIFICACION.md`, en los dos repos.

**Listo cuando:** M decide, con lo que vio, qué cambia antes de la APK.

## Fase W8 — Opcional: mandar el cierre a una planilla

Solo si M lo pide después de la prueba.

- Mismo esquema que el bingo: Google Sheet + Apps Script, dirección fija en el código.
- Se manda al cerrar la caja si hay señal; si no, queda pendiente y se reintenta al abrir la app.
- Recordar que con `no-cors` la app no puede leer errores del servidor, y que el Apps Script hay que volver a publicarlo a mano en cada cambio.

---

## Cómo verificar

- Navegador sin interfaz con Playwright, ventana de 390 × 844.
- Sembrar `localStorage` para arrancar en cualquier estado.
- Probar sin conexión cortando la red del contexto después de la primera carga.
- Revisar que en ninguna pantalla aparezcan IDs ni nombres internos.
