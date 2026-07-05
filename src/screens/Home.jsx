import { useEffect, useState } from 'react'
import BotonGrande from '../components/BotonGrande.jsx'

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

export default function Home({ ajustes, compartiendo, onCasa, onPerdida, onLugares, onAjustes }) {
  const nombre = ajustes?.nombreUsuaria
  const [frase, setFrase] = useState(() => ANIMOS[Math.floor(Math.random() * ANIMOS.length)])

  useEffect(() => {
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
    <>
      <div className="encabezado">
        <div>
          <h1 className="saludo">
            {saludoPorHora()}
            {nombre ? <>,<br /><span className="nombre">{nombre}</span></> : ''}
          </h1>
          <p className="subsaludo" key={frase}>{frase}</p>
        </div>
        <button className="icono-btn" onClick={onAjustes} aria-label="Ajustes">⚙</button>
      </div>

      {compartiendo && (
        <div className="pill-estado" onClick={onAjustes}>
          <span className="punto-vivo" /> Compartiendo tu ubicación
        </div>
      )}

      <div className="contenido">
        <BotonGrande
          badge="celeste"
          emoji="🏠"
          titulo="Llévame a casa"
          subtitulo="Te muestro el camino ahora"
          onClick={onCasa}
        />
        <BotonGrande
          badge="calipso"
          emoji="💬"
          titulo="Me siento perdida"
          subtitulo="Habla conmigo, te acompaño"
          onClick={onPerdida}
        />
        <BotonGrande
          badge="arena"
          emoji="📍"
          titulo="Mis lugares"
          subtitulo="Tus lugares favoritos"
          onClick={onLugares}
        />
        <p className="pie-firma">Hecho con cariño para ti</p>
      </div>
    </>
  )
}
