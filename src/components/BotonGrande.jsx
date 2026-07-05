import Icono from './Icono.jsx'

// Tarjeta de acción principal: insignia con ícono de línea + texto + chevron.
export default function BotonGrande({ badge, icono, titulo, subtitulo, onClick }) {
  return (
    <button className="accion" onClick={onClick}>
      <span className={`badge ${badge}`}>
        <Icono nombre={icono} size={26} strokeWidth={1.9} />
      </span>
      <span className="txt">
        <p className="t">{titulo}</p>
        {subtitulo && <p className="s">{subtitulo}</p>}
      </span>
      <Icono nombre="chevron" size={22} className="chevron" />
    </button>
  )
}
