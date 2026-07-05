// Set de íconos de línea (estilo minimalista, trazo fino, hereda el color con currentColor).
// Uso: <Icono nombre="casa" /> — tamaño y grosor configurables.

const TRAZOS = {
  casa: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  mapa: (
    <>
      <path d="M9 4 3.5 6.5v13L9 17l6 2.5 5.5-2.5v-13L15 6.5 9 4z" />
      <path d="M9 4v13M15 6.5v13" />
    </>
  ),
  brujula: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.5 13l-4.5 2 2-4.5 4.5-2z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  ajustes: (
    <>
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  mensaje: <path d="M21 11.5a8.4 8.4 0 0 1-11.5 7.8L3.5 21l1.7-5.8A8.4 8.4 0 1 1 21 11.5z" />,
  ayuda: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="m5 5 4.3 4.3M14.7 14.7 19 19M19 5l-4.3 4.3M9.3 14.7 5 19" />
    </>
  ),
  atras: (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  mas: <path d="M12 5v14M5 12h14" />,
  basura: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6.5 7 7.3 20h9.4L18 7" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  micro: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </>
  ),
  enviar: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3 14.5 21l-4-8-8-4L21 3z" />
    </>
  ),
  caminar: <path d="M20 4 4 10.5l6.5 2.4L13 20l7-16z" />,
  bus: (
    <>
      <rect x="4" y="5" width="16" height="12" rx="2.5" />
      <path d="M4 12h16" />
      <path d="M8 5v7M16 5v7" />
      <circle cx="8" cy="19" r="1.4" />
      <circle cx="16" cy="19" r="1.4" />
    </>
  ),
  centrar: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  compartir: (
    <>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.3 10.8 7.4-4.3M8.3 13.2l7.4 4.3" />
    </>
  ),
  corazon: <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />,
  estrella: <path d="M12 3.5 14.6 9l6 .7-4.5 4 1.3 5.9L12 16.6 6.6 19.6 7.9 13.7l-4.5-4 6-.7L12 3.5z" />,
  cafe: (
    <>
      <path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
      <path d="M17 9h2.5a2 2 0 0 1 0 4H17" />
      <path d="M7 3v2M11 3v2" />
    </>
  ),
  salud: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  carrito: (
    <>
      <path d="M3 4h2l2 12h10l2-8H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  )
}

export default function Icono({ nombre, size = 24, strokeWidth = 1.75, className }) {
  const trazo = TRAZOS[nombre] || TRAZOS.pin
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {trazo}
    </svg>
  )
}

// Nombres de íconos disponibles para elegir el dibujo de un lugar.
export const ICONOS_LUGAR = ['casa', 'corazon', 'persona', 'estrella', 'cafe', 'salud', 'carrito', 'pin']
