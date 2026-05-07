# 企业微信群机器人通知技能 (wecom-notify)

企业微信群机器人通知技能，支持快速发送消息到企业微信群，可以@指定手机号的用户或者@所有人，支持普通文本和Markdown格式。

## 安装

```bash
cd wecom-notify
npm install
```

## 配置

### 方式一：环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```bash
WECOM_WEBHOOK_KEY=your_webhook_key_here
```

### 方式二：命令行参数指定

在使用时通过 `--key` 参数直接指定 webhook key。

## 获取Webhook Key

1. 打开企业微信，进入目标群聊
2. 点击群设置（右上角"..."）
3. 选择"添加群机器人"
4. 选择"新建机器人"，给机器人命名
5. 创建成功后，会获得一个Webhook地址

## 使用方法

### 1. 发送普通文本消息

```bash
/wecom 大家好，这是一条测试消息
```

### 2. 发送消息并@指定用户

```bash
/wecom 请尽快处理工单 --mobiles 13800138000,13900139000
```

### 3. 发送消息并@所有人

```bash
/wecom 紧急通知：今晚8点系统维护 --at-all true
```

### 4. 发送Markdown格式消息

```bash
/wecom "**系统上线通知**
> 新版本V2.0已上线
> - 新增AI助手功能
> - 优化性能" --type markdown
```

### 5. 使用指定的webhook key

```bash
/wecom 临时通知 --key xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 支持的Markdown语法

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

## 注意事项

- 企业微信机器人频率限制：每个机器人发送的消息不能超过20条/分钟
- @功能仅在text类型消息中支持，markdown类型暂不支持@用户
