# Calendar(iPhone用ホーム画面アプリ)

週間・月間カレンダー、ToDo、メモ、学習の進捗管理ができる個人用カレンダーです。
データはすべて **そのiPhoneの中** に保存され、オフラインでも動きます。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | アプリ本体(HTML・CSS・JavaScriptを1ファイルにまとめたもの) |
| `manifest.webmanifest` | アプリ名・アイコン・全画面表示などの設定 |
| `sw.js` | オフライン用のService Worker |
| `icon-*.png` / `apple-touch-icon.png` | ホーム画面のアイコン |

## 1. GitHub Pages で公開する

1. GitHub で新しいリポジトリを作る(例: `calendar`)。Public にする。
2. このフォルダの中身をリポジトリの一番上(ルート)に置いて push する。

   ```bash
   cd calendar-pwa
   git init
   git add .
   git commit -m "Calendar PWA"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/calendar.git
   git push -u origin main
   ```

3. リポジトリの **Settings → Pages** を開き、Source を「Deploy from a branch」、Branch を `main` / `/(root)` にして Save。
4. 1〜2分待つと `https://<ユーザー名>.github.io/calendar/` で開けるようになる。

> Service Worker は HTTPS でしか動かないので、GitHub Pages や Netlify、Cloudflare Pages などの HTTPS 付きホスティングを使ってください。

## 2. iPhone のホーム画面に追加する

1. iPhone の **Safari** で上の URL を開く(Chrome など他のアプリからは不可)。
2. 一度ページが表示されたら、共有ボタン →「ホーム画面に追加」。
3. ホーム画面のアイコンから開くと、Safari のバーなしの全画面で起動する。

初回に通信ありで一度開けば、以後は機内モードでも使えます(フォントも初回に保存されます)。

## データとバックアップ

- データはホーム画面から開いたアプリの中に保存されます。**Safari で開いたページとは保存場所が別** なので、ふだんはホーム画面のアイコンから使ってください。
- アプリを削除するとデータも消えます。ページ下部の「Backup & restore」から、ときどき「Save backup」でバックアップを保存してください(「ファイル」に保存)。
- 機種変更や別の端末へ移すときは、バックアップファイルを「Restore from file」で読み込みます。

## 更新するとき

`index.html` を書き換えたら、`sw.js` の先頭にある `VERSION` を `"v2"` のように変えてから push してください。
次にアプリを開いたときに新しい版を取り込み、もう一度開くと反映されます。
