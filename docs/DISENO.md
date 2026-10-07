# Entradas en la cancha — Diseño

M aprobó la estética del prototipo: **fácil de usar y con buena elección de colores**. El objetivo es reproducirla, no reinterpretarla. Este documento es el mismo en los dos repos.

## Cómo leer el prototipo

`docs/prototipo/Main.dc.html` es el código del prototipo. No se abre solo en un navegador (necesita un editor que no está en el repo), pero es la referencia exacta:

- El HTML dentro de `<x-dc>` tiene **todos los estilos en línea**: de ahí salen tamaños, colores, radios y espaciados.
- `{{algo}}` es un dato que viene del código. `<sc-if>` muestra u oculta un bloque. `<sc-for>` repite un bloque por cada elemento de una lista.
- La clase `Component` al final tiene la lógica: `itemsBase()` (botones de fábrica), `armar()` (cómo se arma una venta y sus tickets) y `renderVals()` (totales, cierre, sugerencias de vuelto, textos).
- La pantalla de referencia mide 390 × 844.

## Principios

- **Un toque, un resultado.** Lo que más se usa es lo más grande.
- **Se usa al sol.** Solo tema claro, contraste alto, nada de grises suaves para texto importante.
- **El color no es el único indicador.** Lo seleccionado cambia de fondo y también de texto.
- **Botones para dedos apurados.** Ningún botón mide menos de 44 px de alto.
- **Sin adornos.** Sin degradados, sin sombras, sin íconos decorativos, sin emojis.

## Colores

| Uso | Color |
|---|---|
| Fondo de la app | `#EEF0EA` |
| Superficie (tarjetas, paneles, papel) | `#FFFFFF` |
| Tinta: texto principal, barras, botón seleccionado | `#12161C` |
| Texto secundario | `#4A5560` |
| Texto secundario sobre panel gris | `#3A444D` |
| Texto secundario sobre barra oscura | `#C9CFC6` |
| Panel suave (precios, fondo de tickets, vuelto) | `#DDE1D7` |
| Botón "no paga" y fila oculta | `#D3D9CC` |
| Verde: Efectivo, Abrir caja, "coincide" | `#1C6B43` |
| Rojo: anular, "faltan", "sobran" | `#A32A1E` |
| Aviso (recordatorios después de cobrar) | `#FBE9C4` |
| Borde punteado del papel | `#8A938A` |
| Fondo oscuro detrás de un panel | `rgba(18, 22, 28, 0.6)` |

### Botones de entrada

Los botones del grupo `entrada` toman color según su posición, en este orden y volviendo a empezar:

| Posición | Fondo | Texto |
|---|---|---|
| 1 | `#1E4E8C` | `#FFFFFF` |
| 2 | `#F2B33D` | `#12161C` |
| 3 | `#0E6E6E` | `#FFFFFF` |
| 4 | `#7A2E5D` | `#FFFFFF` |

El contador sobre el botón usa el color del texto como fondo, y tinta o blanco para el número, lo que contraste.

## Tipografía

| Familia | Uso |
|---|---|
| **Barlow Condensed** 700, mayúsculas | Títulos, nombres de botones, importes grandes, pestañas |
| **Barlow** 400 / 600 / 700 | Todo el resto |
| **IBM Plex Mono** 400 / 600 | Tickets y cierre (aspecto de papel térmico) |

**Las fuentes van dentro de la app**, no se bajan de internet al usarla: la app tiene que abrir sin señal. Las tres son de licencia abierta (OFL).

| Elemento | Tamaño |
|---|---|
| Título de pantalla inicial | 42 px |
| Nombre en botón de entrada | 42 px |
| Total a cobrar | 44 px |
| Nombre en botón extra | 34 px |
| Efectivo / Siguiente | 32–34 px |
| Título de barra superior | 26–28 px |
| Nombre en botón "no paga" | 28 px |
| Pestañas | 24 px |
| Precio dentro de un botón | 19–22 px |
| Texto de campos | 20–22 px |
| Texto normal | 17–18 px |
| Texto secundario | 14–15 px |
| Ticket en pantalla | 13 px, título 19 px |

## Medidas

| Elemento | Medida |
|---|---|
| Botón de entrada | 172 px de alto (124 px si hay más de dos), radio 18 |
| Botón extra | 112 px de alto, borde de 2 px tinta, radio 18 |
| Botón "no paga" | 68 px de alto, radio 14 |
| Efectivo / Transferencia | 84 px de alto, radio 16 |
| Contador y botón "−" | círculos de 46–50 px |
| Campos de texto | 52–60 px de alto, borde de 2 px tinta, radio 12 |
| Barra de pestañas | 64 px, borde superior de 2 px tinta |
| Panel inferior | esquinas superiores con radio 22 |
| Separación entre botones | 10 px |
| Margen lateral | 12–20 px |

## Componentes

- **Barra superior:** fondo tinta, texto blanco. Título a la izquierda, dato o acción a la derecha.
- **Selector de dos o tres opciones** (Local / Visitante, modo de ticket, Socio): botones con borde de 2 px. El elegido va con fondo tinta y texto blanco; los demás, fondo blanco y texto tinta.
- **Interruptor Sí / No:** una fila entera tocable, con una pastilla a la derecha que dice "Sí" (fondo tinta) o "No" (fondo blanco).
- **Panel inferior:** sube desde abajo sobre un fondo oscurecido. Se usa para cobrado, alias y editar un botón.
- **Papel:** fondo blanco, letra monoespaciada, líneas punteadas. Así se muestran los tickets y el cierre: lo que se ve en pantalla es lo que sale impreso.
- **Pestañas:** tres, siempre abajo: Vender, Ventas, Cierre. Solo con la caja abierta.

## Pantallas

1. **Abrir caja.** Club arriba en chico, título grande, Local / Visitante, rival, plata para vuelto, tarjeta con los precios del día y botón "Configurar", botón verde "Abrir caja" abajo.
2. **Vender.** Barra con el rival, Local o Visitante, botón "Alias" y cuántos ingresaron. Selector de socio si está activado. Botones en dos columnas: entradas, extras, y bajo el título "No pagan entrada" los grises. Franja blanca con resumen y total. Efectivo y Transferencia. Pestañas.
3. **Cobrado** (panel). Ver sección 6 de la especificación.
4. **Alias** (panel). Alias en 44 px para que se lea a un metro.
5. **Ventas.** Tarjetas blancas, una por venta. Las anuladas en gris, tachadas.
6. **Cierre.** El informe con aspecto de papel, campo de efectivo contado, "Imprimir cierre" y "Cerrar caja".
7. **Configurar.** Lista por grupos con "Cambiar" a la derecha de cada fila y un botón de borde punteado para agregar. Después, Socios y Datos para transferir.
8. **Cambiar un botón** (panel). Nombre, precio, modo de ticket con su explicación debajo, título del ticket, "Se muestra para vender", "Listo".

## Textos de referencia

Usar estos tal cual:

| Lugar | Texto |
|---|---|
| Carrito vacío | Tocá lo que te piden |
| Local | Se vende todo lo que está configurado. |
| Visitante | Solo se venden entradas. |
| Modo persona | Sale un ticket por cada uno. Sirve cuando alguien lo controla. |
| Modo venta | Sale un solo ticket con todo lo de la venta. |
| Modo no | Se cuenta en el cierre y no gasta papel. |
| Transferencia | Pedí ver el comprobante de la transferencia. |
| Sin ventas | Todavía no hay ventas. |
| Arqueo | Coincide con lo esperado. / Sobran $ x. / Faltan $ x. |
