// サンプルのティッカーリスト
const sampleTickers = ['1332', '8306', '1605'];

// ログイン状態を確認する関数
async function checkLoginStatus() {
    const response = await fetch('/api/check-auth', { credentials: 'include' });
    if (response.ok) {
        const data = await response.json();
        return data.isAuthenticated;
    }
    return false;
}

// お気に入り銘柄のリストを取得する関数
async function fetchFavoriteTickers() {
    const response = await fetch('/api/favorites/list', { credentials: 'include' });
    if (response.ok) {
        const favorites = await response.json();
        // お気に入り銘柄のティッカーシンボルの配列を作成
        return favorites.map(fav => fav.Stock.stock_symbol);
    } else {
        console.error('お気に入り銘柄の取得に失敗しました');
        return [];
    }
}

// 銘柄データを取得する関数
async function fetchStockData(ticker) {
    try {
        // スクレイピングAPIを使用して銘柄データを取得
        const response = await fetch(`https://jpx.pinkgold.space/scrape?ticker=${ticker}`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error(`ティッカー ${ticker} のデータ取得に失敗しました`);
            return null;
        }
    } catch (error) {
        console.error(`ティッカー ${ticker} のデータ取得中にエラーが発生しました:`, error);
        return null;
    }
}

// ヒートマップを表示する関数
async function displayHeatmap() {
    const isLoggedIn = await checkLoginStatus();
    const dataDiv = document.getElementById('stockData');
    dataDiv.innerHTML = ''; // 既存の内容をクリア

    let tickers = [];

    if (isLoggedIn) {
        // ログインしている場合、お気に入り銘柄を表示
        tickers = await fetchFavoriteTickers();
        if (tickers.length === 0) {
            dataDiv.innerHTML = '<p>お気に入り銘柄が登録されていません。</p>';
            return;
        }
    } else {
        // ログインしていない場合、サンプルのティッカーを表示
        tickers = sampleTickers;
    }

    for (const ticker of tickers) {
        const data = await fetchStockData(ticker);
        if (data) {
            displayStockData(data);
        }
    }
}

// 銘柄データを表示する関数
function displayStockData(data) {
    const dataDiv = document.getElementById('stockData');

    // 数値のパースと前処理
    const currentPrice = parseFloat(data.currentPrice.replace(/[^\d.-]/g, ''));
    const previousCloseMatch = data.previousClose.match(/([\d.,]+)/);
    const previousClose = previousCloseMatch ? parseFloat(previousCloseMatch[1].replace(/,/g, '')) : null;

    if (isNaN(currentPrice) || isNaN(previousClose) || previousClose === 0) {
        console.log(`ティッカー ${data.ticker} のデータが無効です: currentPrice=${data.currentPrice}, previousClose=${data.previousClose}`);
        return;
    }

    const priceChange = currentPrice - previousClose;
    const priceChangePercentage = (priceChange / previousClose) * 100;
    const backgroundColor = calculateBackgroundColor(priceChangePercentage);
    const textColor = 'rgba(255, 255, 255, 1)'; // 文字色は白

    const formattedPercentage = priceChangePercentage > 0 ? `+${priceChangePercentage.toFixed(2)}%` : `${priceChangePercentage.toFixed(2)}%`;

    dataDiv.innerHTML += `
        <div class="stock" style="background-color: ${backgroundColor}; color: ${textColor};">
            <p class="stock-name">${data.companyName}</p>
            <p class="stock-price">${data.currentPrice}</p>
            <p class="stock-price-change-percentage">${formattedPercentage}</p>
        </div>`;
}

// 背景色を計算する関数
function calculateBackgroundColor(priceChangePercentage) {
    if (priceChangePercentage === 0) {
        return '#666666'; // 灰色
    } else if (priceChangePercentage > 0) {
        // 緑色
        let greenIntensity = Math.min(Math.abs(priceChangePercentage) / 5, 1);
        return `rgba(0, ${200 + 55 * greenIntensity}, 0)`;
    } else {
        // 赤色
        let redIntensity = Math.min(Math.abs(priceChangePercentage) / 5, 1);
        return `rgba(${200 + 55 * redIntensity}, 0, 0)`;
    }
}

// ユーザー情報を表示する関数
async function displayUserInfo() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const userInfoContainer = document.getElementById('user-info-container');
        const googleSigninContainer = document.querySelector('.google-signin-container');
        if (response.ok) {
            const data = await response.json();
            if (data.isAuthenticated) {
                // ログインしている場合、ユーザー名とログアウトボタンを表示し、Googleサインインボタンを非表示にする
                userInfoContainer.innerHTML = `
                    <p>こんにちは、${data.user.name}さん</p>
                    <button id="logout-btn">ログアウト</button>
                `;
                if (googleSigninContainer) {
                    googleSigninContainer.style.display = 'none';
                }
                document.getElementById('logout-btn').addEventListener('click', () => {
                    fetch('/api/logout', { method: 'POST', credentials: 'include' })
                        .then(() => {
                            window.location.reload();
                        });
                });
            } else {
                // ログインしていない場合、ユーザー情報コンテナを空にし、Googleサインインボタンを表示する
                userInfoContainer.innerHTML = '';
                if (googleSigninContainer) {
                    googleSigninContainer.style.display = 'block';
                }
            }
        } else {
            console.error('認証状態の確認に失敗しました');
        }
    } catch (error) {
        console.error('ユーザー情報の取得中にエラーが発生しました:', error);
    }
}
// ページ読み込み時にユーザー情報とヒートマップを表示
document.addEventListener('DOMContentLoaded', () => {
    displayUserInfo();
    displayHeatmap();
});
