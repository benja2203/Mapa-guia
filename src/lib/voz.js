// Voz: la app habla (texto-a-voz) y escucha (voz-a-texto), en español.
// Usa la Web Speech API del navegador (gratis, integrada en Chrome de Android).

let vozElegida = null

function elegirVoz() {
  if (vozElegida) return vozElegida
  const voces = window.speechSynthesis ? window.speechSynthesis.getVoices() : []
  vozElegida =
    voces.find((v) => /es[-_]CL/i.test(v.lang)) ||
    voces.find((v) => /es[-_]419/i.test(v.lang)) ||
    voces.find((v) => /^es/i.test(v.lang)) ||
    null
  return vozElegida
}

export function hayVoz() {
  return 'speechSynthesis' in window
}

// Dice un texto en voz alta.
export function hablar(texto) {
  if (!hayVoz() || !texto) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-CL'
    u.rate = 0.98
    u.pitch = 1.05
    const v = elegirVoz()
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  } catch (e) {
    console.warn('No se pudo hablar:', e.message)
  }
}

export function callar() {
  if (hayVoz()) window.speechSynthesis.cancel()
}

// Algunas plataformas cargan las voces de forma diferida.
if (hayVoz()) {
  window.speechSynthesis.onvoiceschanged = () => {
    vozElegida = null
    elegirVoz()
  }
}

const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition

export function hayEscucha() {
  return Boolean(Reconocimiento)
}

// Escucha una frase y devuelve el texto reconocido.
export function escuchar() {
  return new Promise((resolve, reject) => {
    if (!Reconocimiento) {
      reject(new Error('Tu teléfono no permite escuchar por voz'))
      return
    }
    const rec = new Reconocimiento()
    rec.lang = 'es-CL'
    rec.interimResults = false
    rec.maxAlternatives = 1
    let resuelto = false
    rec.onresult = (e) => {
      resuelto = true
      resolve(e.results[0][0].transcript)
    }
    rec.onerror = (e) => reject(new Error(e.error === 'not-allowed' ? 'Necesito permiso para el micrófono 💚' : 'No te escuché bien, intenta de nuevo'))
    rec.onend = () => { if (!resuelto) reject(new Error('No te escuché, intenta de nuevo')) }
    try { rec.start() } catch (e) { reject(e) }
    // guardamos referencia para poder detener desde fuera
    escuchar._activo = rec
  })
}

export function detenerEscucha() {
  if (escuchar._activo) { try { escuchar._activo.stop() } catch {} }
}
