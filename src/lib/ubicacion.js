// Utilidades de ubicación (GPS del teléfono).

export function ubicacionActual(opciones = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Tu teléfono no permite ubicación'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy }),
      (err) => reject(traducirError(err)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000, ...opciones }
    )
  })
}

// Observa la ubicación en vivo. Devuelve una función para dejar de observar.
export function observarUbicacion(alActualizar, alFallar) {
  if (!('geolocation' in navigator)) {
    alFallar && alFallar(new Error('Tu teléfono no permite ubicación'))
    return () => {}
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => alActualizar({ lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy }),
    (err) => alFallar && alFallar(traducirError(err)),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
  )
  return () => navigator.geolocation.clearWatch(id)
}

function traducirError(err) {
  if (err.code === 1) return new Error('Necesito permiso para ver tu ubicación 💚')
  if (err.code === 2) return new Error('No pude encontrar tu ubicación. Sal a un lugar abierto e intenta de nuevo')
  if (err.code === 3) return new Error('Está tardando… vuelve a intentar')
  return new Error('No pude obtener tu ubicación')
}

// Distancia en metros entre dos puntos (fórmula de Haversine).
export function distanciaMetros(a, b) {
  const R = 6371000
  const rad = (x) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// Rumbo (dirección) de a hacia b, como texto amable: "hacia el norte", etc.
export function rumboTexto(a, b) {
  const rad = (x) => (x * Math.PI) / 180
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  let grados = (Math.atan2(y, x) * 180) / Math.PI
  grados = (grados + 360) % 360
  const puntos = ['el norte', 'el noreste', 'el este', 'el sureste', 'el sur', 'el suroeste', 'el oeste', 'el noroeste']
  return puntos[Math.round(grados / 45) % 8]
}

export function distanciaTexto(metros) {
  if (metros < 1000) return `${Math.round(metros)} metros`
  return `${(metros / 1000).toFixed(1)} km`.replace('.', ',')
}
