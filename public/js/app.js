'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  isLoggedIn: false,
  user: null,
  tickers: [],
  stockData: {},
  canRemove: false,
};

// ─── Google SVG ───────────────────────────────────────────────────────────────
const GOOGLE_SVG = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>`;

// ─── Nav SVG icons ────────────────────────────────────────────────────────────
const ICONS = {
  heatmap: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>`,
  manage: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,
  account: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
  </svg>`,
  login: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>`,
};

// ─── Color scale (FINVIZ風) ───────────────────────────────────────────────────
function getTileColor(pct) {
  if (isNaN(pct)) return { bg: '#1e2235', text: '#666' };
  if (pct === 0)  return { bg: '#242840', text: '#888' };
  if (pct > 0) {
    if (pct >= 5) return { bg: '#006400', text: '#fff' };
    if (pct >= 3) return { bg: '#007800', text: '#fff' };
    if (pct >= 1) return { bg: '#005000', text: '#ddd' };
                  return { bg: '#003800', text: '#bbb' };
  } else {
    const a = Math.abs(pct);
    if (a >= 5)  return { bg: '#8b0000', text: '#fff' };
    if (a >= 3)  return { bg: '#6e0000', text: '#fff' };
    if (a >= 1)  return { bg: '#4d0000', text: '#ddd' };
                 return { bg: '#380000', text: '#bbb' };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parsePrice(str)    { return str ? parseFloat(str.replace(/[^\d.-]/g, '')) : NaN; }
function parsePrevClose(str) {
  if (!str) return NaN;
  const m = str.match(/([\d,]+\.?\d*)/);
  return m ? parseFloat(m[1].replace(/,/g, '')) : NaN;
}
function pct(cur, prev)     { return (!isNaN(cur) && !isNaN(prev) && prev) ? (cur - prev) / prev * 100 : NaN; }
function fmtPct(p)          { return isNaN(p) ? 'N/A' : (p >= 0 ? '+' : '') + p.toFixed(2) + '%'; }
function stripCode(name)    { return (name || '').replace(/^\d{4}[\s　]+/, '').trim(); }

// ─── Error banner ─────────────────────────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// ─── Overlay (sheet) open / close ────────────────────────────────────────────
function openOverlay(id) {
  const el = document.getElementById(id);
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('open'));
  el.addEventListener('click', e => { if (e.target === el) closeOverlay(id); }, { once: true });
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  el.classList.remove('open');
  el.addEventListener('transitionend', () => { el.style.display = 'none'; }, { once: true });
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────
function openDetailSheet(ticker, data) {
  const cur  = parsePrice(data.currentPrice);
  const prev = parsePrevClose(data.previousClose);
  const p    = pct(cur, prev);
  const { text } = getTileColor(p);
  const pctColor = p >= 0 ? '#4caf50' : '#f44336';

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-header">
      <div>
        <div class="detail-ticker">${ticker}</div>
        <div class="detail-company">${stripCode(data.companyName) || ticker}</div>
      </div>
      <div class="detail-change" style="color:${pctColor}">${fmtPct(p)}</div>
    </div>
    <div class="detail-stats">
      <div class="stat-row">
        <span class="stat-label">現在値</span>
        <span class="stat-value">${data.currentPrice || '—'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">前日終値</span>
        <span class="stat-value">${data.previousClose || '—'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">配当利回り</span>
        <span class="stat-value">${data.dividendYield || '—'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">PER</span>
        <span class="stat-value">${data.per || '—'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">PBR</span>
        <span class="stat-value">${data.pbr || '—'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">時価総額</span>
        <span class="stat-value">${data.marketCap || '—'}</span>
      </div>
    </div>
    ${state.canRemove ? `
    <button class="btn-remove-sheet" id="btn-remove-sheet">
      お気に入りから削除
    </button>` : ''}
  `;

  if (state.canRemove) {
    document.getElementById('btn-remove-sheet').addEventListener('click', async () => {
      closeOverlay('detail-overlay');
      await removeFavorite(ticker);
    });
  }

  openOverlay('detail-overlay');
}

// ─── Account sheet ────────────────────────────────────────────────────────────
function openAccountSheet() {
  const body = document.getElementById('account-body');
  if (state.isLoggedIn && state.user) {
    body.innerHTML = `
      <div class="account-user">
        <div class="account-name">${state.user.name}</div>
        <div class="account-email">${state.user.email}</div>
      </div>
      <button class="btn-logout-sheet" id="btn-logout-sheet">ログアウト</button>
      <div class="account-links">
        <a href="/term-of-use.html">利用規約</a>
        <a href="/privacy-policy.html">プライバシーポリシー</a>
      </div>
    `;
    document.getElementById('btn-logout-sheet').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      location.reload();
    });
  } else {
    body.innerHTML = `
      <div style="padding:.75rem 0 1.25rem;">
        <a href="/api/auth/google" class="login-invite-btn" style="width:100%;justify-content:center;">
          ${GOOGLE_SVG} Googleでログイン
        </a>
      </div>
      <div class="account-links">
        <a href="/term-of-use.html">利用規約</a>
        <a href="/privacy-policy.html">プライバシーポリシー</a>
      </div>
    `;
  }
  openOverlay('account-overlay');
}

// ─── Bottom navigation ────────────────────────────────────────────────────────
function buildBottomNav() {
  const nav = document.getElementById('bottom-nav');

  if (state.isLoggedIn) {
    nav.innerHTML = `
      <button class="nav-item active" id="nav-map">${ICONS.heatmap}<span>マップ</span></button>
      <button class="nav-item" id="nav-manage">${ICONS.manage}<span>管理</span></button>
      <button class="nav-item" id="nav-account">${ICONS.account}<span>アカウント</span></button>
    `;
    document.getElementById('nav-manage').addEventListener('click', openModal);
    document.getElementById('nav-account').addEventListener('click', openAccountSheet);
  } else {
    nav.innerHTML = `
      <button class="nav-item active" id="nav-map">${ICONS.heatmap}<span>マップ</span></button>
      <button class="nav-item" id="nav-login">${ICONS.login}<span>ログイン</span></button>
    `;
    document.getElementById('nav-login').addEventListener('click', openAccountSheet);
  }
}

// ─── Tile rendering ───────────────────────────────────────────────────────────
function createSkeletonTile() {
  const el = document.createElement('div');
  el.className = 'tile-skeleton';
  return el;
}

function renderTile(ticker, data) {
  const cur  = parsePrice(data.currentPrice);
  const prev = parsePrevClose(data.previousClose);
  const p    = pct(cur, prev);
  const { bg, text } = getTileColor(p);
  const name = stripCode(data.companyName) || ticker;

  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.ticker = ticker;
  tile.style.background = bg;
  tile.style.color = text;

  tile.innerHTML = `
    <div class="tile-ticker">${ticker}</div>
    <div class="tile-name">${name}</div>
    <div class="tile-price">${data.currentPrice || '—'}</div>
    <div class="tile-change">${fmtPct(p)}</div>
    ${state.canRemove ? `<button class="tile-remove" aria-label="削除">×</button>` : ''}
  `;

  // タップで詳細シートを開く
  tile.addEventListener('click', e => {
    if (e.target.classList.contains('tile-remove')) return;
    openDetailSheet(ticker, data);
  });

  if (state.canRemove) {
    tile.querySelector('.tile-remove').addEventListener('click', e => {
      e.stopPropagation();
      removeFavorite(ticker);
    });
  }

  return tile;
}

function renderErrorTile(ticker) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.style.background = '#1a1a2e';
  tile.style.color = '#444';
  tile.innerHTML = `
    <div class="tile-ticker">${ticker}</div>
    <div class="tile-name" style="font-size:.68rem">取得失敗</div>
    <div class="tile-change" style="font-size:.9rem">—</div>
  `;
  return tile;
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
async function loadHeatmap() {
  const heatmap = document.getElementById('heatmap');
  heatmap.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div><p>読み込み中...</p></div>';

  let tickers, isLoggedIn, isFirstVisit;
  try {
    const res  = await fetch('/api/heatmap', { credentials: 'include' });
    const data = await res.json();
    tickers      = data.tickers || [];
    isLoggedIn   = data.isLoggedIn;
    isFirstVisit = data.isFirstVisit;
  } catch {
    heatmap.innerHTML = '<div class="loading-placeholder"><p>接続エラー</p></div>';
    return;
  }

  state.tickers   = tickers;
  state.canRemove = isLoggedIn;
  document.getElementById('stock-count').textContent = tickers.length ? `${tickers.length} 銘柄` : '';

  if (!isLoggedIn) {
    heatmap.innerHTML = `
      <div class="login-invite">
        <div class="login-invite-icon">📈</div>
        <h2>日本株ヒートマップ</h2>
        <p>ログインしてお気に入り銘柄の<br>ヒートマップを作りましょう</p>
        <a href="/api/auth/google" class="login-invite-btn">${GOOGLE_SVG}Googleでログイン</a>
      </div>`;
    return;
  }

  if (isFirstVisit) {
    const banner = document.getElementById('welcome-banner');
    banner.style.display = 'flex';
    document.getElementById('welcome-close').addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }

  if (tickers.length === 0) {
    heatmap.innerHTML = '<div class="loading-placeholder"><p>「管理」から銘柄を追加してください</p></div>';
    return;
  }

  // スケルトン → 並列取得 → タイル描画
  heatmap.innerHTML = '';
  const skeletons = {};
  tickers.forEach(ticker => {
    const sk = createSkeletonTile();
    skeletons[ticker] = sk;
    heatmap.appendChild(sk);
  });

  const results = await Promise.allSettled(
    tickers.map(t =>
      fetch(`/api/stock/${t}`, { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.reject())
    )
  );

  results.forEach((result, i) => {
    const ticker = tickers[i];
    let tile;
    if (result.status === 'fulfilled') {
      state.stockData[ticker] = result.value;
      tile = renderTile(ticker, result.value);
    } else {
      tile = renderErrorTile(ticker);
    }
    heatmap.replaceChild(tile, skeletons[ticker]);
  });
}

// ─── Favorites API ────────────────────────────────────────────────────────────
async function removeFavorite(ticker) {
  try {
    const res = await fetch('/api/favorites/remove', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    if (res.ok) {
      await Promise.all([loadHeatmap(), refreshModalList()]);
    }
  } catch { showError('削除に失敗しました'); }
}

async function fetchFavoritesList() {
  const res = await fetch('/api/favorites', { credentials: 'include' });
  return res.ok ? res.json() : [];
}

// ─── Favorites modal ──────────────────────────────────────────────────────────
async function refreshModalList() {
  const list    = document.getElementById('modal-favorites-list');
  const countEl = document.getElementById('modal-count');
  if (!list) return;
  list.innerHTML = '<div class="modal-empty">読み込み中...</div>';

  const favs = await fetchFavoritesList().catch(() => []);
  countEl.textContent = `(${favs.length})`;

  if (favs.length === 0) {
    list.innerHTML = '<div class="modal-empty">まだ銘柄が登録されていません</div>';
    return;
  }

  list.innerHTML = '';
  favs.forEach(({ ticker, name }) => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.innerHTML = `
      <div class="fav-item-info">
        <div class="fav-item-ticker">${ticker}</div>
        <div class="fav-item-name">${name || ticker}</div>
      </div>
      <button class="btn-fav-remove" data-ticker="${ticker}" aria-label="削除">×</button>
    `;
    item.querySelector('.btn-fav-remove').addEventListener('click', async () => {
      await removeFavorite(ticker);
    });
    list.appendChild(item);
  });
}

function openModal() {
  document.getElementById('modal-ticker-input').value = '';
  document.getElementById('modal-preview').innerHTML = '';
  refreshModalList();
  openOverlay('modal-overlay');
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', () => closeOverlay('modal-overlay'));

  const input     = document.getElementById('modal-ticker-input');
  const searchBtn = document.getElementById('modal-search-btn');
  const preview   = document.getElementById('modal-preview');

  async function doSearch() {
    const ticker = input.value.trim();
    if (!/^\d{4}$/.test(ticker)) {
      preview.innerHTML = '<div class="preview-error">4桁の証券コードを入力してください</div>';
      return;
    }
    searchBtn.disabled = true;
    preview.innerHTML = '<div class="modal-empty"><div class="spinner" style="width:20px;height:20px;border-width:2px;margin:.5rem auto;"></div></div>';

    try {
      const res  = await fetch(`/api/stock/${ticker}`, { credentials: 'include' });
      const data = await res.json();

      if (!res.ok || !data.companyName) {
        preview.innerHTML = '<div class="preview-error">データが見つかりませんでした。証券コードを確認してください。</div>';
        return;
      }

      const cur  = parsePrice(data.currentPrice);
      const prev = parsePrevClose(data.previousClose);
      const p    = pct(cur, prev);
      const pctColor = p >= 0 ? '#4caf50' : '#f44336';
      const name = stripCode(data.companyName);

      preview.innerHTML = `
        <div class="preview-card">
          <div class="preview-info">
            <div class="preview-ticker">${ticker}</div>
            <div class="preview-name">${name}</div>
            <div class="preview-price">${data.currentPrice || '—'}</div>
          </div>
          <div class="preview-change" style="color:${pctColor}">${fmtPct(p)}</div>
        </div>
        <button class="btn-add-confirm" id="btn-add-confirm">この銘柄を追加する</button>
      `;

      document.getElementById('btn-add-confirm').addEventListener('click', async () => {
        const btn = document.getElementById('btn-add-confirm');
        btn.disabled = true;
        btn.textContent = '追加中...';
        const res2  = await fetch('/api/favorites/add', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker }),
        });
        const data2 = await res2.json();
        if (res2.ok) {
          input.value = '';
          preview.innerHTML = '';
          await Promise.all([loadHeatmap(), refreshModalList()]);
        } else {
          preview.innerHTML += `<div class="preview-error" style="margin-top:.5rem">${data2.error || '追加に失敗しました'}</div>`;
        }
      });
    } catch {
      preview.innerHTML = '<div class="preview-error">データの取得に失敗しました</div>';
    } finally {
      searchBtn.disabled = false;
    }
  }

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function initAuth() {
  try {
    const res  = await fetch('/api/check-auth', { credentials: 'include' });
    const data = await res.json();
    state.isLoggedIn = data.isAuthenticated;
    state.user       = data.user || null;
  } catch {
    state.isLoggedIn = false;
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  buildBottomNav();
  if (state.isLoggedIn) initModal();
  await loadHeatmap();
});
