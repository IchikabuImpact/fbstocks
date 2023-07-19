# fbstocks
favorite stocks

## StockDataScraper.js
ティッカーシンボルを引数に渡すとjson形式で
node StockDataScraper.js 1332

## Exporter.js
public/tickers.csvにある証券コードを読み込んで結果をpublic/証券コード.jsonに保存します。crontabなどで頻繁に実行しちゃうと負荷がかかるので要注意

## public/heatmap.html
public/tickers.csvを読み込んでヒートマップを表示します。
