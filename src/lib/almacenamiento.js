// Almacenamiento OFFLINE-FIRST:
//  - Siempre guarda una copia en el teléfono (localStorage) -> nunca pierde datos.
//  - Si Supabase está configurado, sincroniza en la nube para respaldo.
import { supabase } from './supabase.js'
import { HAY_SUPABASE, AJUSTES_DEFECTO } from './config.js'

const CLAVE_LOCAL = 'contigo_datos'
const CLAVE_DISPOSITIVO = 'contigo_dispositivo'
const TABLA = 'datos' // en Supabase: columnas (dispositivo text PK, ajustes jsonb, lugares jsonb, actualizado timestamptz)

// Identificador anónimo del dispositivo (no requiere login).
export function idDispositivo() {
  let id = localStorage.getItem(CLAVE_DISPOSITIVO)
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || 'disp-' + Date.now() + '-' + Math.random().toString(16).slice(2)
    localStorage.setItem(CLAVE_DISPOSITIVO, id)
  }
  return id
}

function datosVacios() {
  return { ajustes: { ...AJUSTES_DEFECTO }, lugares: [], actualizado: 0 }
}

// Lee la copia local de inmediato (sincrónico).
export function leerLocal() {
  try {
    const bruto = localStorage.getItem(CLAVE_LOCAL)
    if (!bruto) return datosVacios()
    const d = JSON.parse(bruto)
    return { ...datosVacios(), ...d, ajustes: { ...AJUSTES_DEFECTO, ...(d.ajustes || {}) } }
  } catch {
    return datosVacios()
  }
}

function escribirLocal(datos) {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(datos))
}

// Trae la versión de la nube. Devuelve los datos más recientes (nube vs local) o null si no hay nube.
export async function sincronizarDesdeNube() {
  if (!HAY_SUPABASE || !supabase) return null
  try {
    const { data, error } = await supabase
      .from(TABLA)
      .select('ajustes, lugares, actualizado')
      .eq('dispositivo', idDispositivo())
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const local = leerLocal()
    const remoto = {
      ajustes: { ...AJUSTES_DEFECTO, ...(data.ajustes || {}) },
      lugares: data.lugares || [],
      actualizado: data.actualizado ? new Date(data.actualizado).getTime() : 0
    }
    // Gana el más nuevo.
    if (remoto.actualizado >= (local.actualizado || 0)) {
      escribirLocal(remoto)
      return remoto
    }
    // Local es más nuevo: lo subimos.
    await empujarANube(local)
    return local
  } catch (e) {
    console.warn('No se pudo sincronizar desde la nube:', e.message)
    return null
  }
}

async function empujarANube(datos) {
  if (!HAY_SUPABASE || !supabase) return
  try {
    await supabase.from(TABLA).upsert({
      dispositivo: idDispositivo(),
      ajustes: datos.ajustes,
      lugares: datos.lugares,
      actualizado: new Date(datos.actualizado).toISOString()
    })
  } catch (e) {
    console.warn('No se pudo respaldar en la nube (se guardó en el teléfono):', e.message)
  }
}

// Guarda datos: local siempre, nube si se puede. Devuelve el objeto guardado (con marca de tiempo).
export function guardar(parcial) {
  const actual = leerLocal()
  const datos = { ...actual, ...parcial, actualizado: Date.now() }
  escribirLocal(datos)
  empujarANube(datos) // en segundo plano, no bloquea
  return datos
}
