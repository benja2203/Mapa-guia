// Configuración leída de las variables de entorno (Vite expone las VITE_*).
export const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || ''
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const CONTACTO_WHATSAPP = import.meta.env.VITE_CONTACTO_WHATSAPP || ''

export const HAY_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const HAY_ORS = Boolean(ORS_API_KEY)

// Ajustes por defecto (editables en la pantalla Ajustes).
export const AJUSTES_DEFECTO = {
  nombreUsuaria: '',
  casa: null, // { lat, lng, direccion }
  whatsappContacto: CONTACTO_WHATSAPP,
  compartirEnVivo: false // compartir ubicación en tiempo real con la persona de confianza
}
