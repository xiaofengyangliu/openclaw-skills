const axios = require('axios');

module.exports = {
  name: 'wecom',
  description: '企业微信群机器人通知 - 发送消息到企业微信群，支持@指定手机号用户',
  version: '1.0.0',
  author: 'xuzhisheng',
  usage: '/wecom <content> [options]',
  options: [
    {
      name: '--mobiles',
      description: '要@的用户手机号，多个用逗号分隔（如：13800138000,13900139000）'
    },
    {
      name: '--at-all',
      description: '是否@所有人。可选值：true, false',
      default: 'false'
    },
    {
      name: '--type',
      description: '消息类型。可选值：text, markdown',
      default: 'text'
    },
    {
      name: '--key',
      description: '机器人webhook key（优先级高于环境变量）'
    }
  ],
  run: async (args, options, context) => {
    const webhookKey = options.key || process.env.WECOM_WEBHOOK_KEY;

    if (!webhookKey) {
      throw new Error('WECOM_WEBHOOK_KEY 环境变量未设置。请先在企业微信群中添加机器人并获取webhook key，或者通过 --key 参数指定。\n获取方式：企业微信群设置 -> 添加群机器人 -> 新建机器人 -> 获取Webhook地址中的key参数');
    }

    const content = args.join(' ');
    if (!content) {
      throw new Error('请输入要发送的消息内容');
    }

    const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;

    let requestBody;
    const msgType = options.type === 'markdown' ? 'markdown' : 'text';

    if (msgType === 'markdown') {
      requestBody = {
        msgtype: 'markdown',
        markdown: {
          content: content
        }
      };
    } else {
      const mentionedMobileList = [];
      if (options.mobiles) {
        mentionedMobileList.push(...options.mobiles.split(',').map(m => m.trim()));
      }

      requestBody = {
        msgtype: 'text',
        text: {
          content: content,
          mentioned_list: [],
          mentioned_mobile_list: mentionedMobileList
        }
      };

      if (options['at-all'] === 'true') {
        requestBody.text.mentioned_mobile_list.push('@all');
      }
    }

    try {
      const response = await axios.post(webhookUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const { errcode, errmsg } = response.data;

      if (errcode !== 0) {
        throw new Error(`发送失败: ${errmsg} (errcode: ${errcode})`);
      }

      const result = [];
      result.push('✅ 企业微信通知发送成功！');
      result.push('');
      result.push('**消息内容：**');
      result.push(content);
      result.push('');
      result.push('**消息类型：** ' + msgType);

      if (msgType === 'text') {
        if (options['at-all'] === 'true') {
          result.push('**@对象：** 所有人');
        } else if (options.mobiles) {
          result.push(`**@对象：** ${options.mobiles}`);
        }
      }

      return result.join('\n');

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        throw new Error(`发送失败 (${status}): ${JSON.stringify(data)}`);
      }
      throw new Error(`发送失败: ${error.message}`);
    }
  }
};
