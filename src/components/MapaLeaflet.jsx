import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'

// Marcador "yo": punto calipso limpio (estilo en CSS).
const iconoYo = L.divIcon({
  className: '',
  html: '<div class="marcador-yo"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

// Pin en forma de gota, con color configurable.
function pin(color) {
  return L.divIcon({
    className: 'marcador-pin',
    html: `<svg width="30" height="38" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C6 0 2 4.6 2 10.4 2 18 12 30 12 30s10-12 10-19.6C22 4.6 18 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="10.4" r="4" fill="#fff"/>
    </svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 36]
  })
}
const iconoDestino = pin('#e0576b')
const iconoBusqueda = pin('#4aa7c1')

// Ajusta la vista para que se vean todos los puntos (solo si autoAjustar).
function AjustarVista({ yo, destino, ruta, activo }) {
  const map = useMap()
  useEffect(() => {
    if (!activo) return
    const puntos = []
    if (yo) puntos.push([yo.lat, yo.lng])
    if (destino) puntos.push([destino.lat, destino.lng])
    if (ruta && ruta.length) puntos.push(...ruta)
    if (puntos.length === 1) map.setView(puntos[0], 16)
    else if (puntos.length > 1) map.fitBounds(L.latLngBounds(puntos), { padding: [50, 50] })
  }, [yo, destino, ruta, activo, map])
  return null
}

// Centra el mapa una vez cuando cambia "centrarA".
function CentrarEn({ centrarA }) {
  const map = useMap()
  useEffect(() => {
    if (centrarA) map.setView([centrarA.lat, centrarA.lng], centrarA.zoom || 16, { animate: true })
  }, [centrarA, map])
  return null
}

// Guarda la instancia del mapa para usarla desde el botón de centrar.
function Capturar({ refMapa }) {
  const map = useMap()
  useEffect(() => { refMapa.current = map }, [map, refMapa])
  return null
}

export default function MapaLeaflet({
  yo, destino, ruta, busqueda,
  autoAjustar = true, centrarA, grande = false, interactivo = true, onCentrarme,
  envoltura = 'mapa-caja', children
}) {
  const refMapa = useRef(null)
  const centro = yo ? [yo.lat, yo.lng] : destino ? [destino.lat, destino.lng] : [-33.45, -70.66]

  function centrarme() {
    if (onCentrarme) { onCentrarme(); return }
    if (refMapa.current && yo) refMapa.current.setView([yo.lat, yo.lng], 16, { animate: true })
  }

  return (
    <div className={`${envoltura} ${grande ? 'mapa-grande' : ''}`}>
      <MapContainer
        center={centro}
        zoom={15}
        scrollWheelZoom={interactivo}
        dragging={interactivo}
        zoomControl={false}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {yo && <Marker position={[yo.lat, yo.lng]} icon={iconoYo} />}
        {destino && <Marker position={[destino.lat, destino.lng]} icon={iconoDestino} />}
        {busqueda && <Marker position={[busqueda.lat, busqueda.lng]} icon={iconoBusqueda} />}
        {ruta && ruta.length > 0 && (
          <Polyline positions={ruta} pathOptions={{ color: '#33928e', weight: 6, opacity: 0.9 }} />
        )}
        <AjustarVista yo={yo} destino={destino} ruta={ruta} activo={autoAjustar} />
        <CentrarEn centrarA={centrarA} />
        <Capturar refMapa={refMapa} />
      </MapContainer>
      {children}
      {(onCentrarme || yo) && interactivo && (
        <button className="fab-centrar" onClick={centrarme} aria-label="Centrar en mi ubicación">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      )}
    </div>
  )
}
