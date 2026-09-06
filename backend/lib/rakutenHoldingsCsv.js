// 楽天証券「資産状況」CSVエクスポート（CP932 / assetbalance(all)_YYYYMMDD_HHMMSS.csv）から
// 「■ 保有商品詳細」セクションのみを抽出する軽量パーサー。
// フォーマットの詳細は assset-balance-rakutensec/src/csvParser.js を参照。

const HOLDING_COLUMNS = [
  'asset_type',
  'security_code',
  'security_name',
];

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function isSectionMarker(fields) {
  return fields.length === 1 && fields[0].startsWith('■');
}

// 戻り値: [{ asset_type, security_code, security_name }, ...]（保有商品詳細セクションの行のみ）
function parseHoldingsCsv(text) {
  const lines = text.split(/\r\n|\n/).map((l) => l.trimEnd());
  const holdings = [];
  let mode = 'none'; // 'none' | 'holdings-header' | 'holdings' | 'ignore'

  for (const line of lines) {
    if (line === '') continue;
    const fields = parseCsvLine(line);

    if (isSectionMarker(fields)) {
      mode = fields[0].includes('保有商品詳細') ? 'holdings-header' : 'ignore';
      continue;
    }

    if (mode === 'holdings-header') {
      mode = 'holdings'; // ヘッダー行(列名のみ)は読み飛ばす
      continue;
    }

    if (mode === 'holdings') {
      const record = {};
      HOLDING_COLUMNS.forEach((key, idx) => {
        record[key] = (fields[idx] || '').trim();
      });
      if (record.security_name || record.asset_type) holdings.push(record);
    }
  }

  return holdings;
}

module.exports = { parseHoldingsCsv };
