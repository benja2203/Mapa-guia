import Icono from './Icono.jsx'

// Encabezado consistente para las sub-pantallas: atrás (opcional) + título + acción (opcional).
export default function Encabezado({ titulo, subtitulo, onAtras, accion }) {
  return (
    <div className="enc">
      {onAtras && (
        <button className="icono-btn" onClick={onAtras} aria-label="Volver">
          <Icono nombre="atras" size={22} />
        </button>
      )}
      <div className="enc-txt">
        <h1 className="enc-titulo">{titulo}</h1>
        {subtitulo && <p className="enc-sub">{subtitulo}</p>}
      </div>
      {accion}
    </div>
  )
}
