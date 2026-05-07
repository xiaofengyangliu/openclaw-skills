---
name: wecom
description: 企业微信群机器人通知 - 发送消息到企业微信群，支持@指定手机号用户，支持文本和Markdown格式
version: 1.0.0
author: xuzhisheng
usage: /wecom <content> [options]
keywords:
  - wecom
  - wechat-work
  - notification
  - webhook
  - 企业微信
  - 群通知
trigger:
  - prefix: "/wecom"
    description: "发送企业微信群机器人通知"
environment:
  - name: WECOM_WEBHOOK_KEY
    description: "企业微信群机器人Webhook的key。获取方式：企业微信群设置 -> 添加群机器人 -> 新建机器人 -> Webhook地址中的key参数"
    required: true
options:
  - name: --mobiles
    description: "要@的用户手机号，多个用逗号分隔（如：13800138000,13900139000）"
  - name: --at-all
    description: "是否@所有人。可选值：true, false"
    default: "false"
  - name: --type
    description: "消息类型。可选值：text, markdown"
    default: "text"
  - name: --key
    description: "机器人webhook key（优先级高于环境变量）"
examples:
  - command: "/wecom 大家好，这是一条测试消息"
    description: "发送普通文本消息"
  - command: "/wecom 请尽快处理工单 --mobiles 13800138000,13900139000"
    description: "发送消息并@指定手机号的用户"
  - command: "/wecom 紧急通知：今晚8点系统维护 --at-all true"
    description: "发送消息并@所有人"
  - command: "/wecom **系统上线通知**\n> 新版本V2.0已上线\n> - 新增AI助手功能\n> - 优化性能 --type markdown"
    description: "发送Markdown格式消息"
  - command: "/wecom 临时通知 --key xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    description: "使用指定的webhook key发送消息"
---

## 功能说明
企业微信群机器人通知技能，支持快速发送消息到企业微信群，可以@指定手机号的用户或者@所有人，支持普通文本和Markdown格式。

## 获取Webhook Key
1. 打开企业微信，进入目标群聊
2. 点击群设置（右上角"..."）
3. 选择"添加群机器人"
4. 选择"新建机器人"，给机器人命名
5. 创建成功后，会获得一个Webhook地址，格式如：
   `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
6. 地址中的 `key` 参数值就是需要设置的 `WECOM_WEBHOOK_KEY`

## 特性
- 📱 支持@指定手机号的用户
- 👥 支持@所有人
- 📝 支持普通文本和Markdown两种消息格式
- 🔑 支持通过环境变量或参数指定webhook key
- ⚡ 简单快速，一条命令即可发送通知

## Markdown语法支持
企业微信机器人支持以下Markdown语法：
- 标题：`# 一级标题`、`## 二级标题`
- 粗体：`**粗体文字**`
- 斜体：`*斜体文字*`
- 链接：`[显示文字](http://url.com)`
- 代码：`` `代码` ``
- 引用：`> 引用内容`
- 无序列表：`- 列表项`
- 有序列表：`1. 列表项`
- 颜色：`<font color="info">绿色</font>`、`<font color="comment">灰色</font>`
