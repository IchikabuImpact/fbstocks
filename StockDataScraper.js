/*
usage
[user@www somewhere]$ node StockDataScraper.js 1332
{ ticker: '1332', companyName: 'ニッスイ', currentPrice: '¥669.20' }
*/
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();
options.addArguments('--headless', '--disable-cache');

var ticker = process.argv[2];
if(ticker == null){
 ticker = "1332";
}

const urlGoogleFinance = `https://www.google.com/finance/quote/${ticker}:TYO?sa=X&ved=2ahUKEwiG1vL6yZzxAhUD4zgGHQGxD7QQ3ecFegQINRAS`;
const urlKabutan = `https://kabutan.jp/stock/?code=${ticker}`;

(async function main() {
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    // Retrieve the company name from Kabutan
    await driver.get(urlKabutan);
    let companyName = await driver.findElement(By.xpath('/html/body/div[1]/div[3]/div[1]/div[4]/div[4]/h3')).getText();
    
    // Retrieve the stock price from Google Finance
    await driver.get(urlGoogleFinance);
    let currentPrice = await driver.findElement(By.css('.YMlKec.fxKbKc')).getText();
    let previousClose = await driver.findElement(By.css('div.P6K39c')).getText();

    console.log(JSON.stringify({
      ticker,
      companyName,
      currentPrice,
      previousClose
    }));
  } 
  finally {
    await driver.quit();
  }
})();
