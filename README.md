# Openclaw Skills Collection

个人开发的Openclaw技能集合，所有技能符合Openclaw开发规范，开箱即用。

## 📋 技能列表

| 技能名称 | 描述 | 版本 | 状态 |
|----------|------|------|------|
| [bocha](./bocha/) | 🤖 博查AI全网搜索技能，从近百亿网页搜索高质量内容，支持时间筛选、内容摘要、图片搜索<br/>🎉 **免费注册送1000次查询额度** | v1.0.0 | ✅ 可用 |

## 🚀 快速开始

### 安装技能
1. 克隆本仓库到Openclaw的skills目录：
   ```bash
   cd ~/.claude/skills
   git clone https://github.com/你的用户名/openclaw-skills.git
   ```

2. 进入需要使用的技能目录安装依赖，例如博查搜索：
   ```bash
   cd openclaw-skills/bocha
   npm install
   ```

3. 配置环境变量（参考各技能目录下的`.env.example`）：
   ```bash
   # 博查搜索API KEY，注册地址：https://open.bocha.cn
   export BOCHA_API_KEY="your_api_key"
   ```

### 使用技能
在Claude Code中直接输入技能命令即可使用：
```
# 博查搜索示例
/bocha 最新科技新闻 --summary true
```

## 📖 技能介绍

### 博查AI搜索 (bocha)
- 全网搜索，覆盖近百亿网页内容
- 支持AI友好的完整内容摘要生成
- 可按时间范围筛选搜索结果
- 支持指定/排除特定网站搜索
- 支持图片搜索结果返回
- 响应速度快，结果准确率高
- 🔗 注册地址：[https://open.bocha.cn](https://open.bocha.cn)，注册即送1000次免费查询

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
