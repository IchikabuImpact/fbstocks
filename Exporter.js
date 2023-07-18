const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Static array of tickers
const tickers = [8714,9433,9101,7164,7278,9783,4765,7011,8278,1802,2157,7011,9980,8285,9728,5343,8616];

// Timeout between requests (in milliseconds)
const TIMEOUT = 500;

// Function to scrape data and write to JSON file for each ticker
function scrapeAndSave(ticker) {
  return new Promise((resolve, reject) => {
    exec(`node StockDataScraper.js ${ticker}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error}`);
        reject(error);
        return;
      }

      // Set the output path to be within the public folder
      const outputPath = path.join(__dirname, 'public', `${ticker}.json`);

      fs.writeFile(outputPath, stdout, (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          reject(err);
        } else {
          console.log(`Saved data for ticker ${ticker} to ${ticker}.json`);
          resolve();
        }
      });
    });
  });
}

// Function to delay by a certain amount of time
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Async function to call the scrapeAndSave function for each ticker with a delay
async function run() {
  for (let ticker of tickers) {
    await scrapeAndSave(ticker);
    await delay(TIMEOUT);
  }
}

run();


