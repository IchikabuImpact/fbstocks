#!/bin/bash
# スクリプトの目的: /var/www/fbstocks ディレクトリ内のファイル構成を表示し、ファイルに保存する（tree コマンドがない場合の代替案）。

# 出力ファイル名を定義
output_file="directory_structure.txt"

# /var/www/fbstocks ディレクトリ内のファイルとフォルダの構造をリストアップし、ファイルに保存
echo "ファイル構成 (/var/www/fbstocks):" > "$output_file"
find /var/www/fbstocks -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g' >> "$output_file"

# 結果を標準出力にも表示
echo "ディレクトリ構成が $output_file に保存されました。内容は以下の通りです:"
cat "$output_file"
