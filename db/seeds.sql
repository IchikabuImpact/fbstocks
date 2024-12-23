-- seeds.sql: Sample data for favorite_samples table

delete from favorite_samples;

REPLACE INTO favorite_samples (stock_symbol, stock_name, created_at, updated_at) VALUES
('1928', '積水ハウス', current_timestamp(), current_timestamp()),
('8593', '三菱ＨＣキャピタル', current_timestamp(), current_timestamp()),
('8931', '和田興産', current_timestamp(), current_timestamp()),
('9765', 'オオバ', current_timestamp(), current_timestamp()),
('7532', 'パンパシフィックＨＤ', current_timestamp(), current_timestamp()),
('3475', 'グッドコムアセット', current_timestamp(), current_timestamp());
