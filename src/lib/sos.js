// SOS: comparte su ubicación con la persona de confianza por WhatsApp.
// Es gratis y muy confiable: abre WhatsApp con un mensaje ya escrito y el link de su ubicación.

export function enlaceUbicacion(ubicacion) {
  return `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`
}

export function mensajeSos(ubicacion, nombre) {
  const quien = nombre ? nombre : 'Necesito ayuda'
  return `Hola, soy ${quien}. Me siento perdida y necesito ayuda 💚\nEsta es mi ubicación ahora: ${enlaceUbicacion(ubicacion)}`
}

// Devuelve la URL de WhatsApp para enviar el SOS al contacto.
export function urlWhatsappSos(ubicacion, contacto, nombre) {
  const texto = encodeURIComponent(mensajeSos(ubicacion, nombre))
  const numero = (contacto || '').replace(/[^0-9]/g, '')
  if (numero) return `https://wa.me/${numero}?text=${texto}`
  // Sin contacto configurado: abre WhatsApp para que elija a quién enviar.
  return `https://wa.me/?text=${texto}`
}

// Alternativa: hoja de compartir del teléfono (si está disponible).
export async function compartirUbicacion(ubicacion, nombre) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Mi ubicación', text: mensajeSos(ubicacion, nombre), url: enlaceUbicacion(ubicacion) })
      return true
    } catch {
      return false
    }
  }
  return false
}
