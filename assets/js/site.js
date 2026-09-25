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
    // Foto: se achica en el celular antes de enviarla (máx. 1600 px, JPEG),
    // así una foto de 5-8 MB sube como ~300 KB y el envío es mucho más rápido.
    var file = form.querySelector('input[type=file]');
    var hint = document.getElementById('foto-hint');
    var btn = form.querySelector('button[type=submit]');
    if (file && window.DataTransfer && window.createImageBitmap) {
      file.addEventListener('change', function () {
        var f = file.files[0];
        if (!f || !/^image\//.test(f.type) || f.size < 600 * 1024) return;
        if (btn) { btn.disabled = true; btn.textContent = 'Preparando foto…'; }
        createImageBitmap(f).then(function (img) {
          var max = 1600, sc = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (blob) {
            if (blob && blob.size < f.size) {
              var dt = new DataTransfer();
              dt.items.add(new File([blob], f.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
              file.files = dt.files;
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Enviar consulta'; }
          }, 'image/jpeg', 0.8);
        }).catch(function () { if (btn) { btn.disabled = false; btn.textContent = 'Enviar consulta'; } });
      });
    }
    if (file && !(window.DataTransfer && window.createImageBitmap)) file.addEventListener('change', function () {
      var total = 0; for (var j = 0; j < file.files.length; j++) total += file.files[j].size;
      if (hint && total > 8 * 1024 * 1024) { hint.textContent = 'La foto supera 8 MB. Probá con una más liviana o mandala por WhatsApp.'; hint.style.color = '#ff8a8a'; file.value = ''; }
    });
    // Indicar que se está enviando
    form.addEventListener('submit', function () {
      if (btn) { btn.textContent = 'Enviando…'; setTimeout(function () { btn.disabled = true; }, 0); }
    });
  }
})();
