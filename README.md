# Openclaw Skills Collection

个人开发的 OpenClaw 技能集合，所有技能采用独立目录、Node.js 入口和技能清单结构，便于 OpenClaw 与大模型引用。

## 📋 技能列表

| 技能名称 | 命令 | 描述 | 版本 | 状态 |
|----------|------|------|------|------|
| [bocha](./bocha/) | `/bocha` | 博查 AI 全网搜索，支持时间筛选、内容摘要、图片搜索和站点过滤 | v1.0.0 | ✅ 可用 |
| [wecom-notify](./wecom-notify/) | `/wecom` | 企业微信群机器人通知，支持文本、Markdown、@手机号和@所有人 | v1.0.0 | ✅ 可用 |
| [workplan-check](./workplan-check/) | `/workplan-check` | 检查飞书多维表格或本地 Excel 中过期未完成的工作计划并生成提醒 | v1.5.0 | ✅ 可用 |
| [lunar-calendar](./lunar-calendar/) | `/lunar-calendar` | 农历公历互转，支持闰月、生肖、干支和传统节日 | v1.0.0 | ✅ 可用 |
| [wps-downloader](./wps-downloader/) | `/wps-downloader` | 自动打开 WPS/金山文档公开分享链接并下载文件 | v1.0.0 | ✅ 可用 |
| [wps-content-extractor](./wps-content-extractor/) | `/wps-content-extractor` | 自动提取 WPS/金山文档多页签文本内容，可保存到文件 | v1.0.0 | ✅ 可用 |

## 🔎 大模型引用入口

- [`skills.md`](./skills.md): 仓库级技能索引，适合 OpenClaw、Agent 和大模型快速发现技能。
- 各技能目录下的 `SKILL.md`: 单个技能的模型可读清单，包含命令、参数、环境变量和示例。
- 各技能目录下的 `README.md`: 面向用户的安装、配置和使用说明。

## 🚀 快速开始

### 安装技能
1. 克隆本仓库到 OpenClaw 的 skills 目录：
   ```bash
   cd ~/.claude/skills
   git clone <repository-url> openclawSkills
   ```

2. 进入需要使用的技能目录安装依赖，例如博查搜索：
   ```bash
   cd openclawSkills/bocha
   npm install
   ```

   也可以在项目根目录安装所有技能依赖：
   ```bash
   npm run install-all
   ```

3. 如技能需要环境变量，请参考对应目录下的 `.env.example` 或 `SKILL.md`：
   ```bash
   export BOCHA_API_KEY="your_api_key"
   export WECOM_WEBHOOK_KEY="your_webhook_key"
   ```

### 使用技能
在 Claude Code 或 OpenClaw 中直接输入技能命令即可使用：
```bash
/bocha 最新科技新闻 --summary true
/wecom 请尽快处理工单 --mobiles 13800138000
/workplan-check ./workplan.xlsx --sheets 后端,前端
/lunar-calendar 2024-02-10
/wps-downloader https://kdocs.cn/l/abcdefghij --output ./downloads
/wps-content-extractor https://kdocs.cn/l/abcdefghij --output ./content.txt
```

## 📖 技能介绍

### 博查 AI 搜索 (bocha)
- 全网搜索，覆盖近百亿网页内容
- 支持 AI 友好的完整内容摘要生成
- 可按时间范围筛选搜索结果
- 支持指定/排除特定网站搜索
- 支持图片搜索结果返回
- 响应速度快，结果准确率高

### 企业微信群机器人通知 (wecom-notify)
- 发送企业微信群机器人消息
- 支持文本和 Markdown 格式
- 支持 @指定手机号用户和 @所有人
- 支持通过环境变量或命令参数传入 webhook key

### 工作计划检查提醒 (workplan-check)
- 支持飞书多维表格和本地 Excel 两种数据源
- 按计划完成时间、状态、预计完成时间和备注规则判断是否需要提醒
- 支持按责任人分组生成提醒内容
- 支持指定检查日期、指定 sheet 和输出到文件

### 农历公历互转 (lunar-calendar)
- 支持公历转农历、农历转公历
- 支持闰月和闰年 2 月 29 日
- 支持多种中文和数字日期格式
- 输出生肖、干支和传统节日信息

### WPS 文件自动下载 (wps-downloader)
- 支持 WPS 云文档和金山文档公开分享链接
- 自动打开页面并识别下载入口
- 支持自定义下载目录、超时时间和无头模式

### WPS 内容提取 (wps-content-extractor)
- 支持 WPS/金山文档公开分享链接
- 自动识别多个页签
- 通过全选复制和 DOM 备用方案提取文本内容
- 支持指定页签和保存到文件

## 🤝 贡献指南
欢迎提交Issue和PR来贡献新技能或改进现有技能。

### 添加新技能规范
1. 在根目录新建独立的技能文件夹，使用小写英文命名
2. 每个技能必须包含：
   - `index.js` - 技能主入口文件
   - `package.json` - 技能依赖配置
   - `README.md` - 技能使用说明（中英文优先）
   - `.env.example` - 环境变量配置模板（如果需要）
3. 更新根目录`README.md`的技能列表

## 📄 开源协议
MIT License
