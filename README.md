# fbstocks
favorite stocks

## HowToStart
### node.jsをインストールします。
  [someuser@www somwhere]$ curl -sL https://rpm.nodesource.com/setup_lts.x | sudo bash -
 
  [someuser@www somwhere]$ sudo yum install -y nodejs

### ソースを入手します
 [someuser@www somwhere]$ git clone https://github.com/kenchanbaken/fbstocks.git

 [someuser@www somwhere]$ cd fbstocks

 [someuser@www fbstocks]$ npm install

### apacheなどで適宜設定します。
### fbstocks/publicをDocumentRootとして想定しております。

## StockDataScraper.js
### ティッカーシンボルを引数に渡すとティッカーシンボル、会社名、株価、昨日終値をjsonで返してくれます

 [rocky@www stub]$ node StockDataScraper.js 1332

{"ticker":"1332","companyName":"ニッスイ","currentPrice":"\668.00","previousClose":"\677.70"}

## Exporter.js
### public/tickers.csvにある証券コードを読み込んで結果をpublic/証券コード.jsonに保存します。### crontabなどで頻繁に実行しちゃうと負荷がかかるので要注意

## public/heatmap.html

### public/tickers.csvを読み込んでヒートマップを表示します。
