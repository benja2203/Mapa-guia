export default function BotonGrande({ badge, emoji, titulo, subtitulo, onClick }) {
  return (
    <button className="tarjeta-boton" onClick={onClick}>
      <span className={`badge ${badge}`} aria-hidden="true">{emoji}</span>
      <span className="txt">
        <p className="t">{titulo}</p>
        {subtitulo && <p className="s">{subtitulo}</p>}
      </span>
      <span className="chevron" aria-hidden="true">›</span>
    </button>
  )
}
