import { useEffect, useRef, useState } from 'react'
import { preguntarAlCompanero } from '../lib/ia.js'
import { hablar, callar, escuchar, detenerEscucha, hayEscucha } from '../lib/voz.js'
import { ubicacionActual } from '../lib/ubicacion.js'

const SUGERENCIAS = ['No sé dónde estoy', 'Tengo miedo', 'Quiero ir a casa', 'Ayúdame a calmarme']

export default function Perdida({ ajustes, lugares, onVolver, onCasa }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const ubicacionRef = useRef(null)
  const finRef = useRef(null)

  // Contexto para la IA (ubicación, casa, lugares).
  function contexto() {
    return {
      nombre: ajustes?.nombreUsuaria || '',
      ubicacion: ubicacionRef.current,
      casa: ajustes?.casa || null,
      lugares: (lugares || []).map((l) => ({ nombre: l.nombre }))
    }
  }

  // Al entrar: obtener ubicación (sin bloquear) y saludar con calma.
  useEffect(() => {
    ubicacionActual().then((u) => { ubicacionRef.current = u }).catch(() => {})
    enviar('Me siento perdida y desorientada.', true)
    return () => callar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, pensando])

  async function enviar(contenido, oculto = false) {
    const limpio = (contenido ?? '').trim()
    if (!limpio || pensando) return
    const historial = oculto ? [] : [...mensajes, { de: 'yo', texto: limpio }]
    if (!oculto) setMensajes(historial)
    setTexto('')
    setPensando(true)
    try {
      const mensajesParaIA = oculto ? [{ de: 'yo', texto: limpio }] : historial
      const respuesta = await preguntarAlCompanero(mensajesParaIA, contexto())
      setMensajes((prev) => [...prev, { de: 'ia', texto: respuesta }])
      hablar(respuesta)
    } finally {
      setPensando(false)
    }
  }

  async function hablarPorVoz() {
    if (escuchando) { detenerEscucha(); setEscuchando(false); return }
    callar()
    setEscuchando(true)
    try {
      const dicho = await escuchar()
      setEscuchando(false)
      if (dicho) enviar(dicho)
    } catch (e) {
      setEscuchando(false)
      setMensajes((prev) => [...prev, { de: 'ia', texto: 'No te escuché bien 💚. Puedes escribirme o tocar el micrófono otra vez.' }])
    }
  }

  return (
    <div className="contenido" style={{ minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="volver" onClick={onVolver}>← Volver</button>
        <button className="boton principal" onClick={onCasa}>🏠 A casa</button>
      </div>
      <h2 className="titulo-pantalla">Estoy contigo 💚</h2>

      <div className="chat">
        <div className="mensajes">
          {mensajes.map((m, i) => (
            <div key={i} className={`burbuja ${m.de === 'yo' ? 'yo' : 'ia'}`}>{m.texto}</div>
          ))}
          {pensando && <div className="burbuja ia">…</div>}
          <div ref={finRef} />
        </div>

        {mensajes.length <= 2 && (
          <div className="chip-fila">
            {SUGERENCIAS.map((s) => (
              <button key={s} className="chip" onClick={() => enviar(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="chat-entrada">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(texto) } }}
            placeholder="Escríbeme o toca el micrófono…"
          />
          {hayEscucha() ? (
            <button
              className={`boton-voz ${escuchando ? 'escuchando' : ''}`}
              onClick={hablarPorVoz}
              aria-label="Hablar por voz"
            >🎤</button>
          ) : (
            <button className="boton-voz" onClick={() => enviar(texto)} aria-label="Enviar">➤</button>
          )}
        </div>
      </div>
    </div>
  )
}
