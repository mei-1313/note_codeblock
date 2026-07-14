# note CodeBlock Visualizer 🚀

note.comのコードブロックをモダンで読みやすいスタイルにカスタマイズし、ユーティリティ機能を追加するブラウザ拡張機能（Chrome/Edge/Firefox対応、Manifest V3）です。

---

## ✨ 主な機能

| 機能 | 詳細 |
| :--- | :--- |
| **🎨 5つの配色テーマ** | One Dark Pro, Dracula, Monokai, GitHub Dark, GitHub Light から選択可能。 |
| **🔤 プログラミングフォント** | JetBrains Mono, Fira Code, Source Code Pro, System Monospace に対応。 |
| **📏 サイズと高さ調整** | 11px〜22pxの範囲でフォントサイズをスライダー調整可能。 |
| **📋 ワンクリックコピー** | コードブロック右上にアニメーション付きの「Copy」ボタンを設置。 |
| **🔢 行番号の表示切替** | 行番号の表示・非表示をトグルスイッチで切り替え可能。 |
| **⚡ リアルタイム反映** | 設定ポップアップで変更した内容は、開いているタブに即座に反映されます。 |

---

## 🛠️ 技術的な特徴

### 1. SPA（React）との競合回避
note.comは単一ページアプリケーション（SPA）であるため、DOMの要素を単純に削除または書き換えるとReactの再レンダリング時にエラー（Reconciliation Crash）が発生するリスクがあります。
本拡張機能では、元の `<pre>` 要素を `display: none !important;` で非表示化しつつ、その直後にクローンしたカスタムラッパーを挿入します。また、元のコードがSPA遷移や更新等によって変化した場合も、`MutationObserver` がそれを検知してクローンにリアルタイム同期します。

### 2. 強力なスタイル孤立化 (Insulated CSS)
note.comのグローバルなスタイル（`pre[data-name="preCode"]` や `.hljs`）が `!important` で強制適用されているため、クローン側では `<pre>` や `<code>` を使わず、あえて `<div>` タグ（`.note-cloned-pre`, `.note-code-block`）に変換しています。これにより、既存のCSSによる予期せぬスタイルの崩れやオーバーライドを完全にシャットアウトし、選んだテーマ通りの見た目を保証します。

---

## 📦 ファイル構成

本プロジェクトは以下のファイルで構成されています。
* [manifest.json](manifest.json): 拡張機能のメタデータと権限設定 (Manifest V3)
* [content.js](content.js): DOMを監視し、コードブロックを安全にクローン＆拡張するコンテンツスクリプト
* [content.css](content.css): 各テーマの配色定義、レイアウト、Google Fontsのインポート
* [popup.html](popup.html) / [popup.css](popup.css) / [popup.js](popup.js): 設定用ポップアップ画面 (グラスモーフィズムデザイン)
* [test_page.html](test_page.html): 拡張機能を入れる前にブラウザ上で動作を確認できるローカルテスト用サンドボックス
* `icons/`: 拡張機能アイコン (16px, 48px, 128px)

---

## 🚀 使用方法・インストール手順

### A. 動作確認 (ローカルサンドボックス)
1. ワークスペース内の [test_page.html](test_page.html) をブラウザで直接開きます。
2. 画面下部にあるシミュレーターコントロールパネルを動かして、テーマやフォント、サイズ、行番号が即座に変更される様子をプレビューできます。

### B. Google Chrome / Microsoft Edge へのインストール
1. ブラウザで `chrome://extensions/` (Edgeは `edge://extensions/`) を開きます。
2. 右上の「**デベロッパーモード (Developer mode)**」をオンにします。
3. 左上の「**パッケージ化されていない拡張機能を読み込む (Load unpacked)**」をクリックします。
4. 本プロジェクトのルートディレクトリ `/home/mirai/work/note_codeblock` を選択して読み込ませます。
5. [note.com](https://note.com) の任意の記事ページを開き、拡張機能の設定ポップアップからお好みのスタイルにカスタマイズしてお楽しみください。

### C. Firefox へのインストール
1. Firefoxで `about:debugging#/runtime/this-firefox` を開きます。
2. 「**一時的な拡張機能の読み込み (Load Temporary Add-on...)**」をクリックします。
3. 本プロジェクトのディレクトリ内の `manifest.json` を選択します。

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の元で公開されています。
