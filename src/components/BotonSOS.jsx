import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { urlWhatsappSos, compartirUbicacion } from '../lib/sos.js'
import { hablar } from '../lib/voz.js'

// Botón rojo siempre visible: comparte su ubicación con la persona de confianza.
export default function BotonSOS({ ajustes }) {
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')

  async function pedirAyuda() {
    setError('')
    setOcupado(true)
    hablar('Tranquila, estoy avisando a tu persona de confianza. Ya casi.')
    try {
      const ubic = await ubicacionActual()
      const nombre = ajustes?.nombreUsuaria || ''
      // Primero intentamos la hoja de compartir del teléfono; si no, WhatsApp.
      const compartido = await compartirUbicacion(ubic, nombre)
      if (!compartido) {
        window.location.href = urlWhatsappSos(ubic, ajustes?.whatsappContacto, nombre)
      }
    } catch (e) {
      setError(e.message)
      hablar('No pude obtener tu ubicación. Revisa el permiso de ubicación e intenta de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="sos-barra">
      {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}
      <button className="boton-sos" onClick={pedirAyuda} disabled={ocupado}>
        🆘 {ocupado ? 'Enviando…' : 'Estoy perdida · Pedir ayuda'}
      </button>
    </div>
  )
}
