# Exposición: ml5.js

Exposición universitaria de Programación Avanzada (Pascual Bravo) sobre la librería [ml5.js](https://ml5js.org/): inteligencia artificial que corre en el navegador, sin servidor.

## Cómo abrirlo

1. Abrir la carpeta en VS Code.
2. Abrir `index.html` (raíz) con la extensión **Live Server**.
3. Aceptar el permiso de la cámara en el navegador.

La cámara solo funciona en `localhost` o en HTTPS. Abrir el archivo con doble clic (`file://`) no sirve.

Se necesita internet: p5.js 1.11.1 y ml5.js 1.2.1 se cargan por CDN, y los modelos de ml5 se descargan al abrir cada página.

## Partes

| Carpeta | Contenido |
|---|---|
| `1-presentacion/` | Presentación en HTML: qué es ml5.js, arquitectura, privacidad, costos y ley colombiana. |
| `2-demos/` | Tres mini demos con la cámara: faceMesh (cara), handPose (manos) y bodyPose (cuerpo). |
| `3-mvp/` | MVP 1, "¿Qué meme eres?": una red neuronal propia elige el meme según la expresión. `entrenar.html` captura ejemplos y entrena. |
| `4-mvp-senas/` | MVP 2, "Escribir con señas": una red neuronal propia reconoce letras estáticas del alfabeto de la Lengua de Señas Colombiana. |
| `compartido/` | Estilos comunes y la gráfica del error al entrenar. |

Cada MVP guarda su modelo entrenado en `modelo/` y los ejemplos de entrenamiento en `datos/ejemplos.json`.

## Privacidad

Los archivos `datos/ejemplos.json` contienen coordenadas de la cara y las manos de los autores (no fotos). Por eso este repositorio es privado.

## Créditos de imágenes

- Las imágenes de memes en `3-mvp/memes/` son de terceros y se usan solo con fines educativos.
- `4-mvp-senas/Abecedario-Lengua-De-Senas.webp`: imagen de referencia del abecedario LSC, tomada de dado.com.co.
