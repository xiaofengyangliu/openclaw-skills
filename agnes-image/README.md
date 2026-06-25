# Agnes AI 图像生成技能 / Agnes AI Image Generation Skill

## 中文说明

### 功能介绍

Agnes AI 图像生成技能是基于 **Agnes-Image-2.0-Flash** 模型的图像生成工具，支持文生图、图生图和多图合成工作流。该模型由 **Sapiens AI** 开发，已在 Artificial Analysis Image Editing Leaderboard 取得 ELO 1,184 的成绩，进入 Top 20 区间。

### 核心能力

- **文生图 (Text-to-Image)**：根据文本提示词生成高质量图像
- **图生图 (Image-to-Image)**：基于输入图像进行编辑、转换或增强
- **多图合成**：输入多张参考图并合成为一张新图像
- **风格控制**：调整艺术风格、光照、布局和视觉方向

### 适用场景

创意设计、营销内容制作、电商产品图优化、社交内容生成、角色合成等。

### 免费使用

当前定价：**免费**（$0 / image）

### 安装和配置

1. 将本技能目录放到 openclaw 的 skills 目录下
2. 安装依赖：

```bash
cd agnes-image
npm install
```

3. 设置环境变量：

```bash
export AGNES_API_KEY="your_api_key_here"
```

或在 openclaw 配置文件中添加：

```json
{
  "env": {
    "AGNES_API_KEY": "your_api_key_here"
  }
}
```

### 使用方法

```
/agnes-image <提示词> [选项]
```

#### 可用选项

- `--mode <value>`：生成模式
  - `txt2img`：文生图（默认）
  - `img2img`：图生图（需要 `--image` 参数）
- `--size <value>`：输出图像尺寸，如 `1024x1024`、`1024x768`、`768x1024`（默认 `1024x1024`）
- `--image <urls>`：输入图片 URL 或 Data URI，多图用逗号分隔（图生图必填）
- `--output <format>`：输出格式，`url`（默认）或 `base64`

#### 使用示例

```bash
# 文生图：生成产品图
/agnes-image A clean product photo of a glass cube on a white studio background, soft shadows, high detail --size 1024x768

# 图生图：风格转换
/agnes-image Transform this image into a cinematic cyberpunk style --mode img2img --image https://example.com/input.png

# 多图合成：角色组合
/agnes-image Combine the two characters into a fantasy battle scene --mode img2img --image https://example.com/char1.png,https://example.com/char2.png

# 输出 Base64 格式
/agnes-image A professional product photo --output base64
```

### 提示词最佳实践

**文生图结构**：`[主体] + [场景/背景] + [风格] + [光照] + [构图] + [质量要求]`

示例：`A young explorer standing in an ancient temple, cinematic fantasy style, warm dramatic lighting, wide-angle composition, ultra detailed, high quality`

**图生图结构**：`[编辑指令] + [保留元素] + [目标风格/场景] + [光照] + [构图] + [质量要求]`

示例：`Change the background into a futuristic city at night while keeping the person's face, outfit, and pose unchanged`

### 常见问题

**Q: 输入图片 URL 不可访问怎么办？**

使用公网可访问的 HTTPS 图片地址，或使用 Data URI Base64 格式（`data:image/png;base64,...`）。

**Q: 请求超时怎么办？**

图片生成可能需要数秒到几十秒。已设置 6 分钟超时，如仍超时请检查网络状况。

**Q: 如何获取 API KEY？**

访问 [Agnes AI Hub](https://apihub.agnes-ai.com) 注册账号获取。

---

## English Instructions

### Feature Introduction

The Agnes AI Image Generation skill is powered by **Agnes-Image-2.0-Flash**, supporting text-to-image, image-to-image, and multi-image composition workflows. Developed by **Sapiens AI**, it has achieved ELO 1,184 on the Artificial Analysis Image Editing Leaderboard (Top 20).

### Core Capabilities

- **Text-to-Image**: Generate images from text prompts
- **Image-to-Image**: Edit, transform, or enhance existing images
- **Multi-Image Composition**: Combine multiple reference images into one
- **Style Control**: Adjust art style, lighting, layout, and visual direction

### Pricing

**Free** ($0 / image)

### Installation and Configuration

1. Place this skill directory in the openclaw skills directory
2. Install dependencies:

```bash
cd agnes-image
npm install
```

3. Set the environment variable:

```bash
export AGNES_API_KEY="your_api_key_here"
```

Or add it to the openclaw configuration:

```json
{
  "env": {
    "AGNES_API_KEY": "your_api_key_here"
  }
}
```

### Usage

```
/agnes-image <prompt> [options]
```

#### Available Options

- `--mode <value>`: Generation mode
  - `txt2img`: Text-to-image (default)
  - `img2img`: Image-to-image (requires `--image`)
- `--size <value>`: Output image size, e.g., `1024x1024`, `1024x768`, `768x1024` (default `1024x1024`)
- `--image <urls>`: Input image URL(s) or Data URI, comma-separated for multiple images (required for img2img)
- `--output <format>`: Output format, `url` (default) or `base64`

#### Examples

```bash
# Text-to-image: Product photo
/agnes-image A clean product photo of a glass cube on a white studio background, soft shadows, high detail --size 1024x768

# Image-to-image: Style transfer
/agnes-image Transform this image into a cinematic cyberpunk style --mode img2img --image https://example.com/input.png

# Multi-image composition
/agnes-image Combine the two characters into a fantasy battle scene --mode img2img --image https://example.com/char1.png,https://example.com/char2.png

# Base64 output
/agnes-image A professional product photo --output base64
```

### Prompt Best Practices

**Text-to-Image Structure**: `[Subject] + [Scene/Background] + [Style] + [Lighting] + [Composition] + [Quality]`

Example: `A young explorer standing in an ancient temple, cinematic fantasy style, warm dramatic lighting, wide-angle composition, ultra detailed, high quality`

**Image-to-Image Structure**: `[Edit Instruction] + [Elements to Preserve] + [Target Style/Scene] + [Lighting] + [Composition] + [Quality]`

Example: `Change the background into a futuristic city at night while keeping the person's face, outfit, and pose unchanged`

### FAQ

**Q: Input image URL is not accessible?**

Use a publicly accessible HTTPS URL or Data URI Base64 format (`data:image/png;base64,...`).

**Q: Request timeout?**

Image generation may take several seconds to tens of seconds. A 6-minute timeout is set. Check your network if it still times out.

**Q: How to get an API KEY?**

Register at [Agnes AI Hub](https://apihub.agnes-ai.com).

---

## 参考文档 / References

- API 文档见本目录 SKILL.md
- 官方平台：https://apihub.agnes-ai.com
- 模型：Agnes-Image-2.0-Flash
