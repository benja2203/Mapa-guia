import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Explorar from './screens/Explorar.jsx'
import Lugares from './screens/Lugares.jsx'
import Mapa from './screens/Mapa.jsx'
import Perdida from './screens/Perdida.jsx'
import Ajustes from './screens/Ajustes.jsx'
import Seguir from './screens/Seguir.jsx'
import BotonSOS from './components/BotonSOS.jsx'
import BarraNav from './components/BarraNav.jsx'
import { leerLocal, sincronizarDesdeNube, guardar } from './lib/almacenamiento.js'
import { iniciarCompartir, detenerCompartir } from './lib/ubicacionVivo.js'

// ¿Se abrió con el enlace de seguimiento? (?seguir=DISPOSITIVO)
const paramSeguir = new URLSearchParams(window.location.search).get('seguir')

export default function App() {
  const [datos, setDatos] = useState(() => leerLocal())
  const [tab, setTab] = useState('inicio') // inicio | mapa | lugares
  const [sub, setSub] = useState(null) // null | ruta | perdida | ajustes
  const [destino, setDestino] = useState(null)

  useEffect(() => {
    if (paramSeguir) return
    sincronizarDesdeNube().then((remoto) => { if (remoto) setDatos(remoto) })
  }, [])

  const ajustes = datos.ajustes
  const lugares = datos.lugares || []

  useEffect(() => {
    if (paramSeguir) return
    if (ajustes?.compartirEnVivo) iniciarCompartir(ajustes?.nombreUsuaria)
    else detenerCompartir()
    return () => detenerCompartir()
  }, [ajustes?.compartirEnVivo, ajustes?.nombreUsuaria])

  if (paramSeguir) {
    return <div className="app"><Seguir dispositivo={paramSeguir} /></div>
  }

  function actualizarAjustes(nuevos) {
    setDatos(guardar({ ajustes: { ...ajustes, ...nuevos } }))
    setSub(null)
  }
  function guardarLugar(lugar) { setDatos(guardar({ lugares: [...lugares, lugar] })) }
  function eliminarLugar(id) { setDatos(guardar({ lugares: lugares.filter((l) => l.id !== id) })) }

  function irADestino(lugar) { setDestino(lugar); setSub('ruta') }

  function irACasa() {
    if (ajustes?.casa) {
      irADestino({ nombre: 'casa', icono: 'casa', lat: ajustes.casa.lat, lng: ajustes.casa.lng })
    } else {
      setSub('ajustes')
    }
  }

  function cambiarTab(t) { setSub(null); setTab(t) }

  // Sub-pantallas enfocadas (sin barra ni SOS).
  if (sub === 'ruta' && destino) {
    return <div className="app"><Mapa destino={destino} onVolver={() => setSub(null)} /></div>
  }
  if (sub === 'perdida') {
    return <div className="app"><Perdida ajustes={ajustes} lugares={lugares} onVolver={() => setSub(null)} onCasa={irACasa} /></div>
  }
  if (sub === 'ajustes') {
    return <div className="app"><Ajustes ajustes={ajustes} onGuardar={actualizarAjustes} onVolver={() => setSub(null)} /></div>
  }

  // Pantallas principales (con barra inferior + SOS).
  return (
    <div className="app">
      {tab === 'inicio' && (
        <Home
          ajustes={ajustes}
          onCasa={irACasa}
          onPerdida={() => setSub('perdida')}
          onExplorar={() => cambiarTab('mapa')}
          onAjustes={() => setSub('ajustes')}
        />
      )}
      {tab === 'mapa' && (
        <Explorar onIrARuta={irADestino} onGuardarLugar={guardarLugar} />
      )}
      {tab === 'lugares' && (
        <Lugares lugares={lugares} onIr={irADestino} onGuardar={guardarLugar} onEliminar={eliminarLugar} />
      )}

      <BotonSOS ajustes={ajustes} />
      <BarraNav activa={tab} onCambiar={cambiarTab} />
    </div>
  )
}
