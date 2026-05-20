// 尝试从多个位置加载puppeteer
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  try {
    puppeteer = require('../wps-downloader/node_modules/puppeteer');
  } catch (e2) {
    throw new Error('无法加载puppeteer，请先运行 npm install puppeteer');
  }
}
const fs = require('fs');
const path = require('path');

/**
 * 获取所有页签名称
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<string[]>} - 页签名称数组
 */
async function getSheetNames(page) {
  const sheetSelectors = [
    '.sheet-tab',
    '.spreadsheet-tab',
    '.tab-item',
    '.sheet-name',
    '.kw-sheet-tab',
    '[class*="sheet"] [class*="tab"]',
    '[class*="tab"] [class*="sheet"]'
  ];

  for (const selector of sheetSelectors) {
    try {
      const sheetNames = await page.evaluate((sel) => {
        const tabs = Array.from(document.querySelectorAll(sel));
        return tabs
          .map(tab => tab.textContent?.trim())
          .filter(name => name && name.length > 0);
      }, selector);

      if (sheetNames.length > 0) {
        console.log(`找到 ${sheetNames.length} 个页签: ${sheetNames.join(', ')}`);
        return sheetNames;
      }
    } catch (e) {
      continue;
    }
  }

  // 如果没有找到页签，尝试通用方式查找所有标签
  try {
    const allTabs = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('div, span, li'));
      const tabElements = allElements.filter(el => {
        const className = el.className || '';
        const text = el.textContent?.trim() || '';
        return (className.includes('tab') || className.includes('sheet'))
          && text.length > 0
          && text.length < 50
          && el.offsetParent !== null;
      });
      return tabElements.map(el => el.textContent.trim());
    });

    if (allTabs.length > 0) {
      // 去重
      const uniqueTabs = [...new Set(allTabs)];
      console.log(`通过通用方式找到 ${uniqueTabs.length} 个页签: ${uniqueTabs.join(', ')}`);
      return uniqueTabs;
    }
  } catch (e) {
    // ignore
  }

  console.log('未找到明确的页签，将尝试提取当前页面内容');
  return ['Sheet1'];
}

/**
 * 获取当前显示的页签名称
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<string>} - 当前页签名称
 */
async function getCurrentSheet(page) {
  return await page.evaluate(() => {
    // 查找高亮/激活的页签
    const selectors = [
      '.sheet-tab.active span',
      '.sheet-tab[class*="active"]',
      '.tab-item[class*="active"]',
      '[class*="sheet"][class*="tab"][class*="active"]',
      'div[role="tab"][aria-selected="true"]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent?.trim()) {
        return el.textContent.trim();
      }
    }

    return '';
  });
}

/**
 * 切换到指定页签
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @param {string} sheetName - 页签名称
 * @returns {Promise<boolean>} - 是否成功切换
 */
async function switchToSheet(page, sheetName) {
  try {
    // 先获取当前页签
    const currentSheet = await getCurrentSheet(page);
    if (currentSheet === sheetName) {
      console.log(`已经在页签 ${sheetName}，无需切换`);
      return true;
    }

    // 金山文档页签的正确选择器
    const selectors = [
      '.sheet-name',          // 从调试信息中找到的
      '.et-status-sheet-item',
      '.item-content',
      '.ks-menu-item'
    ];

    for (const sel of selectors) {
      const tabs = await page.$$(sel);
      for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent?.trim(), tab);
        if (text === sheetName) {
          try {
            await tab.click();
            await page.waitForTimeout(2500);

            // 验证是否切换成功
            const newSheet = await getCurrentSheet(page);
            if (newSheet === sheetName || newSheet === '') {
              console.log(`成功切换到页签: ${sheetName}`);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    console.log(`无法切换到页签: ${sheetName}`);
    return false;
  } catch (e) {
    console.log(`切换页签异常: ${e.message}`);
    return false;
  }
}

/**
 * 通过全选复制获取当前页内容
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<string>} - 提取的内容
 */
async function extractContentBySelectAll(page) {
  try {
    // 先点击Canvas获取焦点（金山文档使用Canvas渲染）
    const canvas = await page.$('canvas');
    if (canvas) {
      await canvas.click({ offset: { x: 200, y: 100 } });
      await page.waitForTimeout(800);
      await canvas.click({ offset: { x: 300, y: 200 } });
      await page.waitForTimeout(500);
    }

    // 额外点击页面中心
    await page.mouse.click(500, 400);
    await page.waitForTimeout(500);

    // 全选 (Cmd+A) - 尝试两次
    for (let i = 0; i < 2; i++) {
      await page.keyboard.down('Meta');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Meta');
      await page.waitForTimeout(800);
    }

    // 复制 (Cmd+C) - 尝试两次
    for (let i = 0; i < 2; i++) {
      await page.keyboard.down('Meta');
      await page.keyboard.press('KeyC');
      await page.keyboard.up('Meta');
      await page.waitForTimeout(800);
    }

    // 获取剪贴板内容
    const content = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch(e) {
        return '';
      }
    });

    // 过滤掉URL或太短的内容
    if (content && !content.startsWith('http') && content.length > 100) {
      return content;
    }

    return '';
  } catch (e) {
    console.log(`全选复制失败: ${e.message}`);
    return '';
  }
}

/**
 * 过滤掉CSS类名等垃圾内容
 * @param {string} text - 原始文本
 * @returns {string} - 清理后的文本
 */
function cleanContent(text) {
  if (!text) return '';

  // 移除CSS类名样式行（.kd-xxx{...}）
  text = text.replace(/^\..*?\{.*?\}\s*$/gm, '');

  // 移除看起来像CSS变量的行
  text = text.replace(/^--[\w-]+:.*?$/gm, '');

  // 移除重复的空行
  text = text.replace(/\n{3,}/g, '\n\n');

  // 移除只包含数字或特殊字符的短行（可能是UI元素）
  text = text.replace(/^[\d\s.，、]{1,5}$/gm, '');

  return text.trim();
}

/**
 * 高级提取方法：针对金山文档的canvas表格，查找虚拟DOM中的数据
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<string>} - 提取的内容
 */
async function extractKdocsAdvanced(page) {
  try {
    const content = await page.evaluate(() => {
      const results = [];

      // 1. 查找所有可能包含表格数据的元素
      const allElements = document.querySelectorAll('*');

      // 2. 查找有定位样式的div（可能是单元格）
      const positionedDivs = [];
      allElements.forEach(el => {
        const style = el.getAttribute('style') || '';
        const text = el.textContent?.trim();
        if (style.includes('position: absolute') && text && text.length > 0 && text.length < 200) {
          // 检查是否在可见区域且不包含子元素
          if (el.children.length === 0 && el.offsetParent !== null) {
            positionedDivs.push({
              text,
              left: parseInt(el.style.left) || 0,
              top: parseInt(el.style.top) || 0
            });
          }
        }
      });

      // 3. 按位置排序并分组
      if (positionedDivs.length > 50) {
        // 按top分组（行），然后按left排序（列）
        const rows = {};
        positionedDivs.forEach(cell => {
          const rowKey = Math.floor(cell.top / 20) * 20; // 近似行高
          if (!rows[rowKey]) rows[rowKey] = [];
          rows[rowKey].push(cell);
        });

        // 按行号排序，每行内按列排序
        const sortedRows = Object.keys(rows)
          .map(k => parseInt(k))
          .sort((a, b) => a - b);

        sortedRows.forEach(rowTop => {
          const rowCells = rows[rowTop].sort((a, b) => a.left - b.left);
          const rowText = rowCells.map(c => c.text).join(' \\t ');
          results.push(rowText);
        });

        return results.join('\\n');
      }

      // 4. 备用：查找所有文本节点，按位置过滤
      if (results.length === 0) {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim();
          if (text && text.length > 0 && text.length < 100) {
            // 过滤CSS和UI文本
            if (!text.includes('{') && !text.includes('}') &&
                !text.includes('--') && !text.includes('var(') &&
                !text.includes('图标') && !text.includes('按钮')) {
              const rect = node.parentElement?.getBoundingClientRect();
              if (rect && rect.top > 100 && rect.top < 2000) { // 表格区域
                textNodes.push({
                  text,
                  y: rect.top,
                  x: rect.left
                });
              }
            }
          }
        }

        // 按y坐标分组
        const rows = {};
        textNodes.forEach(item => {
          const rowKey = Math.floor(item.y / 25) * 25;
          if (!rows[rowKey]) rows[rowKey] = [];
          rows[rowKey].push(item);
        });

        const sortedRows = Object.keys(rows)
          .map(k => parseInt(k))
          .sort((a, b) => a - b);

        sortedRows.forEach(rowKey => {
          const rowItems = rows[rowKey].sort((a, b) => a.x - b.x);
          const rowText = rowItems.map(i => i.text).join(' \\t ');
          if (rowText.length > 5) {
            results.push(rowText);
          }
        });
      }

      return results.join('\\n');
    });

    return content;
  } catch (e) {
    console.log(`高级提取失败: ${e.message}`);
    return '';
  }
}

/**
 * 通过DOM提取表格内容（专门针对金山文档优化）
 * @param {puppeteer.Page} page - Puppeteer page 对象
 * @returns {Promise<string>} - 提取的内容
 */
async function extractContentFromDOM(page) {
  try {
    // 先尝试高级提取
    let content = await extractKdocsAdvanced(page);

    // 如果高级提取内容太少，使用备用方案
    if (!content || content.length < 100) {
      content = await page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              const parent = node.parentElement;
              if (!parent || parent.offsetParent === null) {
                return NodeFilter.FILTER_REJECT;
              }

              const tag = parent.tagName?.toLowerCase();
              if (['svg', 'style', 'script', 'noscript', 'button', 'iframe'].includes(tag)) {
                return NodeFilter.FILTER_REJECT;
              }

              const className = parent.className || '';
              if (className.includes('toolbar') || className.includes('menu') ||
                  className.includes('button') || className.includes('icon') ||
                  className.includes('header')) {
                return NodeFilter.FILTER_REJECT;
              }

              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        const texts = [];
        let node;
        while ((node = walker.nextNode())) {
          const content = node.textContent.trim();
          if (content && content.length < 200 && content.length > 0) {
            // 过滤CSS类名和UI元素
            if (!content.includes('{') && !content.includes('}') &&
                !content.includes('--kd') && !content.includes('var(')) {
              texts.push(content);
            }
          }
        }
        return texts.join('\\n');
      });
    }

    return cleanContent(content);
  } catch (e) {
    console.log(`DOM提取失败: ${e.message}`);
    return '';
  }
}

module.exports = {
  name: 'wps-content-extractor',
  description: '浏览器自动化提取WPS多页签内容 - 打开WPS分享链接，通过全选复制方式获取所有页签的文本内容',
  version: '1.0.0',
  author: 'xuzhisheng',

  usage: '/wps-content-extractor <wps-url> [options]',

  options: [
    {
      name: '--output',
      description: '内容保存文件路径，默认不保存到文件，直接输出',
      required: false
    },
    {
      name: '--timeout',
      description: '页面加载超时时间(毫秒)，默认为 60000',
      default: '60000',
      required: false
    },
    {
      name: '--headless',
      description: '是否使用无头模式，默认为 true',
      default: 'true',
      required: false
    },
    {
      name: '--sheets',
      description: '指定提取的页签名称，多个用逗号分隔，默认提取所有页签',
      required: false
    }
  ],

  /**
   * 执行内容提取
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
  /wps-content-extractor <wps-url> [options]

示例:
  /wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT
  /wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --output ./content.txt
  /wps-content-extractor https://kdocs.cn/l/caKQxHOqhqnT --sheets Sheet1,Sheet2
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
      console.log(`警告: 链接看起来不是WPS/金山文档链接，但仍会尝试提取`);
    }

    const outputFile = options.output;
    const timeout = parseInt(options.timeout || '60000', 10);
    const headless = options.headless !== 'false';
    const specifiedSheets = options.sheets ? options.sheets.split(',').map(s => s.trim()) : null;

    let browser = null;

    try {
      console.log(`正在启动浏览器... URL: ${wpsUrl}`);

      const launchOptions = {
        headless: headless ? 'new' : false,
        timeout: timeout,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--clipboard-read'
        ]
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

      // 设置浏览器上下文允许剪贴板访问
      const context = browser.defaultBrowserContext();
      await context.overridePermissions('https://kdocs.cn', ['clipboard-read', 'clipboard-write']);
      await context.overridePermissions('https://www.kdocs.cn', ['clipboard-read', 'clipboard-write']);

      console.log(`正在打开WPS页面...`);
      await page.goto(wpsUrl, {
        waitUntil: 'networkidle2',
        timeout: timeout
      });

      // 等待页面完全加载
      console.log(`等待页面渲染完成...`);
      await page.waitForNetworkIdle({ idleTime: 2000, timeout: timeout });
      await page.waitForTimeout(3000);

      // 关闭登录弹窗
      console.log(`检查并关闭登录弹窗...`);
      const closeSelectors = [
        '.kd-icon-symbol_cross_two',
        '.kd-icon.kd-icon-symbol_cross_two',
        '[class*="symbol_cross"]',
        '.close-btn',
        '.modal-close',
        '[aria-label="关闭"]',
        '.kd-dialog-close'
      ];

      for (const selector of closeSelectors) {
        try {
          const closeBtn = await page.$(selector);
          if (closeBtn) {
            await closeBtn.click();
            console.log(`已点击关闭按钮: ${selector}`);
            await page.waitForTimeout(1500);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 再次检查弹窗（有些弹窗会延迟出现）
      await page.waitForTimeout(2000);
      for (const selector of closeSelectors) {
        try {
          const closeBtn = await page.$(selector);
          if (closeBtn) {
            await closeBtn.click();
            console.log(`再次点击关闭按钮: ${selector}`);
            await page.waitForTimeout(1000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 关闭"邀你登录"之类的横幅提示
      const bannerSelectors = [
        '.kd-icon-symbol_cross_two',
        '.banner-close',
        '.notification-close',
        '[class*="banner"] [class*="close"]',
        '[class*="notify"] [class*="close"]'
      ];

      for (const selector of bannerSelectors) {
        try {
          const closeBtn = await page.$(selector);
          if (closeBtn) {
            await closeBtn.click();
            console.log(`已关闭横幅提示: ${selector}`);
            await page.waitForTimeout(1000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 尝试点击空白区域关闭弹窗
      try {
        await page.mouse.click(100, 100);
        await page.waitForTimeout(1000);
      } catch (e) {}

      await page.waitForTimeout(2000);

      // 获取所有页签名称
      let sheetNames = await getSheetNames(page);

      // 如果指定了页签，过滤
      if (specifiedSheets) {
        sheetNames = sheetNames.filter(name => specifiedSheets.includes(name));
        console.log(`将提取指定页签: ${sheetNames.join(', ')}`);
      }

      // 提取每个页签的内容
      const results = {};

      for (const sheetName of sheetNames) {
        console.log(`\n正在提取页签: ${sheetName}`);

        // 切换页签
        if (sheetNames.length > 1 || sheetName !== 'Sheet1') {
          const switched = await switchToSheet(page, sheetName);
          if (!switched) {
            console.log(`警告: 无法切换到页签 ${sheetName}，将尝试提取当前可见内容`);
          }
        }

        await page.waitForTimeout(1000);

        // 尝试通过全选复制获取内容
        let content = await extractContentBySelectAll(page);

        // 如果全选复制失败，使用DOM提取作为备用
        if (!content || content.trim().length < 10) {
          console.log(`全选复制内容为空，尝试通过DOM提取...`);
          content = await extractContentFromDOM(page);
        }

        results[sheetName] = content;
        console.log(`页签 ${sheetName} 提取完成，内容长度: ${content.length} 字符`);
      }

      await browser.close();

      // 准备输出
      let outputText = '';
      for (const [sheetName, content] of Object.entries(results)) {
        outputText += `\n${'='.repeat(60)}\n`;
        outputText += `页签: ${sheetName}\n`;
        outputText += `${'='.repeat(60)}\n`;
        outputText += content || '(无内容)';
        outputText += '\n\n';
      }

      // 如果指定了输出文件，保存到文件
      if (outputFile) {
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputFile, outputText, 'utf-8');
        console.log(`\n内容已保存到: ${outputFile}`);
      }

      return {
        success: true,
        message: `
✅ 内容提取成功!

提取的页签: ${Object.keys(results).join(', ')}
${outputFile ? `保存文件: ${outputFile}` : ''}

内容预览:
${outputText.substring(0, 2000)}${outputText.length > 2000 ? '...(更多内容请查看完整输出)' : ''}
        `.trim(),
        data: {
          sheets: results,
          sheetNames: Object.keys(results),
          outputFile: outputFile,
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
        message: `内容提取失败: ${error.message}`,
        error: error
      };
    }
  }
};
