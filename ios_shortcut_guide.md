# 如何创建 "上传到 CaiDamn" iOS 快捷指令

本指南将一步步教你如何创建一个 iOS 快捷指令，用于将照片从手机相册直接上传到你的网站后台。

## 准备工作

*   **API 密钥**: `CaiDamnUpload2026!`
*   **目标 URL**: 
    *   如果你在本地调试: `http://<你的电脑IP>:3000/api/upload-heic` (手机电脑需在同一 WiFi)
    *   如果你已部署上线: `https://caicaicai.me/api/upload-heic` (请替换为实际域名)

## 步骤说明

1.  **打开快捷指令 App**
    *   点击右上角的 **+** 号创建一个新快捷指令。
    *   点击顶部的名称，重命名为 **"Upload to CaiDamn"** (或你喜欢的名字)。

2.  **设置共享表单 (Share Sheet)**
    *   在底部搜索栏搜索 **"在共享表单中显示"** (Show in Share Sheet) 并添加该操作。
        *   *(如果找不到，点击底部“i”图标，开启“在共享表单中显示”)*
    *   配置为: 接收 **图像** 和 **媒体**。
        *   点击 "接收无 (Receive Any)" -> 清除所有 -> 勾选 **Images (图像)** 和 **Media (媒体)**。

3.  **添加网络请求**
    *   搜索 **"获取 URL 内容"** (Get Contents of URL) 并添加。
    *   **URL**: 填写你的 API 地址 (例如 `https://caicaicai.me/api/upload-heic`)。
    *   将 **方法 (Method)** 改为 `POST`。

4.  **配置请求体 (Form Data)**
    *   点击 **请求体 (Request Body)** 行，选择 **表单 (Form)**。
    *   我们需要添加两个字段：

    **字段 1: 密钥**
    *   点击 "添加新字段" (Add new field) -> **文本 (Text)**。
    *   **键 (Key)**: `secret`
    *   **值 (Text)**: `CaiDamnUpload2026!`

    **字段 2: 文件**
    *   点击 "添加新字段" (Add new field) -> **文件 (File)**。
    *   **键 (Key)**: `file`
    *   **值 (File)**: 点击变量区域 -> 在键盘上方选择 **"快捷指令输入" (Shortcut Input)**。

5.  **处理响应 (可选)**
    *   为了确认上传是否成功，我们可以解析返回的 JSON。
    *   搜索 **"获取字典值"** (Get Dictionary Value)。
    *   将输入设置为上一步的 "URL 内容"。
    *   **键 (Key)**: `success`。
    *   搜索 **"显示通知"** (Show Notification)。
    *   内容填写: `上传状态: `，然后点击变量栏选择上一步的 "字典值"。

6.  **完成**
    *   点击完成保存。

## 如何使用

1.  打开 iPhone 的 **照片 (Photos)** App。
    *   **注意**: 也支持在 **文件 (Files)** App 中使用。
2.  选择一张或多张照片。
3.  点击左下角的 **分享 (Share)** 按钮。
4.  向下滚动，找到你刚才创建的 **"Upload to CaiDamn"** 并点击。
5.  如果看到通知显示 `上传状态: 1` (或 `true`)，说明上传成功！

---

> **提示**: 如果遇到网络错误，请先检查:
> 1. 手机是否能访问该 URL？(在手机 Safari 尝试打开 URL，应该会显示 "Method not allowed")。
> 2. 密钥是否填写正确（不要有多余空格）。
