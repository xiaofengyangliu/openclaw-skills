const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 状态关键词定义
const COMPLETED_KEYWORDS = ['完成', '已完成', '做完', '结束', '测试完成', '已上线'];
const WATCHING_STATUSES = {
  '未开始': ['未开始'],
  '待审核': ['待审核'],
  '暂停': ['暂停', '已暂停'],
  '已提测': ['已提测'],
  '待联调': ['待联调'],
  '待测试': ['待测试'],
  '待开发': ['待开发']
};

// 日期正则表达式 - 匹配各种日期格式
const DATE_PATTERNS = [
  /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,  // YYYY-MM-DD, YYYY.MM.DD
  /(\d{1,2})[.-](\d{1,2})/,            // MM-DD
  /(\d{8})/                             // YYYYMMDD
];

/**
 * 获取飞书访问令牌
 */
async function getFeishuAccessToken(appId, appSecret) {
  try {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    app_id: appId,
    app_secret: appSecret
  }, {
    timeout: 10000
  });
  if (response.data && response.data.code === 0) {
    return response.data.tenant_access_token;
  }
  throw new Error(`获取access_token失败: ${response.data.msg || '未知错误'}`);
  } catch (error) {
    throw new Error(`飞书API调用失败: ${error.message}`);
  }
}

/**
 * 获取多维表格数据
 */
async function getBaseRecords(accessToken, appToken, tableId) {
  try {
    const response = await axios.get(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        page_size: 500
      },
      timeout: 30000
    });
    if (response.data && response.data.code === 0) {
      return response.data.data.items || [];
    }
    throw new Error(`获取表格数据失败: ${response.data.msg || '未知错误'}`);
  } catch (error) {
    throw new Error(`获取表格数据失败: ${error.message}`);
  }
}

/**
 * 从Excel文件读取数据
 */
function readExcelFile(filePath, includeSheets) {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel文件不存在: ${filePath}`);
    }

    // 读取文件
    const workbook = XLSX.readFile(filePath);
    let allRecords = [];

    // 遍历所有sheet
    for (const sheetName of workbook.SheetNames) {
      // 跳过图片专用sheet
      if (sheetName === 'WpsReserved_CellImgList') continue;

      // 如果指定了sheet范围，跳过不匹配的
      if (includeSheets && includeSheets.length > 0) {
        const matched = includeSheets.some(include => {
          // 支持模糊匹配
          return sheetName.toLowerCase().includes(include.toLowerCase());
        });
        if (!matched) continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      // 转换为JSON，第一行作为表头
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 转换为统一格式，每个记录格式 { fields: {} }
      const sheetRecords = jsonData.map(row => {
        // 对于Excel，表头已经是键名，直接作为fields
        return { fields: normalizeExcelRow(row) };
      });

      allRecords = allRecords.concat(sheetRecords);
    }

    return allRecords;
  } catch (error) {
    throw new Error(`读取Excel文件失败: ${error.message}`);
  }
}

/**
 * 标准化Excel行数据，处理特殊格式
 */
function normalizeExcelRow(row) {
  const normalized = {};
  for (let [key, value] of Object.entries(row)) {
    // 去除表头空格
    const normalizedKey = String(key).trim();

    // Excel日期处理 - 如果是Excel序列号日期，转换为Date
    if (typeof value === 'number' && value > 40000) {
      // Excel日期序列号，转换为Date
      const date = XLSX.SSF.parse_date_code(value);
      value = new Date(date.y, date.m - 1, date.d);
    }

    // 转换为字符串（除了日期数字日期保持原样）
    if (value !== null && value !== undefined && typeof value !== 'number') {
      value = String(value).trim();
    }

    normalized[normalizedKey] = value;
  }
  return normalized;
}

/**
 * 解析日期，返回Date对象
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return dateStr;
  }
  if (typeof dateStr === 'number') {
    // 飞书时间戳是毫秒 / Excel日期序列号
    if (dateStr > 40000) {
      // Excel日期序列号
      const dateObj = XLSX.SSF.parse_date_code(dateStr);
      return new Date(dateObj.y, dateObj.m - 1, dateObj.d);
    }
    return new Date(dateStr);
  }
  return new Date(dateStr);
}

/**
 * 从文本中提取日期并判断是否大于目标日期
 */
function hasValidFutureDate(text, checkDate) {
  if (!text) return false;
  text = String(text);

  const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());

  for (const pattern of DATE_PATTERNS) {
    // 查找所有匹配，不是只找第一个
    let match;
    const regex = new RegExp(pattern.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      let year, month, day;
      if (match.length >= 3 && match[1] && match[2] && match[3] !== undefined) {
        // YYYY-MM-DD
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[3], 10);
      } else if (match.length >= 2 && match[1] && match[2]) {
        // MM-DD 使用当前年份
        year = checkDate.getFullYear();
        month = parseInt(match[1], 10) - 1;
        day = parseInt(match[2], 10);
      } else if (match[1] && match[1].length === 8) {
        // YYYYMMDD
        const str = match[1];
        year = parseInt(str.substring(0, 4), 10);
        month = parseInt(str.substring(4, 6), 10) - 1;
        day = parseInt(str.substring(6, 8), 10);
      } else {
        continue;
      }

      const extractedDate = new Date(year, month, day);
      if (!isNaN(extractedDate.getTime())) {
        // 比较日期（只比较年月日）
        const extractedDateOnly = new Date(extractedDate.getFullYear(), extractedDate.getMonth(), extractedDate.getDate());
        if (extractedDateOnly > checkDateOnly) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * 判断是否包含预计关键词
 */
function hasExpectedKeyword(text) {
  if (!text) return false;
  text = String(text);
  return /预计|延期|完成/.test(text);
}

/**
 * 获取任务名称（按优先级 fallback）
 */
function getTaskName(fields) {
  // 优先级: 核心目标 → 产品需求名称 → 主要工作 → 项目 → 功能点 → 任务名称
  for (const [key, value] of Object.entries(fields)) {
    if (key.toLowerCase().includes('核心') && value && String(value).trim()) {
      return String(value).trim();
    }
  }
  if (fields['核心目标'] && String(fields['核心目标']).trim()) {
    return String(fields['核心目标']).trim();
  }
  if (fields['产品需求名称'] && String(fields['产品需求名称']).trim()) {
    return String(fields['产品需求名称']).trim();
  }
  if (fields['需求名称'] && String(fields['需求名称']).trim()) {
    return String(fields['需求名称']).trim();
  }
  if (fields['主要工作'] && String(fields['主要工作']).trim()) {
    return String(fields['主要工作']).trim();
  }
  if (fields['工作内容'] && String(fields['工作内容']).trim()) {
    return String(fields['工作内容']).trim();
  }
  if (fields['功能点'] && String(fields['功能点']).trim()) {
    return String(fields['功能点']).trim();
  }
  if (fields['项目'] && String(fields['项目']).trim()) {
    return String(fields['项目']).trim();
  }
  if (fields['任务名称'] && String(fields['任务名称']).trim()) {
    return String(fields['任务名称']).trim();
  }
  // 测试系统加上功能点
  if (fields['测试系统'] && fields['功能点'] && String(fields['功能点']).trim()) {
    return `${String(fields['测试系统']).trim()} - ${String(fields['功能点']).trim()}`;
  }
  if (fields['测试系统'] && String(fields['测试系统']).trim()) {
    return String(fields['测试系统']).trim();
  }
  return '未命名任务';
}

/**
 * 获取责任人
 */
function getResponsiblePerson(fields) {
  // 尝试常见字段名
  const possibleFields = ['责任人', '负责人', '开发人员', '经办人', '开发', '负责人', '研发负责人', '测试负责人', 'assignee', '姓名', '人员'];
  for (const fieldName of possibleFields) {
    // 模糊匹配字段名
    for (const key of Object.keys(fields)) {
      if (key.toLowerCase().includes(fieldName.toLowerCase()) && fields[key]) {
        if (fields[key] && String(fields[key]).trim()) {
          return String(fields[key]).trim();
        }
      }
    }
    if (fields[fieldName] && String(fields[fieldName]).trim()) {
      return String(fields[fieldName]).trim();
    }
  }
  // 检查任意包含"人"字的字段
  for (const [key, value] of Object.entries(fields)) {
    if (key.includes('人') && value && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '未分配';
}

/**
 * 获取计划完成时间
 */
function getPlanFinishTime(fields) {
  const possibleFields = ['计划完成时间', '预计完成时间', '完成时间', '截止日期', '计划完成', '完成日期', '截止'];
  for (const fieldName of possibleFields) {
    // 模糊匹配
    for (const key of Object.keys(fields)) {
      if (key.toLowerCase().includes(fieldName.toLowerCase()) && fields[key] !== undefined && fields[key] !== null) {
        return parseDate(fields[key]);
      }
    }
    if (fields[fieldName] !== undefined && fields[fieldName] !== null) {
      return parseDate(fields[fieldName]);
    }
  }
  return null;
}

/**
 * 获取任务状态
 */
function getTaskStatus(fields) {
  const possibleFields = ['状态', '任务状态', '进度', '任务进度', '当前状态'];
  for (const fieldName of possibleFields) {
    // 模糊匹配
    for (const key of Object.keys(fields)) {
      if (key.toLowerCase().includes(fieldName.toLowerCase()) && fields[key]) {
        return String(fields[key]).trim();
      }
    }
    if (fields[fieldName] && typeof fields[fieldName] === 'string' && String(fields[fieldName]).trim()) {
      return String(fields[fieldName]).trim();
    }
  }
  return '';
}

/**
 * 获取备注信息
 */
function getRemark(fields) {
  const possibleFields = ['备注', '进度备注', '说明', '进展', '进度说明', '进展说明'];
  for (const fieldName of possibleFields) {
    // 模糊匹配
    for (const key of Object.keys(fields)) {
      if (key.toLowerCase().includes(fieldName.toLowerCase()) && fields[key]) {
        return String(fields[key]).trim();
      }
    }
    if (fields[fieldName] && typeof fields[fieldName] === 'string' && String(fields[fieldName]).trim()) {
      return String(fields[fieldName]).trim();
    }
  }
  return '';
}

/**
 * 判断是否已完成
 */
function isCompleted(status) {
  if (!status) return false;
  status = String(status);
  return COMPLETED_KEYWORDS.some(keyword => status.includes(keyword));
}

/**
 * 判断是否是关注状态，返回分类名称
 */
function getWatchingStatusCategory(status) {
  if (!status) return null;
  status = String(status);
  for (const [category, keywords] of Object.entries(WATCHING_STATUSES)) {
    if (keywords.some(keyword => status.includes(keyword))) {
      return category;
    }
  }
  return null;
}

/**
 * 检查未完成任务是否需要推送
 * 返回 true 如果需要推送
 */
function checkIfNeedPush(task, checkDate) {
  const { planFinishDate, remark } = task;

  // 条件1: 预计完成时间不为空 - 这里planFinishDate已经是计划完成时间，如果为空需要推送
  if (!planFinishDate || isNaN(planFinishDate.getTime())) {
    return true; // 需要推送 - 缺少预计完成时间
  }

  // 条件2: 备注字数不少于 5 个字
  if (!remark || String(remark).length < 5) {
    return true; // 需要推送 - 备注信息不足
  }

  // 条件3: 备注必须包含关键词且包含有效未来日期
  if (!hasExpectedKeyword(remark)) {
    return true; // 需要推送 - 缺少预计关键词
  }

  if (!hasValidFutureDate(String(remark), checkDate)) {
    return true; // 需要推送 - 没有明确的未来预计日期
  }

  return false; // 信息齐全，不需要推送
}

/**
 * 获取问题说明
 */
function getProblemDescription(task, checkDate) {
  const { planFinishDate, remark } = task;

  if (!planFinishDate || isNaN(planFinishDate.getTime())) {
    return '缺少预计完成时间信息，请补充预计完成时间并更新进度';
  }

  if (!remark || String(remark).length < 5) {
    return '备注信息不足，请补充说明当前进度和预计完成时间';
  }

  if (!hasExpectedKeyword(remark)) {
    return '备注中未明确预计完成情况，请补充说明当前进度和新的预计完成时间';
  }

  if (!hasValidFutureDate(String(remark), checkDate)) {
    return '备注中未明确预计完成日期，请补充新的预计完成时间';
  }

  return '任务信息不完整，请补充完善';
}

/**
 * 处理所有记录
 */
function processRecords(records, checkDate) {
  const result = {
    completed: 0,
    watching: {},
    needPush: [],
    okUnfinished: []
  };

  // 初始化关注状态计数
  Object.keys(WATCHING_STATUSES).forEach(key => {
    result.watching[key] = 0;
  });

  for (const record of records) {
    const fields = record.fields || {};

    // 获取各个字段
    const task = {
      name: getTaskName(fields),
      assignee: getResponsiblePerson(fields),
      planFinishDate: getPlanFinishTime(fields),
      status: getTaskStatus(fields),
      remark: getRemark(fields),
      raw: record
    };

    // 筛选: 计划完成时间 ≤ 目标日期
    if (!task.planFinishDate || isNaN(task.planFinishDate.getTime())) {
      // 没有计划完成时间，跳过
      continue;
    }

    const taskDateOnly = new Date(
      task.planFinishDate.getFullYear(),
      task.planFinishDate.getMonth(),
      task.planFinishDate.getDate()
    );
    const checkDateOnly = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      checkDate.getDate()
    );

    if (taskDateOnly > checkDateOnly) {
      // 计划完成时间在检查日期之后，不需要处理
      continue;
    }

    // 现在进入处理流程
    // 1. 判断是否完成
    if (isCompleted(task.status)) {
      result.completed++;
      continue;
    }

    // 2. 判断是否是关注状态
    const watchingCategory = getWatchingStatusCategory(task.status);
    if (watchingCategory) {
      result.watching[watchingCategory]++;
      continue;
    }

    // 3. 其他情况判定为未完成，进一步检查是否需要推送
    if (checkIfNeedPush(task, checkDate)) {
      result.needPush.push({
        ...task,
        problem: getProblemDescription(task, checkDate),
        checkDateStr: formatDate(checkDate)
      });
    } else {
      result.okUnfinished.push(task);
    }
  }

  return result;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化中文日期为 YYYY年MM月DD日
 */
function formatChineseDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * 按责任人分组需要推送的任务
 */
function groupByAssignee(tasks) {
  const groups = {};
  for (const task of tasks) {
    if (!groups[task.assignee]) {
    groups[task.assignee] = [];
  }
  groups[task.assignee].push(task);
  }
  return groups;
}

/**
 * 生成最终输出消息
 */
function generateOutput(result, checkDate) {
  const { completed, watching, needPush, okUnfinished } = result;

  if (needPush.length === 0) {
    // 没有需要推送的任务
    let output = `✅ 工作计划检查完成 (检查日期: ${formatDate(checkDate)})\n\n`;
    output += `- 已完成: ${completed} 项\n`;
    output += `- 关注状态统计:\n`;
    for (const [category, count] of Object.entries(watching)) {
      if (count > 0) {
        output += `  • ${category}: ${count} 项\n`;
      }
    }
    output += `- 未完成但信息齐全: ${okUnfinished.length} 项\n`;
    output += `\n🎉 当前没有需要提醒的过期任务。`;
    return output;
  }

  // 有需要推送的任务，生成提醒消息
  const groups = groupByAssignee(needPush);
  let output = `工作计划提醒\n\n`;

  for (const [assignee, tasks] of Object.entries(groups)) {
    for (const task of tasks) {
      output += `@${assignee} \n`;
      output += `您好，您有一项计划应于${formatDate(checkDate)}前完成的任务尚未完成：\n`;
      output += `- 任务名称：${task.name}\n`;
      output += `- 问题说明：${task.problem}\n`;
      output += `\n`;
    }
  }

  output += `请各位责任人在今天内补充完善任务备注，明确新的预计完成时间，谢谢配合！\n`;
  output += `部门管理组\n`;
  output += `${formatChineseDate(new Date())}\n`;
  output += `\n`;
  for (const assignee of Object.keys(groups)) {
    output += `@${assignee} `;
  }

  // 添加统计信息
  output += `\n\n---\n`;
  output += `📊 统计信息:\n`;
  output += `- 已完成: ${completed} 项\n`;
  output += `- 关注状态统计:\n`;
  for (const [category, count] of Object.entries(watching)) {
    if (count > 0) {
      output += `  • ${category}: ${count} 项\n`;
    }
  }
  output += `- 需要补充信息: ${needPush.length} 项\n`;
  if (needPush.length > 0) {
    const assignees = [...new Set(needPush.map(t => t.assignee))].sort();
    output += `  责任人: ${assignees.join(', ')}\n`;
  }
  output += `- 未完成但信息齐全: ${okUnfinished.length} 项\n`;
  if (okUnfinished.length > 0) {
    const assignees = [...new Set(okUnfinished.map(t => t.assignee))].sort();
    output += `  责任人: ${assignees.join(', ')}\n`;
  }

  return output;
}

module.exports = {
  name: 'workplan-check',
  description: '工作计划过期检查提醒 - 检查飞书多维表格/Excel文件中过期未完成的工作计划，按规则分类统计并生成提醒消息',
  version: '1.3.0',
  author: 'Openclaw',
  usage: '/workplan-check [file_path [check-date] | [check-date] [--sheets sheet1,sheet2] [--output output.txt]',
  options: [
    {
      name: '--sheets',
      description: '指定只检查哪些sheet，多个用逗号分隔，支持模糊匹配'
    },
    {
      name: '--output',
      description: '将检查结果保存到指定文件'
    }
  ],
  run: async (args, options, context) => {
    // 判断模式检测：如果第一个参数是.xlsx或.xls文件，使用Excel模式
    let checkDate;
    let allRecords;
    let isExcelMode = false;
    let includeSheets = [];
    let outputFile = null;

    // 解析选项
    if (options && options.sheets) {
      includeSheets = options.sheets.split(',').map(s => s.trim()).filter(s => s);
    }
    if (options && options.output) {
      outputFile = options.output.trim();
    }

    if (args.length > 0) {
      const firstArg = args[0];
      // 检查是否是Excel文件
      if (firstArg.toLowerCase().endsWith('.xlsx') || firstArg.toLowerCase().endsWith('.xls')) {
        // Excel模式: 参数是 filePath [check-date]
        isExcelMode = true;
        const filePath = path.resolve(firstArg);
        // 第二个参数是检查日期
        if (args.length > 1 && args[1]) {
          checkDate = parseDate(args[1]);
          if (!checkDate || isNaN(checkDate.getTime())) {
            throw new Error(`无效的日期格式: ${args[1]}\n请使用 YYYY-MM-DD 格式`);
          }
        } else {
          // 默认检查昨天
          checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - 1);
        }
        // 读取Excel
        allRecords = readExcelFile(filePath, includeSheets);
      } else {
        // 飞书模式，第一个参数是检查日期
        checkDate = parseDate(firstArg);
        if (!checkDate || isNaN(checkDate.getTime())) {
          throw new Error(`无效的日期格式: ${firstArg}\n请使用 YYYY-MM-DD 格式，或者传入Excel文件路径`);
        }
      }
    } else {
      // 默认检查昨天，飞书模式
      checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (!isExcelMode) {
      // 飞书模式，获取飞书配置
      const appId = process.env.FEISHU_APP_ID;
      const appSecret = process.env.FEISHU_APP_SECRET;
      const appToken = process.env.FEISHU_APP_TOKEN;
      const tableIdsBackend = process.env.FEISHU_TABLE_IDS_BACKEND || '';
      const tableIdsFrontend = process.env.FEISHU_TABLE_IDS_FRONTEND || '';

      // 检查配置
      if (!appId || !appSecret) {
        throw new Error('FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量未设置\n请在环境变量中配置飞书应用凭证，或传入Excel文件路径使用Excel模式。');
      }
      if (!appToken) {
        throw new Error('FEISHU_APP_TOKEN 环境变量未设置\n请在环境变量中配置多维表格app_token，或传入Excel文件路径使用Excel模式。');
      }

      // 收集所有tableId
      let allTableIds = [];
      if (tableIdsBackend) {
        allTableIds = allTableIds.concat(tableIdsBackend.split(',').map(s => s.trim()).filter(s => s));
      }
      if (tableIdsFrontend) {
        allTableIds = allTableIds.concat(tableIdsFrontend.split(',').map(s => s.trim()).filter(s => s));
      }
      if (allTableIds.length === 0) {
        throw new Error('未配置任何表格ID\n请在 FEISHU_TABLE_IDS_BACKEND 或 FEISHU_TABLE_IDS_FRONTEND 中配置要检查的表格ID，或传入Excel文件路径使用Excel模式。');
      }

      try {
        // 获取access_token
        const accessToken = await getFeishuAccessToken(appId, appSecret);

        // 获取所有表格的数据
        allRecords = [];
        for (const tableId of allTableIds) {
        const records = await getBaseRecords(accessToken, appToken, tableId);
        allRecords = allRecords.concat(records);
        }
      } catch (error) {
        throw new Error(`飞书检查失败: ${error.message}`);
      }
    }

    // 处理所有记录（两种模式统一处理
    const result = processRecords(allRecords, checkDate);

    // 生成输出
    const output = generateOutput(result, checkDate);

    // 如果指定了输出文件，保存到文件
    if (outputFile) {
      try {
        const outputPath = path.resolve(outputFile);
        fs.writeFileSync(outputPath, output, 'utf-8');
        // 在输出末尾添加保存成功信息
        return output + `\n\n💾 检查结果已保存到文件: ${outputPath}`;
      } catch (error) {
        throw new Error(`保存结果到文件失败: ${error.message}`);
      }
    }

    return output;
  }
};