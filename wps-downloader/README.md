# wps-downloader

[中文](#中文) | [English](#english)

---

## 中文

浏览器自动化下载WPS分析文件 - 打开WPS分享链接，自动点击下载按钮下载文件。

### 功能特点

- 🤖 全自动浏览器操作，无需手动点击
- 支持 WPS 云文档、金山文档 (kdocs.cn) 分享链接
- 智能识别多种下载按钮样式
- 可自定义下载目录和超时时间
- 支持无头模式和可视化模式

### 安装

```bash
cd wps-downloader
npm install
```

或者在项目根目录执行：

```bash
npm run install-all
```

### 使用方法

```
/wps-downloader <wps-url> [options]
```

#### 参数

- `wps-url`: WPS/金山文档分享链接 (必需)

#### 选项

- `--output <dir>`: 下载文件保存目录，默认为当前目录
- `--timeout <ms>`: 页面加载和下载超时时间(毫秒)，默认为 `60000`
- `--headless <true|false>`: 是否使用无头模式，默认为 `true`

### 示例

```bash
# 基本用法，下载到当前目录
/wps-downloader https://kdocs.cn/l/abcdefghij

# 下载到指定目录
/wps-downloader https://kdocs.cn/l/abcdefghij --output ./downloads

# 设置较长的超时时间，并显示浏览器窗口
/wps-downloader https://wps.cn/s/abcdefgh --timeout 120000 --headless false
```

### 支持的链接类型

- ✅ WPS 云文档分享链接 (`*.wps.cn`)
- ✅ 金山文档分享链接 (`*.kdocs.cn`)
- ✅ WPS 在线表格/文档/演示链接
- ✅ 公开可访问的分享链接

### 注意事项

1. 需要公开可访问的分享链接，需要允许下载权限
2. 如果链接需要登录才能下载，本工具无法使用
3. 首次运行会自动下载 Chromium，需要等待一段时间
4. 如果找不到下载按钮，请确认分享链接是否设置了"禁止下载"

### 依赖

- [puppeteer](https://pptr.dev/) - 浏览器自动化工具

---

## English

Browser automation for downloading WPS analysis files - Open WPS share link, automatically click download button to download files.

### Features

- 🤖 Fully automated browser operation, no manual clicking required
- Supports WPS Cloud Documents, Kingsoft Documents (kdocs.cn) share links
- Smart recognition of multiple download button styles
- Customizable download directory and timeout
- Supports both headless and visible mode

### Installation

```bash
cd wps-downloader
npm install
```

Or at project root:

```bash
npm run install-all
```

### Usage

```
/wps-downloader <wps-url> [options]
```

#### Parameters

- `wps-url`: WPS/Kingsoft document share link (required)

#### Options

- `--output <dir>`: Output directory for downloaded files, default: current directory
- `--timeout <ms>`: Page load and download timeout in milliseconds, default: `60000`
- `--headless <true|false>`: Whether to use headless mode, default: `true`

### Examples

```bash
# Basic usage, download to current directory
/wps-downloader https://kdocs.cn/l/abcdefghij

# Download to specified directory
/wps-downloader https://kdocs.cn/l/abcdefghij --output ./downloads

# Set longer timeout and show browser window
/wps-downloader https://wps.cn/s/abcdefgh --timeout 120000 --headless false
```

### Supported Link Types

- ✅ WPS Cloud Document share links (`*.wps.cn`)
- ✅ Kingsoft Document share links (`*.kdocs.cn`)
- ✅ WPS online spreadsheet/document/presentation links
- ✅ Publicly accessible share links

### Notes

1. Requires publicly accessible share links with download permission enabled
2. This tool cannot be used if the link requires login to download
3. First run will automatically download Chromium, need to wait
4. If download button not found, please check if the share link has "download prohibited" enabled

### Dependencies

- [puppeteer](https://pptr.dev/) - Browser automation tool
