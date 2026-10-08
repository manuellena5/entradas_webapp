# Entradas en la cancha — Especificación

Reglas de negocio de la app para cobrar las entradas del Club Deportivo Mitre (Fútbol Mayor).
Este documento es **el mismo** en los dos repos (`entradas_app` y `entradas_webapp`). Si cambia una regla, se actualiza en los dos.

Las reglas salen del prototipo aprobado por M. El código del prototipo está en `docs/prototipo/Main.dc.html` (ver `DISENO.md` para saber cómo leerlo). Si este documento y el prototipo se contradicen, vale este documento.

### Diferencias conocidas con el prototipo

- **Aviso después de cobrar:** el prototipo tiene escrito a mano "Entregá 3 números del sorteo." Acá es un campo `aviso` de cada botón y se muestra `{aviso}: {cantidad}`.
- El prototipo no guarda nada, no imprime, no tiene historial de cajas y cierra la caja sin confirmar. La app sí guarda, y confirma antes de cerrar.
- El prototipo trae datos de ejemplo (`demo`) y marcadores como `[RIVAL]` o `[ALIAS DEL CLUB]`. No van en la app.

---

## 1. Contexto de uso

- Se cobra en la entrada de la cancha. **No hay enchufe y puede no haber señal.** Todo tiene que funcionar sin internet.
- La usa una persona no técnica, parada, al sol, con gente haciendo cola. Cada venta tiene que salir en dos o tres toques.
- Hoy se usan tickets de papel. Se paga en efectivo o por transferencia.
- Hay **un solo punto de cobro** por partido.
- De **local** se venden entradas, tribuna y números de un sorteo. De **visitante** solo entradas.
- Jugadores y menores no pagan. Hoy no se cuentan; la app los tiene que contar.

## 2. Vocabulario

| Término | Significado |
|---|---|
| Caja | Una jornada de cobro: un partido. Se abre, se vende, se cierra. |
| Botón | Cada cosa que se puede vender o anotar (Hombre, Mujer, Tribuna…). En el código puede llamarse `item`. |
| Grupo | Categoría del botón: `entrada`, `extra` o `gratis`. |
| Venta | Una operación de cobro. Puede tener varios botones y varias unidades. |
| Ticket | Un papel impreso. Una venta puede generar cero, uno o varios. |
| Cierre | Informe final de la caja. |

M dice **"cobrar"**, no "pagar": el club cobra.

## 3. Botones

Cada botón tiene:

| Campo | Descripción |
|---|---|
| `nombre` | Texto del botón. Editable. |
| `grupo` | `entrada`, `extra` o `gratis`. No se cambia después de creado. |
| `precio` | Entero en pesos. En el grupo `gratis` siempre es 0 y no se muestra. |
| `precioSocio` | Precio para socios. Solo aplica al grupo `entrada`. Por defecto igual a `precio`. |
| `visible` | Si se muestra para vender. Ocultar no borra nada. |
| `ticket` | Cómo imprime: `persona`, `venta` o `no`. Ver sección 5. |
| `titulo` | Texto grande que sale en el ticket. Siempre en mayúsculas. |
| `aviso` | Texto opcional. Si está cargado, después de cobrar se muestra como recordatorio con la cantidad. |
| `orden` | Posición dentro de su grupo. |

### Grupos

| Grupo | Dónde se vende | ¿Cuenta como persona que ingresó? | En pantalla |
|---|---|---|---|
| `entrada` | Local y visitante | Sí | Botones grandes, de color |
| `extra` | Solo de local | No | Botones medianos, blancos con borde |
| `gratis` | Local y visitante | Sí | Botones chicos, grises, bajo el título "No pagan entrada" |

### Botones de fábrica

| Nombre | Grupo | Precio | Ticket | Título | Aviso |
|---|---|---|---|---|---|
| Hombre | entrada | 10.000 | venta | ENTRADA GENERAL | — |
| Mujer | entrada | 7.000 | venta | ENTRADA GENERAL | — |
| Tribuna | extra | 2.000 | persona | TRIBUNA | — |
| Sorteo | extra | 2.000 | no | SORTEO | Entregá números del sorteo |
| Jugador | gratis | 0 | no | SIN CARGO | — |
| Menor | gratis | 0 | no | SIN CARGO | — |

La tribuna va uno por persona porque **ese ticket sí se controla**. El número del sorteo se sigue entregando en papel aparte: la app solo lo cuenta.

## 4. Vender

1. Tocar un botón suma 1. Aparece un contador sobre el botón y un botón "−" para restar 1.
2. Abajo se ve el resumen ("2 Hombres · 1 Mujer · 2 Tribunas") y el total.
3. "Borrar" vacía lo cargado.
4. Se cobra con **Efectivo** o **Transferencia**. Con el carrito vacío, los dos botones están apagados.
5. Si hay cosas cargadas y el total es $ 0 (solo los que no pagan), en lugar de los dos botones aparece uno solo: **"Anotar sin cargo"**. El medio de esa venta es `sin_cargo`.
6. Al cobrar:
   - Se guarda la venta **antes** de imprimir. Si la impresión falla, la venta ya está.
   - Se generan los tickets (sección 5).
   - Se abre la pantalla de cobrado (sección 6).
7. La venta guarda una **copia** del nombre, grupo, modo de ticket, precio unitario y subtotal de cada línea. Cambiar un precio o un nombre después no modifica ventas ya hechas.

No hay pago mixto (parte efectivo, parte transferencia). Está fuera de alcance.

### Plurales

Nunca "entrada(s)" ni "ticket(s)". Usar una función: 1 → nombre tal cual; más de 1 → si termina en vocal agrega "s", si termina en "s" queda igual, si no agrega "es". (Hombre → Hombres, Mujer → Mujeres, Jugador → Jugadores.)

### Plata

Siempre enteros en pesos. Formato `$ 10.000`: signo, espacio, punto de miles, sin decimales.

## 5. Tickets

Cada botón elige su modo:

| Modo | Qué imprime |
|---|---|
| `persona` | Un ticket por cada unidad vendida. |
| `venta` | Un solo ticket para toda la venta, con las líneas de todos los botones en este modo. |
| `no` | Nada. Se cuenta en el cierre y no gasta papel. |

Reglas para una venta:

- Si hay al menos una línea en modo `venta`, sale **un ticket combinado** con todas esas líneas.
- Por cada unidad de cada línea en modo `persona`, sale **un ticket individual**.
- Las líneas en modo `no` no aparecen en ningún ticket.
- Orden: primero el combinado, después los individuales en el orden de los botones.
- **Numeración:** correlativa dentro de la caja, empieza en 0001, cuatro dígitos. Cada ticket generado consume un número. Anular una venta no libera sus números.

### Ticket combinado

- Título: si todas las líneas tienen el mismo `titulo`, ese. Si no, `COMPROBANTE`.
- Cuerpo: una línea por botón, `{cantidad} {NOMBRE}` a la izquierda y el subtotal a la derecha. Si el subtotal es 0, `s/cargo`.
- Al pie del cuerpo: `TOTAL $ x` (solo si el total es mayor que 0).

### Ticket individual

- Título: el `titulo` del botón.
- Detalle: el nombre en mayúsculas. Se omite si es igual al título (TRIBUNA / TRIBUNA).
- Precio unitario, si es mayor que 0.

### En todos

- Arriba: nombre del club y `vs. {rival}` (o "Partido de hoy" si no se cargó rival).
- Abajo: fecha y hora, número de ticket y medio de cobro.
- Si la venta fue a precio de socio, los tickets de botones del grupo `entrada` llevan ` · SOCIO` (en el título del combinado, en el detalle del individual). Si el combinado junta títulos distintos, sale `COMPROBANTE · SOCIO`. Si el detalle del individual queda vacío, dice `SOCIO`.
- El nombre de quien transfirió **no** se imprime.

### Ejemplo en papel de 58 mm (32 columnas)

```
      CLUB DEPORTIVO MITRE
           vs. RIVAL
        ENTRADA GENERAL
--------------------------------
2 HOMBRE                $ 20.000
1 MUJER                  $ 7.000
--------------------------------
         TOTAL $ 27.000
        07/10/2026 15:41
       N 0001 - Efectivo
```

```
      CLUB DEPORTIVO MITRE
           vs. RIVAL
            TRIBUNA
            $ 2.000
        07/10/2026 15:41
       N 0002 - Efectivo
```

## 6. Pantalla de cobrado

Después de cobrar se muestra, de arriba hacia abajo:

1. "Cobrado" (o "Anotado" si el total es 0), el medio y el total.
2. Los tickets de la venta, tal como salen impresos, con el texto "Se imprime 1 ticket" / "Se imprimen N tickets".
3. Avisos:
   - Por cada línea con `aviso` cargado: `{aviso}: {cantidad}`.
   - Si hay líneas en modo `no` sin aviso: "Anotado sin ticket: 1 Menor · 1 Jugador."
   - Si fue transferencia: "Pedí ver el comprobante de la transferencia."
4. **Si fue transferencia:** campo "¿Quién transfirió?" con texto de ayuda "Nombre (opcional)". Se guarda en la venta a medida que se escribe. Puede quedar vacío.
5. **Si fue efectivo:** "¿Con cuánto paga?" con hasta tres sugerencias. Al tocar una, muestra el vuelto.
   - Sugerencias: redondear el total hacia arriba al múltiplo de 10.000, 20.000, 50.000 y 100.000; quedarse con los que son mayores que el total, sin repetir, los tres primeros.
   - Es solo una ayuda. No se guarda.
6. Botón grande **"Siguiente"**: vuelve a vender con el carrito vacío.

### Alias

En la pantalla de venta hay un botón **"Alias"**. Abre un panel con el alias en grande, "A nombre de" y "Banco o billetera", más "A transferir $ x" si hay algo cargado. Sirve para mostrarle la pantalla al que va a transferir. Los datos se cargan en Configurar.

La app **no verifica** transferencias. Se anotan y se concilian después contra el extracto.

## 7. Ventas y anulación

- Lista de ventas de la caja, la más nueva arriba: qué se vendió, hora, medio, total.
- Las transferencias con nombre se leen "Transferencia de {nombre}".
- Filtro por medio: **Todas**, **Efectivo**, **Transferencia**. Arriba se ve cuántas ventas y cuánto suman las que se están mirando, sin contar las anuladas. Sirve para controlar las transferencias contra el extracto.
- "Anular" pide confirmación en el mismo botón (primer toque: "¿Anular?"; segundo toque: anula).
- Una venta anulada queda en la lista, tachada y marcada "Anulada". No se borra ni se puede desanular.
- Las anuladas no suman en ningún total del cierre; se informan aparte.

## 8. Caja

### Abrir

- Elegir **Local** o **Visitante**. De visitante se ocultan los botones del grupo `extra`.
- Rival (opcional).
- "Plata para dar vuelto" (opcional, entero).
- Se muestran los precios del día y el acceso a Configurar.
- Solo puede haber **una caja abierta**. Si la app se cierra o el equipo se apaga, al volver a abrirla tiene que seguir en la misma caja, en la pantalla de vender, sin perder ninguna venta. El carrito a medio cargar se puede perder.

### Cerrar

- "Cerrar caja" deja la caja como cerrada y vuelve a la pantalla de abrir.
- La caja cerrada no se modifica más, pero se tiene que poder volver a ver y a imprimir su cierre.
- Los botones, precios y datos de transferencia se conservan de una caja a la otra.

### Salir

- El botón "atrás" del teléfono no cierra la app de un toque: el primero muestra "Tocá atrás otra vez para salir." y, si se toca de nuevo mientras se ve ese aviso, la app se cierra. Lo que estaba en pantalla no cambia.

## 9. Cierre de caja

Informe con forma de ticket. Todo sale de las ventas **no anuladas**, usando la copia guardada en cada venta.

| Bloque | Contenido |
|---|---|
| Encabezado | Club, "CIERRE DE ENTRADAS", rival, Local o Visitante, fecha |
| ENTRADAS | Una fila por botón del grupo `entrada`: cantidad y monto. Fila "Subtotal". |
| Extras | Una fila por botón del grupo `extra`: cantidad y monto. Solo de local. |
| SIN CARGO | Una fila por botón del grupo `gratis`: cantidad. |
| Ingresaron en total | Cantidades del grupo `entrada` + cantidades del grupo `gratis`. |
| COBRADO | Efectivo, Transferencia y TOTAL. Las transferencias **no** se listan una por una: pueden ser muchas y el cierre quedaría muy largo. Se ven en Ventas, con el filtro Transferencia. |
| EFECTIVO EN CAJA | Para vuelto + Ventas en efectivo = "Tiene que haber". |
| Ventas anuladas | Cantidad y monto. |

- Un botón oculto que tuvo ventas en esta caja igual aparece.
- En las filas, el nombre del botón va en plural (Hombres, Mujeres, Jugadores).
- **Efectivo contado:** se cuentan los billetes de $ 20.000, $ 10.000, $ 2.000, $ 1.000, $ 500, $ 200 y $ 100: para cada uno se pone cuántos hay, se ve el subtotal y abajo el total contado. Ese total se compara con "Tiene que haber" y muestra "Coincide con lo esperado.", "Sobran $ x." o "Faltan $ x." Mientras no se cargue ningún billete, no se muestra la comparación. El cierre compartido trae el total contado y los billetes cargados.
- Botones: "Imprimir cierre" y "Cerrar caja".

## 10. Configurar

Solo con la caja cerrada.

- **Botones**, agrupados en "Entradas", "Solo cuando se juega de local" y "No pagan entrada". En cada grupo se puede agregar uno nuevo.
- Al tocar un botón se edita: nombre, precio, precio para socios (si está activado y es del grupo `entrada`), modo de ticket, título del ticket (solo si imprime) y si se muestra para vender.
- **No se borran botones.** Se ocultan, para no perder el historial.
- **Socios:** interruptor "Precio distinto para socios". Ver sección 11.
- **Datos para transferir:** alias, a nombre de, banco o billetera.

Valores por defecto de un botón nuevo: en `entrada`, modo `venta` y título ENTRADA GENERAL; en `extra`, modo `persona` y título EXTRA; en `gratis`, modo `no` y título SIN CARGO.

## 11. Socios

Hoy el precio es el mismo para socios y no socios. A futuro M quiere cobrar distinto.

- Con el interruptor apagado no cambia nada en la pantalla de venta.
- Con el interruptor encendido, arriba de los botones aparece "No socio / Socio". Elegir Socio hace que los botones del grupo `entrada` usen `precioSocio`.
- La elección vale para **toda la venta** y vuelve a "No socio" después de cobrar.
- La venta guarda si fue de socio.

## 12. Textos en pantalla

La usan personas no técnicas. Reglas firmes:

- Nada de jerga ni de cosas internas: ni IDs, ni nombres de tablas, ni direcciones web, ni explicaciones de cómo funciona por dentro.
- Mensajes cortos, claros y en presente. Decir qué le pasa a la persona, no cómo lo resuelve el sistema.
- Errores en términos de la persona: "No se pudo imprimir. La venta quedó guardada."
- Único dato técnico permitido a la vista: la versión, chiquita.

## 13. Casos de prueba

Con los botones de fábrica, de local, plata para vuelto $ 20.000. Sirven para las dos implementaciones.

| # | Venta | Resultado esperado |
|---|---|---|
| 1 | 2 Hombre + 1 Mujer + 2 Tribuna, efectivo | Total $ 31.000. 3 tickets: N° 0001 combinado ENTRADA GENERAL (2 HOMBRE $ 20.000 / 1 MUJER $ 7.000 / TOTAL $ 27.000); N° 0002 y 0003 TRIBUNA $ 2.000. Sugerencias de pago: 40.000, 50.000, 100.000. Con 50.000, vuelto $ 19.000. |
| 2 | 1 Mujer + 1 Menor, transferencia, nombre "Juan" | Total $ 7.000. 1 ticket (N° 0004). Aviso "Anotado sin ticket: 1 Menor." En ventas: "Transferencia de Juan". |
| 3 | 1 Jugador | Total $ 0. Botón "Anotar sin cargo". Medio sin cargo. 0 tickets. |
| 4 | 1 Hombre + 3 Sorteo, efectivo | Total $ 16.000. 1 ticket (N° 0005: 1 HOMBRE $ 10.000 / TOTAL $ 10.000). Aviso "Entregá números del sorteo: 3". |

Cierre después de 1 a 4:

| Concepto | Cantidad | Monto |
|---|---|---|
| Hombres | 3 | $ 30.000 |
| Mujeres | 2 | $ 14.000 |
| Subtotal entradas | 5 | $ 44.000 |
| Tribunas | 2 | $ 4.000 |
| Sorteos | 3 | $ 6.000 |
| Jugadores | 1 | — |
| Menores | 1 | — |
| Ingresaron en total | 7 | — |
| Efectivo | — | $ 47.000 |
| Transferencia | — | $ 7.000 |
| TOTAL | — | $ 54.000 |
| Tiene que haber | — | $ 67.000 |

| # | Acción | Resultado esperado |
|---|---|---|
| 5 | Anular la venta 4 | Hombres 2 ($ 20.000), Sorteos 0, Efectivo $ 31.000, TOTAL $ 38.000, Ingresaron 6, Tiene que haber $ 51.000, Ventas anuladas 1 ($ 16.000). El próximo ticket es el N° 0006. |
| 6 | Abrir de visitante | No aparecen Tribuna ni Sorteo, ni en venta ni en el cierre. |
| 7 | Activar socios, precio socio de Hombre $ 8.000, vender 1 Hombre como socio | Total $ 8.000. Título del ticket "ENTRADA GENERAL · SOCIO". La venta siguiente arranca en "No socio". |
| 8 | Hombre en modo `persona`, Tribuna en modo `venta`; vender 2 Hombre + 1 Tribuna | 3 tickets: primero el combinado TRIBUNA (1 TRIBUNA $ 2.000 / TOTAL $ 2.000), después dos individuales ENTRADA GENERAL / HOMBRE / $ 10.000. |
| 9 | Hombre y Tribuna en modo `venta`; vender 1 y 1 | 1 ticket con título COMPROBANTE. |
| 10 | Cambiar el precio de Hombre a $ 12.000 con ventas ya hechas | Las ventas anteriores y sus totales no cambian. |
| 11 | Ocultar Mujer después de venderle | No aparece para vender; sigue en el cierre de esa caja. |
| 12 | Cerrar la app a la fuerza con la caja abierta y volver a entrar | Sigue la misma caja, con todas las ventas. |

## 14. Fuera de alcance

- Pago mixto.
- Más de un punto de cobro a la vez.
- Verificar transferencias.
- Facturación.
- Control de acceso (leer o validar tickets en la puerta).

## 15. Para preguntarle a M antes de decidir

- Datos reales para transferir (alias, titular, banco).
- Si el encabezado del ticket dice "CLUB DEPORTIVO MITRE" o quiere otro texto.
- Si los que no pagan, puestos en modo "uno por venta", tienen que figurar en el comprobante (hoy figuran como `s/cargo`).
- Qué quiere que pase con el cierre una vez cerrado: a quién se le manda y en qué formato.
