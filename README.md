# Contigo 💚 — tu guía para volver a casa

App-mapa con una **compañera de IA** que guía y **acompaña** a una persona que se desorienta
al salir. Está pensada con mucho cariño: **cálida, muy simple y tranquilizadora**, para bajar la
ansiedad de perderse y devolverle autonomía.

Inspirada en sus gustos: **taekwondo 🥋, circo 🎪, cueca 💃 y manualidades 🎨**.

## ¿Qué hace?
- 🏠 **Llévame a casa** — con un toque traza la ruta **a pie siguiendo las calles** (no una línea recta).
- 💚 **Me siento perdida** — una compañera de IA la **calma con palabras de apoyo** y la orienta,
  por **texto y por voz**.
- 📍 **Mis lugares** — favoritos (casa, familia, etc.) para ir con un toque.
- 🚌 **¿Cómo llego en micro/metro?** — abre la ruta en transporte público (Google Maps).
- 🔊 **Voz** — le habla en voz alta y ella puede **hablarle** en vez de escribir.
- 🆘 **SOS** — comparte su ubicación con la persona de confianza por WhatsApp.
- ☁️ Sus datos se guardan en el **teléfono y en la nube** (no pierde nada) y es **instalable** como app.

## Tecnología (todo gratis o de costo mínimo)
- **PWA** con **React + Vite** (instalable en Android).
- Mapa: **Leaflet + OpenStreetMap**. Rutas a pie: **OpenRouteService** (plan gratis).
- IA: **Gemini (Google)** vía un backend seguro (`api/asistente.js`). Tiene **capa gratis**.
- Voz: **Web Speech API** del navegador. Base de datos: **Supabase** (plan gratis).

## Puesta en marcha (desarrollo)
```bash
npm install
cp .env.example .env   # completa tus claves (todas opcionales para probar)
npm run dev
```
La app funciona aunque dejes las claves vacías:
- **Sin OpenRouteService**: muestra dirección y distancia, y ofrece abrir Google Maps.
- **Sin Supabase**: guarda todo en el teléfono (localStorage).
- **Sin backend de IA** (en `npm run dev` no corre `api/`): usa respuestas cálidas de reserva.

## Claves (todas con plan gratis o de centavos)
1. **Gemini (IA, gratis)** — https://aistudio.google.com/app/apikey → `GEMINI_API_KEY` (solo en el backend).
2. **OpenRouteService (rutas a pie)** — https://openrouteservice.org/dev/#/signup → `VITE_ORS_API_KEY`.
3. **Supabase (base de datos)** — https://supabase.com → `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. **WhatsApp del contacto (SOS)** — `VITE_CONTACTO_WHATSAPP` (ej. Chile: `56912345678`).

### Tabla en Supabase (una sola vez)
En el editor SQL de Supabase:
```sql
create table if not exists datos (
  dispositivo text primary key,
  ajustes jsonb,
  lugares jsonb,
  actualizado timestamptz
);
alter table datos enable row level security;
create policy "acceso anon" on datos for all
  using (true) with check (true);
```
> Nota: esta política es abierta para simplicidad de un uso personal. Si más adelante quieres
> más seguridad, se puede agregar login.

## Desplegar (gratis) en Vercel
1. Sube este repo a GitHub e impórtalo en **https://vercel.com**.
2. En *Settings → Environment Variables* agrega las 4 claves de arriba.
3. Deploy. Vercel sirve la PWA y ejecuta `api/asistente.js` automáticamente.
4. Abre el enlace en **Chrome (Android)** → menú → *Instalar app*.

## Personalizar para ella
Todo se configura desde la pantalla **Ajustes ⚙️** dentro de la app (sin tocar código):
su **nombre**, la **dirección de casa** y el **WhatsApp** de la persona de confianza.
