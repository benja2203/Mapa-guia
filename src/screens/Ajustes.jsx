import { useState } from 'react'
import { ubicacionActual } from '../lib/ubicacion.js'
import { buscarLugar } from '../lib/rutas.js'
import { idDispositivo } from '../lib/almacenamiento.js'
import { urlWhatsappSeguir } from '../lib/ubicacionVivo.js'
import { HAY_SUPABASE } from '../lib/config.js'
import Encabezado from '../components/Encabezado.jsx'
import Icono from '../components/Icono.jsx'

export default function Ajustes({ ajustes, onGuardar, onVolver }) {
  const [nombre, setNombre] = useState(ajustes?.nombreUsuaria || '')
  const [whatsapp, setWhatsapp] = useState(ajustes?.whatsappContacto || '')
  const [casa, setCasa] = useState(ajustes?.casa || null)
  const [compartirEnVivo, setCompartirEnVivo] = useState(Boolean(ajustes?.compartirEnVivo))
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [estado, setEstado] = useState('')
  const [guardado, setGuardado] = useState(false)

  async function casaAqui() {
    setEstado('cargando')
    try {
      const u = await ubicacionActual()
      setCasa({ lat: u.lat, lng: u.lng, direccion: 'Mi casa (ubicación actual)' })
      setEstado('')
    } catch (e) { setEstado(e.message) }
  }

  async function buscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) return
    setEstado('cargando')
    try {
      const r = await buscarLugar(busqueda)
      setResultados(r)
      setEstado(r.length ? '' : 'No encontré esa dirección.')
    } catch (err) { setEstado(err.message) }
  }

  function guardar() {
    onGuardar({
      nombreUsuaria: nombre.trim(),
      whatsappContacto: whatsapp.replace(/[^0-9]/g, ''),
      casa,
      compartirEnVivo
    })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  return (
    <div className="vista con-atras">
      <Encabezado titulo="Ajustes" onAtras={onVolver} />

      <div className="seccion">
        <div className="seccion-titulo">Sobre ella</div>
        <div className="tarjeta">
          <div className="campo">
            <label>Su nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: María" />
            <span className="campo-ayuda">Se usa para saludarla y hablarle con cariño.</span>
          </div>
        </div>
      </div>

      <div className="seccion">
        <div className="seccion-titulo">Persona de confianza</div>
        <div className="tarjeta">
          <div className="campo">
            <label>WhatsApp (para el botón de ayuda)</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="numeric" placeholder="Ej: 56912345678" />
            <span className="campo-ayuda">Con código de país, sin + ni espacios.</span>
          </div>
        </div>
      </div>

      <div className="seccion">
        <div className="seccion-titulo">Su casa</div>
        <div className="tarjeta">
          {casa && <div className="aviso">✓ {casa.direccion || `${casa.lat.toFixed(4)}, ${casa.lng.toFixed(4)}`}</div>}
          <button className="boton principal bloque" onClick={casaAqui}>
            <Icono nombre="centrar" size={20} /> Estoy en casa ahora
          </button>
          <form onSubmit={buscar} style={{ marginTop: 12 }}>
            <div className="fila-buscar">
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="…o busca la dirección de casa" />
              <button className="boton suave" type="submit" aria-label="Buscar"><Icono nombre="buscar" size={20} /></button>
            </div>
          </form>
          {estado === 'cargando' && <div className="cargando">Buscando…</div>}
          {estado && estado !== 'cargando' && <div className="aviso">{estado}</div>}
          {resultados.map((r, i) => (
            <button key={i} className="lugar" onClick={() => { setCasa({ lat: r.lat, lng: r.lng, direccion: r.direccion }); setResultados([]) }}>
              <span className="lugar-ico"><Icono nombre="casa" size={22} /></span>
              <span className="lugar-txt"><p className="nombre">{r.nombre}</p><p className="detalle">{r.direccion}</p></span>
            </button>
          ))}
        </div>
      </div>

      <div className="seccion">
        <div className="seccion-titulo">Seguridad · ubicación en vivo</div>
        <div className="tarjeta">
          <div className="fila-toggle">
            <div>
              <div className="t">Compartir mi ubicación en vivo</div>
              <div className="s">Tu persona de confianza puede verte en tiempo real mientras usas la app.</div>
            </div>
            <button
              className={`toggle ${compartirEnVivo ? 'on' : ''}`}
              aria-label="Compartir ubicación en vivo"
              aria-pressed={compartirEnVivo}
              onClick={() => setCompartirEnVivo((v) => !v)}
            />
          </div>
          {!HAY_SUPABASE && <div className="aviso" style={{ marginTop: 12 }}>Para el seguimiento en vivo hay que configurar la base de datos (Supabase). Ver el README.</div>}
          <a className="boton celeste bloque" style={{ marginTop: 14 }} href={urlWhatsappSeguir(idDispositivo(), whatsapp, nombre)} target="_blank" rel="noreferrer">
            <Icono nombre="compartir" size={20} /> Enviarme el enlace para seguirla
          </a>
          <p className="campo-ayuda" style={{ marginTop: 8 }}>Recuerda tocar “Guardar” para activar el cambio.</p>
        </div>
      </div>

      <button className="boton principal bloque" onClick={guardar}>Guardar cambios</button>
      {guardado && <div className="exito">✓ Guardado</div>}
    </div>
  )
}
