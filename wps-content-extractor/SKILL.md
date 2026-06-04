---
name: wps-content-extractor
description: 浏览器自动化提取 WPS/金山文档多页签内容，通过全选复制和 DOM 备用提取方式获取公开分享文档中的文本内容。
version: 1.0.0
author: xuzhisheng
usage: /wps-content-extractor <wps-url> [options]
keywords:
  - wps
  - kdocs
  - content-extraction
  - spreadsheet
  - browser-automation
  - puppeteer
  - openclaw-skill
trigger:
  - prefix: "/wps-content-extractor"
    description: "自动打开 WPS 或金山文档分享链接并提取页签内容"
options:
  - name: --output
    description: "内容保存文件路径，默认不保存到文件，直接输出"
  - name: --timeout
    description: "页面加载超时时间，单位毫秒"
    default: "60000"
  - name: --headless
    description: "是否使用无头模式。可选值：true, false"
    default: "true"
  - name: --sheets
    description: "指定提取的页签名称，多个用逗号分隔，默认提取所有页签"
examples:
  - command: "/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT"
    description: "提取所有页签内容并直接输出"
  - command: "/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --output ./content.txt"
    description: "提取内容并保存到文件"
  - command: "/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --sheets Sheet1,数据汇总"
    description: "只提取指定页签内容"
  - command: "/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --headless false"
    description: "使用可视化浏览器模式提取内容"
---

## 功能说明

WPS 内容提取技能使用 Puppeteer 打开 WPS 或金山文档公开分享链接，自动识别页签，通过模拟全选复制获取文本内容，并在复制失败时使用 DOM 提取作为备用方案。

## 适用场景

- 提取公开 WPS 表格或金山文档内容
- 获取多页签表格的文本数据
- 将在线文档内容保存到本地文本文件
- 为后续文本分析、检查或提醒流程准备输入
