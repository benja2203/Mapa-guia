import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { buscarLugar } from '../lib/rutas.js'
import { idDispositivo } from '../lib/almacenamiento.js'
import { urlWhatsappSeguir } from '../lib/ubicacionVivo.js'
import { HAY_SUPABASE } from '../lib/config.js'

export default function Ajustes({ ajustes, onGuardar, onVolver }) {
  const [nombre, setNombre] = useState(ajustes?.nombreUsuaria || '')
  const [whatsapp, setWhatsapp] = useState(ajustes?.whatsappContacto || '')
  const [casa, setCasa] = useState(ajustes?.casa || null)
  const [compartirEnVivo, setCompartirEnVivo] = useState(Boolean(ajustes?.compartirEnVivo))
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [estado, setEstado] = useState('')
  const [guardado, setGuardado] = useState(false)

  async function casaAqui() {
    setEstado('cargando')
    try {
      const u = await ubicacionActual()
      setCasa({ lat: u.lat, lng: u.lng, direccion: 'Mi casa (ubicación actual)' })
      setEstado('')
    } catch (e) { setEstado(e.message) }
  }

  async function buscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) return
    setEstado('cargando')
    try {
      const r = await buscarLugar(busqueda)
      setResultados(r)
      setEstado(r.length ? '' : 'No encontré esa dirección.')
    } catch (err) { setEstado(err.message) }
  }

  function guardar() {
    onGuardar({
      nombreUsuaria: nombre.trim(),
      whatsappContacto: whatsapp.replace(/[^0-9]/g, ''),
      casa,
      compartirEnVivo
    })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  return (
    <div className="contenido">
      <button className="volver" onClick={onVolver}>← Volver</button>
      <h2 className="titulo-pantalla">Ajustes ⚙️</h2>

      <div className="tarjeta">
        <label>Su nombre (para saludarla)</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: María" />

        <label>WhatsApp de la persona de confianza (para el SOS)</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="numeric"
          placeholder="Ej: 56912345678 (con código de país)"
        />
        <p className="detalle" style={{ color: '#6d5f56', marginTop: 4 }}>Con código de país, sin + ni espacios.</p>
      </div>

      <div className="tarjeta">
        <label>🏠 Mi casa</label>
        {casa && <div className="aviso" style={{ marginBottom: 10 }}>✅ {casa.direccion || `${casa.lat.toFixed(4)}, ${casa.lng.toFixed(4)}`}</div>}
        <button className="boton principal bloque" onClick={casaAqui}>📍 Estoy en casa ahora (usar esta ubicación)</button>
        <form onSubmit={buscar} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="…o busca la dirección de casa" />
            <button className="boton dorado" type="submit">🔎</button>
          </div>
        </form>
        {estado === 'cargando' && <div className="cargando">Buscando…</div>}
        {estado && estado !== 'cargando' && <div className="aviso" style={{ marginTop: 10 }}>{estado}</div>}
        {resultados.map((r, i) => (
          <button key={i} className="lugar" onClick={() => { setCasa({ lat: r.lat, lng: r.lng, direccion: r.direccion }); setResultados([]) }}>
            <span className="icono">🏠</span>
            <span><p className="nombre" style={{ fontSize: '1.05rem' }}>{r.nombre}</p><p className="detalle">{r.direccion}</p></span>
          </button>
        ))}
      </div>

      <div className="tarjeta">
        <div className="fila-toggle">
          <div>
            <div className="t">📍 Compartir mi ubicación en vivo</div>
            <div className="s">Tu persona de confianza puede verte en tiempo real mientras usas la app.</div>
          </div>
          <button
            className={`toggle ${compartirEnVivo ? 'on' : ''}`}
            aria-label="Compartir ubicación en vivo"
            aria-pressed={compartirEnVivo}
            onClick={() => setCompartirEnVivo((v) => !v)}
          />
        </div>
        {!HAY_SUPABASE && (
          <div className="aviso" style={{ marginTop: 12 }}>Para el seguimiento en vivo hay que configurar la base de datos (Supabase). Ver el README.</div>
        )}
        <a
          className="boton celeste bloque"
          style={{ marginTop: 14, textDecoration: 'none' }}
          href={urlWhatsappSeguir(idDispositivo(), whatsapp, nombre)}
          target="_blank" rel="noreferrer"
        >
          📤 Enviarme el enlace para seguirla
        </a>
        <p className="detalle" style={{ color: '#6f8286', marginTop: 8 }}>Recuerda tocar “Guardar” para activar el cambio.</p>
      </div>

      <button className="boton principal bloque" onClick={guardar}>Guardar cambios 💗</button>
      {guardado && <div className="aviso centrado">✅ Guardado</div>}
    </div>
  )
}
