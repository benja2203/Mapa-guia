import { useEffect, useState } from 'react'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import Icono from '../components/Icono.jsx'
import { observarUbicacion } from '../lib/ubicacion.js'
import { buscarLugar, urlGoogleTransporte } from '../lib/rutas.js'

export default function Explorar({ onIrARuta, onGuardarLugar }) {
  const [yo, setYo] = useState(null)
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState([])
  const [seleccion, setSeleccion] = useState(null)
  const [centrarA, setCentrarA] = useState(null)
  const [estado, setEstado] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const parar = observarUbicacion(setYo, () => {})
    return () => parar()
  }, [])

  async function buscar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setEstado('cargando')
    setSeleccion(null)
    try {
      const r = await buscarLugar(texto)
      setResultados(r)
      setEstado(r.length ? '' : 'No encontré ese lugar. Prueba con otras palabras.')
    } catch (err) {
      setEstado(err.message)
    }
  }

  function elegir(r) {
    setSeleccion(r)
    setResultados([])
    setCentrarA({ lat: r.lat, lng: r.lng, zoom: 16 })
    setGuardado(false)
  }

  function centrarme() {
    if (yo) setCentrarA({ lat: yo.lat, lng: yo.lng, zoom: 16, _t: Date.now() })
  }

  function guardar() {
    if (!seleccion) return
    onGuardarLugar({
      id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      nombre: seleccion.nombre,
      icono: 'pin',
      lat: seleccion.lat,
      lng: seleccion.lng,
      direccion: seleccion.direccion
    })
    setGuardado(true)
  }

  return (
    <div className="vista con-barra">
      <div className="enc">
        <div className="enc-txt">
          <h1 className="enc-titulo">Mapa</h1>
          <p className="enc-sub">Explora o busca un lugar</p>
        </div>
      </div>

      <form className="explorar-buscar" onSubmit={buscar}>
        <div className="fila-buscar">
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar dirección o lugar…" />
          <button className="boton principal" type="submit" aria-label="Buscar"><Icono nombre="buscar" size={20} /></button>
        </div>
        {estado === 'cargando' && <div className="cargando">Buscando…</div>}
        {estado && estado !== 'cargando' && <div className="aviso" style={{ marginTop: 8 }}>{estado}</div>}
        {resultados.length > 0 && (
          <div className="resultados">
            {resultados.map((r, i) => (
              <button key={i} className="lugar" onClick={() => elegir(r)}>
                <span className="lugar-ico"><Icono nombre="pin" size={22} /></span>
                <span className="lugar-txt">
                  <p className="nombre">{r.nombre}</p>
                  <p className="detalle">{r.direccion}</p>
                </span>
              </button>
            ))}
          </div>
        )}
      </form>

      <MapaLeaflet
        yo={yo}
        busqueda={seleccion}
        grande
        autoAjustar={false}
        centrarA={centrarA}
        onCentrarme={centrarme}
      />

      {seleccion && (
        <div className="hoja">
          <div className="hoja-titulo">
            <span className="lugar-ico"><Icono nombre="pin" size={22} /></span>
            <span>
              <div className="nombre">{seleccion.nombre}</div>
              <div className="detalle">{seleccion.direccion}</div>
            </span>
          </div>
          <button className="boton principal bloque" onClick={() => onIrARuta({ nombre: seleccion.nombre, icono: 'pin', lat: seleccion.lat, lng: seleccion.lng })}>
            <Icono nombre="caminar" size={20} /> Cómo llegar a pie
          </button>
          <a className="boton suave bloque" href={urlGoogleTransporte(seleccion)} target="_blank" rel="noreferrer">
            <Icono nombre="bus" size={20} /> En micro / metro
          </a>
          {guardado ? (
            <div className="exito">✓ Guardado en Mis lugares</div>
          ) : (
            <button className="boton tenue bloque" onClick={guardar}>
              <Icono nombre="mas" size={20} /> Guardar en Mis lugares
            </button>
          )}
        </div>
      )}
    </div>
  )
}
