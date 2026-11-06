# Exposición sobre ml5.js — contexto del proyecto

Exposición universitaria (Programación Avanzada) en pareja, 25 minutos, sobre la librería ml5.js en general.
Entregables: diapositivas en HTML, guion, mini demos prácticas y un MVP final.
Los autores tienen JavaScript básico: el código debe ser simple, sin build tools, y con comentarios en español.

## Temas que pide el profesor

Requeridos:
- Qué leyes aplican según la ley colombiana para el uso de datos personales (si aplica)
- Privacidad
- Costo de infraestructura
- Arquitectura
- Problema / funcionalidad

Otros temas para la presentación:
- Correr modelos sin servidor
- Límites en la descarga del modelo, rendimiento, WebGL
- Datos de entrada
- Diferencia entre usar un modelo preentrenado y entrenar uno propio
- Por qué se usan coordenadas en lugar de la imagen cruda como entrada de la red, y qué ventajas tiene
- Cuántos ejemplos de entrenamiento son suficientes para que un clasificador de gestos generalice, y qué pasa si se capturan muy pocos
- Riesgos de privacidad al usar la cámara para IA, incluso si todo es 100% local
- Consideraciones técnicas al usar ml5.js

Nota legal (verificar antes de presentar): Ley 1581 de 2012 (Habeas Data), Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015); los datos biométricos (rostro) son datos sensibles; autoridad: Superintendencia de Industria y Comercio.

## Tecnología y convenciones

- p5.js 1.11.1 y ml5.js 1.2.1, cargados por CDN con versión fija:
  - https://cdn.jsdelivr.net/npm/p5@1.11.1/lib/p5.min.js
  - https://cdn.jsdelivr.net/npm/ml5@1.2.1/dist/ml5.min.js
- Se abre con Live Server en VS Code (localhost permite la cámara). Portátil propio con cámara e internet.
- Video en espejo: `createCapture(VIDEO, { flipped: true })` y los modelos con `{ flipped: true }`.
- En ml5 1.x los callbacks reciben `(resultados, error)`, en ese orden.
- Estilo visual oscuro y moderno: ver `compartido/estilos.css` (paleta, fuentes Bricolage Grotesque + Atkinson Hyperlegible). Reutilizarlo en el MVP y las diapositivas.
- Diapositivas y MVP en archivos HTML separados (si el MVP falla en vivo, las diapositivas siguen).

## Estructura

Todo en un solo proyecto, en el orden de la exposición. `index.html` (raíz) es la portada que enlaza las cuatro partes.
- `1-presentacion/`: diapositivas HTML (explicación de la librería y cómo funciona).
- `2-demos/`: tres mini demos (1-cara faceMesh, 2-manos handPose, 3-cuerpo bodyPose) + `comun.js`.
- `3-mvp/`: el MVP 1 (filtro `index.html`, entrenamiento `entrenar.html`).
- `4-mvp-senas/`: el MVP 2, escribir con señas (`index.html`, `entrenar.html`). Reutiliza `3-mvp/estilos-mvp.css`.
- `compartido/estilos.css`: estilo común de todo el proyecto.
- `compartido/grafica.js`: gráfica SVG del error al entrenar, usada por los dos entrenadores en lugar del visor de tfjs-vis (`debug: true` ya no se usa). Sus estilos están en `3-mvp/estilos-mvp.css`.

## Estado

Hecho: mini demos en `2-demos/`. Aún no probadas con cámara real. Umbrales iniciales sin calibrar: boca abierta 0.08, sonrisa 0.45.

Hecho: MVP en `3-mvp/`, entrenado (modelo en `3-mvp/modelo/`, ejemplos en `3-mvp/datos/`) y funcionando.

Hecho (2026-11-05): presentación en `1-presentacion/` como página web con secciones (no diapositivas): índice lateral, teclas ← →, enlaces a demos y MVP (sin cámara dentro de la presentación). Sin comparación con otras librerías (decisión de los autores). Datos faltantes marcados con la clase `.pendiente`.

Hecho (2026-11-05): código del MVP 2 en `4-mvp-senas/`. Entrenado (confirmado el 2026-11-06): modelo en `4-mvp-senas/modelo/`, ejemplos en `4-mvp-senas/datos/`.

Hecho (2026-11-06): repositorio Git privado en https://github.com/ExNotGomezPascual/ml5-js (rama `main`). Se sube todo, incluidos imágenes y `datos/ejemplos.json`. En este equipo Git usa la cuenta de trabajo `TgomezBexSoluciones`, que es colaboradora del repositorio.

Reentrenado (confirmado el 2026-11-06): `3-mvp/modelo/` tiene las 12 clases actuales (red 171 → 16 → 12, pesos 11.8 KB) y `3-mvp/datos/ejemplos.json` tiene 2 788 ejemplos, solo de los memes actuales (180 a 359 por meme). MVP 2: 2 336 ejemplos, red 42 → 16 → 23, pesos 4.3 KB.

En la presentación, los autores comentaron a mano varios bloques (resultados del MVP, cajas "Qué demuestra / Pendiente", sección "Consideraciones técnicas", sección "Pendientes"). Lo comentado se deja comentado; solo se actualiza el contenido visible.

Pendiente:
1. Guion con reparto de tiempos entre los dos expositores (aún no se lo han repartido)

## Diseño del MVP 2 ("Escribir con señas")

Decidido el 2026-11-05.
- Solo las 21 letras estáticas del alfabeto LSC (lista en `4-mvp-senas/senas.js`). Según la imagen de referencia `4-mvp-senas/Abecedario-Lengua-De-Senas.webp` (dado.com.co), G, H, J, Ñ, S y Z llevan movimiento y quedan fuera. Las tarjetas de entrenamiento muestran el recorte de esa imagen para cada letra.
- Además de las letras, clases "espacio" y "borrar" (gestos que eligen los autores).
- Entrada (`4-mvp-senas/entradas.js`, 42 números): 21 puntos de una mano relativos a la muñeca, divididos por la distancia muñeca → base del dedo medio. Sin mano no se clasifica.
- Escribir: sostener la seña 1 s con confianza >= 0.6. No repite mientras se sostiene; para repetir letra se baja la mano.
- Entrenamiento igual al MVP 1 (3 s espera, 3 s captura, 60 épocas).

## Diseño del MVP ("¿Qué meme eres?")

Decidido el 2026-11-05; reemplaza el diseño anterior de stickers por reglas.
- Cámara a la izquierda, meme que coincide con la expresión a la derecha, más el ranking de los 3 memes más probables.
- Una sola red propia (`ml5.neuralNetwork`, classification) decide el meme. Cada meme es una clase. No hay reglas escritas a mano ni bodyPose.
- Entrada de la red (`3-mvp/entradas.js`, 171 números): 42 puntos de faceMesh (boca, ojos, cejas, contorno) + hasta 2 manos de handPose (21 puntos), todo relativo a la nariz y dividido por el ancho de la cara. Un número 0/1 indica si hay cara y si hay cada mano; si falta, se llenan ceros.
- Anti-parpadeo: el mismo meme 8 veces seguidas con confianza >= 0.6 antes de cambiar.
- Lista de memes en `3-mvp/memes.js` (clase, archivo, pista de expresión); archivos en `3-mvp/memes/`. Desde el 2026-11-06 son 12 memes: 7 imágenes JPEG + 4 stickers WebP (diablito-plan y paloma son animados) + `video.mp4` (clase "video", el gesto lo eligen los autores). Los autores borraron perro-serio, corgi-feliz, corgi-asustado, chihuahua-reojo, gato-triste, llorando-emocion, explosion, senor-pasto y tirado. No hay clase de cara neutral ni de "sin persona".
- Entrenamiento ANTES de la exposición en `3-mvp/entrenar.html`: clic en un meme, 3 s para posar, 3 s capturando. Entrenar, probar en vivo, `red.save()` y copiar model.json, model.weights.bin, model_meta.json a `3-mvp/modelo/`. "Guardar ejemplos" descarga ejemplos.json para `3-mvp/datos/` y poder retomar.
- El filtro (`3-mvp/index.html` + `sketch.js`) carga el modelo con `red.load({ model, metadata, weights })`. Tecla P muestra/oculta los puntos.
- faceMesh + handPose + red corren a la vez: se muestran los FPS (material para el tema de WebGL/rendimiento).

## Forma de trabajar

Los autores pidieron no suponer nada: ante una decisión que no esté en este archivo, preguntar antes de construir.
