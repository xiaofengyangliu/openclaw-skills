# Agnes AI 视频生成技能 / Agnes AI Video Generation Skill

## 中文说明

### 功能介绍

Agnes AI 视频生成技能是基于 **Agnes-Video-V2.0** 模型的视频生成工具，支持文生视频、图生视频、多图视频生成和关键帧动画工作流。该模型由 **Sapiens AI** 开发，面向生产环境，适用于故事创作、营销视频、产品演示、社交媒体内容等场景。

### 核心能力

- **文生视频 (Text-to-Video)**：根据文本提示词直接生成视频
- **图生视频 (Image-to-Video)**：将静态图片动画化为动态视频
- **多图视频生成**：使用多张参考图片指导视频生成
- **关键帧动画 (Keyframe Animation)**：在多个关键帧之间生成平滑过渡
- **场景运动控制**：通过提示词控制主体动作、镜头运动和场景动态
- **视觉一致性**：在多帧之间保持主体、风格和场景一致
- **电影级输出**：生成高质量电影级视频

### 适用场景

| 场景 | 示例 |
|------|------|
| 故事创作 | 短片、角色场景、叙事片段 |
| 营销视频 | 产品广告、活动视频、推广内容 |
| 社交媒体内容 | Reels、Shorts、TikTok 风格视频 |
| 图像动画化 | 动画化人像、产品、角色或场景 |
| 产品演示 | 根据文本或图像生成产品展示视频 |
| 关键帧过渡 | 在不同视觉状态之间生成平滑转场 |

### 免费使用

当前定价：**免费**（$0 / second）

### 安装和配置

1. 将本技能目录放到 openclaw 的 skills 目录下
2. 安装依赖：

```bash
cd agnes-video
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
/agnes-video <提示词> [选项]
```

#### 可用选项

- `--mode <value>`：生成模式
  - `ti2vid`：文生视频（默认）
  - `img2vid`：图生视频（需要 `--image` 参数）
  - `keyframes`：关键帧动画（需要 `--image` 参数）
- `--size <value>`：视频分辨率，如 `1152x768`、`1920x1080`、`1080x1920`（默认 `1152x768`）
- `--duration <value>`：视频时长（秒），可选 `3`、`5`、`10`、`18`（默认 `10`）
- `--fps <value>`：帧率，范围 1-60（默认 `24`）
- `--image <url>`：输入图片 URL，多图用逗号分隔（图生视频/关键帧动画必填）
- `--seed <value>`：随机种子，用于保证结果可复现
- `--negative-prompt <value>`：负向提示词，描述需要避免的内容
- `--poll-interval <value>`：查询间隔（秒），默认 `5`

#### 使用示例

```bash
# 文生视频：生成日落海滩猫咪漫步
/agnes-video A cinematic shot of a cat walking on the beach at sunset, soft ocean waves, warm golden lighting --duration 10

# 图生视频：将人像动画化
/agnes-video The woman slowly turns around and looks back at the camera --mode img2vid --image https://example.com/portrait.jpg --duration 5

# 关键帧动画：两张图片之间平滑过渡
/agnes-video Create a smooth cinematic transition between the keyframes --mode keyframes --image https://example.com/frame1.jpg,https://example.com/frame2.jpg --duration 10

# 短视频：3 秒航拍山景
/agnes-video A drone flying over a mountain range at dawn --duration 3 --fps 30

# 自定义随机种子
/agnes-video A serene lake reflecting mountains at sunrise --seed 42 --duration 10
```

### 提示词最佳实践

**文生视频结构**：`[主体] + [动作] + [场景] + [镜头运动] + [光照] + [风格]`

示例：`A young astronaut walking across a red desert planet, dust blowing in the wind, slow cinematic tracking shot, dramatic sunset lighting, realistic sci-fi style`

**图生视频结构**：`[运动指令] + [保留元素] + [镜头/光照]`

示例：`Animate the character with subtle breathing motion, hair moving gently in the wind, background lights flickering softly, while keeping the face and outfit consistent`

### 常见问题

**Q: 视频生成需要多长时间？**

视频生成是异步任务，通常需要几分钟，取决于视频时长和复杂度。请耐心等待轮询结果。

**Q: 输入图片 URL 不可访问怎么办？**

使用公网可访问的 HTTPS 图片地址。

**Q: 如何获取 API KEY？**

访问 [Agnes AI Hub](https://apihub.agnes-ai.com) 注册账号获取。

---

## English Instructions

### Feature Introduction

The Agnes AI Video Generation skill is powered by **Agnes-Video-V2.0**, supporting text-to-video, image-to-video, multi-image video, and keyframe animation workflows. Developed by **Sapiens AI**, it is production-ready for storytelling, marketing videos, product demos, and social media content.

### Core Capabilities

- **Text-to-Video**: Generate videos directly from text prompts
- **Image-to-Video**: Animate static images into dynamic videos
- **Multi-Image Video**: Use multiple reference images to guide video generation
- **Keyframe Animation**: Generate smooth transitions between keyframes
- **Scene Motion Control**: Control subject actions, camera movement, and scene dynamics via prompts
- **Visual Consistency**: Maintain subject, style, and scene consistency across frames
- **Cinematic Output**: Generate high-quality cinematic videos

### Pricing

**Free** ($0 / second)

### Installation and Configuration

1. Place this skill directory in the openclaw skills directory
2. Install dependencies:

```bash
cd agnes-video
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
/agnes-video <prompt> [options]
```

#### Available Options

- `--mode <value>`: Generation mode
  - `ti2vid`: Text-to-video (default)
  - `img2vid`: Image-to-video (requires `--image`)
  - `keyframes`: Keyframe animation (requires `--image`)
- `--size <value>`: Video resolution, e.g., `1152x768`, `1920x1080`, `1080x1920` (default `1152x768`)
- `--duration <value>`: Video duration in seconds, options: `3`, `5`, `10`, `18` (default `10`)
- `--fps <value>`: Frame rate, range 1-60 (default `24`)
- `--image <url>`: Input image URL(s), comma-separated for multiple images (required for img2vid/keyframes)
- `--seed <value>`: Random seed for reproducible results
- `--negative-prompt <value>`: Negative prompt describing content to avoid
- `--poll-interval <value>`: Polling interval in seconds (default `5`)

#### Examples

```bash
# Text-to-video: Cat on beach at sunset
/agnes-video A cinematic shot of a cat walking on the beach at sunset, soft ocean waves, warm golden lighting --duration 10

# Image-to-video: Animate a portrait
/agnes-video The woman slowly turns around and looks back at the camera --mode img2vid --image https://example.com/portrait.jpg --duration 5

# Keyframe animation: Smooth transition between two images
/agnes-video Create a smooth cinematic transition between the keyframes --mode keyframes --image https://example.com/frame1.jpg,https://example.com/frame2.jpg --duration 10

# Short video: 3-second drone shot
/agnes-video A drone flying over a mountain range at dawn --duration 3 --fps 30

# Custom seed for reproducibility
/agnes-video A serene lake reflecting mountains at sunrise --seed 42 --duration 10
```

### Prompt Best Practices

**Text-to-Video Structure**: `[Subject] + [Action] + [Scene] + [Camera Movement] + [Lighting] + [Style]`

Example: `A young astronaut walking across a red desert planet, dust blowing in the wind, slow cinematic tracking shot, dramatic sunset lighting, realistic sci-fi style`

**Image-to-Video Structure**: `[Motion Instruction] + [Elements to Preserve] + [Camera/Lighting]`

Example: `Animate the character with subtle breathing motion, hair moving gently in the wind, background lights flickering softly, while keeping the face and outfit consistent`

### FAQ

**Q: How long does video generation take?**

Video generation is an asynchronous task, typically taking a few minutes depending on duration and complexity. Please wait for the polling results.

**Q: Input image URL is not accessible?**

Use a publicly accessible HTTPS image URL.

**Q: How to get an API KEY?**

Register at [Agnes AI Hub](https://apihub.agnes-ai.com).

---

## 参考文档 / References

- API 文档见本目录 SKILL.md
- 官方平台：https://apihub.agnes-ai.com
- 模型：Agnes-Video-V2.0
