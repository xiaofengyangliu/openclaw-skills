---
name: agnes-image
description: Agnes AI 图像生成 - 文生图、图生图、多图合成。支持快速、高质量的图像生成与编辑，适用于创意设计、营销内容、电商视觉等场景。/ Agnes AI Image Generation - Text-to-image, image-to-image, multi-image composition. Optimized for fast, high-quality image generation and editing.
version: 1.0.0
author: Sapiens AI
usage: /agnes-image <prompt> [options]
keywords:
  - image-generation
  - text-to-image
  - image-to-image
  - agnes-ai
  - ai-art
  - openclaw-skill
trigger:
  - prefix: "/agnes-image"
    description: "调用 Agnes AI 图像生成技能创建或编辑图片"
environment:
  - name: AGNES_API_KEY
    description: "Agnes AI Hub API KEY，注册地址：https://apihub.agnes-ai.com"
    required: true
options:
  - name: --mode
    description: "生成模式。可选值：txt2img（文生图，默认）、img2img（图生图）"
    default: "txt2img"
  - name: --size
    description: "输出图像尺寸，例如 1024x1024、1024x768、768x1024"
    default: "1024x1024"
  - name: --image
    description: "输入图片URL或Data URI（图生图/多图合成时使用，多个URL用逗号分隔）"
  - name: --output
    description: "输出格式。可选值：url（默认）、base64"
    default: "url"
  - name: --count
    description: "生成图片数量，目前固定为1"
    default: "1"
examples:
  - command: "/agnes-image A clean product photo of a glass cube on a white studio background, soft shadows, high detail --size 1024x768"
    description: "文生图：生成一张白色背景下的玻璃立方体产品图"
  - command: "/agnes-image Transform this image into a cinematic cyberpunk style --mode img2img --image https://example.com/input.png"
    description: "图生图：将输入图片转换为赛博朋克风格"
  - command: "/agnes-image Combine two characters into a fantasy battle scene --mode img2img --image https://example.com/char1.png,https://example.com/char2.png"
    description: "多图合成：将两张角色图片合成为战斗场景"
  - command: "/agnes-image A professional product photo --output base64"
    description: "生成图片并以 Base64 格式返回"
---

## 功能说明

Agnes-Image-2.0-Flash 是由 Sapiens AI 开发的图像生成与编辑模型，支持文生图、图生图和多图合成工作流，适用于创意设计、营销内容、电商视觉、社交内容等场景。

该模型已登上 **Artificial Analysis Image Editing Leaderboard**，取得 **ELO 1,184** 的成绩，进入 Top 20 区间。

## 注册获取 API KEY

1. 访问 [Agnes AI Hub](https://apihub.agnes-ai.com) 注册账号
2. 获取 API KEY，设置为环境变量 `AGNES_API_KEY`
3. 当前定价：**免费**（$0 / image）

## 特性

- 🎨 **文生图**：根据文本提示词生成高质量图像
- 🖼️ **图生图**：基于输入图像进行编辑、转换或增强
- 🔀 **多图合成**：输入多张参考图并合成为一张新图像
- 📐 **风格控制**：调整艺术风格、光照、布局和视觉方向
- ⚡ **快速生成**：针对快速、低成本的生产工作流优化
- 🔌 **OpenAI 兼容**：兼容 OpenAI Images API 的请求结构

## 适用场景

| 场景 | 示例 |
|------|------|
| 创意设计 | 海报、概念艺术、社交媒体视觉图 |
| 营销内容 | 产品广告、活动创意、Banner |
| 电商 | 产品图优化、场景化产品图、营销主图 |
| 社交内容 | Meme、头像、缩略图、生活方式视觉图 |
| 角色合成 | 将多个角色或参考图组合到同一场景中 |

## 使用方法

### 文生图（默认）

```
/agnes-image <prompt> [--size SIZE] [--output url|base64]
```

### 图生图

```
/agnes-image <编辑提示词> --mode img2img --image <图片URL或DataURI> [--size SIZE]
```

### 多图合成

```
/agnes-image <合成描述> --mode img2img --image <URL1>,<URL2> [--size SIZE]
```

## 提示词建议

### 文生图结构

```
[主体] + [场景/背景] + [风格] + [光照] + [构图] + [质量要求]
```

示例：`A young explorer standing in an ancient temple, cinematic fantasy style, warm dramatic lighting, wide-angle composition, ultra detailed, high quality`

### 图生图结构

```
[编辑指令] + [保留元素] + [目标风格/场景] + [光照] + [构图] + [质量要求]
```

示例：`Change the background into a cinematic fantasy temple while preserving the person's face, outfit, and pose, warm dramatic lighting, wide-angle composition, ultra detailed, high quality`

## 注意事项

- `response_format` 必须放在 `extra_body` 中，放在顶层会返回 400 错误
- 输入图片 URL 必须是公网可访问的 HTTPS 地址，或使用 Data URI Base64 格式
- 图片生成可能需要数秒到几十秒，已设置 6 分钟超时
- 图生图模式不需要传 `tags` 参数
