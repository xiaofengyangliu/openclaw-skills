const axios = require('axios');

// Map duration to num_frames (assuming default 24 fps)
const DURATION_TO_FRAMES = {
  3: 81,
  5: 121,
  10: 241,
  18: 441,
};

module.exports = {
  name: 'agnes-video',
  description: 'Agnes AI 视频生成 - 文生视频、图生视频、多图视频、关键帧动画 / Agnes AI Video Generation - Text-to-video, image-to-video, multi-image video, keyframe animation',
  version: '1.0.0',
  author: 'Sapiens AI',
  usage: '/agnes-video <prompt> [options]',
  options: [
    {
      name: '--mode',
      description: '生成模式。可选值：ti2vid（文生视频，默认）、img2vid（图生视频）、keyframes（关键帧动画）。',
      default: 'ti2vid'
    },
    {
      name: '--size',
      description: '视频分辨率。例如：1152x768、1920x1080、1080x1920。',
      default: '1152x768'
    },
    {
      name: '--duration',
      description: '视频时长（秒）。可选值：3、5、10、18。',
      default: '10'
    },
    {
      name: '--fps',
      description: '视频帧率，范围 1-60。',
      default: '24'
    },
    {
      name: '--image',
      description: '输入图片URL，多图用逗号分隔（图生视频/关键帧动画时使用）。'
    },
    {
      name: '--seed',
      description: '随机种子，用于保证结果可复现。'
    },
    {
      name: '--negative-prompt',
      description: '负向提示词，描述需要避免的内容。'
    },
    {
      name: '--poll-interval',
      description: '查询间隔（秒），默认 5。',
      default: '5'
    }
  ],
  run: async (args, options, context) => {
    const apiKey = process.env.AGNES_API_KEY;

    if (!apiKey) {
      throw new Error('AGNES_API_KEY 环境变量未设置。请先在 Agnes AI 平台注册账号并获取 API KEY。\nAGNES_API_KEY environment variable not set. Please register at https://apihub.agnes-ai.com and get your API KEY first.');
    }

    const prompt = args.join(' ');
    if (!prompt) {
      throw new Error('请输入视频描述提示词 / Please enter a video description prompt.');
    }

    const mode = options.mode || 'ti2vid';
    const size = options.size || '1152x768';
    const duration = parseInt(options.duration) || 10;
    const fps = parseInt(options.fps) || 24;
    const pollInterval = parseInt(options['poll-interval']) || 5;
    const seed = options.seed ? parseInt(options.seed) : undefined;
    const negativePrompt = options['negative-prompt'];

    // Validate size format
    const sizeRegex = /^\d+x\d+$/;
    if (!sizeRegex.test(size)) {
      throw new Error('尺寸格式不正确 / Invalid size format. Example: 1152x768');
    }

    const [width, height] = size.split('x').map(Number);

    // Validate duration
    if (!(duration in DURATION_TO_FRAMES)) {
      throw new Error(`不支持的时长: ${duration} 秒。支持的时长：3、5、10、18 秒。\nUnsupported duration: ${duration}s. Supported: 3, 5, 10, 18 seconds.`);
    }

    // Validate fps
    if (fps < 1 || fps > 60) {
      throw new Error('帧率范围必须在 1-60 之间 / Frame rate must be between 1 and 60.');
    }

    const numFrames = DURATION_TO_FRAMES[duration];

    // Validate image requirement for img2vid and keyframes modes
    const images = options.image ? options.image.split(',').map(u => u.trim()).filter(Boolean) : [];
    if ((mode === 'img2vid' || mode === 'keyframes') && images.length === 0) {
      throw new Error(`${mode === 'img2vid' ? '图生视频' : '关键帧动画'}模式需要传入 --image 参数，支持公网 HTTPS URL。\n${mode === 'img2vid' ? 'Image-to-video' : 'Keyframe animation'} mode requires --image parameter with public HTTPS URLs.`);
    }

    // Build request body
    const requestBody = {
      model: 'agnes-video-v2.0',
      prompt: prompt,
      height: height,
      width: width,
      num_frames: numFrames,
      frame_rate: fps,
    };

    if (seed !== undefined) {
      requestBody.seed = seed;
    }

    if (negativePrompt) {
      requestBody.negative_prompt = negativePrompt;
    }

    // Handle image inputs
    if (mode === 'img2vid' && images.length > 0) {
      requestBody.image = images[0]; // Single image
    } else if (mode === 'keyframes' && images.length > 0) {
      requestBody.extra_body = {
        image: images,
        mode: 'keyframes',
      };
    }

    const baseUrl = 'https://apihub.agnes-ai.com/v1/videos';

    try {
      console.error(`⏳ 正在创建视频生成任务... / Creating video generation task (mode: ${mode}, duration: ${duration}s)...`);

      const createResponse = await axios.post(baseUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      });

      const taskData = createResponse.data;
      const videoId = taskData.video_id || taskData.id || taskData.task_id;
      const taskId = taskData.task_id || taskData.id;

      if (!videoId) {
        throw new Error('未收到有效的任务 ID / No valid task ID received from the API.');
      }

      console.error(`📋 任务已创建 / Task created. video_id: ${videoId}, status: ${taskData.status}`);

      // Poll for completion
      const result = await pollForResult(videoId, taskId, apiKey, pollInterval);

      return result;

    } catch (error) {
      if (error.response) {
        const { status, data: apiError } = error.response;

        if (status === 401) {
          throw new Error('API KEY 无效，请检查您的 API KEY 是否正确。\nInvalid API KEY, please check if your API KEY is correct.');
        } else if (status === 403) {
          throw new Error('权限不足或余额不足，请前往 Agnes AI 平台检查账户状态。\nAccess denied or insufficient balance. Please check your account at the Agnes AI platform.');
        } else if (status === 429) {
          throw new Error('请求频率达到限制，请稍后再试。\nRate limit exceeded, please try again later.');
        } else if (status === 400) {
          const errMsg = apiError?.message || apiError?.error || '未知错误';
          throw new Error(`请求参数错误 (400) / Bad request: ${errMsg}`);
        } else if (apiError && apiError.message) {
          throw new Error(`API 错误 (${status}) / API error: ${apiError.message}`);
        }
      } else if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        throw new Error('请求超时，请检查网络连接后重试。\nRequest timed out. Please check your network and retry.');
      }

      throw new Error(`视频生成失败 / Video generation failed: ${error.message}`);
    }
  },
};

/**
 * Poll for video generation result.
 * Uses video_id for querying (recommended), falls back to task_id.
 */
async function pollForResult(videoId, taskId, apiKey, pollInterval) {
  const maxAttempts = 180; // Max 15 minutes (180 * 5s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    console.error(`⏱  查询任务状态 (${attempts}/${maxAttempts})... / Checking task status (${attempts}/${maxAttempts})...`);

    await sleep(pollInterval * 1000);

    try {
      // Try video_id query first (recommended)
      let result = await queryByVideoId(videoId, apiKey);
      if (result) {
        if (result.status === 'completed') {
          return formatSuccessResult(result);
        } else if (result.status === 'failed') {
          const errorMsg = result.error ? (result.error.message || result.error || 'Unknown error') : 'Unknown error';
          throw new Error(`视频生成失败 / Video generation failed: ${errorMsg}`);
        } else if (result.status === 'completed' && result.remixed_from_video_id) {
          return formatSuccessResult(result);
        }
        // Still in progress (queued / in_progress), continue polling
      }

      // Fallback to task_id query
      result = await queryByTaskId(taskId, apiKey);
      if (result.status === 'completed') {
        return formatSuccessResult(result);
      } else if (result.status === 'failed') {
        const errorMsg = result.error ? (result.error.message || result.error || 'Unknown error') : 'Unknown error';
        throw new Error(`视频生成失败 / Video generation failed: ${errorMsg}`);
      }

      // Show progress if available
      if (result.progress !== undefined && result.progress > 0) {
        console.error(`📊 进度 / Progress: ${result.progress}%`);
      }

    } catch (error) {
      // If it's a polling error (not completion-related), rethrow
      if (error.message.includes('视频生成失败') || error.message.includes('API 错误')) {
        throw error;
      }
      console.error(`⚠️  查询出错，继续重试 / Query error, retrying: ${error.message}`);
    }
  }

  throw new Error(`视频生成超时（超过 ${maxAttempts / (60 / (pollInterval || 5))} 分钟）。任务可能仍在处理中，请稍后使用 video_id 查询结果。\nVideo generation timed out (exceeded ${Math.floor(maxAttempts * pollInterval / 60)} minutes). The task may still be processing. Use the video_id to check results later.`);
}

async function queryByVideoId(videoId, apiKey) {
  const url = `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(videoId)}`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    timeout: 30000,
  });
  return response.data;
}

async function queryByTaskId(taskId, apiKey) {
  const url = `https://apihub.agnes-ai.com/v1/videos/${taskId}`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    timeout: 30000,
  });
  return response.data;
}

function formatSuccessResult(result) {
  const videoUrl = result.remixed_from_video_id || result.video_url;
  const lines = [];
  lines.push('### Agnes AI 视频生成结果 / Video Generation Result');
  lines.push('');
  lines.push(`**状态 / Status:** ✅ 已完成 / Completed`);
  lines.push(`**视频 ID / Video ID:** ${result.video_id || result.id}`);

  if (result.size) {
    lines.push(`**分辨率 / Resolution:** ${result.size}`);
  }
  if (result.seconds) {
    lines.push(`**时长 / Duration:** ${result.seconds}s`);
  }
  if (videoUrl) {
    lines.push('');
    lines.push(`🎬 [观看视频 / Watch Video](${videoUrl})`);
  }

  lines.push('');
  lines.push('> Agnes Video V2.0 | Sapiens AI');

  return lines.join('\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
