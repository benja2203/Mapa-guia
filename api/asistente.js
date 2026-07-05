// Backend seguro (función serverless de Vercel).
// Recibe la conversación y el contexto, y responde con Gemini (Google) usando un tono cálido.
// La API key de Gemini vive SOLO aquí (variable de entorno), nunca en el teléfono.
// Gemini tiene una capa GRATIS: consigue tu clave en https://aistudio.google.com/app/apikey

const MODELO = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY' })
    return
  }

  try {
    const { mensajes = [], contexto = {} } = req.body || {}

    const nombre = contexto.nombre || 'ella'
    const ubic = contexto.ubicacion
      ? `Su ubicación actual es aprox. lat ${contexto.ubicacion.lat}, lng ${contexto.ubicacion.lng}.`
      : 'Ahora mismo no tenemos su ubicación exacta.'
    const casa = contexto.casa
      ? `Tiene guardada su casa. Puede volver con el botón "Llévame a casa".`
      : 'Aún no tiene una casa guardada en la app.'
    const lugares = (contexto.lugares && contexto.lugares.length)
      ? `Lugares que conoce y tiene guardados: ${contexto.lugares.map((l) => l.nombre).join(', ')}.`
      : 'Todavía no tiene lugares guardados.'

    const system = [
      `Eres "Guía", una compañera de bolsillo cálida y tranquilizadora dentro de una app de mapas.`,
      `Hablas con ${nombre}, una persona que a veces se desorienta y se pierde al salir, y siente ansiedad.`,
      `Hablas español de Chile, cercano y suave. La llamas por su nombre cuando ayuda.`,
      `REGLAS:`,
      `1. Primero calma y da seguridad ("estás bien", "estoy contigo", "respira"). Valida lo que siente.`,
      `2. Luego da UN solo paso simple y concreto a la vez. Nunca varias instrucciones juntas.`,
      `3. Respuestas MUY cortas (2 a 4 frases), pensadas para escucharse en voz alta.`,
      `4. Guíala a usar los botones de la app: "Llévame a casa", "Mis lugares", y el botón rojo de ayuda (SOS) si necesita a su persona de confianza.`,
      `5. No inventes nombres de calles ni direcciones exactas que no puedas saber; si necesita una ruta precisa, dile que toque "Llévame a casa" o el lugar en la app.`,
      `6. Tono amoroso y paciente, nunca apurado ni técnico. Puedes usar 💚 con moderación.`,
      `CONTEXTO: ${ubic} ${casa} ${lugares}`
    ].join('\n')

    // Gemini usa roles "user" y "model".
    const contents = mensajes.map((m) => ({
      role: m.de === 'yo' ? 'user' : 'model',
      parts: [{ text: m.texto }]
    }))
    if (contents.length === 0 || contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: 'Me siento perdida.' }] })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.85 }
      })
    })

    if (!r.ok) {
      const detalle = await r.text()
      console.error('Error de Gemini:', detalle)
      res.status(502).json({ error: 'La compañera no está disponible ahora' })
      return
    }

    const data = await r.json()
    const respuesta = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text)
      .filter(Boolean)
      .join('\n')
      .trim()

    res.status(200).json({ respuesta: respuesta || 'Estoy aquí contigo 💚' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Algo falló, pero sigo aquí contigo' })
  }
}
