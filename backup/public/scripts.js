
    async function fetchCSV() {
        const response = await fetch('tickers.csv');
        const data = await response.text();
        return data.split('\n').filter(ticker => ticker.length > 0);
    }


function calculateBackgroundColor(priceChangePercentage) {
    if (priceChangePercentage === 0) {
        return '#666666'; // 灰色
    } else if (priceChangePercentage > 0) {
        // 緑色
        let greenIntensity = Math.min(Math.abs(priceChangePercentage) / 5, 1);
        return `rgba(0, ${200 + 55 * greenIntensity}, 0)`; // 色の強さを調整
    } else {
        // 赤色
        let redIntensity = Math.min(Math.abs(priceChangePercentage) / 5, 1);
        return `rgba(${200 + 55 * redIntensity}, 0, 0)`; // 色の強さを調整
    }
}

async function fetchAndDisplayStockData(ticker) {
    const response = await fetch(`${ticker}.json`);
    const data = await response.json();
    const dataDiv = document.getElementById('stockData');

    var currentPrice = parseFloat(data.currentPrice.slice(1).replace(/,/g, ''));
    var previousClose = parseFloat(data.previousClose.slice(1).replace(/,/g, ''));

    if (isNaN(currentPrice) || isNaN(previousClose) || previousClose === 0) {
        console.log(`Invalid data for ticker ${ticker}: currentPrice=${data.currentPrice}, previousClose=${data.previousClose}`);
        return;
    }

    const priceChange = currentPrice - previousClose;
    const priceChangePercentage = (priceChange / previousClose) * 100;
    const backgroundColor = calculateBackgroundColor(priceChangePercentage);
    const textColor = 'rgba(255, 255, 255, 1)'; // 文字色は白

    // パーセンテージ表示のフォーマットを調整
    const formattedPercentage = priceChangePercentage > 0 ? `+${priceChangePercentage.toFixed(2)}%` : `${priceChangePercentage.toFixed(2)}%`;

    dataDiv.innerHTML += `<div class="stock" style="background-color: ${backgroundColor}; color: ${textColor};">
                                <p class="stock-name">${data.ticker}: ${data.companyName}</p>
                                <p class="stock-price-change">${data.currentPrice}</p>
                                <p class="stock-price-change-percentage">${formattedPercentage}</p>
                              </div>`;
}

fetchCSV().then(tickers => {
    tickers.forEach(fetchAndDisplayStockData);
});

