/* SKINUP.CS2 — общие интерактив и анимации */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* прелоадер */
  const preloader = $('.preloader');
  if (preloader) {
    const num = $('.preloader-num', preloader);
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.random() * 20);
      if (num) num.textContent = String(Math.floor(p)).padStart(3, '0') + '%';
      if (p >= 100) {
        clearInterval(t);
        preloader.classList.add('done');
        document.body.classList.remove('locked');
        startHero();
        setTimeout(() => preloader.remove(), 700);
      }
    }, 110);
  } else {
    document.body.classList.remove('locked');
    startHero();
  }

  function startHero() {
    $$('.hero h1 .line > span, [data-hero-anim]').forEach((el, i) => {
      el.style.transition = 'transform 1s cubic-bezier(0.22,1,0.36,1)';
      el.style.transitionDelay = (0.08 + i * 0.09) + 's';
      requestAnimationFrame(() => { el.style.transform = 'translateY(0)'; });
    });
  }

  /* переход между страницами */
  const curtain = $('.page-curtain');
  if (curtain && !prefersReduced) {
    curtain.classList.add('out');
    setTimeout(() => curtain.remove(), 900);
  } else if (curtain) {
    curtain.remove();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !curtain) return;
    const href = a.getAttribute('href') || '';
    if (
      a.target === '_blank' || a.hasAttribute('download') ||
      href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
      (/^https?:\/\//i.test(href) && !href.includes(location.hostname))
    ) return;
    if (a.pathname === location.pathname && a.hash) return;
    if (prefersReduced) return;
    e.preventDefault();
    closeMenu();
    curtain.classList.remove('out');
    curtain.classList.add('in');
    setTimeout(() => { location.href = a.href; }, 620);
  });

  /* шапка */
  const header = $('.header');
  const toTop = $('.to-top');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 40);
    toTop?.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* меню */
  const burger = $('.burger');
  const overlay = $('.menu-overlay');
  function closeMenu() {
    burger?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.classList.remove('locked');
  }
  burger?.addEventListener('click', () => {
    const open = !overlay.classList.contains('open');
    burger.classList.toggle('open', open);
    overlay?.classList.toggle('open', open);
    document.body.classList.toggle('locked', open);
  });
  overlay && $$('.menu-list a', overlay).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* курсор */
  const cur = $('.cursor');
  const dot = $('.cursor-dot');
  if (cur && dot && matchMedia('(hover: hover)').matches) {
    let mx = -100, my = -100, cx = -100, cy = -100;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('on'); dot.classList.add('on');
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      cur.classList.toggle('grow', !!e.target.closest('a, button, .skin-card, .mini, .faq-q, .filter'));
    });
  }

  /* reveal */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  $$('[data-reveal], [data-count]').forEach(el => io.observe(el));

  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const dur = 1500;
    const t0 = performance.now();
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* FAQ */
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    const a = $('.faq-a', item);
    q?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        $('.faq-a', o).style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* форма */
  const form = $('.form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const ok = $('.form-ok', form);
    ok?.classList.add('show');
    form.reset();
    setTimeout(() => ok?.classList.remove('show'), 5000);
  });

  /* баланс в шапке (общий для сайта) */
  window.SKINUP = window.SKINUP || {};
  window.SKINUP.loadBalance = () => 9999999999;
  window.SKINUP.saveBalance = () => {};
  window.SKINUP.updateBalance = (val) => {
    $$('[data-balance]').forEach(el => { el.textContent = fmtMoney(val); });
  };
  window.SKINUP.updateBalance(window.SKINUP.loadBalance());

  /* инвентарь (localStorage) */
  const INV_KEY = 'skinup_inventory';
  window.SKINUP.getInventory = () => {
    try { return JSON.parse(localStorage.getItem(INV_KEY)) || []; } catch { return []; }
  };
  window.SKINUP.addInventory = (skin) => {
    const list = window.SKINUP.getInventory();
    list.unshift({ ...skin, ts: Date.now() });
    try { localStorage.setItem(INV_KEY, JSON.stringify(list)); } catch {}
    $$('[data-inv-count]').forEach(el => { el.textContent = list.length; });
  };
  window.SKINUP.clearInventory = () => {
    try { localStorage.removeItem(INV_KEY); } catch {}
    $$('[data-inv-count]').forEach(el => { el.textContent = '0'; });
  };
})();
