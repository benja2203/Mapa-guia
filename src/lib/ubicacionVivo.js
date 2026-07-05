// Ubicación en VIVO: mientras la app está abierta y la opción está activada,
// envía su ubicación a Supabase cada pocos segundos, para que su persona de
// confianza la vea en tiempo real con un enlace (no solo al tocar SOS).
import { supabase } from './supabase.js'
import { HAY_SUPABASE } from './config.js'
import { idDispositivo } from './almacenamiento.js'
import { observarUbicacion } from './ubicacion.js'

const TABLA = 'ubicaciones' // en Supabase: (dispositivo text PK, nombre text, lat float8, lng float8, precision float8, actualizado timestamptz)
const INTERVALO_MS = 8000

let pararWatch = null
let ultimoEnvio = 0

export function estaCompartiendo() {
  return Boolean(pararWatch)
}

export function iniciarCompartir(nombre) {
  if (pararWatch) return
  pararWatch = observarUbicacion(
    (u) => {
      const ahora = Date.now()
      if (ahora - ultimoEnvio < INTERVALO_MS) return
      ultimoEnvio = ahora
      enviar(u, nombre)
    },
    () => {}
  )
}

export function detenerCompartir() {
  if (pararWatch) { pararWatch(); pararWatch = null }
}

async function enviar(u, nombre) {
  if (!HAY_SUPABASE || !supabase) return
  try {
    await supabase.from(TABLA).upsert({
      dispositivo: idDispositivo(),
      nombre: nombre || '',
      lat: u.lat,
      lng: u.lng,
      precision: u.precision || null,
      actualizado: new Date().toISOString()
    })
  } catch (e) {
    console.warn('No pude enviar la ubicación en vivo:', e.message)
  }
}

// Para la pantalla de seguimiento (la persona de confianza).
export async function obtenerUbicacion(dispositivo) {
  if (!HAY_SUPABASE || !supabase) return null
  try {
    const { data, error } = await supabase
      .from(TABLA)
      .select('nombre, lat, lng, precision, actualizado')
      .eq('dispositivo', dispositivo)
      .maybeSingle()
    if (error || !data) return null
    return { ...data, actualizado: data.actualizado ? new Date(data.actualizado).getTime() : 0 }
  } catch {
    return null
  }
}

export function enlaceSeguir(dispositivo) {
  return `${location.origin}/?seguir=${encodeURIComponent(dispositivo)}`
}

// Enlace de WhatsApp para enviarle a la persona de confianza el link de seguimiento.
export function urlWhatsappSeguir(dispositivo, contacto, nombre) {
  const texto = encodeURIComponent(
    `Hola 💗 Con este enlace puedes ver mi ubicación en vivo cuando salgo${nombre ? `, soy ${nombre}` : ''}:\n${enlaceSeguir(dispositivo)}`
  )
  const numero = (contacto || '').replace(/[^0-9]/g, '')
  return numero ? `https://wa.me/${numero}?text=${texto}` : `https://wa.me/?text=${texto}`
}
