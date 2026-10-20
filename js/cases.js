/* Режим кейсов: лента с выпадением как в CS2 — бесплатно */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);

  const CASES = [
    { id: 1, name: "Kilowatt Case",            file: "img/case-kilowatt-case.png" },
    { id: 2, name: "Recoil Case",              file: "img/case-recoil-case.png" },
    { id: 3, name: "Fracture Case",            file: "img/case-fracture-case.png" },
    { id: 4, name: "Dreams & Nightmares Case", file: "img/case-dreams-nightmares-case.png" },
    { id: 5, name: "Snakebite Case",           file: "img/case-snakebite-case.png" },
    { id: 6, name: "Gallery Case",             file: "img/case-gallery-case.png" },
    { id: 7, name: "Fever Case",               file: "img/case-fever-case.png" },
    { id: 8, name: "CS20 Case",                file: "img/case-cs20-case.png" },
    { id: 9, name: "Prisma 2 Case",            file: "img/case-prisma-2-case.png" }
  ];

  const RATES = [
    { rarity: "blue",   weight: 79.92 },
    { rarity: "purple", weight: 15.98 },
    { rarity: "pink",   weight: 3.20 },
    { rarity: "red",    weight: 0.64 },
    { rarity: "gold",   weight: 0.26 }
  ];

  const grid = $('#cases-grid');
  const modal = $('#case-open');
  const reel = $('#case-reel');
  const resultEl = $('#case-result');
  const openTitle = $('#case-open-title');
  const openBtn = $('#open-btn');
  const closeBtn = $('#close-btn');
  const wrap = $('.case-reel-wrap');

  if (!grid || typeof SKINS === 'undefined') return;

  let balance = SKINUP.loadBalance(250);
  let currentCase = null;
  let spinning = false;
  const lastDrops = [];

  function rollRarity() {
    const total = RATES.reduce((s, r) => s + r.weight, 0);
    let x = Math.random() * total;
    for (const r of RATES) {
      if (x < r.weight) return r.rarity;
      x -= r.weight;
    }
    return "blue";
  }

  function randomSkin(rarity) {
    const pool = SKINS.filter(s => s.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function dropValue(skin) {
    /* кейс бесплатный: на баланс капает цена выпавшего скина со скидкой */
    return Math.max(1, Math.round(skin.price * (0.85 + Math.random() * 0.3)));
  }

  function renderCases() {
    grid.innerHTML = '';
    CASES.forEach((c, i) => {
      const el = document.createElement('article');
      el.className = 'case-card';
      el.setAttribute('data-reveal', 'scale');
      el.style.setProperty('--d', (i % 3) * 0.08 + 's');
      el.innerHTML = `
        <img src="${c.file}" alt="${c.name}" loading="lazy">
        <h3>${c.name}</h3>
        <span class="case-price" style="color:var(--win)">Бесплатно</span>
        <button type="button" class="btn btn-primary">Открыть</button>`;
      el.addEventListener('click', () => openCase(c));
      grid.appendChild(el);
      const obs = new IntersectionObserver(en => {
        if (en[0].isIntersecting) { el.classList.add('visible'); obs.disconnect(); }
      }, { threshold: 0.08 });
      obs.observe(el);
    });
  }

  function buildReel(winner) {
    reel.classList.remove('spinning');
    reel.style.transform = 'translateX(0)';
    reel.innerHTML = '';

    const WIN_INDEX = 42;
    const items = [];
    for (let i = 0; i < 55; i++) {
      if (i === WIN_INDEX) {
        items.push({ ...winner, isWin: true });
      } else {
        const s = randomSkin(rollRarity());
        items.push({ ...s, priceShown: Math.max(1, Math.round(s.price * (0.5 + Math.random()))) });
      }
    }

    items.forEach(s => {
      const d = document.createElement('div');
      d.className = 'reel-item';
      d.style.setProperty('--rc', RARITY[s.rarity].color);
      const price = s.isWin ? s.price : s.priceShown;
      d.innerHTML = `<img src="${s.file}" alt=""><small>${s.name.split('|').pop().trim()}<br>${fmtMoney(Math.round(price))}</small>`;
      reel.appendChild(d);
    });

    return WIN_INDEX;
  }

  function openCase(c) {
    if (spinning) return;
    currentCase = c;
    spinning = true;

    modal.classList.add('show');
    document.body.classList.add('locked');
    resultEl.classList.remove('show', 'win');
    openTitle.innerHTML = `Открываем <b>${c.name}</b> · бесплатно`;
    openBtn.disabled = true;
    openBtn.textContent = 'Крутится...';

    const winner = randomSkin(rollRarity());
    const winIndex = buildReel(winner);

    requestAnimationFrame(() => {
      const itemW = 140 + 10;
      const pad = 10;
      const wrapW = wrap.clientWidth;
      const offset = wrapW / 2 - (pad + winIndex * itemW + 140 / 2);
      const jitter = (Math.random() - 0.5) * 60;
      reel.style.transform = 'translateX(0)';
      requestAnimationFrame(() => {
        reel.classList.add('spinning');
        reel.style.transform = `translateX(${offset + jitter}px)`;
      });
    });

    setTimeout(() => {
      const winPrice = dropValue(winner);
      balance += winPrice;
      SKINUP.updateBalance(balance);

      resultEl.className = 'case-result show win';
      resultEl.innerHTML = `
        <img src="${winner.file}" alt="">
        <div>
          <b>${winner.name}</b>
          <span>${winner.wear} · ${RARITY[winner.rarity].label}</span>
        </div>
        <div style="text-align:right">
          <b>${fmtMoney(winPrice)}</b>
          <span class="profit">+${fmtMoney(winPrice)} к балансу</span>
        </div>`;
      confettiBurst();

      lastDrops.unshift({ case: c.name, skin: winner, price: winPrice });
      if (lastDrops.length > 6) lastDrops.pop();
      renderDrops();
      addToInventory(winner);

      openBtn.disabled = false;
      openBtn.textContent = 'Открыть ещё';
      spinning = false;
    }, 5300);
  }

  function addToInventory(skin) {
    if (SKINUP.addInventory) SKINUP.addInventory(skin);
  }

  function renderDrops() {
    const box = $('#drops');
    if (!box) return;
    if (!lastDrops.length) {
      box.innerHTML = '<p style="color:var(--muted)">Тут появятся последние дропы</p>';
      return;
    }
    box.innerHTML = lastDrops.map(d => `
      <div class="hist-row win" style="animation:popIn .35s ease">
        <img src="${d.skin.file}" alt="">
        <div class="hist-name">${d.skin.name}<small>${d.case}</small></div>
        <div class="hist-chance">${RARITY[d.skin.rarity].label}</div>
        <div class="hist-status">${fmtMoney(Math.round(d.price))}</div>
      </div>`).join('');
  }

  function closeCase() {
    if (spinning) return;
    modal.classList.remove('show');
    document.body.classList.remove('locked');
  }

  closeBtn?.addEventListener('click', closeCase);
  openBtn?.addEventListener('click', () => { if (currentCase && !spinning) openCase(currentCase); });
  modal?.addEventListener('click', e => { if (e.target === modal) closeCase(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });

  function confettiBurst() {
    const confetti = $('#confetti');
    if (!confetti) return;
    const colors = ['#f7931a', '#ff5e3a', '#ffd700', '#26d97f', '#38c7ff', '#d32ce6'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2 + Math.random() * 2) + 's';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.appendChild(p);
      setTimeout(() => p.remove(), 4600);
    }
  }

  renderCases();
  renderDrops();
})();
