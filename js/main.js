/* ============================================================
   POLILLA SUITES · JS PRINCIPAL
   ============================================================ */
(function(){
  'use strict';

  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------
     1. Barra de progreso + header + volver arriba
     --------------------------------------------------------- */
  const progress = $('#progress');
  const header   = $('#header');
  const toTop    = $('#toTop');
  let ticking = false;

  function onScroll(){
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y/max)*100 : 0) + '%';
    header.classList.toggle('scrolled', y > 60);
    if (toTop) toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });
  onScroll();

  /* ---------------------------------------------------------
     2. Menú móvil
     --------------------------------------------------------- */
  const burger    = $('#burger');
  const mobileNav = $('#mobileNav');

  function toggleNav(force){
    const open = force !== undefined ? force : !mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open', open);
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  if (burger){
    burger.addEventListener('click', () => toggleNav());
    $$('#mobileNav a').forEach(a => a.addEventListener('click', () => toggleNav(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleNav(false); });
  }

  /* ---------------------------------------------------------
     3. Scroll suave con compensación del header fijo
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     4. Carga de imágenes con degradado de respaldo
     --------------------------------------------------------- */
  $$('img[data-img]').forEach(img => {
    const mark = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) mark();
    else {
      img.addEventListener('load', mark, { once:true });
      img.addEventListener('error', () => { img.style.display = 'none'; }, { once:true });
    }
  });

  /* ---------------------------------------------------------
     5. Hero · animación de entrada
     --------------------------------------------------------- */
  function initHero(){
    const hero = document.querySelector('#hero');
    if (!hero) return;
    void hero.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hero.classList.add('ready');
      });
    });
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    initHero();
  }

  /* ---------------------------------------------------------
     6. Reveal on scroll
     --------------------------------------------------------- */
  const revealEls = $$('.reveal');
  if (revealEls.length){
    if (!('IntersectionObserver' in window)){
      revealEls.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting){
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold:0.14, rootMargin:'0px 0px -8% 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------------------------------------------------------
     7. Barra de reservas + motor simulado
     --------------------------------------------------------- */
  const bookingForm  = document.querySelector('#bookingForm');
  const bookingModal = document.querySelector('#bookingModal');
  const bmSummary    = document.querySelector('#bmSummary');
  const bmList       = document.querySelector('#bmList');
  const bmReserve    = document.querySelector('#bmReserve');

  const ROOMS = [
    { nombre: 'Refugio', detalle: '42 m² · Vista reserva · Cama king', precio: 780,
      img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80' },
    { nombre: 'Vuelo', detalle: '70 m² · Terraza & telescopio', precio: 1240,
      img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80' },
    { nombre: 'Crisálida', detalle: '120 m² · Aislada en el bosque', precio: 2400,
      img: 'img/crisalida.jpg' }
  ];

  function diasEntre(a, b){
    const d1 = new Date(a);
    const d2 = new Date(b);
    return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  function formatoFecha(iso){
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' });
  }

  function abrirModalReserva(){
    if (!bookingModal) return;
    const llegada = document.querySelector('#llegada').value;
    const salida  = document.querySelector('#salida').value;
    const huespedes = document.querySelector('#huespedes').value;
    if (!llegada || !salida) return;

    const noches = diasEntre(llegada, salida);

    bmSummary.innerHTML = `
      <strong>${formatoFecha(llegada)}</strong> → <strong>${formatoFecha(salida)}</strong>
      · ${noches} ${noches === 1 ? 'noche' : 'noches'} · ${huespedes}
    `;

    bmList.innerHTML = ROOMS.map(r => {
      const total = r.precio * noches;
      return `
        <div class="bm-room">
          <div class="bm-room__thumb">
            <img src="${r.img}" alt="${r.nombre}">
          </div>
          <div class="bm-room__info">
            <h4>${r.nombre}</h4>
            <span>${r.detalle}</span>
            <em>Disponible para tus fechas</em>
          </div>
          <div class="bm-room__price">
            <strong>USD ${total.toLocaleString('es-AR')}</strong>
            <small>Total · ${noches} noches</small>
          </div>
        </div>
      `;
    }).join('');

    const msg = `Hola, quiero reservar en Polilla Suites.%0A%0ALlegada: ${formatoFecha(llegada)}%0ASalida: ${formatoFecha(salida)}%0ANoches: ${noches}%0AHu%C3%A9spedes: ${huespedes}%0A%0A%C2%BFQu%C3%A9%20habitaciones%20ten%C3%A9s%20disponibles%3F`;
    bmReserve.href = `https://wa.me/393520061020?text=${msg}`;

    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function cerrarModalReserva(){
    if (!bookingModal) return;
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  if (bookingModal){
    $('#bmClose').addEventListener('click', cerrarModalReserva);
    bookingModal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', cerrarModalReserva);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && bookingModal.classList.contains('open')) cerrarModalReserva();
    });
  }

  if (bookingForm){
    const llegada = document.querySelector('#llegada');
    const salida  = document.querySelector('#salida');

    const hoy  = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoy.getDate()).padStart(2, '0');
    const hoyISO = `${yyyy}-${mm}-${dd}`;

    llegada.min = hoyISO;
    salida.min  = hoyISO;

    llegada.addEventListener('change', () => {
      if (!llegada.value) return;
      const next = new Date(llegada.value);
      next.setDate(next.getDate() + 1);
      const minISO = next.toISOString().split('T')[0];
      salida.min = minISO;
      if (salida.value && salida.value < minISO) salida.value = minISO;
    });

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!llegada.value || !salida.value){
        [llegada, salida].forEach(f => {
          if (!f.value){
            f.style.borderBottomColor = '#C0664F';
            setTimeout(() => { f.style.borderBottomColor = ''; }, 1800);
          }
        });
        return;
      }
      abrirModalReserva();
    });
  }

  /* ---------------------------------------------------------
     8. Pestañas de habitaciones
     --------------------------------------------------------- */
  const tabs   = $$('.tab');
  const panels = $$('.room-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = tab.dataset.room;

      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
      });

      panels.forEach(p => {
        p.classList.toggle('active', p.dataset.panel === idx);
      });

      const activePanel = $('.room-panel.active');
      if (activePanel){
        activePanel.querySelectorAll('img[data-img]').forEach(img => {
          if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
        });
      }
    });
  });

  /* ---------------------------------------------------------
     9. Galería · Lightbox
     --------------------------------------------------------- */
  const galleryBtns = $$('#gallery button');
  const lightbox    = $('#lightbox');
  const lbImg       = $('#lbImg');
  const lbCount     = $('#lbCount');
  let lbIndex = 0;

  function openLightbox(i){
    if (!galleryBtns.length) return;
    lbIndex = (i + galleryBtns.length) % galleryBtns.length;
    const btn = galleryBtns[lbIndex];
    lbImg.src = btn.dataset.src;
    const inner = btn.querySelector('img');
    lbImg.alt = inner ? inner.alt : '';
    lbCount.textContent = (lbIndex + 1) + ' / ' + galleryBtns.length;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    setTimeout(() => { lbImg.src = ''; }, 400);
  }
  if (lightbox && galleryBtns.length){
    galleryBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => openLightbox(i));
    });
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => openLightbox(lbIndex - 1));
    $('#lbNext').addEventListener('click', () => openLightbox(lbIndex + 1));
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  openLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
    });
  }

  /* ---------------------------------------------------------
     10. Testimonios · slider automático
     --------------------------------------------------------- */
  const quotes = $$('.quote');
  const dots   = $$('#quoteDots button');
  const slider = $('#quoteSlider');
  let qIndex = 0;
  let qTimer = null;

  function showQuote(i){
    if (!quotes.length) return;
    qIndex = (i + quotes.length) % quotes.length;
    quotes.forEach((q, n) => q.classList.toggle('active', n === qIndex));
    dots.forEach((d, n) => d.classList.toggle('active', n === qIndex));
  }
  function startQuotes(){
    clearInterval(qTimer);
    qTimer = setInterval(() => showQuote(qIndex + 1), 7000);
  }
  if (quotes.length){
    dots.forEach((d, n) => {
      d.addEventListener('click', () => {
        showQuote(n);
        startQuotes();
      });
    });
    if (slider){
      slider.addEventListener('mouseenter', () => clearInterval(qTimer));
      slider.addEventListener('mouseleave', startQuotes);
    }
    startQuotes();
  }

  /* ---------------------------------------------------------
     11. Newsletter
     --------------------------------------------------------- */
  const newsForm  = $('#newsForm');
  const newsEmail = $('#newsEmail');
  const newsNote  = $('#newsNote');

  if (newsForm){
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = newsEmail.value.trim();
      const ok  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      if (!ok){
        newsNote.textContent = 'Introduzca un correo electrónico válido.';
        newsNote.style.color = '#C0664F';
        return;
      }
      newsNote.textContent = 'Gracias. Bienvenido al círculo Polilla.';
      newsNote.style.color = 'var(--dorado)';
      newsEmail.value = '';
      setTimeout(() => {
        newsNote.textContent = 'Sin spam. Baja cuando quiera.';
        newsNote.style.color = '';
      }, 4200);
    });
  }

  /* ---------------------------------------------------------
     12. Botón volver arriba
     --------------------------------------------------------- */
  if (toTop){
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     13. Año dinámico en el footer
     --------------------------------------------------------- */
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     14. Selector de idioma (i18n)
     --------------------------------------------------------- */
  const langBtns = $$('.lang-btn');
  const DICT = window.POLILLA_I18N || null;

  function setTranslation(el, val){
    if (val && typeof val === 'object' && val.h !== undefined){
      el.innerHTML = val.h;
    } else {
      el.textContent = val;
    }
  }

  function applyLang(lang){
    if (!DICT || !DICT[lang]) return;
    const entries = DICT[lang];
    Object.keys(entries).forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      setTranslation(el, entries[sel]);
    });

    const newsInput = document.querySelector('#newsEmail');
    if (newsInput){
      const map = { es:'Su correo electrónico', en:'Your email address', it:'La tua email' };
      newsInput.placeholder = map[lang] || map.es;
    }
    const msgInput = document.querySelector('#cMensaje');
    if (msgInput){
      const map = { es:'Contanos qué tenés en mente…', en:'Tell us what you have in mind…', it:'Raccontaci cosa hai in mente…' };
      msgInput.placeholder = map[lang] || map.es;
    }

    document.documentElement.lang = lang;
    try { localStorage.setItem('polilla-lang', lang); } catch(e){}
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  let initialLang = 'es';
  try {
    const saved = localStorage.getItem('polilla-lang');
    if (saved && DICT && DICT[saved]) initialLang = saved;
    else {
      const nav = (navigator.language || 'es').slice(0,2).toLowerCase();
      if (nav === 'en' && DICT.en) initialLang = 'en';
      else if (nav === 'it' && DICT.it) initialLang = 'it';
    }
  } catch(e){}
  if (initialLang !== 'es') applyLang(initialLang);

  /* ---------------------------------------------------------
     15. Enlace activo en el menú según la sección visible
     --------------------------------------------------------- */
  const sections = [
    { id: 'hotel',        sel: '.nav a[href="#hotel"]' },
    { id: 'habitaciones', sel: '.nav a[href="#habitaciones"]' },
    { id: 'comedor',      sel: '.nav a[href="#comedor"]' },
    { id: 'rituales',     sel: '.nav a[href="#rituales"]' },
    { id: 'llegar',       sel: '.nav a[href="#llegar"]' },
    { id: 'galeria',      sel: '.nav a[href="#galeria"]' }
  ];

  function setActiveSection(id){
    sections.forEach(s => {
      const link = document.querySelector(s.sel);
      if (!link) return;
      const isActive = s.id === id;
      link.classList.toggle('active', isActive);
      const mobileLink = document.querySelector(`.mobile-nav a[href="#${s.id}"]`);
      if (mobileLink) mobileLink.classList.toggle('active', isActive);
    });
  }

  if ('IntersectionObserver' in window){
    const sectionEls = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(en => {
        if (en.isIntersecting){
          if (!best || en.intersectionRatio > best.intersectionRatio){
            best = en;
          }
        }
      });
      if (best) setActiveSection(best.target.id);
    }, {
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    sectionEls.forEach(el => sectionObserver.observe(el));
  }

  /* ---------------------------------------------------------
     16. Loader de entrada
     --------------------------------------------------------- */
  const loader = document.querySelector('#loader');
  if (loader){
    const hideLoader = () => {
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 1000);
    };
    const minTime = new Promise(r => setTimeout(r, 1400));
    const pageLoad = new Promise(r => {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r, { once: true });
    });
    Promise.all([minTime, pageLoad]).then(hideLoader);
  }

  /* ---------------------------------------------------------
     17. Cursor personalizado (solo escritorio)
     --------------------------------------------------------- */
  const cursor = document.querySelector('#cursor');
  const cursorDot  = cursor ? cursor.querySelector('.cursor__dot')  : null;
  const cursorRing = cursor ? cursor.querySelector('.cursor__ring') : null;

  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add('visible');
      if (cursorDot){
        cursorDot.style.left = mx + 'px';
        cursorDot.style.top  = my + 'px';
      }
    });

    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('visible'));

    function animateRing(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (cursorRing){
        cursorRing.style.left = rx + 'px';
        cursorRing.style.top  = ry + 'px';
      }
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = 'a, button, .tab, .card, .gallery button, .lang-btn, .llegar-card, .diario-card, .persona, input, select, textarea';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    document.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('text'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('text'));
    });

    document.documentElement.style.cursor = 'none';
    document.querySelectorAll('a, button').forEach(el => {
      el.style.cursor = 'none';
    });
  }

  /* ---------------------------------------------------------
     18. Formulario de contacto
     --------------------------------------------------------- */
  const contactoForm = document.querySelector('#contactoForm');
  const contactoNote = document.querySelector('#contactoNote');

  if (contactoForm){
    contactoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre  = contactoForm.querySelector('#cNombre');
      const email   = contactoForm.querySelector('#cEmail');
      const mensaje = contactoForm.querySelector('#cMensaje');
      let ok = true;

      [nombre, email, mensaje].forEach(f => {
        const valor = f.value.trim();
        const valido = valor.length > 0 && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor));
        if (!valido){
          f.style.borderBottomColor = '#C0664F';
          setTimeout(() => { f.style.borderBottomColor = ''; }, 1800);
          ok = false;
        }
      });

      if (!ok){
        contactoNote.textContent = 'Revisá los campos marcados en rojo.';
        contactoNote.style.color = '#C0664F';
        return;
      }

      const btn = contactoForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Mensaje enviado ✓';
        contactoNote.textContent = 'Gracias. El concierge te escribirá hoy mismo.';
        contactoNote.style.color = 'var(--dorado)';
        contactoForm.reset();

        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          contactoNote.textContent = 'Al enviar, aceptás que guardemos tus datos para responderte.';
          contactoNote.style.color = '';
        }, 5000);
      }, 1000);
    });
  }

  /* ---------------------------------------------------------
     19. Parallax suave en el hero
     --------------------------------------------------------- */
  const heroSection = document.querySelector('#hero');
  const heroImg = heroSection ? heroSection.querySelector('.hero__bg img') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (heroImg && !prefersReducedMotion && isDesktop){
    let pTicking = false;
    function parallaxHero(){
      const y = window.scrollY;
      const heroH = heroSection.offsetHeight;
      if (y < heroH){
        const offset = y * 0.35;
        heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
      }
      pTicking = false;
    }
    window.addEventListener('scroll', () => {
      if (!pTicking){
        requestAnimationFrame(parallaxHero);
        pTicking = true;
      }
    }, { passive: true });
    parallaxHero();
  }

  /* ---------------------------------------------------------
     20. Modo claro / oscuro
     --------------------------------------------------------- */
  const themeToggle = document.querySelector('#themeToggle');
  const root = document.documentElement;

  function applyTheme(theme){
    if (theme === 'light'){
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    try { localStorage.setItem('polilla-theme', theme); } catch(e){}
  }

  if (themeToggle){
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(current);
    });
  }

  try {
    const saved = localStorage.getItem('polilla-theme');
    if (saved === 'light' || saved === 'dark'){
      applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches){
      applyTheme('light');
    }
  } catch(e){}

  /* ---------------------------------------------------------
     21. Popup de salida
     --------------------------------------------------------- */
  const exitModal = document.querySelector('#exitModal');
  const exitForm  = document.querySelector('#exitForm');
  const exitEmail = document.querySelector('#exitEmail');
  const exitNote  = document.querySelector('#exitNote');

  function cerrarExitModal(){
    if (!exitModal) return;
    exitModal.classList.remove('open');
    exitModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    try { sessionStorage.setItem('polilla-exit-shown', '1'); } catch(e){}
  }

  if (exitModal){
    exitModal.querySelector('#emClose').addEventListener('click', cerrarExitModal);
    exitModal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', cerrarExitModal);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && exitModal.classList.contains('open')) cerrarExitModal();
    });

    const isDesktopExit = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let exitShown = false;
    try { exitShown = sessionStorage.getItem('polilla-exit-shown') === '1'; } catch(e){}

    if (isDesktopExit && !exitShown){
      document.addEventListener('mouseout', (e) => {
        if (exitShown) return;
        if (e.clientY > 0) return;
        if (e.relatedTarget || e.toElement) return;

        exitShown = true;
        setTimeout(() => {
          exitModal.classList.add('open');
          exitModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('nav-open');
        }, 200);
      });

      setTimeout(() => {
        if (exitShown) return;
        if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800){
          exitShown = true;
          exitModal.classList.add('open');
          exitModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('nav-open');
        }
      }, 45000);
    }
  }

  if (exitForm){
    exitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = exitEmail.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      if (!ok){
        exitNote.textContent = 'Introducí un correo válido.';
        exitNote.style.color = '#C0664F';
        return;
      }
      exitNote.textContent = 'Listo. La primera carta llega el 1 del mes.';
      exitNote.style.color = 'var(--dorado)';
      exitEmail.value = '';
      setTimeout(() => { cerrarExitModal(); }, 2200);
    });
  }

  /* ---------------------------------------------------------
     22. Lazy loading + prefetch
     --------------------------------------------------------- */
  if ('IntersectionObserver' in window){
    const lazyImages = document.querySelectorAll(
      '.gallery img, .diario-card__media img, .persona__media img, .room__media img, .comedor__media img, .filo__media img'
    );
    lazyImages.forEach(img => {
      if (img.loading !== 'lazy'){
        img.loading = 'lazy';
        img.decoding = 'async';
      }
    });

    document.querySelectorAll('.nav a[href^="#"]').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        if (section){
          section.querySelectorAll('img[data-img]').forEach(img => {
            if (!img.complete && img.loading !== 'eager'){
              img.loading = 'eager';
            }
          });
        }
      }, { once: true });
    });
  }

})();