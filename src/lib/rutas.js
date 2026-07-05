// Rutas: caminata que SIGUE LAS CALLES (OpenRouteService) + apoyo en Google Maps
// para transporte público (micros, Metro) que ya conoce las rutas reales de Chile.
import { ORS_API_KEY, HAY_ORS } from './config.js'

// Ruta a pie real por las calles. Devuelve la línea que dobla en las esquinas.
export async function rutaAPie(desde, hasta) {
  if (!HAY_ORS) throw new Error('SIN_ORS')
  const resp = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
    method: 'POST',
    headers: {
      Authorization: ORS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coordinates: [
        [desde.lng, desde.lat],
        [hasta.lng, hasta.lat]
      ],
      instructions: true,
      language: 'es'
    })
  })
  if (!resp.ok) throw new Error('No pude calcular la ruta ahora')
  const data = await resp.json()
  const f = data.features && data.features[0]
  if (!f) throw new Error('No encontré un camino')
  // ORS entrega [lng, lat]; Leaflet quiere [lat, lng].
  const coordenadas = f.geometry.coordinates.map(([lng, lat]) => [lat, lng])
  const resumen = f.properties.summary || {}
  const pasos = (f.properties.segments || []).flatMap((s) => s.steps || []).map((p) => p.instruction)
  return {
    coordenadas,
    distancia: resumen.distance || 0, // metros
    duracion: resumen.duration || 0, // segundos
    pasos
  }
}

// Abre Google Maps para CAMINAR con guía por voz paso a paso.
export function urlGoogleCaminar(hasta) {
  return `https://www.google.com/maps/dir/?api=1&destination=${hasta.lat},${hasta.lng}&travelmode=walking`
}

// Abre Google Maps en modo TRANSPORTE (micros y Metro).
export function urlGoogleTransporte(hasta) {
  return `https://www.google.com/maps/dir/?api=1&destination=${hasta.lat},${hasta.lng}&travelmode=transit`
}

// Busca un lugar por nombre/dirección (Nominatim de OpenStreetMap, gratis).
export async function buscarLugar(texto) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=es&countrycodes=cl&q=${encodeURIComponent(texto)}`
  const resp = await fetch(url, { headers: { 'Accept-Language': 'es' } })
  if (!resp.ok) throw new Error('No pude buscar ese lugar')
  const data = await resp.json()
  return data.map((r) => ({
    nombre: r.display_name.split(',').slice(0, 2).join(','),
    direccion: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon)
  }))
}

export function minutosCaminando(metros) {
  // ~5 km/h => 83.3 m/min
  return Math.max(1, Math.round(metros / 83.3))
}
