import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { urlWhatsappSos, compartirUbicacion } from '../lib/sos.js'
import { hablar } from '../lib/voz.js'
import Icono from './Icono.jsx'

// Botón de ayuda (rojo, sobrio) que comparte su ubicación con la persona de confianza.
export default function BotonSOS({ ajustes }) {
  const [ocupado, setOcupado] = useState(false)

  async function pedirAyuda() {
    setOcupado(true)
    hablar('Tranquila, estoy avisando a tu persona de confianza. Ya casi.')
    try {
      const ubic = await ubicacionActual()
      const nombre = ajustes?.nombreUsuaria || ''
      const compartido = await compartirUbicacion(ubic, nombre)
      if (!compartido) {
        window.location.href = urlWhatsappSos(ubic, ajustes?.whatsappContacto, nombre)
      }
    } catch (e) {
      hablar('No pude obtener tu ubicación. Revisa el permiso de ubicación e intenta de nuevo.')
      alert(e.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="sos-flotante">
      <button className="boton-sos" onClick={pedirAyuda} disabled={ocupado}>
        <Icono nombre="ayuda" size={22} />
        {ocupado ? 'Enviando…' : 'Pedir ayuda'}
      </button>
    </div>
  )
}
