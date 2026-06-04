---
name: wps-downloader
description: 浏览器自动化下载 WPS/金山文档分享文件，打开公开分享链接并自动识别下载入口完成文件下载。
version: 1.0.0
author: xuzhisheng
usage: /wps-downloader <wps-url> [options]
keywords:
  - wps
  - kdocs
  - download
  - browser-automation
  - puppeteer
  - openclaw-skill
trigger:
  - prefix: "/wps-downloader"
    description: "自动打开 WPS 或金山文档分享链接并下载文件"
options:
  - name: --output
    description: "下载文件保存目录，默认为当前目录"
    default: "."
  - name: --timeout
    description: "页面加载和下载超时时间，单位毫秒"
    default: "60000"
  - name: --headless
    description: "是否使用无头模式。可选值：true, false"
    default: "true"
examples:
  - command: "/wps-downloader https://kdocs.cn/l/abcdefghij"
    description: "下载公开可访问的金山文档分享文件到当前目录"
  - command: "/wps-downloader https://kdocs.cn/l/abcdefghij --output ./downloads"
    description: "下载文件到指定目录"
  - command: "/wps-downloader https://wps.cn/s/abcdefgh --timeout 120000 --headless false"
    description: "使用较长超时时间并显示浏览器窗口"
---

## 功能说明

WPS 下载技能使用 Puppeteer 启动浏览器，打开 WPS 云文档或金山文档公开分享链接，自动查找并点击下载入口，将文件保存到指定目录。

## 使用限制

- 分享链接需要公开可访问
- 分享文档需要允许下载
- 需要安装 Puppeteer 依赖
- 首次运行可能需要下载 Chromium
