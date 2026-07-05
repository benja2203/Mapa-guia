import Icono from './Icono.jsx'

const PESTANAS = [
  { id: 'inicio', icono: 'casa', etiqueta: 'Inicio' },
  { id: 'mapa', icono: 'mapa', etiqueta: 'Mapa' },
  { id: 'lugares', icono: 'pin', etiqueta: 'Lugares' }
]

// Barra inferior con las 3 pestañas principales.
export default function BarraNav({ activa, onCambiar }) {
  return (
    <nav className="barra-nav">
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          className={`nav-item ${activa === p.id ? 'activo' : ''}`}
          onClick={() => onCambiar(p.id)}
          aria-current={activa === p.id ? 'page' : undefined}
        >
          <Icono nombre={p.icono} size={24} strokeWidth={activa === p.id ? 2 : 1.75} />
          {p.etiqueta}
          <span className="punto" />
        </button>
      ))}
    </nav>
  )
}
