# Bitride

Landing page de **Bitride** — alquiler de motos Hurricane 250cc y scooters Tank 200 en La Habana, Cuba, con pago en Bitcoin (Lightning), efectivo o cripto.

Sitio de una sola página (`index.html`, HTML + CSS + JS inline, sin dependencias de build) preparado para **GitHub Pages**.

## Características
- Diseño responsive, tema oscuro estilo Bitcoin.
- **i18n** en 5 idiomas (ES / EN / FR / DE / IT) mediante atributos `data-i18n`.
- **Flota en vivo** desde la API de Rentaria (`app.rentaria.app`), con flota estática de respaldo (`FLEET` en `index.html`: 3 Hurricane + 1 Tank 200).
- Calculadora de precios por días (40 / 35 / 30 USD según duración).
- Sección "Todo incluido", requisitos y FAQ.
- Mapa BTCMap + Google Maps, tours y enlaces a redes/WhatsApp.

## Imágenes (`assets/`)
- `assets/motos/` — fotos de la flota (la web usa `hurricane-negra.webp` y `tank200-gris.webp`; `tank200-gris-original.webp` y `tank200-verde-*.webp` quedan de librería).
- `assets/lugares/` — fotos de La Habana, Viñales, Trinidad, playas y tours (WebP; `habana-capitolio.jpg` se mantiene en JPG para la vista previa al compartir en redes/WhatsApp).
- `assets/logo/` — logo de Bitride.

## Desarrollo
Es un único archivo estático: ábrelo en el navegador o sírvelo con cualquier servidor estático.

```bash
python3 -m http.server 8000   # luego abre http://localhost:8000
```

## Contacto
WhatsApp: +53 5500 3336 · La Habana, Cuba
</content>
