import { useEffect, useState } from 'react'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import { obtenerUbicacion } from '../lib/ubicacionVivo.js'
import { HAY_SUPABASE } from '../lib/config.js'

function haceCuanto(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `hace ${s} segundos`
  const m = Math.round(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  return `hace ${h} h`
}

export default function Seguir({ dispositivo }) {
  const [ubic, setUbic] = useState(null)
  const [estado, setEstado] = useState('cargando')
  const [, setTick] = useState(0)

  useEffect(() => {
    let vivo = true
    async function cargar() {
      const u = await obtenerUbicacion(dispositivo)
      if (!vivo) return
      if (u) { setUbic(u); setEstado('ok') }
      else setEstado(HAY_SUPABASE ? 'sin-datos' : 'sin-config')
    }
    cargar()
    const t = setInterval(cargar, 10000)
    const reloj = setInterval(() => setTick((x) => x + 1), 1000) // refresca el "hace X"
    return () => { vivo = false; clearInterval(t); clearInterval(reloj) }
  }, [dispositivo])

  const nombre = ubic?.nombre || 'ella'

  return (
    <div className="contenido" style={{ paddingTop: 26 }}>
      <h1 className="saludo">Ubicación de {nombre}</h1>
      <p className="subsaludo" style={{ marginTop: 4 }}>Se actualiza sola mientras tenga la app abierta.</p>

      {estado === 'cargando' && <div className="cargando">Buscando su ubicación…</div>}

      {estado === 'sin-config' && (
        <div className="aviso">El seguimiento en vivo aún no está configurado en la app (falta la base de datos).</div>
      )}
      {estado === 'sin-datos' && (
        <div className="aviso">Todavía no hay una ubicación compartida. Aparecerá aquí en cuanto ella active “Compartir en vivo” y salga con la app abierta.</div>
      )}

      {estado === 'ok' && ubic && (
        <>
          <MapaLeaflet yo={{ lat: ubic.lat, lng: ubic.lng }} />
          <div className="panel-ruta">
            <div className="ruta-resumen">
              <span className="dato">📍 En vivo</span>
              <span className="dato" style={{ color: '#6f8286', fontWeight: 600 }}>Actualizado {haceCuanto(ubic.actualizado)}</span>
            </div>
            <a
              className="boton principal bloque"
              href={`https://www.google.com/maps?q=${ubic.lat},${ubic.lng}`}
              target="_blank" rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              🧭 Cómo llegar a ella
            </a>
          </div>
        </>
      )}
    </div>
  )
}
