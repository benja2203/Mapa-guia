import { useEffect, useRef, useState } from 'react'
import { preguntarAlCompanero } from '../lib/ia.js'
import { hablar, callar, escuchar, detenerEscucha, hayEscucha } from '../lib/voz.js'
import { ubicacionActual } from '../lib/ubicacion.js'
import Encabezado from '../components/Encabezado.jsx'
import Icono from '../components/Icono.jsx'

const SUGERENCIAS = ['No sé dónde estoy', 'Tengo miedo', 'Quiero ir a casa', 'Ayúdame a calmarme']

export default function Perdida({ ajustes, lugares, onVolver, onCasa }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const ubicacionRef = useRef(null)
  const finRef = useRef(null)

  function contexto() {
    return {
      nombre: ajustes?.nombreUsuaria || '',
      ubicacion: ubicacionRef.current,
      casa: ajustes?.casa || null,
      lugares: (lugares || []).map((l) => ({ nombre: l.nombre }))
    }
  }

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
      setMensajes((prev) => [...prev, { de: 'ia', texto: 'No te escuché bien 💗. Puedes escribirme o tocar el micrófono otra vez.' }])
    }
  }

  const botonCasa = (
    <button className="boton tenue" onClick={onCasa}>
      <Icono nombre="casa" size={18} /> A casa
    </button>
  )

  return (
    <div className="vista con-atras">
      <Encabezado titulo="Estoy contigo 💗" onAtras={onVolver} accion={botonCasa} />

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
            <button className={`boton-voz ${escuchando ? 'escuchando' : ''}`} onClick={hablarPorVoz} aria-label="Hablar por voz">
              <Icono nombre="micro" size={24} />
            </button>
          ) : (
            <button className="boton-voz" onClick={() => enviar(texto)} aria-label="Enviar">
              <Icono nombre="enviar" size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
