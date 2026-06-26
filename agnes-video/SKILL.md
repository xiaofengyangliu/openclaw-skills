---
name: agnes-video
description: Agnes AI 视频生成 - 文生视频、图生视频、多图视频、关键帧动画。支持异步任务式 API，适用于故事创作、营销视频、产品演示、社交媒体内容等场景。/ Agnes AI Video Generation - Text-to-video, image-to-video, multi-image video, keyframe animation. Asynchronous task-based API for storytelling, marketing, product demos, social media content.
version: 1.0.0
author: Sapiens AI
usage: /agnes-video <prompt> [options]
keywords:
  - video-generation
  - text-to-video
  - image-to-video
  - keyframe-animation
  - agnes-ai
  - ai-video
  - openclaw-skill
trigger:
  - prefix: "/agnes-video"
    description: "调用 Agnes AI 视频生成技能创建视频"
environment:
  - name: AGNES_API_KEY
    description: "Agnes AI Hub API KEY，注册地址：https://apihub.agnes-ai.com"
    required: true
options:
  - name: --mode
    description: "生成模式。可选值：ti2vid（文生视频，默认）、img2vid（图生视频）、keyframes（关键帧动画）"
    default: "ti2vid"
  - name: --size
    description: "视频分辨率，例如 1152x768、1920x1080、1080x1920"
    default: "1152x768"
  - name: --duration
    description: "视频时长（秒）。可选值：3、5、10、18。默认 10"
    default: "10"
  - name: --image
    description: "输入图片URL，图生视频或关键帧动画时使用。多图用逗号分隔"
  - name: --fps
    description: "视频帧率。可选值：1-60，默认 24"
    default: "24"
  - name: --seed
    description: "随机种子，用于保证结果可复现"
  - name: --negative-prompt
    description: "负向提示词，描述需要避免的内容"
  - name: --poll-interval
    description: "查询间隔（秒），默认 5"
    default: "5"
examples:
  - command: "/agnes-video A cinematic shot of a cat walking on the beach at sunset, soft ocean waves, warm golden lighting --duration 10"
    description: "文生视频：生成一段日落海滩上猫咪漫步的电影感视频"
  - command: "/agnes-video The woman slowly turns around and looks back at the camera --mode img2vid --image https://example.com/portrait.jpg --duration 5"
    description: "图生视频：将静态人像动画化"
  - command: "/agnes-video Create a smooth transformation between the two images --mode keyframes --image https://example.com/frame1.jpg,https://example.com/frame2.jpg --duration 10"
    description: "关键帧动画：在两张图片之间生成平滑过渡"
  - command: "/agnes-video A drone flying over a mountain range at dawn --duration 3 --fps 30"
    description: "短视频：生成3秒航拍山景短视频"
---

## 功能说明

Agnes-Video-V2.0 是由 Sapiens AI 开发的生产级视频生成模型，支持文生视频、图生视频、多图视频生成和关键帧动画工作流。

## 注册获取 API KEY

1. 访问 [Agnes AI Hub](https://apihub.agnes-ai.com) 注册账号
2. 获取 API KEY，设置为环境变量 `AGNES_API_KEY`
3. 当前定价：**免费**（$0 / second）

## 特性

- 🎬 **文生视频**：根据文本提示词直接生成视频
- 🖼️ **图生视频**：将静态图片动画化为动态视频
- 🔀 **多图视频生成**：使用多张参考图片指导视频生成
- 🎞️ **关键帧动画**：在多个关键帧之间生成平滑过渡
- 🎥 **场景运动控制**：通过提示词控制主体动作、镜头运动和场景动态
- 🎭 **视觉一致性**：在多帧之间保持主体、风格和场景一致
- 🎬 **电影级输出**：生成高质量电影级视频
- ⚙️ **异步 API**：先提交任务，再查询生成结果

## 使用方法

### 文生视频（默认）

```
/agnes-video <提示词> [--size SIZE] [--duration SECONDS] [--fps FPS] [--negative-prompt TEXT]
```

### 图生视频

```
/agnes-video <运动描述> --mode img2vid --image <图片URL> [--duration SECONDS]
```

### 关键帧动画

```
/agnes-video <过渡描述> --mode keyframes --image <URL1>,<URL2> [--duration SECONDS]
```

## 参数详解

### 分辨率（--size）

模型支持 480p、720p、1080p 三个标准档位，系统会自动标准化最接近的尺寸。

推荐宽高比：

| 宽高比 | 推荐场景 |
|------|---------|
| 16:9 | 横屏视频、产品演示、YouTube 风格内容 |
| 9:16 | 竖屏短视频、TikTok / Reels / Shorts |
| 1:1  | 方形视频、社交媒体 Feed |
| 4:3  | 传统横向画幅 |
| 3:4  | 竖向展示、人物主体突出 |

### 时长控制

```
seconds = num_frames / frame_rate
```

`num_frames` 必须满足 `8n + 1` 且 ≤ 441。

| 目标时长 | 推荐参数 |
|--------|---------|
| 约 3 秒 | num_frames: 81, frame_rate: 24 |
| 约 5 秒 | num_frames: 121, frame_rate: 24 |
| 约 10 秒 | num_frames: 241, frame_rate: 24 |
| 约 18 秒 | num_frames: 441, frame_rate: 24 |

### 提示词最佳实践

**文生视频结构**：`[主体] + [动作] + [场景] + [镜头运动] + [光照] + [风格]`

示例：`A young astronaut walking across a red desert planet, dust blowing in the wind, slow cinematic tracking shot, dramatic sunset lighting, realistic sci-fi style`

**图生视频结构**：`[运动指令] + [保留元素] + [镜头/光照]`

示例：`Animate the character with subtle breathing motion, hair moving gently in the wind, background lights flickering softly, while keeping the face and outfit consistent`

**关键帧动画结构**：`[过渡描述] + [一致性要求] + [镜头运动]`

示例：`Create a smooth transition from the first keyframe to the second keyframe, maintaining character identity, consistent camera angle, and natural motion between scenes`

## 工作流程

1. 调用 API 创建视频生成任务，获得 `video_id`
2. 轮询查询任务状态（queued → in_progress → completed / failed）
3. 任务完成后返回视频 URL（`remixed_from_video_id` 字段）

## 注意事项

- 视频生成是异步任务，需要轮询查询结果
- 推荐使用 `video_id` 查询视频结果（旧版 `task_id` 查询仍兼容）
- 视频 URL 仅在 `status` 为 `completed` 时可用
- `num_frames` 必须满足 `8n + 1` 且 ≤ 441
- 图生视频和关键帧动画需要公网可访问的图片 URL
- 默认轮询间隔 5 秒，可通过 `--poll-interval` 调整
- 超时时间较长（最长 15 分钟），因为视频生成需要较多推理时间
