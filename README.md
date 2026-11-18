# 分帳

簡單的多人分帳網頁：建立群組、記帳、看餘額與結算建議，資料存在你自己的瀏覽器。

網址：https://hao-yuliu.github.io/Money/

## 本機開發

```bash
npm install
npm run dev     # 開發伺服器
npm test        # 執行測試
npm run build   # 打包到 dist/
```

## 部署

1. 到 GitHub repo 的 **Settings → Pages**，把 **Source** 設為 **GitHub Actions**（只需設定一次）。
2. 之後每次 push 到 `main`，GitHub Actions 會自動測試、打包並更新網站。
