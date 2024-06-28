const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

const options = new chrome.Options();
options.addArguments('--headless', '--disable-cache');

// Set ChromeDriver path
const service = new chrome.ServiceBuilder('/usr/local/bin/chromedriver');

var ticker = process.argv[2];
if (ticker == null) {
  ticker = "1332";
}

const urlGoogleFinance = `https://www.google.com/finance/quote/${ticker}:TYO?sa=X&ved=2ahUKEwiG1vL6yZzxAhUD4zgGHQGxD7QQ3ecFegQINRAS`;
const urlKabutan = `https://kabutan.jp/stock/?code=${ticker}`;

async function getElementText(driver, by, timeout = 10000) {
  try {
    await driver.wait(until.elementLocated(by), timeout);
    let element = await driver.findElement(by);
    return await element.getText();
  } catch (err) {
    console.error(`Error locating element: ${by}`, err);
    throw err;
  }
}

(async function main() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  try {
    // Retrieve the company name from Kabutan
    await driver.get(urlKabutan);
    let companyName = await getElementText(driver, By.xpath('/html/body/div[1]/div[3]/div[1]/div[4]/div[4]/h3'));

    // Retrieve the stock price from Google Finance
    await driver.get(urlGoogleFinance);
    let currentPrice = await getElementText(driver, By.css('.YMlKec.fxKbKc'));
    let previousClose = await getElementText(driver, By.css('div.P6K39c'));

    console.log(JSON.stringify({
      ticker,
      companyName,
      currentPrice,
      previousClose
    }));
  } catch (err) {
    console.error(`Error processing ticker ${ticker}:`, err);
  } finally {
    await driver.quit();
  }
})();

