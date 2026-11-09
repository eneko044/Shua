# SHUA French Taco · web

Web de una sola página para **SHUA French Taco**: portada en 3D, carta completa, configurador "Crea tu taco" con precio en directo, shawarma/kebab, pedrata, entrantes y cómo llegar.

## Cómo verla

Usa módulos JavaScript, así que hay que servirla (abrir `index.html` con doble clic no funciona):

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

También funciona tal cual en GitHub Pages, Netlify, Hostinger o cualquier hosting estático. No necesita compilar nada: las librerías (Three.js, GSAP, Lenis) van dentro de `vendor/`.

## Opciones de diseño

Abajo a la izquierda está el botón **Opciones de diseño** para comparar combinaciones. También se pueden enlazar directamente:

| Portada (`hero`) | Qué es |
|---|---|
| `trompo` | Trompo de kebab en 3D con la textura de las fotos reales (ternera arriba, pollo abajo), brasas y luz del grill. Responde al ratón; un clic lo hace girar más rápido. |
| `rayo` | El rayo del logo en 3D, con trozos de papel de aluminio flotando y descargas eléctricas. Un clic lanza un rayo. |
| `foil` | Foto del shawarma de falafel con inclinación 3D en CSS y pegatinas. La más ligera para móviles antiguos. |

| Scroll (`scroll`) | Qué es |
|---|---|
| `cine` | Scroll suave (Lenis), los French Tacos pasan en horizontal con la sección fijada, la frase de la carne se ilumina palabra a palabra, botones magnéticos. |
| `comic` | Cada sección entra como una viñeta (barrido en diagonal), títulos como sellos con un rayo y sacudida, tarjetas que caen rebotando. |
| `suave` | Scroll normal con apariciones discretas. Se usa siempre si el sistema pide reducir animaciones. |

Ejemplos: `?hero=trompo&scroll=cine`, `?hero=rayo&scroll=comic`, `?hero=foil&scroll=suave`.

Cuando elijáis la definitiva, añade `?opciones=0` al enlace o borra el bloque `.opts` de `index.html` para ocultar el selector, y cambia los valores por defecto en el `<script>` del `<head>`.

## Editar la carta

Todos los platos y precios están en `js/menu-data.js`. Cambiar un precio ahí lo cambia en toda la web, incluido el configurador.

## Pendiente

- **Fotos de Google:** el enlace de Google Maps no se pudo descargar desde el entorno de trabajo. Las fotos actuales salen de las imágenes que se pasaron (trompo, shawarma de falafel y french taco de la carta). Para añadir más, guárdalas en `img/` y cámbialas en `index.html`.
- **Dirección, teléfono y horario:** no aparecen en la carta. El botón "Cómo llegar" abre la ficha de Google Maps del local.
