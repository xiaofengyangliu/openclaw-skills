const axios = require('axios');

module.exports = {
  name: 'agnes-image',
  description: 'Agnes AI 图像生成 - 文生图、图生图、多图合成 / Agnes AI Image Generation - Text-to-image, image-to-image, multi-image composition',
  version: '1.0.0',
  author: 'Sapiens AI',
  usage: '/agnes-image <prompt> [options]',
  options: [
    {
      name: '--mode',
      description: '生成模式。可选值：txt2img（文生图，默认）、img2img（图生图）。',
      default: 'txt2img'
    },
    {
      name: '--size',
      description: '输出图像尺寸。例如：1024x1024、1024x768、768x1024。',
      default: '1024x1024'
    },
    {
      name: '--image',
      description: '输入图片URL或Data URI（图生图/多图合成时使用，多个URL用逗号分隔）。Image input URL(s) or Data URI for image-to-image or multi-image mode.'
    },
    {
      name: '--output',
      description: '输出格式。可选值：url（默认）、base64。',
      default: 'url'
    },
    {
      name: '--count',
      description: '生成图片数量，目前固定为1。',
      default: '1'
    }
  ],
  run: async (args, options, context) => {
    const apiKey = process.env.AGNES_API_KEY;

    if (!apiKey) {
      throw new Error('AGNES_API_KEY 环境变量未设置。请先在 Agnes AI 平台注册账号并获取 API KEY。\nAGNES_API_KEY environment variable not set. Please register at https://apihub.agnes-ai.com and get your API KEY first.');
    }

    const prompt = args.join(' ');
    if (!prompt) {
      throw new Error('请输入图像描述提示词 / Please enter an image description prompt.');
    }

    const mode = options.mode || 'txt2img';
    const size = options.size || '1024x1024';
    const outputFormat = options.output || 'url';

    // Validate size format
    const sizeRegex = /^\d+x\d+$/;
    if (!sizeRegex.test(size)) {
      throw new Error('尺寸格式不正确 / Invalid size format. Example: 1024x1024');
    }

    const requestBody = {
      model: 'agnes-image-2.0-flash',
      prompt: prompt,
      size: size,
    };

    // Handle image inputs for img2img mode
    if (mode === 'img2img') {
      const rawImages = options.image;
      if (!rawImages) {
        throw new Error('图生图模式需要传入 --image 参数，支持公网 URL 或 Data URI Base64。\nImage-to-image mode requires --image parameter with public URL(s) or Data URI Base64.');
      }
      const images = rawImages.split(',').map(u => u.trim()).filter(Boolean);
      if (images.length === 0) {
        throw new Error('--image 参数不能为空 / --image parameter cannot be empty.');
      }
      requestBody.image = images;
    }

    // response_format goes inside extra_body, NOT at top level
    if (outputFormat === 'base64') {
      requestBody.return_base64 = true;
      requestBody.extra_body = {
        response_format: 'b64_json',
      };
    } else {
      requestBody.extra_body = {
        response_format: 'url',
      };
    }

    const baseUrl = 'https://apihub.agnes-ai.com/v1/images/generations';

    try {
      console.error(`⏳ 正在生成图像... / Generating image (mode: ${mode}, size: ${size})...`);

      const response = await axios.post(baseUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 360000,
      });

      const { data } = response.data;

      if (!data || data.length === 0) {
        throw new Error('未收到生成结果 / No result received from the API.');
      }

      const results = [];
      results.push(`### Agnes AI 图像生成结果 / Image Generation Result`);
      results.push('');
      results.push(`**模式 / Mode:** ${mode === 'txt2img' ? '文生图 / Text-to-Image' : '图生图 / Image-to-Image'}`);
      results.push(`**尺寸 / Size:** ${size}`);
      results.push(`**提示词 / Prompt:** ${prompt}`);
      results.push('');

      data.forEach((item, index) => {
        results.push(`---`);
        results.push(`**图片 ${index + 1} / Image ${index + 1}**`);

        if (item.url) {
          results.push(`🔗 [查看图片 / View Image](${item.url})`);
        } else if (item.b64_json) {
          results.push(`📦 Base64 数据已返回（长度: ${item.b64_json.length} 字符）`);
          results.push(`> Base64 data returned (length: ${item.b64_json.length} chars). Use with base64 output mode.`);
        } else {
          results.push(`⚠️ 未找到图片数据 / No image data found.`);
        }

        if (item.revised_prompt) {
          results.push(`📝 修订提示词 / Revised Prompt: ${item.revised_prompt}`);
        }
      });

      results.push('');
      results.push('> Agnes Image 2.0 Flash | Sapiens AI');

      return results.join('\n');

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
        throw new Error('请求超时，图片生成可能需要较长时间（通常几秒到几十秒）。请检查网络连接后重试。\nRequest timed out. Image generation may take longer than expected (typically seconds to tens of seconds). Please check your network and retry.');
      }

      throw new Error(`图像生成失败 / Image generation failed: ${error.message}`);
    }
  },
};
