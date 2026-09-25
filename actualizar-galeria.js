// actualizar-galeria.js
//
// Este script mira la carpeta images/galeria/ y reescribe gallery.json
// automáticamente con todas las fotos que encuentre.
//
// - Si una foto ya estaba en gallery.json, mantiene TODOS sus datos (título,
//   descripción, alt, proyecto) y su posición en la lista (no los pisa).
// - Las fotos que ya no están en la carpeta se quitan del JSON.
// - IMPORTANTE (SEO): antes de subir una foto, renombrala en minúsculas, sin
//   espacios ni tildes y describiendo el trabajo: pintura-fachada-palermo.jpg
//   y, si podés, achicala a 1600px de lado mayor (menos de ~400 KB).
// - Si es una foto nueva, le pone un título provisorio basado en el nombre
//   del archivo, que después podés editar a mano en gallery.json si querés.
// - El tamaño (portrait/landscape) se calcula solo, mirando si la foto es
//   más alta que ancha o al revés.
//
// No necesitás entender este código para usarlo: solo corré
// "actualizar-galeria.bat" con doble clic después de subir fotos nuevas.

const fs = require('fs');
const path = require('path');

const CARPETA_FOTOS = path.join(__dirname, 'images', 'galeria');
const ARCHIVO_JSON = path.join(__dirname, 'gallery.json');
const EXTENSIONES_VALIDAS = ['.jpg', '.jpeg', '.png', '.webp'];

function tituloDesdeNombreArchivo(nombreArchivo) {
  const sinExtension = nombreArchivo.replace(/\.[^/.]+$/, '');
  const conEspacios = sinExtension.replace(/[-_]/g, ' ');
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
}

function leerDimensiones(rutaCompleta) {
  // Lee las dimensiones de un PNG o JPG sin librerías externas,
  // leyendo directamente los bytes del header del archivo.
  const buffer = fs.readFileSync(rutaCompleta);

  // PNG: ancho y alto están en los bytes 16-24
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    const ancho = buffer.readUInt32BE(16);
    const alto = buffer.readUInt32BE(20);
    return { ancho, alto };
  }

  // JPEG: hay que recorrer los "markers" hasta encontrar el de dimensiones (SOF)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) { offset++; continue; }
      const marker = buffer[offset + 1];
      const esSOF = (marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
      if (esSOF) {
        const alto = buffer.readUInt16BE(offset + 5);
        const ancho = buffer.readUInt16BE(offset + 7);
        return { ancho, alto };
      }
      const tamanoSegmento = buffer.readUInt16BE(offset + 2);
      offset += 2 + tamanoSegmento;
    }
  }

  // Si no se pudo determinar
  return null;
}

function main() {
  if (!fs.existsSync(CARPETA_FOTOS)) {
    console.error('No encuentro la carpeta images/galeria/. Creala y subí fotos ahí primero.');
    process.exit(1);
  }

  // Cargar el JSON existente (si hay) para no perder títulos/descripciones editados a mano
  let galeriaExistente = [];
  if (fs.existsSync(ARCHIVO_JSON)) {
    try {
      galeriaExistente = JSON.parse(fs.readFileSync(ARCHIVO_JSON, 'utf-8'));
    } catch (e) {
      console.warn('Aviso: gallery.json tenía un error de formato, se va a regenerar desde cero.');
    }
  }
  const datosExistentesPorRuta = {};
  for (const item of galeriaExistente) {
    datosExistentesPorRuta[item.image] = item;
  }

  // Leer archivos de la carpeta de fotos (se ignoran las versiones chicas "-800")
  const archivos = fs.readdirSync(CARPETA_FOTOS)
    .filter(nombre => EXTENSIONES_VALIDAS.includes(path.extname(nombre).toLowerCase()))
    .filter(nombre => !/-800\.[a-z]+$/i.test(nombre))
    .sort();

  if (archivos.length === 0) {
    console.warn('No hay fotos en images/galeria/. El gallery.json va a quedar vacío.');
  }

  const presentes = new Set(archivos.map(a => `images/galeria/${a}`));

  // 1) Se mantienen las fotos que ya estaban, EN EL MISMO ORDEN y con todos sus datos
  const nuevaGaleria = galeriaExistente.filter(item => presentes.has(item.image));

  // 2) Las fotos nuevas se agregan al final con datos automáticos
  const nombresNuevos = archivos.filter(a => !datosExistentesPorRuta[`images/galeria/${a}`]);
  for (const nombreArchivo of nombresNuevos) {
    const rutaRelativa = `images/galeria/${nombreArchivo}`;
    const rutaCompleta = path.join(CARPETA_FOTOS, nombreArchivo);
    let dim = null;
    try { dim = leerDimensiones(rutaCompleta); } catch (e) { dim = null; }
    const base = nombreArchivo.replace(/\.[^/.]+$/, '');
    const chica = EXTENSIONES_VALIDAS.map(ext => `${base}-800${ext}`).find(n => fs.existsSync(path.join(CARPETA_FOTOS, n)));
    const titulo = tituloDesdeNombreArchivo(nombreArchivo);
    const item = {
      image: rutaRelativa,
      image_sm: chica ? `images/galeria/${chica}` : rutaRelativa,
      title: titulo,
      description: '',
      alt: titulo + ' - Limones Rope Access',
      size: dim && dim.ancho > dim.alto ? 'landscape' : 'portrait',
      proyecto: ''
    };
    if (dim) { item.width = dim.ancho; item.height = dim.alto; }
    nuevaGaleria.push(item);

    // Aviso SEO: nombres de archivo sin espacios, sin tildes y en minúscula
    if (/[\sA-ZáéíóúñÁÉÍÓÚÑ()]/.test(nombreArchivo)) {
      console.warn(`  ⚠ "${nombreArchivo}": conviene renombrarla en minúsculas, sin espacios ni tildes (ej: reparacion-fachada-palermo.jpg)`);
    }
  }

  fs.writeFileSync(ARCHIVO_JSON, JSON.stringify(nuevaGaleria, null, 2) + '\n', 'utf-8');

  console.log(`\n✔ gallery.json actualizado con ${nuevaGaleria.length} foto(s).\n`);
  if (nombresNuevos.length > 0) {
    console.log('Fotos nuevas detectadas (con título automático, editalo si querés):');
    nombresNuevos.forEach(n => console.log('  - ' + n));
  } else {
    console.log('No había fotos nuevas, solo se confirmó el archivo.');
  }
}

main();
