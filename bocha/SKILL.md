---
name: bocha
description: 博查AI搜索 - 从全网搜索任何网页信息和网页链接，结果准确、摘要完整，更适合AI使用。/ Bocha AI Search - Search web information and links from the entire network, with accurate results and complete summaries, more suitable for AI use.
version: 1.0.0
author: Bocha AI
usage: /bocha <query> [options]
keywords:
  - search
  - web-search
  - bocha
  - ai-search
  - openclaw-skill
trigger:
  - prefix: "/bocha"
    description: "调用博查AI搜索技能进行全网搜索"
environment:
  - name: BOCHA_API_KEY
    description: "博查AI开放平台API KEY，注册地址：https://open.bocha.cn"
    required: true
options:
  - name: --freshness
    description: "搜索指定时间范围内的网页。可选值：noLimit, oneDay, oneWeek, oneMonth, oneYear, YYYY-MM-DD..YYYY-MM-DD, YYYY-MM-DD"
    default: "noLimit"
  - name: --summary
    description: "是否显示文本摘要。可选值：true, false"
    default: "false"
  - name: --include
    description: "指定搜索的网站范围。多个域名使用|或,分隔"
  - name: --exclude
    description: "排除搜索的网站范围。多个域名使用|或,分隔"
  - name: --count
    description: "返回结果的条数，范围1-50"
    default: "10"
  - name: --images
    description: "是否返回图片结果。可选值：true, false"
    default: "false"
examples:
  - command: "/bocha 最新科技新闻 --summary true"
    description: "搜索最新科技新闻并显示摘要"
  - command: "/bocha 人工智能教程 --freshness oneMonth --count 20"
    description: "搜索最近一个月的人工智能教程，返回20条结果"
  - command: "/bocha 风景图片 --images true"
    description: "搜索风景图片并返回图片结果"
  - command: "/bocha 前端开发 --include site:github.com,site:npmjs.com"
    description: "只在GitHub和NPM网站搜索前端开发相关内容"
---

## 功能说明
博查AI搜索是专为AI助手设计的全网搜索技能，拥有近百亿网页索引，响应速度快，结果准确率高，支持AI友好的内容摘要生成，特别适合大模型获取实时互联网信息。

## 注册获取API KEY
1. 访问 [博查AI开放平台](https://open.bocha.cn) 注册账号
2. 注册成功后即可获得1000次免费查询额度
3. 在个人中心获取API KEY，设置为环境变量`BOCHA_API_KEY`

## 特性
- 🌐 全网搜索，覆盖近百亿网页内容
- 📝 AI友好的完整内容摘要生成
- ⏰ 可按时间范围筛选搜索结果
- 🔍 支持指定/排除特定网站搜索
- 🖼️ 支持图片搜索结果返回
- ⚡ 响应速度快，结果准确率高
