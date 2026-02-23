# random_note

GitHub Actions で `public/urls.json` を定期生成し、静的サイト側はその JSON を読んで note 記事の**embed URLカードをランダム10件**表示する構成です。

## 目的

- ブラウザから `note.com` を直接取得しない（403回避）
- GitHub Pages / Cloudflare Pages の静的配信だけでランダム表示を実現
- ルート `index.html` を公開エントリに統一
- GitHub Pages のキャッシュ影響を避けるため、`index.html` で CSS/JS にバージョンクエリを付与

## リポジトリ構成

- `index.html` : UI本体（ヘッダー + 一覧）
- `public/app.js` : ランダム10件表示ロジック
- `public/style.css` : スマホ対応2分割 + カード一覧スタイル
- `public/urls.json` : 生成物（記事URLまたはカード情報）
- `tools/build_urls.py` : URLs生成スクリプト
- `tools/preview_embed_conversion.js` : `/n/<id>` から embed URL への変換確認スクリプト（Node.js）
- `.github/workflows/build_urls.yml` : 定期実行

## フロント仕様

- ボタン「ランダム10件」押下で毎回10件を再抽選
- 初期表示時にも自動で1回読み込み
- `public/urls.json` から重複なしで最大10件を選択（前回表示URLは可能な範囲で回避）
- 取得した URL を `https://note.com/embed/notes/<id>` に変換し、カードとして表示
- カードクリックで embed URL を `_blank` で開く
- `urls.json` fetch失敗時はエラー表示
- 候補が10件未満の場合は可能な件数のみ表示して警告

## Actions 生成仕様

- スケジュール: 1日1回（UTC 00:00）
- 取得元: `https://note.com/sitemap.xml.gz`
- child sitemap を複数取得して `/n/` URL を抽出
- 100時間以内 (`now - lastmod <= 100h`) を優先しつつ、候補不足時はそれ以外も補完
- URL生存チェックを行い、404/410 のURLを除外
- 重複除去、上限5000件

## ローカル確認

```bash
python3 -m http.server 8000
```

- 画面: `http://localhost:8000/index.html`

## 注意

- フロントで sitemap 取得は行いません（note.com 直fetchしない）。
- sitemap 取得は Actions（サーバー側処理）に限定します。


### 変換確認（手動）

```bash
node tools/preview_embed_conversion.js https://note.com/yusukin_smoke/n/nca2acd72eda8
```

