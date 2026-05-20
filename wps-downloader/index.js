const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * 等待下载完成
 * @param {string} downloadDir - 下载目录
 * @param {number} timeout - 超时时间(毫秒)
 * @returns {Promise<string>} - 下载的文件路径
 */
async function waitForDownload(downloadDir, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 500;

    const interval = setInterval(() => {
      const files = fs.readdirSync(downloadDir)
        .filter(file => !file.endsWith('.crdownload') && !file.endsWith('.tmp'));

      if (files.length > 0) {
        // 找到最新的文件
        const latestFile = files
          .map(file => ({ file, mtime: fs.statSync(path.join(downloadDir, file)).mtime.getTime() }))
          .sort((a, b) => b.mtime - a.mtime)[0];

        clearInterval(interval);
        resolve(path.join(downloadDir, latestFile.file));
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`下载超时 - ${timeout}ms 内未完成下载`));
      }
    }, checkInterval);
  });
}

/**
 * 尝试点击下载按钮
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<boolean>} - 是否成功点击
 */
async function tryClickDownloadButton(page) {
  // 先等待文档加载完成
  console.log('等待文档容器加载...');
  try {
    await page.waitForSelector('.doc-container', { timeout: 10000 });
  } catch (e) {
    try {
      await page.waitForSelector('.sp-preview-inner', { timeout: 10000 });
    } catch (e2) {
      // ignore
    }
  }

  // 额外等待让工具栏渲染
  await page.waitForTimeout(3000);

  // 金山文档Kdocs特定选择器 - 先尝试点击右上角的"更多"或三个点
  const moreSelectors = [
    '.toolbar-container [aria-label*="更多"]',
    '.more-actions-btn',
    '.icon-more',
    'button:contains("更多")',
    '.topbar-more',
    '.header-more'
  ];

  for (const selector of moreSelectors) {
    try {
      const escapedSelector = selector.replace(/:contains\("([^"]+)"\)/g, (_, text) => {
        return `::-p-text(${text})`;
      });
      const moreBtn = await page.$(escapedSelector);
      if (moreBtn) {
        console.log(`找到更多按钮，点击: ${selector}`);
        await moreBtn.click();
        await page.waitForTimeout(1000); // 等待菜单展开
        break;
      }
    } catch (e) {
      continue;
    }
  }

  // 常见的下载按钮选择器
  const selectors = [
    // 通用下载按钮文本
    'button:contains("下载")',
    'a:contains("下载")',
    '[aria-label*="下载"]',
    '[title*="下载"]',
    // WPS 云文档常见选择器
    '.download-btn',
    '.btn-download',
    '#downloadBtn',
    '[data-testid="download-button"]',
    '.tool-bar button[aria-label*="下载"]',
    '.header-toolbar button[data-name="download"]',
    // 金山文档/飞书表格常见选择器
    '.wps-download-button',
    '.kw-spreadsheet-download-btn',
    '.doc-download-btn',
    // 金山文档特定选择器
    '.menu-item:contains("下载")',
    '.dropdown-item:contains("下载")',
    '.kdocs-download',
    '#downloadButton',
    '.toolbar [data-click="download"]',
    '.file-toolbar .download',
    // 任何包含 download 的类或 id
    '[class*="download"] button',
    '[id*="download"] button',
    'a[href*="download"]',
    // 带图标的按钮
    '[class*="icon-download"]',
    '.icon-download'
  ];

  for (const selector of selectors) {
    try {
      // 转义选择器
      const escapedSelector = selector.replace(/:contains\("([^"]+)"\)/g, (_, text) => {
        return `::-p-text(${text})`;
      });

      const button = await page.$(escapedSelector);
      if (button) {
        await button.click();
        console.log(`成功点击下载按钮，选择器: ${selector}`);
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  // 如果上面都没找到，尝试通过文本查找所有按钮
  try {
    const buttons = await page.$$('button, a, li, div');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent.toLowerCase());
      if (text.includes('下载') || text.includes('download')) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) { // 只点击可见元素
          await button.click();
          console.log('通过文本匹配找到并点击了下载按钮');
          return true;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // 尝试点击右上角下载按钮（金山文档特定位置）
  try {
    const topRightButtons = await page.$$('.top-bar-right button, .header-right button');
    for (const btn of topRightButtons) {
      const text = await btn.evaluate(el => el.textContent.toLowerCase());
      const ariaLabel = await btn.evaluate(el => el.getAttribute('aria-label') || '');
      if (text.includes('下载') || ariaLabel.toLowerCase().includes('下载')) {
        await btn.click();
        console.log('在右上角工具栏找到下载按钮');
        return true;
      }
    }
  } catch (e) {
    // ignore
  }

  return false;
}

module.exports = {
  name: 'wps-downloader',
  description: '浏览器自动化下载WPS分析文件 - 打开WPS分享链接，自动点击下载按钮下载文件',
  version: '1.0.0',
  author: 'xuzhisheng',

  usage: '/wps-downloader <wps-url> [options]',

  options: [
    {
      name: '--output',
      description: '下载文件保存目录，默认为当前目录',
      default: process.cwd(),
      required: false
    },
    {
      name: '--timeout',
      description: '页面加载和下载超时时间(毫秒)，默认为 60000',
      default: '60000',
      required: false
    },
    {
      name: '--headless',
      description: '是否使用无头模式，默认为 true',
      default: 'true',
      required: false
    }
  ],

  /**
   * 执行下载
   * @param {string[]} args - 参数数组
   * @param {Object} options - 选项对象
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 执行结果
   */
  run: async (args, options, context) => {
    const wpsUrl = args[0] || options.url;

    if (!wpsUrl) {
      return {
        success: false,
        message: `
错误: 缺少WPS分享链接参数。

使用方法:
  /wps-downloader <wps-url> [options]

示例:
  /wps-downloader https://kdocs.cn/l/xxxxxxxxxx
  /wps-downloader https://kdocs.cn/l/xxxxxxxxxx --output ./downloads
        `.trim()
      };
    }

    // 验证URL格式
    if (!wpsUrl.startsWith('http')) {
      return {
        success: false,
        message: `错误: URL必须以 http 或 https 开头，请检查输入: ${wpsUrl}`
      };
    }

    // WPS/金山文档链接验证
    const isWpsUrl = wpsUrl.includes('wps.cn') || wpsUrl.includes('kdocs.cn') || wpsUrl.includes('kingsoft.com');
    if (!isWpsUrl) {
      console.log(`警告: 链接看起来不是WPS/金山文档链接，但仍会尝试下载`);
    }

    const outputDir = options.output || process.cwd();
    const timeout = parseInt(options.timeout || '60000', 10);
    const headless = options.headless !== 'false';

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let browser = null;

    try {
      console.log(`正在启动浏览器... URL: ${wpsUrl}`);
      console.log(`下载目录: ${outputDir}`);

      const launchOptions = {
        headless: headless ? 'new' : false,
        timeout: timeout
      };

      // 支持从环境变量获取Chrome可执行文件路径
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      } else if (process.platform === 'darwin') {
        // macOS 默认Chrome路径
        const macChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        if (fs.existsSync(macChromePath)) {
          launchOptions.executablePath = macChromePath;
        }
      }

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      page.setDefaultTimeout(timeout);

      // 设置下载行为
      const client = await page.target().createCDPSession();
      await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: outputDir
      });

      console.log(`正在打开WPS页面...`);
      await page.goto(wpsUrl, {
        waitUntil: 'networkidle2',
        timeout: timeout
      });

      // 等待页面完全加载，可能需要一些时间让JS渲染
      console.log(`等待页面渲染完成...`);
      await page.waitForNetworkIdle({ idleTime: 2000, timeout: timeout });
      await page.waitForTimeout(3000); // 额外等待，确保所有元素加载完成

      console.log(`寻找下载按钮...`);
      const clicked = await tryClickDownloadButton(page);

      if (!clicked) {
        await browser.close();
        return {
          success: false,
          message: `
错误: 在页面中未找到下载按钮。

可能的原因:
1. 链接需要登录权限才能下载
2. 分享链接设置了禁止下载
3. 页面结构发生了变化，需要更新选择器

请检查链接是否可以公开访问并允许下载。
          `.trim()
        };
      }

      console.log(`已点击下载按钮，等待下载完成...`);
      const downloadedFile = await waitForDownload(outputDir, timeout);

      const fileName = path.basename(downloadedFile);
      const fileSize = (fs.statSync(downloadedFile).size / 1024 / 1024).toFixed(2);

      await browser.close();

      return {
        success: true,
        message: `
✅ 下载成功!

文件信息:
- 文件名: ${fileName}
- 大小: ${fileSize} MB
- 路径: ${downloadedFile}
- 来源: ${wpsUrl}
        `.trim(),
        data: {
          filePath: downloadedFile,
          fileName: fileName,
          fileSizeMb: parseFloat(fileSize),
          sourceUrl: wpsUrl
        }
      };

    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // ignore
        }
      }

      return {
        success: false,
        message: `下载失败: ${error.message}`,
        error: error
      };
    }
  }
};
