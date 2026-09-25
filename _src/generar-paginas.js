// generar-paginas.js
//
// Genera las páginas internas del sitio (servicios, proyectos, guías, contacto)
// a partir de los archivos de _src/paginas/*.html.
//
// Cómo se usa: doble clic en "generar-paginas.bat" (en la raíz del sitio).
// El resultado son carpetas con un index.html adentro, por ejemplo:
//   _src/paginas/reparacion-de-fachadas.html  →  /reparacion-de-fachadas/index.html
// y el sitemap.xml actualizado. Después se sube todo con GitHub Desktop.
//
// Cada archivo de _src/paginas empieza con un bloque de datos entre <!--{ ... }-->
// (título SEO, descripción, foto principal, etc.) y sigue con el HTML del contenido.
// La navegación, el pie, los metadatos, el schema.org y las migas de pan se
// arman solos: NO hace falta tocarlos en cada página.
//
// Atajos que se pueden usar dentro del contenido:
//   {{fotos:ID}}            → galería con todas las fotos del proyecto ID (según gallery.json)
//   {{fotos:ID1+ID2}}       → una sola galería con las fotos de varios proyectos
//   {{foto:archivo.jpg}}    → una foto de images/galeria con su ALT y tamaño
//   {{relacionados:a,b,c}}  → tarjetas con enlaces a otras páginas (por su slug)
//   {{cta}}                 → bloque final de contacto
//   {{wa:Texto}}            → URL de WhatsApp con ese mensaje precargado

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DIR_PAGINAS = path.join(__dirname, 'paginas');
const SITIO = 'https://www.limonesropeaccess.com';
const WA = '5491171349126';
const TEL_VISIBLE = '+54 9 11 7134 9126';
const EMAIL = 'limonesropeaccess@gmail.com';
const HOY = new Date().toISOString().slice(0, 10);

const galeria = JSON.parse(fs.readFileSync(path.join(RAIZ, 'gallery.json'), 'utf-8'));

// ─── Utilidades ────────────────────────────────────────────────
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sinHtml = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const url = slug => slug ? `${SITIO}/${slug}/` : `${SITIO}/`;
const wa = texto => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;

function leerPagina(archivo) {
  const txt = fs.readFileSync(path.join(DIR_PAGINAS, archivo), 'utf-8');
  const m = txt.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${archivo}: falta el bloque de datos <!--{ ... }--> al principio`);
  let datos;
  try { datos = JSON.parse(m[1]); } catch (e) { throw new Error(`${archivo}: el bloque de datos tiene un error de formato JSON → ${e.message}`); }
  datos.cuerpo = txt.slice(m[0].length);
  datos.modificado = fs.statSync(path.join(DIR_PAGINAS, archivo)).mtime.toISOString().slice(0, 10);
  datos.archivo = archivo;
  return datos;
}

const paginas = fs.readdirSync(DIR_PAGINAS).filter(f => f.endsWith('.html')).map(leerPagina);
const porSlug = Object.fromEntries(paginas.map(p => [p.slug, p]));

function fotoPorArchivo(ref) {
  const f = galeria.find(g => g.image.endsWith('/' + ref) || g.image === ref);
  if (!f) throw new Error(`No encuentro la foto "${ref}" en gallery.json`);
  return f;
}

function figura(f, { eager = false } = {}) {
  const w = f.width || 1200, h = f.height || 1600;
  const sm = f.image_sm || f.image;
  return `<figure class="gal-item gal-${f.size}">
          <img src="/${sm}" srcset="/${sm} 800w, /${f.image} ${Math.max(w, h) > 800 ? w : 801}w" sizes="(max-width: 500px) 100vw, (max-width: 768px) 50vw, 360px" alt="${esc(f.alt || f.title)}" width="${w}" height="${h}"${eager ? '' : ' loading="lazy" decoding="async"'}>
          <figcaption class="gal-overlay"><div class="gal-info"><div class="gal-title">${esc(f.title)}</div><div class="gal-desc">${esc(f.description || '')}</div></div></figcaption>
        </figure>`;
}

function tarjetas(slugs) {
  return `<div class="cards">
${slugs.map(s => {
    const p = porSlug[s];
    if (!p) throw new Error(`{{relacionados}}: no existe la página "${s}"`);
    const img = p.cardImg ? fotoPorArchivo(p.cardImg) : null;
    return `      <a class="card" href="/${p.slug}/">
        ${img ? `<div class="card-img"><img src="/${img.image_sm || img.image}" alt="${esc(img.alt || img.title)}" width="800" height="600" loading="lazy" decoding="async"></div>` : ''}
        <span class="card-kicker">${esc(p.cardKicker || 'Servicio')}</span>
        <span class="card-title">${esc(p.cardTitle || p.breadcrumb)}</span>
        <span class="card-desc">${esc(p.cardDesc || p.description)}</span>
        <span class="card-link">${esc(p.cardCta || 'Ver más')} →</span>
      </a>`;
  }).join('\n')}
    </div>`;
}

const ICONO_WA = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.121 1.527 5.849L0 24l6.34-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.48-5.073-1.324l-.362-.215-3.763.892.908-3.666-.236-.375A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';

function bloqueCta(p) {
  const titulo = p.ctaTitle || '¿Tenés un problema en altura<br>que <span class="g">resolver</span>?';
  const texto = p.ctaText || 'Mandanos fotos y una breve descripción. Te respondemos con los próximos pasos: diagnóstico por fotos o visita técnica, y presupuesto por escrito.';
  return `<div class="sep"></div>
<section class="cta-sec" id="contacto">
  <div class="cta-inner">
    <h2 class="cta-title">${titulo}</h2>
    <p class="cta-sub">${texto}</p>
    <div class="cta-btns">
      <a href="${esc(wa(p.waText || 'Hola, quiero consultar por un trabajo en altura'))}" target="_blank" rel="noopener" class="btn-main">${ICONO_WA} Enviar fotos por WhatsApp</a>
      <a href="/contacto/" class="btn-ghost">Solicitar relevamiento con el formulario <span class="arrow">→</span></a>
    </div>
    <div class="cta-info">${TEL_VISIBLE} · <a href="mailto:${EMAIL}" style="color:inherit">${EMAIL}</a> · CABA y Gran Buenos Aires</div>
  </div>
</section>`;
}

function expandir(html, p) {
  return html
    .replace(/\{\{fotos:([^}]+)\}\}/g, (_, id) => {
      const ids = id.split('+').map(x => x.trim());
      const fotos = galeria.filter(g => ids.includes(g.proyecto));
      if (!fotos.length) throw new Error(`${p.archivo}: {{fotos:${id}}} no tiene fotos en gallery.json`);
      return `<div class="gallery gallery-sm">\n        ${fotos.map(f => figura(f)).join('\n        ')}\n      </div>`;
    })
    .replace(/\{\{foto:([^}]+)\}\}/g, (_, ref) => `<div class="gallery gallery-sm">${figura(fotoPorArchivo(ref.trim()))}</div>`)
    .replace(/\{\{relacionados:([^}]+)\}\}/g, (_, lista) => tarjetas(lista.split(',').map(s => s.trim()).filter(Boolean)))
    .replace(/\{\{wa:([^}]+)\}\}/g, (_, t) => esc(wa(t.trim())))
    .replace(/\{\{cta\}\}/g, () => bloqueCta(p));
}

// ─── Schema.org ────────────────────────────────────────────────
const ORG_ID = `${SITIO}/#empresa`;

function faqDesdeHtml(html) {
  const preguntas = [];
  const re = /<details class="faq-item">\s*<summary>([\s\S]*?)<span class="faq-plus">[\s\S]*?<\/summary>\s*<div class="faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g;
  let m;
  while ((m = re.exec(html))) preguntas.push({ q: sinHtml(m[1]), a: sinHtml(m[2]) });
  return preguntas;
}

function schemas(p, cuerpoFinal) {
  const out = [];
  const migas = [{ n: 'Inicio', u: url('') }];
  if (p.parent) { const pp = porSlug[p.parent]; migas.push({ n: pp.breadcrumb, u: url(pp.slug) }); }
  migas.push({ n: p.breadcrumb, u: url(p.slug) });
  out.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.n, item: m.u }))
  });
  const img = p.hero ? `${SITIO}/${fotoPorArchivo(p.hero).image}` : `${SITIO}/images/og-limones-rope-access.jpg`;
  if (p.type === 'service') {
    out.push({
      '@context': 'https://schema.org', '@type': 'Service',
      '@id': `${url(p.slug)}#servicio`,
      name: p.serviceName || sinHtml(p.h1),
      serviceType: p.serviceType || p.serviceName || sinHtml(p.h1),
      description: p.description,
      url: url(p.slug),
      image: img,
      provider: { '@id': ORG_ID },
      areaServed: [
        { '@type': 'City', name: 'Ciudad Autónoma de Buenos Aires' },
        { '@type': 'AdministrativeArea', name: 'Gran Buenos Aires' }
      ]
    });
  }
  if (p.type === 'article' || p.type === 'case') {
    out.push({
      '@context': 'https://schema.org', '@type': 'Article',
      headline: sinHtml(p.h1).slice(0, 110),
      description: p.description,
      image: img,
      datePublished: p.datePublished || HOY,
      dateModified: p.dateModified || p.datePublished || HOY,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: url(p.slug),
      inLanguage: 'es-AR'
    });
  }
  const faq = faqDesdeHtml(cuerpoFinal);
  if (faq.length) {
    out.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    });
  }
  // Referencia mínima a la empresa (los datos completos están en la Home)
  out.push({
    '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', '@id': ORG_ID,
    name: 'Limones Rope Access', url: `${SITIO}/`, telephone: '+5491171349126', email: EMAIL,
    logo: `${SITIO}/images/logo-vertical.png`, image: `${SITIO}/images/og-limones-rope-access.jpg`,
    address: { '@type': 'PostalAddress', addressLocality: 'Ciudad Autónoma de Buenos Aires', addressRegion: 'CABA', addressCountry: 'AR' }
  });
  return out.map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
}

// ─── Partes comunes ────────────────────────────────────────────
const HEAD_COMUN = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18343119177"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18343119177');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

const FUENTES = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192.png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">`;

function nav() {
  return `<a class="skip-link" href="#contenido">Saltar al contenido</a>
<nav aria-label="Principal">
  <a href="/" class="nav-logo" aria-label="Limones Rope Access, ir al inicio">
    <img src="/images/logo-header-660.png" class="nav-logo-img" alt="Limones Rope Access" width="660" height="193">
    <span class="nav-tagline">Trabajos en alturas · Fachadas · Impermeabilizaciones</span>
  </a>
  <div class="nav-right">
    <a href="/#servicios">Servicios</a>
    <a href="/#nosotros">Nosotros</a>
    <a href="/proyectos/">Proyectos</a>
    <a href="/contacto/">Contacto</a>
    <a href="${esc(wa('Hola, quiero solicitar un presupuesto'))}" target="_blank" rel="noopener" class="nav-cta">Presupuesto</a>
  </div>
</nav>`;
}

function footer() {
  return `<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-name">Limones <span>·</span> Rope Access</div>
      <div class="footer-sub">Trabajos en altura · Fachadas · Impermeabilizaciones · CABA y Gran Buenos Aires</div>
    </div>
    <div class="footer-links">
      <a href="/#servicios">Servicios</a>
      <a href="/#nosotros">Nosotros</a>
      <a href="/proyectos/">Proyectos</a>
      <a href="/contacto/">Contacto</a>
    </div>
  </div>
  <div class="footer-nav" role="navigation" aria-label="Servicios y recursos">
    <a href="/trabajos-en-altura/">Trabajos en altura</a>
    <a href="/acceso-por-cuerdas/">Acceso por cuerdas</a>
    <a href="/silleteros/">Silleteros</a>
    <a href="/reparacion-de-fachadas/">Reparación de fachadas</a>
    <a href="/pintura-de-fachadas/">Pintura de fachadas</a>
    <a href="/impermeabilizacion/">Impermeabilización y filtraciones</a>
    <a href="/mantenimiento-de-edificios/">Mantenimiento de edificios</a>
    <a href="/restauracion-patrimonial/">Restauración patrimonial</a>
    <a href="/instalaciones-en-altura/">Instalaciones en altura</a>
    <a href="/proyectos/">Proyectos</a>
    <a href="/administradores/">Administradores de consorcios</a>
  </div>
  <div class="footer-nap">Limones Rope Access · Ciudad Autónoma de Buenos Aires · <a href="tel:+5491171349126">${TEL_VISIBLE}</a> · <a href="mailto:${EMAIL}">${EMAIL}</a></div>
</footer>`;
}

const SCRIPTS = `<!-- WhatsApp flotante -->
<div class="wa-float hidden" id="wa-float">
  <div class="wa-menu" id="wa-menu">
    <div class="wa-menu-title">¿En qué te ayudamos?</div>
    <a href="${esc(wa('Hola, nos intimaron por el estado de la fachada y necesito asesoramiento'))}" target="_blank" rel="noopener" class="wa-menu-item">¿Te intimaron por el mal estado de la fachada?</a>
    <a href="${esc(wa('Hola, no sé qué necesita mi edificio para pintar o refaccionar'))}" target="_blank" rel="noopener" class="wa-menu-item">¿No sabés qué necesita tu edificio para pintar o refaccionar?</a>
    <a href="${esc(wa('Hola, tengo humedad o filtraciones recurrentes'))}" target="_blank" rel="noopener" class="wa-menu-item">¿Tenés humedad, filtraciones o goteras recurrentes?</a>
    <a href="${esc(wa('Hola, noto grietas o desprendimientos en balcones o frente'))}" target="_blank" rel="noopener" class="wa-menu-item">¿Notás grietas o desprendimientos en balcones o frente?</a>
    <a href="${esc(wa('Hola, necesito un diagnóstico técnico antes de invertir'))}" target="_blank" rel="noopener" class="wa-menu-item">¿Necesitás un diagnóstico técnico confiable antes de invertir?</a>
  </div>
  <button class="wa-float-btn" id="wa-toggle" aria-label="Abrir menú de WhatsApp" aria-expanded="false" aria-controls="wa-menu">
    <svg viewBox="0 0 24 24" aria-hidden="true">${ICONO_WA.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>
  </button>
</div>
<script src="/assets/js/site.js" defer></script>`;

function render(p) {
  const cuerpo = expandir(p.cuerpo, p);
  const hero = p.hero ? fotoPorArchivo(p.hero) : null;
  const ogImg = p.ogImage ? `${SITIO}/${p.ogImage}` : (hero ? `${SITIO}/${hero.image}` : `${SITIO}/images/og-limones-rope-access.jpg`);
  const migas = [`<li><a href="/">Inicio</a></li>`];
  if (p.parent) { const pp = porSlug[p.parent]; migas.push(`<li><a href="/${pp.slug}/">${esc(pp.breadcrumb)}</a></li>`); }
  migas.push(`<li><span aria-current="page">${esc(p.breadcrumb)}</span></li>`);
  const heroFoto = hero ? `<figure class="page-hero-photo">
    <img src="/${hero.image_sm || hero.image}" srcset="/${hero.image_sm || hero.image} 800w, /${hero.image} 1600w" sizes="(max-width: 768px) 100vw, 40vw" alt="${esc(hero.alt || hero.title)}" width="${hero.width}" height="${hero.height}" fetchpriority="high" style="object-position:${p.heroPos || 'center'}">
    <figcaption>${esc(p.heroCaption || hero.title)}</figcaption>
  </figure>` : '';

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
${HEAD_COMUN}
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '' : `<link rel="canonical" href="${url(p.slug)}">`}
<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="${p.type === 'article' || p.type === 'case' ? 'article' : 'website'}">
<meta property="og:site_name" content="Limones Rope Access">
<meta property="og:locale" content="es_AR">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url(p.slug)}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
${FUENTES}
${p.noindex ? '' : schemas(p, cuerpo)}
</head>
<body>

${nav()}

<main id="contenido">

<section class="page-hero" id="hero">
  <div class="page-hero-inner">
    <div class="breadcrumb" role="navigation" aria-label="Migas de pan"><ol>${migas.join('')}</ol></div>
    <div class="hero-label"><div class="hero-label-line"></div>${esc(p.label || 'Acceso por cuerdas · Argentina')}</div>
    <h1 class="page-title">${p.h1}</h1>
    ${p.lead ? `<p class="page-lead">${p.lead}</p>` : ''}
    <div class="hero-cta">
      <a href="${esc(wa(p.waText || 'Hola, quiero consultar por un trabajo en altura'))}" target="_blank" rel="noopener" class="btn-main">${ICONO_WA} ${esc(p.heroCta || 'Enviar fotos del problema')}</a>
      <a href="${esc(p.heroCta2Href || '/contacto/')}" class="btn-ghost">${esc(p.heroCta2 || 'Solicitar relevamiento')} <span class="arrow">→</span></a>
    </div>
  </div>
  ${heroFoto}
</section>

${cuerpo.trim()}

</main>

${footer()}

${SCRIPTS}
</body>
</html>
`;
}

// ─── Escribir páginas ──────────────────────────────────────────
let n = 0;
for (const p of paginas) {
  const destino = p.slug === '404' ? path.join(RAIZ, '404.html') : path.join(RAIZ, p.slug, 'index.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, render(p), 'utf-8');
  n++;
}


// ─── Home: schema FAQPage sincronizado con las preguntas visibles ───
const rutaHome = path.join(RAIZ, 'index.html');
let home = fs.readFileSync(rutaHome, 'utf-8');
const faqHome = faqDesdeHtml(home);
if (faqHome.length && home.includes('<!--FAQ_SCHEMA-->')) {
  const bloque = `<!--FAQ_SCHEMA--><script type="application/ld+json">\n${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqHome.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  }, null, 2)}\n</script><!--/FAQ_SCHEMA-->`;
  const nuevo = home.replace(/<!--FAQ_SCHEMA-->[\s\S]*?<!--\/FAQ_SCHEMA-->/, bloque);
  if (nuevo !== home) fs.writeFileSync(rutaHome, nuevo, 'utf-8');
}

// ─── sitemap.xml ───────────────────────────────────────────────
const modHome = fs.statSync(path.join(RAIZ, 'index.html')).mtime.toISOString().slice(0, 10);
const indexables = [{ slug: '', prioridad: '1.0', lastmod: modHome }]
  .concat(paginas.filter(p => !p.noindex).map(p => ({ slug: p.slug, prioridad: p.priority || '0.7', lastmod: p.dateModified || p.modificado })));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexables.map(i => `  <url>
    <loc>${url(i.slug)}</loc>
    <lastmod>${i.lastmod}</lastmod>
    <priority>${i.prioridad}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`\n✔ ${n} página(s) generada(s) y sitemap.xml actualizado (${indexables.length} URLs).\n`);
