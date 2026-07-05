import { useEffect, useState } from 'react'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import Encabezado from '../components/Encabezado.jsx'
import Icono from '../components/Icono.jsx'
import { observarUbicacion, distanciaMetros, distanciaTexto, rumboTexto } from '../lib/ubicacion.js'
import { rutaAPie, urlGoogleCaminar, urlGoogleTransporte, minutosCaminando } from '../lib/rutas.js'
import { hablar, callar } from '../lib/voz.js'

export default function Mapa({ destino, onVolver }) {
  const [yo, setYo] = useState(null)
  const [ruta, setRuta] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')
  const [calculando, setCalculando] = useState(true)

  useEffect(() => {
    const parar = observarUbicacion(setYo, (e) => setError(e.message))
    return () => parar()
  }, [])

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
        const metros = distanciaMetros(yo, destino)
        setRuta(null)
        setResumen({ distancia: metros, duracion: minutosCaminando(metros) * 60, pasos: [], aproximado: true, rumbo: rumboTexto(yo, destino) })
        if (e.message !== 'SIN_ORS') setError('')
      })
      .finally(() => !cancelado && setCalculando(false))
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(yo), destino])

  function leerEnVoz() {
    if (!resumen) return
    const min = Math.max(1, Math.round(resumen.duracion / 60))
    let texto = `${destino.nombre} está a ${distanciaTexto(resumen.distancia)}, unos ${min} minutos caminando.`
    if (resumen.aproximado) texto += ` Camina hacia ${resumen.rumbo}.`
    else if (resumen.pasos && resumen.pasos.length) texto += ` Primero: ${resumen.pasos[0]}.`
    texto += ' Vas muy bien, yo te acompaño 💗'
    hablar(texto)
  }

  useEffect(() => { return () => callar() }, [])

  const min = resumen ? Math.max(1, Math.round(resumen.duracion / 60)) : null

  return (
    <div className="vista con-atras">
      <Encabezado titulo={`Hacia ${destino.nombre}`} onAtras={onVolver} />

      <MapaLeaflet yo={yo} destino={destino} ruta={ruta} />

      {calculando && !resumen && <div className="cargando">Buscando el mejor camino…</div>}
      {error && <div className="error">{error}</div>}

      {resumen && (
        <div className="panel-ruta">
          <div className="ruta-resumen">
            <span className="ruta-dato"><Icono nombre="caminar" size={20} className="icono-mini" /> {distanciaTexto(resumen.distancia)}</span>
            <span className="ruta-dato"><Icono nombre="brujula" size={20} className="icono-mini" /> {min} min</span>
          </div>
          {resumen.aproximado && <div className="aviso">Camina hacia <b>{resumen.rumbo}</b>. Para el camino exacto por las calles, toca “Empezar a caminar”.</div>}
          {resumen.pasos && resumen.pasos.length > 0 && <div className="aviso">Primer paso: {resumen.pasos[0]}</div>}

          <div className="acciones-ruta">
            <button className="boton principal bloque" onClick={leerEnVoz}>
              <Icono nombre="mensaje" size={20} /> Léeme el camino
            </button>
            <a className="boton celeste bloque" href={urlGoogleCaminar(destino)} target="_blank" rel="noreferrer">
              <Icono nombre="caminar" size={20} /> Empezar a caminar
            </a>
            <a className="boton suave bloque" href={urlGoogleTransporte(destino)} target="_blank" rel="noreferrer">
              <Icono nombre="bus" size={20} /> ¿Cómo llego en micro / metro?
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
