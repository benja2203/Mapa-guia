// Cliente del compañero IA. Llama al backend seguro (/api/asistente) que habla con Claude.
// La API key vive SOLO en el backend, nunca aquí.

export async function preguntarAlCompanero(mensajes, contexto) {
  try {
    const resp = await fetch('/api/asistente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensajes, contexto })
    })
    if (!resp.ok) {
      const info = await resp.json().catch(() => ({}))
      throw new Error(info.error || 'sin_backend')
    }
    const data = await resp.json()
    return data.respuesta
  } catch (e) {
    // Si el backend aún no está desplegado, damos una respuesta cálida de reserva
    // para que la app nunca la deje sin compañía.
    return respuestaDeReserva(mensajes, contexto)
  }
}

function respuestaDeReserva(mensajes, contexto) {
  const nombre = (contexto && contexto.nombre) ? contexto.nombre : ''
  const saludo = nombre ? `${nombre}, ` : ''
  const tieneCasa = contexto && contexto.casa
  const partes = [
    `${saludo}estoy aquí contigo 💚. Respira hondo, estás a salvo.`,
    tieneCasa
      ? 'Toca el botón grande "Llévame a casa" y te muestro el camino paso a paso.'
      : 'Vamos a mirar el mapa juntas para orientarnos.',
    'Si prefieres, toca el botón rojo de ayuda y avisamos a tu persona de confianza.'
  ]
  return partes.join(' ')
}
