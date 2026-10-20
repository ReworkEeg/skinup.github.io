/* Апгрейдер: выбор скинов, шанс, анимация колеса */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const fromPick = $('#from-pick');
  const toPick = $('#to-pick');
  const fromPriceEl = $('#from-price');
  const toPriceEl = $('#to-price');
  const chanceEl = $('#chance');
  const wheel = $('#wheel');
  const spinBtn = $('#spin-btn');
  const historyBox = $('#history');
  const toast = $('#toast');
  const confetti = $('#confetti');
  const multBox = $('#multipliers');

  if (!fromPick || !toPick || typeof SKINS === 'undefined') return;

  const state = {
    from: null,
    to: null,
    balance: SKINUP.loadBalance(250),
    inventory: SKINS.filter(s => s.price <= 160).slice(0, 8),
    spinning: false,
    mult: 1
  };
  SKINUP.updateBalance(state.balance);

  function chance() {
    if (!state.from || !state.to) return 0;
    const base = (state.from.price / state.to.price) * 100 * state.mult;
    return Math.max(1, Math.min(97, base));
  }

  function renderPickers() {
    renderFrom();
    renderTo();
    const c = chance();
    chanceEl.textContent = c.toFixed(1) + '%';
    wheel.style.setProperty('--win-deg', (c / 100 * 360) + 'deg');
    fromPriceEl.textContent = state.from ? fmtMoney(state.from.price) : '—';
    toPriceEl.textContent = state.to ? fmtMoney(state.to.price) : '—';
    spinBtn.disabled = !state.from || !state.to || state.spinning;
  }

  function miniEl(s, selected, onPick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mini' + (selected ? ' sel' : '');
    b.style.setProperty('--rc', RARITY[s.rarity].color);
    b.innerHTML = `<img src="${s.file}" alt="${s.name}" loading="lazy"><small>${s.name.split('|').pop().trim()}</small>`;
    b.title = `${s.name} (${s.wear}) — ${fmtMoney(s.price)}`;
    b.addEventListener('click', () => onPick(s));
    return b;
  }

  function renderFrom() {
    fromPick.innerHTML = '';
    if (!state.inventory.length) {
      fromPick.innerHTML = '<p style="color:var(--muted);font-size:.85rem;grid-column:1/-1">Инвентарь пуст — обнови страницу</p>';
      return;
    }
    state.inventory.forEach(s => fromPick.appendChild(miniEl(s, state.from?.id === s.id, (sel) => {
      state.from = sel;
      renderPickers();
    })));
  }

  function renderTo() {
    toPick.innerHTML = '';
    SKINS.filter(s => !state.from || s.price > state.from.price * 0.9).forEach(s => {
      toPick.appendChild(miniEl(s, state.to?.id === s.id, (sel) => {
        state.to = sel;
        renderPickers();
      }));
    });
  }

  /* множители */
  $$('.mult', multBox).forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.spinning) return;
      $$('.mult', multBox).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mult = parseFloat(btn.dataset.mult);
      renderPickers();
    });
  });

  /* прокрутка: крутится только стрелка, колесо стоит */
  spinBtn.addEventListener('click', () => {
    if (state.spinning || !state.from || !state.to) return;
    state.spinning = true;
    spinBtn.disabled = true;

    const c = chance();
    const win = Math.random() * 100 < c;
    const winDeg = c / 100 * 360;
    const spins = (6 + Math.floor(Math.random() * 3)) * 360;
    let targetAngle;
    if (win) {
      const offset = Math.random() * (winDeg * 0.7) + winDeg * 0.12;
      targetAngle = spins + offset;
    } else {
      const offset = winDeg + Math.random() * (360 - winDeg - 6) + 3;
      targetAngle = spins + offset;
    }

    wheel.style.setProperty('--spin-deg', targetAngle + 'deg');
    wheel.classList.remove('arm-spin', 'shake');
    void wheel.offsetWidth;
    wheel.classList.add('arm-spin');

    setTimeout(() => {
      wheel.classList.remove('arm-spin');
      wheel.classList.add('shake');
      setTimeout(() => wheel.classList.remove('shake'), 500);

      if (win) {
        const fromIdx = state.inventory.findIndex(s => s.id === state.from.id);
        state.inventory.splice(fromIdx, 1);
        if (!state.inventory.some(s => s.id === state.to.id)) {
          state.inventory.push(state.to);
        }
        addHistory(true, state.to, c);
        showToast(true, state.to);
        confettiBurst();
      } else {
        const fromIdx = state.inventory.findIndex(s => s.id === state.from.id);
        state.inventory.splice(fromIdx, 1);
        addHistory(false, state.from, c);
        showToast(false, state.from);
      }
      state.from = null;
      state.spinning = false;
      renderPickers();
      SKINUP.updateBalance(state.balance);
    }, 4300);
  });

  function addHistory(win, skin, c) {
    const row = document.createElement('div');
    row.className = 'hist-row ' + (win ? 'win' : 'lose');
    row.innerHTML = `
      <img src="${skin.file}" alt="">
      <div class="hist-name">${skin.name}<small>${skin.wear} · ${fmtMoney(skin.price)}</small></div>
      <div class="hist-chance">${c.toFixed(1)}%</div>
      <div class="hist-status">${win ? 'UPGRADED' : 'FAIL'}</div>`;
    historyBox.prepend(row);
    while (historyBox.children.length > 8) historyBox.lastChild.remove();
  }

  let toastTimer;
  function showToast(win, skin) {
    toast.className = 'toast ' + (win ? 'win' : 'lose');
    toast.innerHTML = `
      <img src="${skin.file}" alt="">
      <div>
        <b>${win ? 'Апгрейд успешен!' : 'Не повезло...'}</b>
        <span>${skin.name} · ${fmtMoney(skin.price)}</span>
      </div>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function confettiBurst() {
    if (!confetti) return;
    const colors = ['#f7931a', '#ff5e3a', '#ffd700', '#26d97f', '#38c7ff', '#d32ce6'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2 + Math.random() * 2) + 's';
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.appendChild(p);
      setTimeout(() => p.remove(), 4500);
    }
  }

  renderPickers();
})();
