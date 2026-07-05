import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { buscarLugar } from '../lib/rutas.js'

const ICONOS = ['🏠', '👵', '🏥', '🛒', '☕', '⛪', '🥋', '🎪', '💃', '🎨', '💚', '📍']

export default function Lugares({ lugares, onIr, onGuardar, onEliminar, onVolver }) {
  const [agregando, setAgregando] = useState(false)

  return (
    <>
      <div className="contenido">
        <button className="volver" onClick={onVolver}>← Volver</button>
        <h2 className="titulo-pantalla">Mis lugares 📍</h2>

        {!agregando && (
          <>
            {lugares.length === 0 && (
              <div className="aviso">Todavía no tienes lugares guardados. Agrega tu casa y los lugares que más visitas para llegar con un solo toque 💚</div>
            )}
            {lugares.map((l) => (
              <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'stretch', marginBottom: 12 }}>
                <button
                  className="lugar"
                  style={{ margin: 0, flex: 1 }}
                  onClick={() => onIr(l)}
                >
                  <span className="icono" aria-hidden="true">{l.icono || '📍'}</span>
                  <span>
                    <p className="nombre">{l.nombre}</p>
                    <p className="detalle">Tocar para ir</p>
                  </span>
                </button>
                <button
                  className="boton suave"
                  aria-label={`Borrar ${l.nombre}`}
                  onClick={() => onEliminar(l.id)}
                >🗑️</button>
              </div>
            ))}
            <button className="boton dorado bloque" onClick={() => setAgregando(true)}>➕ Agregar un lugar</button>
          </>
        )}

        {agregando && (
          <FormularioLugar
            onCancelar={() => setAgregando(false)}
            onGuardar={(lugar) => { onGuardar(lugar); setAgregando(false) }}
          />
        )}
      </div>
    </>
  )
}

function FormularioLugar({ onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('📍')
  const [coords, setCoords] = useState(null)
  const [direccion, setDireccion] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [estado, setEstado] = useState('')

  async function usarMiUbicacion() {
    setEstado('cargando')
    try {
      const u = await ubicacionActual()
      setCoords({ lat: u.lat, lng: u.lng })
      setDireccion('Tu ubicación actual')
      setEstado('')
    } catch (e) {
      setEstado(e.message)
    }
  }

  async function buscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) return
    setEstado('cargando')
    try {
      const r = await buscarLugar(busqueda)
      setResultados(r)
      setEstado(r.length ? '' : 'No encontré ese lugar. Prueba con otra palabra.')
    } catch (err) {
      setEstado(err.message)
    }
  }

  function elegirResultado(r) {
    setCoords({ lat: r.lat, lng: r.lng })
    setDireccion(r.direccion)
    if (!nombre) setNombre(r.nombre)
    setResultados([])
  }

  function guardar() {
    if (!nombre.trim() || !coords) return
    onGuardar({
      id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      nombre: nombre.trim(),
      icono,
      lat: coords.lat,
      lng: coords.lng,
      direccion
    })
  }

  return (
    <div className="tarjeta">
      <label>¿Cómo se llama este lugar?</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Casa de la abuela" />

      <label>Elige un dibujo</label>
      <div className="chip-fila">
        {ICONOS.map((ic) => (
          <button
            key={ic}
            className="chip"
            style={{ fontSize: '1.6rem', borderColor: icono === ic ? '#17a2a2' : '#eadfce', borderWidth: icono === ic ? 3 : 2 }}
            onClick={() => setIcono(ic)}
          >{ic}</button>
        ))}
      </div>

      <label>¿Dónde queda?</label>
      <button className="boton principal bloque" onClick={usarMiUbicacion}>📍 Usar mi ubicación actual</button>

      <form onSubmit={buscar} style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="…o busca una dirección" />
          <button className="boton dorado" type="submit">🔎</button>
        </div>
      </form>

      {estado === 'cargando' && <div className="cargando">Buscando…</div>}
      {estado && estado !== 'cargando' && <div className="aviso" style={{ marginTop: 10 }}>{estado}</div>}

      {resultados.map((r, i) => (
        <button key={i} className="lugar" onClick={() => elegirResultado(r)}>
          <span className="icono">📍</span>
          <span><p className="nombre" style={{ fontSize: '1.05rem' }}>{r.nombre}</p><p className="detalle">{r.direccion}</p></span>
        </button>
      ))}

      {coords && <div className="aviso" style={{ marginTop: 10 }}>✅ Ubicación lista: {direccion}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="boton suave bloque" onClick={onCancelar}>Cancelar</button>
        <button className="boton principal bloque" onClick={guardar} disabled={!nombre.trim() || !coords}>Guardar 💚</button>
      </div>
    </div>
  )
}
