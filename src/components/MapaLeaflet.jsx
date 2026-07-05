import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

// Íconos con emoji (evita el problema de las imágenes por defecto de Leaflet).
function iconoEmoji(emoji, color) {
  return L.divIcon({
    className: 'marcador-emoji',
    html: `<div style="font-size:30px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));background:${color};border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid #fff">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  })
}

const iconoYo = iconoEmoji('🧍', '#17a2a2')
const iconoDestino = iconoEmoji('📍', '#e23b52')

// Ajusta la vista para que se vean todos los puntos importantes.
function AjustarVista({ yo, destino, ruta }) {
  const map = useMap()
  useEffect(() => {
    const puntos = []
    if (yo) puntos.push([yo.lat, yo.lng])
    if (destino) puntos.push([destino.lat, destino.lng])
    if (ruta && ruta.length) puntos.push(...ruta)
    if (puntos.length === 1) {
      map.setView(puntos[0], 16)
    } else if (puntos.length > 1) {
      map.fitBounds(L.latLngBounds(puntos), { padding: [40, 40] })
    }
  }, [yo, destino, ruta, map])
  return null
}

export default function MapaLeaflet({ yo, destino, ruta }) {
  const centro = yo ? [yo.lat, yo.lng] : destino ? [destino.lat, destino.lng] : [-33.45, -70.66] // Santiago por defecto
  return (
    <div className="mapa-caja">
      <MapContainer center={centro} zoom={15} scrollWheelZoom={true} zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {yo && <Marker position={[yo.lat, yo.lng]} icon={iconoYo} />}
        {destino && <Marker position={[destino.lat, destino.lng]} icon={iconoDestino} />}
        {ruta && ruta.length > 0 && (
          <Polyline positions={ruta} pathOptions={{ color: '#e23b52', weight: 7, opacity: 0.85 }} />
        )}
        <AjustarVista yo={yo} destino={destino} ruta={ruta} />
      </MapContainer>
    </div>
  )
}
