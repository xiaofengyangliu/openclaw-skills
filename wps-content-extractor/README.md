# wps-content-extractor

浏览器自动化提取WPS/金山文档多页签内容 - 通过全选复制方式获取所有页签的文本内容

## 功能特点

- 支持WPS/金山文档公开分享链接
- 自动识别所有页签
- 通过模拟键盘全选(Ctrl+A)和复制(Ctrl+C)获取内容
- 支持指定提取特定页签
- 可选择将内容保存到文件
- 支持无头模式和可视化模式

## 使用方法

```bash
/wps-content-extractor <wps-url> [options]
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `<wps-url>` | WPS/金山文档分享链接（必需） | - |
| `--output` | 内容保存文件路径，不指定则直接输出 | - |
| `--timeout` | 页面加载超时时间(毫秒) | 60000 |
| `--headless` | 是否使用无头模式 | true |
| `--sheets` | 指定提取的页签名称，多个用逗号分隔 | 所有页签 |

### 使用示例

```bash
# 提取所有页签内容并直接输出
/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT

# 提取内容并保存到文件
/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --output ./content.txt

# 只提取指定页签
/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --sheets Sheet1,数据汇总

# 使用可视化模式（可看到浏览器操作过程）
/wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --headless false
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `PUPPETEER_EXECUTABLE_PATH` | Chrome/Chromium 可执行文件路径 |

## 工作原理

1. 使用 Puppeteer 启动浏览器并打开WPS链接
2. 自动识别页面中的所有页签名称
3. 依次切换到每个页签
4. 模拟键盘操作：全选(Ctrl+A) → 复制(Ctrl+C)
5. 从剪贴板读取内容
6. 如果全选复制失败，自动使用DOM提取作为备用方案
7. 汇总所有页签内容并输出/保存

## 注意事项

- 分享链接需要设置为"所有人可查看"
- 部分复杂表格可能需要较长的加载时间
- 剪贴板权限需要浏览器支持
- 首次运行会下载 Chromium 浏览器（约100MB）
