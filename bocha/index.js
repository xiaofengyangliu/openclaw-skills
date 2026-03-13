const axios = require('axios');

module.exports = {
  name: 'bocha',
  description: '博查AI搜索 - 从全网搜索任何网页信息和网页链接，结果准确、摘要完整，更适合AI使用。/ Bocha AI Search - Search web information and links from the entire network, with accurate results and complete summaries, more suitable for AI use.',
  version: '1.0.0',
  author: 'Bocha AI',
  usage: '/bocha <query> [options]',
  options: [
    {
      name: '--freshness',
      description: '搜索指定时间范围内的网页。可选值：noLimit, oneDay, oneWeek, oneMonth, oneYear, YYYY-MM-DD..YYYY-MM-DD, YYYY-MM-DD',
      default: 'noLimit'
    },
    {
      name: '--summary',
      description: '是否显示文本摘要。可选值：true, false',
      default: 'false'
    },
    {
      name: '--include',
      description: '指定搜索的网站范围。多个域名使用|或,分隔'
    },
    {
      name: '--exclude',
      description: '排除搜索的网站范围。多个域名使用|或,分隔'
    },
    {
      name: '--count',
      description: '返回结果的条数，范围1-50',
      default: '10'
    },
    {
      name: '--images',
      description: '是否返回图片结果。可选值：true, false',
      default: 'false'
    }
  ],
  run: async (args, options, context) => {
    const apiKey = process.env.BOCHA_API_KEY;

    if (!apiKey) {
      throw new Error('BOCHA_API_KEY 环境变量未设置。请先在博查AI开放平台(https://open.bocha.cn)注册账号并获取API KEY。\nBOCHA_API_KEY environment variable not set. Please register an account at Bocha AI Open Platform (https://open.bocha.cn) and get your API KEY first.');
    }

    const query = args.join(' ');
    if (!query) {
      throw new Error('请输入搜索关键词 / Please enter search keywords');
    }

    const requestBody = {
      query,
      freshness: options.freshness || 'noLimit',
      summary: options.summary === 'true',
      count: parseInt(options.count) || 10
    };

    if (options.include) requestBody.include = options.include;
    if (options.exclude) requestBody.exclude = options.exclude;

    try {
      const response = await axios.post('https://api.bocha.cn/v1/web-search', requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const { code, msg, data } = response.data;

      if (code !== 200) {
        throw new Error(`API 调用失败 / API call failed: ${msg || '未知错误 / Unknown error'} (code: ${code})`);
      }

      const result = [];

      // 处理网页结果
      if (data.webPages && data.webPages.value && data.webPages.value.length > 0) {
        result.push(`### 🔍 搜索结果 / Search Results (${data.webPages.totalEstimatedMatches} 个结果 / results)`);
        result.push('');

        data.webPages.value.forEach((page, index) => {
          result.push(`${index + 1}. **${page.name}**`);
          result.push(`   🔗 ${page.url}`);
          if (page.siteName) {
            result.push(`   🌐 ${page.siteName}`);
          }
          if (page.datePublished) {
            result.push(`   📅 ${page.datePublished.split('T')[0]}`);
          }
          result.push(`   ${page.snippet}`);
          if (page.summary && requestBody.summary) {
            result.push(`   📝 ${page.summary}`);
          }
          result.push('');
        });
      }

      // 处理图片结果
      if (options.images === 'true' && data.images && data.images.value && data.images.value.length > 0) {
        result.push('### 🖼️ 图片结果 / Image Results');
        result.push('');

        data.images.value.slice(0, 5).forEach((image, index) => {
          result.push(`${index + 1}. ![${image.name || 'Image'}](${image.thumbnailUrl})`);
          result.push(`   🔗 ${image.contentUrl}`);
          if (image.hostPageUrl) {
            result.push(`   来源页面 / Source: ${image.hostPageUrl}`);
          }
          result.push('');
        });
      }

      if (result.length === 0) {
        result.push('❌ 没有找到相关结果 / No relevant results found');
      }

      return result.join('\n');

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          throw new Error('API KEY 无效，请检查您的API KEY是否正确。/ Invalid API KEY, please check if your API KEY is correct.');
        } else if (status === 403) {
          throw new Error('余额不足，请前往 https://open.bocha.cn 进行充值。/ Insufficient balance, please recharge at https://open.bocha.cn.');
        } else if (status === 429) {
          throw new Error('请求频率达到限制，请稍后再试。/ Request rate limit reached, please try again later.');
        } else if (data && data.message) {
          throw new Error(`API 错误 / API error: ${data.message}`);
        }
      }
      throw new Error(`搜索失败 / Search failed: ${error.message}`);
    }
  }
};
