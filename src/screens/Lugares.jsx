import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { buscarLugar } from '../lib/rutas.js'
import Icono, { ICONOS_LUGAR } from '../components/Icono.jsx'

export default function Lugares({ lugares, onIr, onGuardar, onEliminar }) {
  const [agregando, setAgregando] = useState(false)

  return (
    <div className="vista con-barra">
      <div className="enc">
        <div className="enc-txt">
          <h1 className="enc-titulo">Mis lugares</h1>
          <p className="enc-sub">Tus lugares favoritos, a un toque</p>
        </div>
      </div>

      {agregando ? (
        <FormularioLugar
          onCancelar={() => setAgregando(false)}
          onGuardar={(lugar) => { onGuardar(lugar); setAgregando(false) }}
        />
      ) : (
        <>
          {lugares.length === 0 ? (
            <div className="tarjeta vacio">
              <span className="vacio-ico"><Icono nombre="pin" size={30} /></span>
              <p>Aún no tienes lugares guardados. Agrega tu casa, la de un familiar o los lugares que más visitas.</p>
            </div>
          ) : (
            lugares.map((l) => (
              <div key={l.id} className="fila-lugar">
                <button className="lugar" onClick={() => onIr(l)}>
                  <span className="lugar-ico"><Icono nombre={l.icono || 'pin'} size={24} /></span>
                  <span className="lugar-txt">
                    <p className="nombre">{l.nombre}</p>
                    <p className="detalle">{l.direccion || 'Tocar para ir'}</p>
                  </span>
                </button>
                <button className="borrar" aria-label={`Borrar ${l.nombre}`} onClick={() => onEliminar(l.id)}>
                  <Icono nombre="basura" size={20} />
                </button>
              </div>
            ))
          )}
          <button className="boton principal bloque" onClick={() => setAgregando(true)}>
            <Icono nombre="mas" size={20} /> Agregar un lugar
          </button>
        </>
      )}
    </div>
  )
}

function FormularioLugar({ onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('casa')
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
    } catch (e) { setEstado(e.message) }
  }

  async function buscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) return
    setEstado('cargando')
    try {
      const r = await buscarLugar(busqueda)
      setResultados(r)
      setEstado(r.length ? '' : 'No encontré ese lugar. Prueba con otra palabra.')
    } catch (err) { setEstado(err.message) }
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
      nombre: nombre.trim(), icono, lat: coords.lat, lng: coords.lng, direccion
    })
  }

  return (
    <div className="tarjeta">
      <div className="campo">
        <label>¿Cómo se llama este lugar?</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Casa de la abuela" />
      </div>

      <div className="campo">
        <label>Elige un ícono</label>
        <div className="selector-iconos">
          {ICONOS_LUGAR.map((ic) => (
            <button key={ic} className={`opcion-icono ${icono === ic ? 'activo' : ''}`} onClick={() => setIcono(ic)} aria-label={ic}>
              <Icono nombre={ic} size={24} />
            </button>
          ))}
        </div>
      </div>

      <div className="campo">
        <label>¿Dónde queda?</label>
        <button className="boton principal bloque" onClick={usarMiUbicacion}>
          <Icono nombre="centrar" size={20} /> Usar mi ubicación actual
        </button>
        <form onSubmit={buscar}>
          <div className="fila-buscar">
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="…o busca una dirección" />
            <button className="boton suave" type="submit" aria-label="Buscar"><Icono nombre="buscar" size={20} /></button>
          </div>
        </form>
      </div>

      {estado === 'cargando' && <div className="cargando">Buscando…</div>}
      {estado && estado !== 'cargando' && <div className="aviso">{estado}</div>}

      {resultados.map((r, i) => (
        <button key={i} className="lugar" onClick={() => elegirResultado(r)}>
          <span className="lugar-ico"><Icono nombre="pin" size={22} /></span>
          <span className="lugar-txt"><p className="nombre">{r.nombre}</p><p className="detalle">{r.direccion}</p></span>
        </button>
      ))}

      {coords && <div className="aviso">✓ Ubicación lista: {direccion}</div>}

      <div className="fila-botones">
        <button className="boton suave bloque" onClick={onCancelar}>Cancelar</button>
        <button className="boton principal bloque" onClick={guardar} disabled={!nombre.trim() || !coords}>Guardar</button>
      </div>
    </div>
  )
}
