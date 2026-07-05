import BotonGrande from '../components/BotonGrande.jsx'

function saludoPorHora() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Home({ ajustes, onCasa, onPerdida, onLugares, onAjustes }) {
  const nombre = ajustes?.nombreUsuaria
  return (
    <>
      <div className="encabezado">
        <div>
          <h1 className="saludo">
            {saludoPorHora()}
            {nombre ? <>, <span className="nombre">{nombre}</span></> : ''} 🎪
          </h1>
          <p className="subsaludo">Nunca estás sola. Yo te guío 💚</p>
        </div>
        <button className="boton suave" onClick={onAjustes} aria-label="Ajustes">⚙️</button>
      </div>
      <div className="cinta-circo" />

      <div className="contenido">
        <BotonGrande
          tipo="casa"
          emoji="🏠"
          titulo="Llévame a casa"
          subtitulo="Te muestro el camino ahora mismo"
          onClick={onCasa}
        />
        <BotonGrande
          tipo="perdida"
          emoji="💚"
          titulo="Me siento perdida"
          subtitulo="Habla conmigo, te acompaño y te calmo"
          onClick={onPerdida}
        />
        <BotonGrande
          tipo="lugares"
          emoji="📍"
          titulo="Mis lugares"
          subtitulo="Casa, familia, tus lugares favoritos"
          onClick={onLugares}
        />
        <p className="pie-firma">Hecho con cariño para ti 🥋💃🎨</p>
      </div>
    </>
  )
}
