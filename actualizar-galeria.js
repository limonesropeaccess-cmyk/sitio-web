// actualizar-galeria.js
//
// Este script mira la carpeta images/galeria/ y reescribe gallery.json
// automáticamente con todas las fotos que encuentre.
//
// - Si una foto ya estaba en gallery.json, mantiene su título y descripción
//   tal cual los hayas editado a mano (no los pisa).
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

function calcularTamano(rutaCompleta) {
  // Lee las dimensiones de un PNG o JPG sin librerías externas,
  // leyendo directamente los bytes del header del archivo.
  const buffer = fs.readFileSync(rutaCompleta);

  // PNG: ancho y alto están en los bytes 16-24
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    const ancho = buffer.readUInt32BE(16);
    const alto = buffer.readUInt32BE(20);
    return alto >= ancho ? 'portrait' : 'landscape';
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
        return alto >= ancho ? 'portrait' : 'landscape';
      }
      const tamanoSegmento = buffer.readUInt16BE(offset + 2);
      offset += 2 + tamanoSegmento;
    }
  }

  // Si no se pudo determinar, por defecto landscape
  return 'landscape';
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

  // Leer archivos de la carpeta de fotos
  const archivos = fs.readdirSync(CARPETA_FOTOS)
    .filter(nombre => EXTENSIONES_VALIDAS.includes(path.extname(nombre).toLowerCase()))
    .sort();

  if (archivos.length === 0) {
    console.warn('No hay fotos en images/galeria/. El gallery.json va a quedar vacío.');
  }

  const nuevaGaleria = archivos.map(nombreArchivo => {
    const rutaRelativa = `images/galeria/${nombreArchivo}`;
    const rutaCompleta = path.join(CARPETA_FOTOS, nombreArchivo);

    // Si ya existía, mantener título/descripción/tamaño tal como estaban
    if (datosExistentesPorRuta[rutaRelativa]) {
      return datosExistentesPorRuta[rutaRelativa];
    }

    // Si es nueva, generar datos automáticos
    let tamano;
    try {
      tamano = calcularTamano(rutaCompleta);
    } catch (e) {
      tamano = 'landscape';
    }

    return {
      image: rutaRelativa,
      title: tituloDesdeNombreArchivo(nombreArchivo),
      description: '',
      size: tamano
    };
  });

  fs.writeFileSync(ARCHIVO_JSON, JSON.stringify(nuevaGaleria, null, 2) + '\n', 'utf-8');

  console.log(`\n✔ gallery.json actualizado con ${nuevaGaleria.length} foto(s).\n`);
  const nombresNuevos = archivos.filter(a => !datosExistentesPorRuta[`images/galeria/${a}`]);
  if (nombresNuevos.length > 0) {
    console.log('Fotos nuevas detectadas (con título automático, editalo si querés):');
    nombresNuevos.forEach(n => console.log('  - ' + n));
  } else {
    console.log('No había fotos nuevas, solo se confirmó el archivo.');
  }
}

main();
