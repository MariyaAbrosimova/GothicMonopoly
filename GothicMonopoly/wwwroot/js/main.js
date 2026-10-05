// ============================================================
//  GOTHIC MONOPOLY — клиентская логика
// ============================================================
const API = '/api/game';

let state = null;
let animating = false;   // блокирует клики во время анимации фишки

// ------------------------------------------------------------
//  Константы
// ------------------------------------------------------------
const TOKEN_EMOJI = { Skull: '💀', Raven: '🦅', Bat: '🦇', Candle: '🕯️' };
const TOKEN_IMG = {
    Skull: 'assets/tokens/token_skull.png',
    Raven: 'assets/tokens/token_raven.png',
    Bat: 'assets/tokens/token_bat.png',
    Candle: 'assets/tokens/token_candle.png'
};
const GROUP_COLOR = {
    moss: '#3d4a2a',
    crimson: '#6b1010',
    bone: '#8a8070',
    night: '#2a1c3a',
    marsh: '#2a3a30',
    steel: '#4a4a55',
    gold: '#a8861a',
    royal: '#5a0a2a'
};
const OWNER_COLOR = ['#8b0000', '#c9a227', '#4a6b8a', '#5a2a6b'];

const $ = id => document.getElementById(id);

// ------------------------------------------------------------
//  Стартовый экран
// ------------------------------------------------------------
document.querySelectorAll('#startScreen .btn-stone').forEach(btn => {
    btn.addEventListener('click', () => startGame(+btn.dataset.count));
});

async function startGame(count) {
    const names = ['Ворон', 'Кровавая Мэри', 'Аббат', 'Инквизитор'].slice(0, count);
    try {
        const r = await fetch(`${API}/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names })
        });
        if (!r.ok) throw new Error(await r.text());
        state = await r.json();
        $('startScreen').classList.add('hidden');
        $('game').classList.remove('hidden');
        renderAll();
    } catch (e) {
        alert('Не удалось начать партию: ' + e.message);
    }
}

// ------------------------------------------------------------
//  Обёртка над API
// ------------------------------------------------------------
async function api(path, body) {
    if (animating) return;
    try {
        const r = await fetch(`${API}/${state.Id}${path}`, {
            method: 'POST',
            headers: body ? { 'Content-Type': 'application/json' } : {},
            body: body ? JSON.stringify(body) : null
        });
        if (!r.ok) throw new Error(await r.text());
        const prevPositions = state.Players.map(p => p.Position);
        state = await r.json();
        await animateMovement(prevPositions);
        renderAll();
    } catch (e) {
        console.error(e);
        alert('Ошибка: ' + e.message);
    }
}

// ------------------------------------------------------------
//  Анимация движения фишки
// ------------------------------------------------------------
async function animateMovement(prevPositions) {
    const moved = state.Players.find((p, i) => p.Position !== prevPositions[i]);
    if (!moved) return;

    const from = prevPositions[moved.Id];
    const to = moved.Position;
    if (from === to) return;

    animating = true;

    // путь по кругу (по часовой от from к to)
    const path = [];
    let cur = from;
    while (cur !== to) {
        cur = (cur + 1) % 40;
        path.push(cur);
    }

    // запоминаем исходную позицию игрока в state, чтобы рендер не мешал
    const originalPos = moved.Position;

    for (const step of path) {
        moved.Position = step;
        // быстрый ре-рендер только доски и панели игроков
        renderBoardOnly();
        renderPlayersOnly();
        await sleep(140);
    }

    moved.Position = originalPos; // вернём как в state
    animating = false;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ------------------------------------------------------------
//  Геометрия доски
// ------------------------------------------------------------
function gridPos(i) {
    if (i <= 10) return { row: 11, col: 11 - i };
    if (i <= 20) return { row: 11 - (i - 10), col: 1 };
    if (i <= 30) return { row: 1, col: 1 + (i - 20) };
    return { row: 1 + (i - 30), col: 11 };
}

// ------------------------------------------------------------
//  Рендер: доска
// ------------------------------------------------------------
function renderBoardOnly() {
    const board = $('board');
    board.innerHTML = '';

    state.Board.forEach((t, i) => {
        const { row, col } = gridPos(i);
        const el = document.createElement('div');
        el.className = 'tile';
        el.style.gridRow = row;
        el.style.gridColumn = col;
        el.dataset.id = t.Id;

        // цветовая полоса группы
        if (t.Group) {
            const bar = document.createElement('div');
            bar.className = 'tile-bar';
            bar.style.background = GROUP_COLOR[t.Group] || '#444';
            el.appendChild(bar);
        }

        // имя + цена + постройки
        const name = document.createElement('span');
        name.className = 'tile-name';
        name.textContent = t.Name;
        el.appendChild(name);

        if (t.Price) {
            const price = document.createElement('span');
            price.className = 'tile-price';
            price.textContent = t.Price + '⚜';
            el.appendChild(price);
        }

        if (t.Houses > 0) {
            const h = document.createElement('span');
            h.className = 'houses';
            h.textContent = t.Houses === 5 ? '⛪' : '🏠'.repeat(t.Houses);
            el.appendChild(h);
        }

        // владелец
        if (t.OwnerId != null) {
            el.classList.add('owned');
            el.style.setProperty('--owner-color', OWNER_COLOR[t.OwnerId]);
        }

        // фишки игроков
        const here = state.Players.filter(p => p.Position === t.Id && !p.IsBankrupt);
        if (here.length) {
            const row = document.createElement('div');
            row.className = 'tokens-row';
            here.forEach(p => {
                const img = document.createElement('img');
                img.src = TOKEN_IMG[p.Token];
                img.alt = p.Token;
                img.className = 'token-img';
                img.onerror = () => { img.replaceWith(document.createTextNode(TOKEN_EMOJI[p.Token])); };
                row.appendChild(img);
            });
            el.appendChild(row);
        }

        // подсветка текущего игрока (тонкая рамка)
        if (here.some(p => p.Id === state.CurrentPlayer)) {
            el.classList.add('current-tile');
        }

        el.addEventListener('click', () => showTileInfo(t));
        board.appendChild(el);
    });

    // центр
    const center = document.createElement('div');
    center.className = 'board-center';
    center.style.gridArea = '2 / 2 / 11 / 11';
    board.appendChild(center);
}

// ------------------------------------------------------------
//  Рендер: игроки
// ------------------------------------------------------------
function renderPlayersOnly() {
    const panel = $('playersPanel');
    panel.innerHTML = '<h3 class="panel-title">ДУШИ</h3>';

    state.Players.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'player-card';
        if (i === state.CurrentPlayer && !state.GameOver) card.classList.add('active');
        if (p.IsBankrupt) card.classList.add('bankrupt');

        const img = document.createElement('img');
        img.src = TOKEN_IMG[p.Token];
        img.className = 'token-img-card';
        img.onerror = () => { img.replaceWith(document.createTextNode(TOKEN_EMOJI[p.Token])); };

        const info = document.createElement('div');
        info.className = 'player-info';
        info.innerHTML = `
      <div class="name">${p.Name}</div>
      <div class="money">${p.Money} ⚜</div>
      <div class="pos">${state.Board[p.Position].Name}${p.InJail ? ' ⛓' : ''}</div>
    `;

        card.appendChild(img);
        card.appendChild(info);
        panel.appendChild(card);
    });
}

// ------------------------------------------------------------
//  Рендер: кубики
// ------------------------------------------------------------
function renderDice() {
    const d = $('dice');
    if (!state.DiceA || !state.DiceB) {
        d.innerHTML = '<div class="die">?</div><div class="die">?</div>';
        return;
    }
    d.innerHTML = `<div class="die">${state.DiceA}</div><div class="die">${state.DiceB}</div>`;
}

// ------------------------------------------------------------
//  Рендер: лог
// ------------------------------------------------------------
function renderLog() {
    const log = $('log');
    log.innerHTML = state.Log.slice(-40).map(l => `<div>${escapeHtml(l)}</div>`).join('');
    log.scrollTop = log.scrollHeight;
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ------------------------------------------------------------
//  Рендер: кнопки управления
// ------------------------------------------------------------
function renderControls() {
    const p = state.Players[state.CurrentPlayer];
    const t = state.Board[p.Position];

    $('rollBtn').disabled = !state.AwaitingRoll || state.GameOver;
    $('endBtn').disabled = !state.AwaitingEndTurn || state.GameOver;

    const canBuild = state.AwaitingEndTurn
        && t.OwnerId === p.Id
        && t.Type === 'Property'
        && t.Houses < 5;
    $('buildBtn').disabled = !canBuild;

    if (state.GameOver) {
        $('rollBtn').disabled = true;
        $('endBtn').disabled = true;
        $('buildBtn').disabled = true;
    }
}

// ------------------------------------------------------------
//  Рендер: модалка
// ------------------------------------------------------------
function renderModal() {
    const modal = $('modal');

    if (state.GameOver) {
        const winner = state.Players.find(p => !p.IsBankrupt);
        modal.classList.remove('hidden');
        modal.innerHTML = `
      <div class="modal-box">
        <h3>⚜ КОНЕЦ ⚜</h3>
        <p style="font-size:20px;margin:16px 0">${winner ? winner.Name : 'Никто'} владыка этого мира</p>
        <div class="row"><button class="btn-stone" id="restartBtn">Новая партия</button></div>
      </div>`;
        $('restartBtn').onclick = () => location.reload();
        return;
    }

    if (!state.PendingMessage) {
        modal.classList.add('hidden');
        modal.innerHTML = '';
        return;
    }

    const t = state.Board[state.Players[state.CurrentPlayer].Position];
    modal.classList.remove('hidden');
    modal.innerHTML = `
    <div class="modal-box">
      <h3>${t.Name}</h3>
      <p style="margin:12px 0">${state.PendingMessage}</p>
      <p style="color:#c9a227">Цена: ${t.Price} ⚜ · Аренда: ${t.Rent} ⚜</p>
      <div class="row">
        <button class="btn-stone" id="buyYes">Забрать</button>
        <button class="btn-stone" id="buyNo">Отказаться</button>
      </div>
    </div>`;

    $('buyYes').onclick = () => api('/buy', { value: true });
    $('buyNo').onclick = () => api('/buy', { value: false });
}

// ------------------------------------------------------------
//  Инфо-карточка клетки
// ------------------------------------------------------------
function showTileInfo(t) {
    if (animating) return;
    const modal = $('modal');
    const owner = t.OwnerId != null ? state.Players[t.OwnerId].Name : 'Ничей';

    modal.classList.remove('hidden');
    modal.innerHTML = `
    <div class="modal-box">
      <h3>${t.Name}</h3>
      <p>Тип: ${t.Type}</p>
      ${t.Price ? `<p>Цена: ${t.Price} ⚜ · Аренда: ${t.Rent} ⚜</p>` : ''}
      ${t.Houses ? `<p>Построек: ${t.Houses}</p>` : ''}
      <p style="margin-top:8px;color:#c9a227">Владелец: ${owner}</p>
      <div class="row"><button class="btn-stone" id="closeInfo">Закрыть</button></div>
    </div>`;

    $('closeInfo').onclick = () => {
        modal.classList.add('hidden');
        modal.innerHTML = '';
        renderModal(); // вернуть модалку покупки, если она была
    };
}

// ------------------------------------------------------------
//  Полный рендер
// ------------------------------------------------------------
function renderAll() {
    renderBoardOnly();
    renderPlayersOnly();
    renderDice();
    renderLog();
    renderControls();
    renderModal();
}

// ------------------------------------------------------------
//  Привязка кнопок
// ------------------------------------------------------------
$('rollBtn').addEventListener('click', () => api('/roll'));
$('endBtn').addEventListener('click', () => api('/end-turn'));
$('buildBtn').addEventListener('click', () => api('/build'));

// Хоткеи (приятный бонус)
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !$('rollBtn').disabled) { e.preventDefault(); $('rollBtn').click(); }
    if (e.code === 'Enter' && !$('endBtn').disabled) { e.preventDefault(); $('endBtn').click(); }
});