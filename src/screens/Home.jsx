import { useEffect, useState } from 'react'
import BotonGrande from '../components/BotonGrande.jsx'
import MapaLeaflet from '../components/MapaLeaflet.jsx'
import Icono from '../components/Icono.jsx'
import { ubicacionActual } from '../lib/ubicacion.js'

function saludoPorHora() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Frases de ánimo suaves, con guiños discretos a lo que ama (sin exagerar).
const ANIMOS = [
  'Respira. Vas muy bien 💗',
  'Estás a salvo. Yo te acompaño.',
  'Paso a paso, con calma.',
  'Tranquila, no estás sola.',
  'Con tu fuerza de siempre 🥋',
  'A tu ritmo, como un buen baile 💃'
]

export default function Home({ ajustes, onCasa, onPerdida, onExplorar, onAjustes }) {
  const nombre = ajustes?.nombreUsuaria
  const [yo, setYo] = useState(null)
  const [frase, setFrase] = useState(() => ANIMOS[Math.floor(Math.random() * ANIMOS.length)])

  useEffect(() => {
    ubicacionActual().then(setYo).catch(() => {})
    const t = setInterval(() => {
      setFrase((actual) => {
        let sig = actual
        while (sig === actual) sig = ANIMOS[Math.floor(Math.random() * ANIMOS.length)]
        return sig
      })
    }, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="vista con-barra">
      <div className="encabezado-inicio">
        <div className="saludo-bloque">
          <h1 className="saludo">
            {saludoPorHora()}
            {nombre ? <>,<br /><span className="nombre">{nombre}</span></> : ''}
          </h1>
          <p className="frase" key={frase}>{frase}</p>
        </div>
        <button className="icono-btn" onClick={onAjustes} aria-label="Ajustes">
          <Icono nombre="ajustes" size={22} />
        </button>
      </div>

      <BotonGrande
        badge="celeste"
        icono="casa"
        titulo="Llévame a casa"
        subtitulo="Te muestro el camino ahora"
        onClick={onCasa}
      />
      <BotonGrande
        badge="calipso"
        icono="mensaje"
        titulo="Me siento perdida"
        subtitulo="Habla conmigo, te acompaño"
        onClick={onPerdida}
      />

      <div className="mini-mapa">
        <MapaLeaflet yo={yo} interactivo={false} envoltura="mini-inner">
          <span className="etiqueta">
            <Icono nombre="brujula" size={16} /> {yo ? 'Estás aquí · Explorar el mapa' : 'Abrir el mapa'}
          </span>
        </MapaLeaflet>
        <button className="mini-overlay" onClick={onExplorar} aria-label="Explorar el mapa" />
      </div>

      <p className="pie-firma">Hecho con cariño para ti</p>
    </div>
  )
}
