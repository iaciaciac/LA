---
description: 如何更新 Nike Run Club 跑步数据
---

# 更新 Nike Run Club 数据流程

每当您跑完步想要更新网站数据时，请按照以下步骤操作：

## 1. 获取新的 Nike Access Token
因为 Nike 的 Token 有效期较短，通常需要重新获取。
1. 登录 Nike 官网，开启开发者工具 (F12) -> Network 面板。
2. 刷新页面，找到任意 fetch 请求。
3. 在请求头 (Request Headers) 中找到 `Authorization` 字段，复制 `Bearer ` 后面的那串长字符。

## 2. 更新脚本 Token
1. 打开项目根目录下的 `fetch_nike_runs.js` 文件。
2. 找到第 6 行 `const ACCESS_TOKEN = '...'`。
3. 将新的 Token 粘贴进去替换旧的。

## 3. 运行抓取脚本
在终端中运行以下命令：
```bash
node fetch_nike_runs.js
```
// turbo
此命令会从 Nike 服务器抓取最新的跑步数据，并自动更新 `public/data/nike_runs_final.json` 文件。

## 4. 提交并推送 (部署)
为了让线上网站生效，您需要将更新后的 JSON 文件推送到 GitHub：
```bash
git add fetch_nike_runs.js public/data/nike_runs_final.json
git commit -m "Update Nike runs data"
git push
```
等待 Vercel 自动构建完成即可。

> **提示**：如果是本地开发 (`npm run dev`)，运行完步骤 3 后，刷新浏览器页面即可看到更新（无需 git push）。
