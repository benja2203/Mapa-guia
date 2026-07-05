// Genera los íconos PNG de la PWA sin dependencias externas.
// Un corazón blanco (💚 = "Contigo") sobre fondo rojo carpa de circo.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const salida = join(__dirname, '..', 'public')
mkdirSync(salida, { recursive: true })

// CRC32 para los chunks PNG.
const tablaCrc = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = tablaCrc[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(tipo, datos) {
  const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length, 0)
  const t = Buffer.from(tipo, 'ascii')
  const cuerpo = Buffer.concat([t, datos])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(cuerpo), 0)
  return Buffer.concat([largo, cuerpo, crc])
}

function mezclar(a, b, t) { return Math.round(a + (b - a) * t) }

function dibujar(tam) {
  const px = Buffer.alloc(tam * tam * 4)
  const rojo = [226, 59, 82]
  const rojoOsc = [184, 31, 56]
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      // Fondo con leve degradado diagonal.
      const t = (x + y) / (2 * tam)
      let r = mezclar(rojo[0], rojoOsc[0], t)
      let g = mezclar(rojo[1], rojoOsc[1], t)
      let b = mezclar(rojo[2], rojoOsc[2], t)

      // Coordenadas normalizadas centradas para el corazón.
      const u = (x / tam - 0.5) * 2.6
      const v = -(y / tam - 0.56) * 2.6
      const dentro = Math.pow(u * u + v * v - 1, 3) - u * u * v * v * v <= 0
      if (dentro) { r = 255; g = 255; b = 255 }

      const i = (y * tam + x) * 4
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255
    }
  }
  // Añadir byte de filtro (0) al inicio de cada fila.
  const conFiltro = Buffer.alloc(tam * (tam * 4 + 1))
  for (let y = 0; y < tam; y++) {
    conFiltro[y * (tam * 4 + 1)] = 0
    px.copy(conFiltro, y * (tam * 4 + 1) + 1, y * tam * 4, (y + 1) * tam * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(tam, 0); ihdr.writeUInt32BE(tam, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8 bits, RGBA
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(conFiltro, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
  return png
}

for (const tam of [192, 512]) {
  writeFileSync(join(salida, `icon-${tam}.png`), dibujar(tam))
  console.log(`icon-${tam}.png generado`)
}
