import { useEffect, useState } from 'react'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import { observarUbicacion, distanciaMetros, distanciaTexto, rumboTexto } from '../lib/ubicacion.js'
import { rutaAPie, urlGoogleCaminar, urlGoogleTransporte, minutosCaminando } from '../lib/rutas.js'
import { hablar, callar } from '../lib/voz.js'

export default function Mapa({ destino, ajustes, onVolver }) {
  const [yo, setYo] = useState(null)
  const [ruta, setRuta] = useState(null) // coordenadas de la línea que sigue las calles
  const [resumen, setResumen] = useState(null) // { distancia, duracion, pasos }
  const [error, setError] = useState('')
  const [calculando, setCalculando] = useState(true)

  // Seguir la ubicación en vivo.
  useEffect(() => {
    const parar = observarUbicacion(setYo, (e) => setError(e.message))
    return () => parar()
  }, [])

  // Calcular la ruta a pie (siguiendo las calles) cuando tengamos ubicación.
  useEffect(() => {
    if (!yo || !destino) return
    let cancelado = false
    setCalculando(true)
    rutaAPie(yo, destino)
      .then((r) => {
        if (cancelado) return
        setRuta(r.coordenadas)
        setResumen({ distancia: r.distancia, duracion: r.duracion, pasos: r.pasos })
        setError('')
      })
      .catch((e) => {
        if (cancelado) return
        // Sin motor de rutas: mostramos dirección aproximada (línea recta).
        const metros = distanciaMetros(yo, destino)
        setRuta(null)
        setResumen({ distancia: metros, duracion: minutosCaminando(metros) * 60, pasos: [], aproximado: true, rumbo: rumboTexto(yo, destino) })
        if (e.message !== 'SIN_ORS') setError('')
      })
      .finally(() => !cancelado && setCalculando(false))
    return () => { cancelado = true }
    // Solo recalculamos una vez al llegar la primera ubicación (no en cada micro-cambio).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(yo), destino])

  function leerEnVoz() {
    if (!resumen) return
    const min = Math.max(1, Math.round(resumen.duracion / 60))
    let texto = `${destino.nombre} está a ${distanciaTexto(resumen.distancia)}, unos ${min} minutos caminando.`
    if (resumen.aproximado) texto += ` Camina hacia ${resumen.rumbo}.`
    else if (resumen.pasos && resumen.pasos.length) texto += ` Primero: ${resumen.pasos[0]}.`
    texto += ' Vas muy bien, yo te acompaño 💚'
    hablar(texto)
  }

  useEffect(() => { return () => callar() }, [])

  const min = resumen ? Math.max(1, Math.round(resumen.duracion / 60)) : null

  return (
    <div className="contenido">
      <button className="volver" onClick={onVolver}>← Volver</button>
      <h2 className="titulo-pantalla">
        {destino.icono || '📍'} Hacia {destino.nombre}
      </h2>

      <MapaLeaflet yo={yo} destino={destino} ruta={ruta} />

      {calculando && !resumen && <div className="cargando">Buscando el mejor camino…</div>}
      {error && <div className="error">{error}</div>}

      {resumen && (
        <div className="panel-ruta">
          <div className="ruta-resumen">
            <span className="dato">🚶 {distanciaTexto(resumen.distancia)}</span>
            <span className="dato">⏱️ {min} min</span>
          </div>
          {resumen.aproximado && (
            <div className="aviso">Camina hacia <b>{resumen.rumbo}</b>. Para el camino exacto por las calles, toca “Empezar a caminar”.</div>
          )}
          {resumen.pasos && resumen.pasos.length > 0 && (
            <div className="aviso">Primer paso: {resumen.pasos[0]}</div>
          )}

          <button className="boton principal bloque" onClick={leerEnVoz}>🔊 Léeme el camino</button>
          <a className="boton dorado bloque" href={urlGoogleCaminar(destino)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            🚶 Empezar a caminar (guía por voz)
          </a>
          <a className="boton suave bloque" href={urlGoogleTransporte(destino)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            🚌 ¿Cómo llego en micro / metro?
          </a>
        </div>
      )}
    </div>
  )
}
