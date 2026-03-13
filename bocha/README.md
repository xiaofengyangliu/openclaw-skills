# 博查AI搜索技能 / Bocha AI Search Skill

## 中文说明

### 功能介绍
博查AI搜索是一个为openclaw开发的全网搜索技能，可以从近百亿网页和生态内容源中搜索高质量世界知识，包括新闻、图片、百科、文库等内容。搜索结果准确、摘要完整，更适合AI使用。

### 主要特性
- 🌐 全网搜索，覆盖近百亿网页内容
- 📝 支持生成AI友好的完整内容摘要
- ⏰ 可按时间范围筛选搜索结果
- 🔍 支持指定/排除特定网站搜索
- 🖼️ 支持图片搜索结果返回
- ⚡ 响应速度快，结果准确率高
- 🔄 响应格式兼容Bing Search API

### 免费注册福利
🎉 **免费注册，首次获取1000次查询额度！**
1. 访问 [博查AI开放平台](https://open.bocha.cn) 注册账号
2. 注册成功后自动获得1000次免费查询额度
3. 在API KEY管理页面获取您的专属API KEY

### 安装和配置
1. 将本技能目录放到openclaw的skills目录下
2. 安装依赖：
   ```bash
   cd bocha
   npm install
   ```
3. 设置环境变量：
   ```bash
   export BOCHA_API_KEY="您的API KEY"
   ```
   或者在openclaw配置文件中添加：
   ```json
   "env": {
     "BOCHA_API_KEY": "您的API KEY"
   }
   ```

### 使用方法
```
/bocha <搜索关键词> [选项]
```

#### 可用选项
- `--freshness <value>`: 搜索指定时间范围内的网页
  - 可选值：`noLimit`(默认,不限), `oneDay`(一天内), `oneWeek`(一周内), `oneMonth`(一个月内), `oneYear`(一年内), `YYYY-MM-DD..YYYY-MM-DD`(日期范围), `YYYY-MM-DD`(指定日期)
- `--summary <true|false>`: 是否显示文本摘要，默认false
- `--include <domains>`: 指定搜索的网站范围，多个域名使用`|`或`,`分隔
- `--exclude <domains>`: 排除搜索的网站范围，多个域名使用`|`或`,`分隔
- `--count <number>`: 返回结果的条数，范围1-50，默认10
- `--images <true|false>`: 是否返回图片结果，默认false

#### 使用示例
```
# 基础搜索
/bocha 阿里巴巴2024年的ESG报告

# 显示摘要的搜索
/bocha 人工智能最新发展 --summary true

# 搜索最近一周的结果
/bocha 科技新闻 --freshness oneWeek

# 指定网站搜索
/bocha 技术教程 --include github.com|developer.mozilla.org

# 搜索并返回图片结果
/bocha 自然风光 --images true --count 20
```

### 常见问题
**Q: API KEY无效怎么办？**
A: 请检查API KEY是否正确，或者登录博查AI开放平台重新生成新的API KEY。

**Q: 提示余额不足怎么办？**
A: 免费额度用完后，可以前往博查AI开放平台进行充值，价格优惠。

**Q: 调用频率有限制吗？**
A: 免费用户有一定的频率限制，付费用户根据充值金额享受更高的频率限制。

---

## English Instructions

### Feature Introduction
Bocha AI Search is a web search skill developed for openclaw, which can search high-quality world knowledge from nearly 10 billion web pages and ecological content sources, including news, images, encyclopedias, libraries and other content. The search results are accurate, the summary is complete, and it is more suitable for AI use.

### Key Features
- 🌐 Whole network search, covering nearly 10 billion web content
- 📝 Support generating AI-friendly complete content summaries
- ⏰ Filter search results by time range
- 🔍 Support including/excluding specific websites in search
- 🖼️ Support image search results return
- ⚡ Fast response speed and high result accuracy
- 🔄 Response format compatible with Bing Search API

### Free Registration Benefit
🎉 **Free registration, get 1000 queries for the first time!**
1. Visit [Bocha AI Open Platform](https://open.bocha.cn) to register an account
2. Automatically get 1000 free query credits after successful registration
3. Get your exclusive API KEY on the API KEY management page

### Installation and Configuration
1. Place this skill directory in the skills directory of openclaw
2. Install dependencies:
   ```bash
   cd bocha
   npm install
   ```
3. Set environment variable:
   ```bash
   export BOCHA_API_KEY="your API KEY"
   ```
   Or add it to the openclaw configuration file:
   ```json
   "env": {
     "BOCHA_API_KEY": "your API KEY"
   }
   ```

### Usage
```
/bocha <search keywords> [options]
```

#### Available Options
- `--freshness <value>`: Search web pages within a specified time range
  - Available values: `noLimit`(default, no limit), `oneDay`(within one day), `oneWeek`(within one week), `oneMonth`(within one month), `oneYear`(within one year), `YYYY-MM-DD..YYYY-MM-DD`(date range), `YYYY-MM-DD`(specific date)
- `--summary <true|false>`: Whether to display text summary, default false
- `--include <domains>`: Specify website scope for search, multiple domains separated by `|` or `,`
- `--exclude <domains>`: Exclude website scope from search, multiple domains separated by `|` or `,`
- `--count <number>`: Number of results returned, range 1-50, default 10
- `--images <true|false>`: Whether to return image results, default false

#### Usage Examples
```
# Basic search
/bocha Alibaba 2024 ESG report

# Search with summary
/bocha latest developments in artificial intelligence --summary true

# Search results from the last week
/bocha technology news --freshness oneWeek

# Search specific websites
/bocha technical tutorials --include github.com|developer.mozilla.org

# Search and return image results
/bocha natural scenery --images true --count 20
```

### FAQ
**Q: What should I do if the API KEY is invalid?**
A: Please check if the API KEY is correct, or log in to the Bocha AI Open Platform to regenerate a new API KEY.

**Q: What should I do if it prompts insufficient balance?**
A: After the free quota is used up, you can recharge on the Bocha AI Open Platform with preferential prices.

**Q: Is there a call frequency limit?**
A: Free users have certain frequency limits, and paid users enjoy higher frequency limits according to the recharge amount.

---

## 技术支持 / Technical Support
- 官方网站 / Official Website: https://bocha.cn
- 开放平台 / Open Platform: https://open.bocha.cn
- 文档中心 / Documentation Center: https://bocha-ai.feishu.cn/wiki/RXEOw02rFiwzGSkd9mUcqoeAnNK
