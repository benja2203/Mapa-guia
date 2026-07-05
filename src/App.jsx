import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Lugares from './screens/Lugares.jsx'
import Mapa from './screens/Mapa.jsx'
import Perdida from './screens/Perdida.jsx'
import Ajustes from './screens/Ajustes.jsx'
import BotonSOS from './components/BotonSOS.jsx'
import { leerLocal, sincronizarDesdeNube, guardar } from './lib/almacenamiento.js'

export default function App() {
  const [datos, setDatos] = useState(() => leerLocal())
  const [pantalla, setPantalla] = useState('home')
  const [destino, setDestino] = useState(null)
  const [avisoCasa, setAvisoCasa] = useState(false)

  // Sincronizar con la nube al abrir (si Supabase está configurado).
  useEffect(() => {
    sincronizarDesdeNube().then((remoto) => { if (remoto) setDatos(remoto) })
  }, [])

  const ajustes = datos.ajustes
  const lugares = datos.lugares || []

  function actualizarAjustes(nuevos) {
    setDatos(guardar({ ajustes: { ...ajustes, ...nuevos } }))
    setPantalla('home')
  }

  function guardarLugar(lugar) {
    setDatos(guardar({ lugares: [...lugares, lugar] }))
  }

  function eliminarLugar(id) {
    setDatos(guardar({ lugares: lugares.filter((l) => l.id !== id) }))
  }

  function irADestino(lugar) {
    setDestino(lugar)
    setPantalla('mapa')
  }

  function irACasa() {
    if (ajustes?.casa) {
      irADestino({ nombre: 'casa', icono: '🏠', lat: ajustes.casa.lat, lng: ajustes.casa.lng })
    } else {
      // Aún no hay casa guardada: llevar a Ajustes con un aviso amable.
      setAvisoCasa(true)
      setPantalla('ajustes')
    }
  }

  const mostrarSOS = pantalla === 'home' || pantalla === 'lugares'

  return (
    <div className="app">
      {pantalla === 'home' && (
        <Home
          ajustes={ajustes}
          onCasa={irACasa}
          onPerdida={() => setPantalla('perdida')}
          onLugares={() => setPantalla('lugares')}
          onAjustes={() => setPantalla('ajustes')}
        />
      )}

      {pantalla === 'lugares' && (
        <Lugares
          lugares={lugares}
          onIr={irADestino}
          onGuardar={guardarLugar}
          onEliminar={eliminarLugar}
          onVolver={() => setPantalla('home')}
        />
      )}

      {pantalla === 'mapa' && destino && (
        <Mapa destino={destino} ajustes={ajustes} onVolver={() => setPantalla('home')} />
      )}

      {pantalla === 'perdida' && (
        <Perdida
          ajustes={ajustes}
          lugares={lugares}
          onVolver={() => setPantalla('home')}
          onCasa={irACasa}
        />
      )}

      {pantalla === 'ajustes' && (
        <>
          {avisoCasa && (
            <div className="contenido" style={{ paddingBottom: 0 }}>
              <div className="aviso">Primero guarda dónde está tu casa 🏠 para poder llevarte con un toque.</div>
            </div>
          )}
          <Ajustes ajustes={ajustes} onGuardar={actualizarAjustes} onVolver={() => { setAvisoCasa(false); setPantalla('home') }} />
        </>
      )}

      {mostrarSOS && <BotonSOS ajustes={ajustes} />}
    </div>
  )
}
