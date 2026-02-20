# random_note

<<<<<<< codex/create-static-page-to-display-random-note.com-urls
GitHub Actions で `public/urls.json` を定期生成し、静的サイト側はその JSON を読んでランダム表示する構成です。

## 目的

- ブラウザから `note.com` を直接取得しない（403回避）
- GitHub Pages / Cloudflare Pages の静的配信だけでランダム表示を実現

## リポジトリ構成

- `public/index.html` : UI本体
- `public/app.js` : ランダム表示ロジック
- `public/style.css` : スマホ対応2分割レイアウト
- `public/urls.json` : 生成物（記事URL配列）
- `tools/build_urls.py` : URLs生成スクリプト
- `.github/workflows/build_urls.yml` : 定期実行

## フロント仕様

- `public/urls.json` を fetch
- `urls` から1件ランダム選択して `iframe.src` へ反映
- ローディング表示、`urls.json` 取得失敗時メッセージ表示
- `iframe` 失敗時は新規タブリンクUIへ自動切替

## Actions 生成仕様

- スケジュール: 1日1回（UTC 00:00）
- 取得元: `https://note.com/sitemap.xml.gz`
- child sitemap を複数取得して `/n/` URL を抽出
- 100時間以内 (`now - lastmod <= 100h`) を優先しつつ、候補不足時はそれ以外も補完
- 重複除去、上限5000件
- 出力形式:

```json
{
  "generated_at": "ISO8601",
  "source": "note sitemap",
  "urls": ["..."]
}
```

## 更新方式

- Actions 実行後、`public/urls.json` に差分があればコミット＆push
- フロントは `generated_at` を使ったキャッシュ回避付きで `urls.json` を再取得

## ローカル確認
=======
note.com の記事 URL を sitemap からランダムに取得して表示する静的 Web ページです。

## 仕様

- スマホ対応の上下二分割レイアウト
  - 上: サイト名 + ランダム表示ボタン
  - 下: iframe で記事表示
- ボタン押下時の取得フロー
  1. `https://note.com/sitemap.xml.gz` を取得
  2. child sitemap をランダムに選択
  3. `/n/` を含む記事 URL を抽出
  4. `lastmod` が現在時刻から 100 時間以内の候補に絞る
  5. 1件をランダム選択して iframe に反映
- 失敗時の挙動
  - ローディング表示
  - HTTP エラーや解析失敗時に再試行
  - iframe 埋め込みが難しい場合は新規タブ用リンクを表示

## ローカル実行
>>>>>>> main

```bash
python3 -m http.server 8000
```

<<<<<<< codex/create-static-page-to-display-random-note.com-urls
- 画面: `http://localhost:8000/public/index.html`
- ルート `index.html` は `public/index.html` へリダイレクト

## 注意（矛盾回避）

- 「ブラウザから note.com を直接叩かない」方針のため、フロントで sitemap 取得は行いません。
- sitemap 取得は Actions（サーバー側処理）に限定します。


## トラブルシューティング

- `ランダム表示` で 403 が出る場合
  - 旧フロント（ブラウザが note.com を直接取得する版）が配信されている可能性があります。
  - `https://<user>.github.io/<repo>/public/index.html` を直接開いて、新版が表示されるか確認してください。

- `tools/build_urls.py` が実行された形跡がない場合
  - GitHub Actions の `Build note urls` を `workflow_dispatch` で手動実行して初回の `public/urls.json` を生成してください。
  - Actions が `main` ブランチで有効化されているか、リポジトリ設定で `Read and write permissions` が有効か確認してください。
=======
ブラウザで `http://localhost:8000` を開いて確認してください。

## 補足

ブラウザの CORS 制約を回避するため、スクリプト内で複数の取得経路（直接アクセス + 公開プロキシ）を順番に試します。
>>>>>>> main
