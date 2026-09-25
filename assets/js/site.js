// site.js — comportamiento común a todas las páginas
(function () {
  // Botón flotante de WhatsApp: abre/cierra el menú de opciones
  var waFloat = document.getElementById('wa-float');
  var waToggle = document.getElementById('wa-toggle');
  var waMenu = document.getElementById('wa-menu');
  if (waToggle && waMenu) {
    waToggle.addEventListener('click', function () {
      var abierto = waMenu.classList.toggle('open');
      waToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.wa-float')) { waMenu.classList.remove('open'); waToggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Conversión de Google Ads: se dispara al clickear cualquier link de WhatsApp de la página
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (link && typeof gtag === 'function') {
      gtag('event', 'conversion', { 'send_to': 'AW-18343119177/MsyzCIrDu9UcEMmS16pE', 'value': 1.0, 'currency': 'ARS' });
    }
  });

  // Oculta el botón flotante cuando el hero o el bloque de contacto están visibles
  var heroSec = document.getElementById('hero');
  var contactoSec = document.getElementById('contacto');
  if (waFloat && 'IntersectionObserver' in window && (heroSec || contactoSec)) {
    var heroVisible = !!heroSec, contactoVisible = false;
    var update = function () {
      if (heroVisible || contactoVisible) { waFloat.classList.add('hidden'); if (waMenu) waMenu.classList.remove('open'); }
      else { waFloat.classList.remove('hidden'); }
    };
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.target === heroSec) heroVisible = en.isIntersecting;
        if (en.target === contactoSec) contactoVisible = en.isIntersecting;
      });
      update();
    }, { threshold: 0.15 });
    if (heroSec) obs.observe(heroSec);
    if (contactoSec) obs.observe(contactoSec);
  } else if (waFloat) {
    waFloat.classList.remove('hidden');
  }

  // Formulario de contacto: evento de lead en Analytics/Ads (sin afectar el envío)
  var form = document.querySelector('form[name="contacto"]');
  if (form) {
    form.addEventListener('submit', function () {
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { form: 'contacto' });
    });
    // Prellenar el tipo de problema si viene en la URL (?tipo=filtraciones)
    var m = location.search.match(/[?&]tipo=([^&]+)/);
    var sel = form.querySelector('select[name="tipo"]');
    if (m && sel) {
      var val = decodeURIComponent(m[1]);
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === val) sel.selectedIndex = i;
    }
    // Aviso si la foto supera el límite
    var file = form.querySelector('input[type=file]');
    if (file) file.addEventListener('change', function () {
      var total = 0; for (var j = 0; j < file.files.length; j++) total += file.files[j].size;
      var hint = document.getElementById('foto-hint');
      if (hint && total > 8 * 1024 * 1024) { hint.textContent = 'La foto supera 8 MB. Probá con una más liviana o mandala por WhatsApp.'; hint.style.color = '#ff8a8a'; file.value = ''; }
    });
  }
})();
