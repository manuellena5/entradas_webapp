# CLAUDE.md — Entradas en la cancha (webapp de prueba)

Webapp para probar en uno o dos partidos el cobro de entradas del Club Deportivo Mitre, **sin impresora**. Los tickets de papel se siguen entregando; la app cuenta las ventas y hace el cierre. Lo que se aprenda acá define la APK (`..\entradas_app`).

## Leer primero, en este orden

1. `docs/ESPECIFICACION.md` — qué hace la app. Es la fuente de verdad de las reglas y es el mismo archivo que en `..\entradas_app\docs`.
2. `docs/DISENO.md` — cómo se ve. M aprobó la estética del prototipo: reproducirla.
3. `docs/PLAN.md` — en qué orden construirla y en qué fase estamos.
4. `docs/BITACORA.md` — qué se hizo y qué se probó en cada fase (crearla en la fase W0).

`docs/prototipo/Main.dc.html` es el código del prototipo, como referencia de estilos y de lógica. No es parte de la app.

## Reglas de trabajo

- Una fase por vez. Frenar al final de cada fase y contarle a M qué se probó de verdad.
- Actualizar la tabla de estado de `docs/PLAN.md` y la bitácora al terminar cada fase.
- Subir `APP_VERSION` (en `index.html`) y `CACHE_NAME` (en `sw.js`) juntas, en el mismo cambio.
- No hacer commit ni push salvo que M lo pida.
- Si cambia una regla, actualizar `ESPECIFICACION.md` acá y en `..\entradas_app\docs`.
- Si falta una regla, preguntarle a M. No inventar.
- Es una prueba. No agregar funciones que no estén en el plan.

## Reglas de la app

- Un solo `index.html`, sin frameworks ni paso de compilación, como las otras apps del club.
- Tiene que abrir y funcionar entera en modo avión, con las fuentes incluidas.
- Guardar después de cada cambio. Una venta cobrada nunca puede depender de un guardado posterior.
- Plata en enteros. Formato `$ 10.000`.
- Los textos en pantalla son para personas no técnicas: cortos, en presente, sin jerga, sin IDs ni datos internos. Lo único técnico a la vista es la versión, en chico.
- M dice "cobrar", no "pagar".
- El repo se publica en GitHub Pages: no poner claves ni datos reales del club en el código. El alias y los precios se cargan desde la app.
