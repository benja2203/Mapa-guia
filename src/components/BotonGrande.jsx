export default function BotonGrande({ tipo, emoji, titulo, subtitulo, onClick }) {
  return (
    <button className={`boton-grande ${tipo}`} onClick={onClick}>
      <span className="emoji" aria-hidden="true">{emoji}</span>
      <span>
        {titulo}
        {subtitulo && <small>{subtitulo}</small>}
      </span>
    </button>
  )
}
