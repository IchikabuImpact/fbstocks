const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Path to the CSV file
const CSV_PATH = path.join(__dirname, 'public', 'tickers.csv');

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

// Function to load tickers from a CSV file
function loadTickersFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      // Split the file by new lines and remove any empty lines
      const tickers = data.split('\n').filter(ticker => ticker.trim() !== '');
      resolve(tickers);
    });
  });
}

// Async function to call the scrapeAndSave function for each ticker with a delay
async function run() {
  const tickers = await loadTickersFromCSV(CSV_PATH);
  for (let ticker of tickers) {
    await scrapeAndSave(ticker);
    await delay(TIMEOUT);
  }
}

run();