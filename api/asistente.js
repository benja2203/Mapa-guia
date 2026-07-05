// Backend seguro (función serverless de Vercel).
// Recibe la conversación y el contexto, y responde con Claude usando un tono cálido.
// La API key vive SOLO aquí (variable de entorno), nunca en el teléfono.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY' })
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

    const messages = mensajes.map((m) => ({
      role: m.de === 'yo' ? 'user' : 'assistant',
      content: m.texto
    }))
    // Aseguramos que la conversación empiece con el usuario.
    if (messages.length === 0 || messages[0].role !== 'user') {
      messages.unshift({ role: 'user', content: 'Me siento perdida.' })
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system,
        messages
      })
    })

    if (!r.ok) {
      const detalle = await r.text()
      console.error('Error de Anthropic:', detalle)
      res.status(502).json({ error: 'La compañera no está disponible ahora' })
      return
    }

    const data = await r.json()
    const respuesta = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    res.status(200).json({ respuesta: respuesta || 'Estoy aquí contigo 💚' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Algo falló, pero sigo aquí contigo' })
  }
}
