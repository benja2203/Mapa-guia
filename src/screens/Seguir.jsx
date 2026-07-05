import { useEffect, useState } from 'react'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import Icono from '../components/Icono.jsx'
import { obtenerUbicacion } from '../lib/ubicacionVivo.js'
import { HAY_SUPABASE } from '../lib/config.js'

function haceCuanto(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `hace ${s} segundos`
  const m = Math.round(s / 60)
  if (m < 60) return `hace ${m} min`
  return `hace ${Math.round(m / 60)} h`
}

export default function Seguir({ dispositivo }) {
  const [ubic, setUbic] = useState(null)
  const [estado, setEstado] = useState('cargando')
  const [centrarA, setCentrarA] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    let vivo = true
    async function cargar() {
      const u = await obtenerUbicacion(dispositivo)
      if (!vivo) return
      if (u) {
        setUbic(u)
        setEstado('ok')
        setCentrarA({ lat: u.lat, lng: u.lng, zoom: 16 })
      } else setEstado(HAY_SUPABASE ? 'sin-datos' : 'sin-config')
    }
    cargar()
    const t = setInterval(cargar, 10000)
    const reloj = setInterval(() => setTick((x) => x + 1), 1000)
    return () => { vivo = false; clearInterval(t); clearInterval(reloj) }
  }, [dispositivo])

  const nombre = ubic?.nombre || 'ella'

  return (
    <div className="vista">
      <div className="enc">
        <div className="enc-txt">
          <h1 className="enc-titulo">Ubicación de {nombre}</h1>
          <p className="enc-sub">Se actualiza sola mientras tenga la app abierta.</p>
        </div>
      </div>

      {estado === 'cargando' && <div className="cargando">Buscando su ubicación…</div>}
      {estado === 'sin-config' && <div className="aviso">El seguimiento en vivo aún no está configurado en la app (falta la base de datos).</div>}
      {estado === 'sin-datos' && <div className="aviso">Todavía no hay una ubicación compartida. Aparecerá aquí en cuanto ella active “Compartir en vivo” y salga con la app abierta.</div>}

      {estado === 'ok' && ubic && (
        <>
          <MapaLeaflet yo={{ lat: ubic.lat, lng: ubic.lng }} autoAjustar={false} centrarA={centrarA} grande />
          <div className="panel-ruta">
            <div className="ruta-resumen">
              <span className="ruta-dato"><Icono nombre="pin" size={20} className="icono-mini" /> En vivo</span>
              <span className="texto-suave">Actualizado {haceCuanto(ubic.actualizado)}</span>
            </div>
            <a className="boton principal bloque" href={`https://www.google.com/maps?q=${ubic.lat},${ubic.lng}`} target="_blank" rel="noreferrer">
              <Icono nombre="brujula" size={20} /> Cómo llegar a ella
            </a>
          </div>
        </>
      )}
    </div>
  )
}
