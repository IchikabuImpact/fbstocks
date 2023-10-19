
    async function fetchCSV() {
        const response = await fetch('tickers.csv');
        const data = await response.text();
        return data.split('\n').filter(ticker => ticker.length > 0);
    }
    async function fetchAndDisplayStockData(ticker) {
        const response = await fetch(`${ticker}.json`);
        const data = await response.json();
        const dataDiv = document.getElementById('stockData');
        var currentPrice = parseFloat(data.currentPrice.toString().replace(/,/g,'').replace(/¥/g,'')); 
        var previousClose = parseFloat(data.previousClose.toString().replace(/,/g,'').replace(/¥/g,''));
        const priceChange = currentPrice - previousClose;
        const priceChangePercentage = (priceChange / previousClose) * 100;
        const absolutePercentage = Math.abs(priceChangePercentage);
        const colorIntensity = Math.min(Math.round(absolutePercentage), 100);
        let color, textColor;
        if (priceChangePercentage === 0) {
            color = 'rgba(255, 255, 255, 1)'; // white background
            textColor = 'rgba(0, 0, 0, 1)'; // black text
        } else {
            //const alpha = colorIntensity / 100;
            const alpha = Math.min((colorIntensity / 50), 1); 
            color = (priceChangePercentage > 0) ? `rgba(0, 255, 0, ${alpha})` : `rgba(255, 0, 0, ${alpha})`;
            textColor = 'rgba(0, 0, 0, 1)'; // black text
        }
        dataDiv.innerHTML += `<div class="stock" style="background-color: ${color}; color: ${textColor};">
                                <p class="stock-name">${data.ticker}: ${data.companyName}</p>
                                <p class="stock-price-change">${data.currentPrice}</p>
                                <p class="stock-price-change-percentage">${priceChangePercentage.toFixed(2)}%</p>
                              </div>`;
    }

    fetchCSV().then(tickers => {
        tickers.forEach(fetchAndDisplayStockData);
    });

// fetchCSV().then(tickers => {
//      tickers.forEach(fetchAndDisplayStockData);
//  });
  
