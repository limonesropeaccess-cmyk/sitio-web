# Informe SEO · limonesropeaccess.com · septiembre 2026

## A. Cambios realizados (archivos)

| Archivo | Cambio |
|---|---|
| `index.html` | Title/description nuevos, canonical con barra final, OG + Twitter card con imagen 1200×630, schema `HomeAndConstructionBusiness` completo (+ `WebSite`, `FAQPage` sincronizado), meta keywords eliminada, fuente Space Grotesk (no usada) eliminada, CSS movido a `/assets/css/site.css`, logo del nav servido en versión liviana (mismo archivo reescalado, 155 KB → 47 KB), filas de servicios y problemas enlazadas a sus páginas, nuevo servicio 07 "Mantenimiento de edificios", stats corregidos, textos de "Por qué nos eligen", proceso con descripción, FAQ ajustadas + 1 nueva, CTA con botón a formulario, footer con enlaces internos y datos de contacto, galería con miniaturas, ALT reales, dimensiones y enlace a cada proyecto. |
| `assets/css/site.css` | CSS de la Home (idéntico) + componentes de páginas internas + fix de desborde de botones del hero en celulares. |
| `assets/js/site.js` | WhatsApp flotante + conversión de Google Ads (ahora en todas las páginas) + eventos del formulario. |
| `gallery.json` | 36 fotos con nombre descriptivo, `alt`, `width`, `height`, `image_sm` (800 px) y `proyecto`. |
| `images/galeria/*` | Renombradas (sin tildes ni espacios), comprimidas, EXIF eliminado. Galería: ~19,9 MB → ~2,4 MB de descarga. |
| `images/` | `og-limones-rope-access.jpg`, `logo-header-660.png`, favicons 32/192, `apple-touch-icon.png`; `hero-photo.jpg` → `tecnico-acceso-por-cuerdas-descenso-fachada.jpg`. Logos originales intactos. |
| `actualizar-galeria.js` | Conserva orden y todos los datos; avisa si una foto nueva tiene nombre poco SEO; agrega alt/medidas. |
| `_src/generar-paginas.js` + `generar-paginas.bat` | Generador de páginas internas (nav, footer, metadatos, schema, migas y sitemap automáticos). |
| `_src/paginas/*.html` | Contenido editable de cada página interna. |
| `sitemap.xml` | 15 URLs indexables. |
| `robots.txt` | Bloquea `/_src/` y `/gracias/`. |
| `_redirects`, `_headers` | Redirecciones 301 y cabeceras de seguridad/caché (Netlify). |
| `404.html` | Página de error propia. |

## B. SEO por página

| URL | Title | H1 | Intención | Keywords principales |
|---|---|---|---|---|
| `/` | Trabajos en Altura y Fachadas en CABA \| Limones Rope Access | Resolución técnica de problemas en altura | Comercial / marca | trabajos en altura CABA, empresa de trabajos en altura, acceso por cuerdas |
| `/trabajos-en-altura/` | Trabajos en Altura en CABA y Buenos Aires \| Limones | Trabajos en altura en CABA y Buenos Aires | Comercial (pilar) | trabajos en altura CABA/Buenos Aires, trabajos verticales |
| `/acceso-por-cuerdas/` | Acceso por Cuerdas en CABA: Trabajos Verticales \| Limones | Acceso por cuerdas: trabajos verticales sin montar andamios | Informativa-comercial | acceso por cuerdas, rope access, trabajos en altura sin andamios |
| `/reparacion-de-fachadas/` | Reparación de Fachadas en CABA sin Andamios \| Limones | Reparación de fachadas en CABA con acceso por cuerdas | Comercial | reparación de fachadas CABA, desprendimientos de fachada |
| `/pintura-de-fachadas/` | Pintura de Fachadas y Medianeras en CABA \| Limones | Pintura de fachadas y medianeras en CABA | Comercial | pintura de fachadas CABA, pintura de medianeras |
| `/impermeabilizacion/` | Impermeabilización de Medianeras y Filtraciones \| Limones | Impermeabilización de medianeras y filtraciones | Comercial / problema | impermeabilización de medianeras, reparación de filtraciones, reparación de medianeras |
| `/mantenimiento-de-edificios/` | Mantenimiento de Edificios y Fachadas en CABA \| Limones | Mantenimiento de edificios en altura | Comercial B2B (consorcios) | mantenimiento de edificios, mantenimiento de fachadas, inspección de fachadas |
| `/restauracion-patrimonial/` | Restauración Patrimonial y de Fachadas en CABA \| Limones | Restauración de fachadas y patrimonio | Comercial | restauración de fachadas, restauración patrimonial |
| `/instalaciones-en-altura/` | Instalaciones en Altura en CABA: Ductos y Cartelería \| Limones | Instalaciones en altura | Comercial | instalaciones en altura, ductos, cañerías, gigantografías |
| `/proyectos/` | Proyectos de Trabajos en Altura en CABA y GBA \| Limones | Proyectos reales en altura | Confianza / evidencia | proyectos trabajos en altura, obras reales |
| `/proyectos/restauracion-cupula-edificio-la-inmobiliaria/` | Restauración de la Cúpula de La Inmobiliaria \| Limones | Restauración de la cúpula del edificio La Inmobiliaria | Caso de estudio | restauración cúpula Avenida de Mayo, restauración patrimonial CABA |
| `/administradores/` | Guías para Administradores de Consorcios en CABA \| Limones | Para administradores de consorcios | Informativa B2B | administradores de consorcios, mantenimiento de fachadas CABA |
| `/administradores/conservacion-de-fachadas-caba/` | Conservación de Fachadas en CABA: Ley 257 y 6116 \| Limones | Conservación de fachadas en CABA: qué implica para el consorcio | Informativa | ley 257 fachadas, ley 6116, intimación fachada |
| `/administradores/desprendimiento-de-fachada/` | Qué Hacer ante un Desprendimiento de Fachada \| Limones | Qué hacer ante un desprendimiento de fachada | Informativa / urgencia | desprendimiento de fachada, caída de revoque |
| `/contacto/` | Pedir Presupuesto de Trabajos en Altura en CABA \| Limones | Solicitar relevamiento o presupuesto | Transaccional | presupuesto trabajos en altura |

(Las meta descriptions están en cada `_src/paginas/*.html`, todas únicas y de 140–160 caracteres.)

## D. Problemas encontrados y solución

1. Una sola URL indexable → arquitectura de 15 URLs con intención propia.
2. Galería de ~20 MB con nombres con espacios/tildes/typos ("oetste", "averellaneda") → renombrado + compresión + miniaturas.
3. ALT genérico repetido ("título - Limones…") → ALT descriptivo por foto.
4. Botones del hero desbordaban la pantalla en celulares (se cortaba "Ver trabajos") → corregido.
5. Afirmaciones no demostrables: "40–70% menos logística", "cuerdas certificadas", "protocolos certificados", "todo el país", "métodos tradicionales no viables" → reemplazadas por afirmaciones defendibles. "0 incidentes" → contextualizado con nota.
6. `sameAs` con WhatsApp y un LinkedIn con "undefined" → quitados del schema.
7. Canonical sin barra final e inconsistente con OG → unificado.
8. Imagen OG = logo recortado → imagen 1200×630 propia.
9. Fuente Space Grotesk cargada sin usarse → eliminada.
10. Sin 404 propio, sin favicons de tamaño correcto, sin cabeceras de seguridad → agregados.
11. Sin formulario ni forma de enviar fotos fuera de WhatsApp → formulario con foto.

## E. Pendientes (no se pueden resolver desde el código)

- Netlify: activar **Form detection** (Forms → Enable) y configurar el aviso por email de nuevos envíos.
- Confirmar el dato "0 incidentes" y su nota; confirmar coberturas (ART/seguros) antes de enviarlas a administradores.
- Datos reales de cada proyecto (problema, diagnóstico, materiales, duración) para convertirlos en casos completos.
- Los títulos de H1/H2 usan 'Bebas Neue' en el CSS, pero esa fuente nunca se cargó: lo que se ve hoy es la fuente de respaldo. No se tocó para no cambiar la estética.
- GA4 (G-GL9SJZQ4ZM) no está en el código; solo el tag de Google Ads. Verificar si se carga por otra vía antes de agregarlo (para no duplicar).
- LinkedIn: crear la página de empresa (/company/) y sumarla al schema.

## F. Próximos pasos externos

Ver el mensaje de entrega en el chat.
