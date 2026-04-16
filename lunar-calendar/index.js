const solarLunar = require('solarlunar');

/**
 * 中文数字转阿拉伯数字
 */
function chineseNumToInt(str) {
  const map = {
    '零': 0, '〇': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '正': 1, '正⽉': 1, '正月': 1, '冬': 11, '冬月': 11, '腊': 12, '腊月': 12,
    '初': 0, '廿': 20, '卅': 30
  };

  // 处理初一 → 1, 初十 → 10, 十五 → 15, 二十 → 20, 廿一 → 21, 三十 → 30
  str = str.trim();
  if (str.length === 1) {
    const val = map[str];
    return val !== undefined ? val : parseInt(str, 10);
  }

  let result = 0;

  // 处理 "初十" → 以十结尾，前面是初
  if (str.startsWith('初')) {
    // 初一 = 1, 初十 = 10
    const rest = str.slice(1);
    if (rest.length === 1) {
      if (rest === '十') {
        return 10;
      }
      const val = map[rest];
      return val !== undefined ? val : parseInt(rest, 10);
    }
  }

  if (str.startsWith('十')) {
    result = 10;
    if (str.length > 1) {
      result += map[str[1]] || 0;
    }
  } else if (str.startsWith('廿')) {
    result = 20;
    if (str.length > 1) {
      result += map[str[1]] || 0;
    }
  } else if (str.startsWith('卅')) {
    result = 30;
    if (str.length > 1) {
      result += map[str[1]] || 0;
    }
  } else if (str.endsWith('十')) {
    result = map[str[0]] * 10;
  } else if (str.length === 2) {
    result = (map[str[0]] || 0) * 10 + (map[str[1]] || 0);
  } else {
    result = parseInt(str.replace(/[初十]/g, ''), 10);
  }

  return result > 0 ? result : parseInt(str, 10);
}

/**
 * 解析输入日期字符串
 * 支持格式:
 * - 公历: YYYY-MM-DD, YYYY/MM/DD, YYYY年MM月DD日
 * - 农历: YYYY年MM月DD日, YYYY年正月初一, YYYY年闰MM月DD日
 */
function parseDate(input) {
  input = input.trim();

  // 检查是否标记为农历 - 包含农历、闰、中文月份名称都认为是农历
  const hasChineseMonth = input.match(/正月|冬月|腊月|初一|初二|初十|十五/);
  const isLunarMarked = input.includes('农历') || input.includes('闰') || hasChineseMonth;
  let isLunar = isLunarMarked;
  const hasLeap = input.includes('闰');
  let leapMonth = hasLeap;

  // 提取年份 - 年份总是数字
  const yearMatch = input.match(/(\d{4})/);
  if (!yearMatch) {
    return null;
  }
  const year = parseInt(yearMatch[1], 10);

  // 提取月份和日期
  if (isLunar) {
    // 处理农历格式，支持中文月份日期
    let monthStr = null;
    let dayStr = null;

    // 匹配类似 "2024年正月初一" → year=2024, month=正月, day=初一
    // 匹配类似 "2023年闰二月初十" → leap=true, month=二月, day=初十
    // 月份只包含月份名称，不包含初一初二这些日期词
    const lunarRegex = /(\d{4})年(闰)?([正冬腊一二三四五六七八九十]+)月([初廿卅一二三四五六七八九十]+)日?/;
    const match = input.match(lunarRegex);

    if (match) {
      leapMonth = !!match[2];
      monthStr = match[3];
      dayStr = match[4];
    } else {
      // 尝试其他格式，直接分割
      const parts = input.replace(/\d{4}|年|月|日|农历|闰/g, ' ').trim().split(/\s+/).filter(p => p);
      if (parts.length >= 2) {
        monthStr = parts[0];
        dayStr = parts[1];
      }
    }

    if (!monthStr || !dayStr) {
      return null;
    }

    const month = chineseNumToInt(monthStr);
    const day = chineseNumToInt(dayStr);

    if (isNaN(month) || isNaN(day)) {
      return null;
    }

    return {
      year,
      month,
      day,
      isLunar,
      leapMonth
    };
  } else {
    // 公历处理
    let cleanInput = input.replace(/年|月|日/g, '-').replace(/[./]/g, '-');
    const parts = cleanInput.split('-').filter(p => p).map(p => parseInt(p, 10));

    if (parts.length !== 3) {
      return null;
    }

    const [, month, day] = parts;
    // year already extracted from regex above
    return {
      year,
      month,
      day,
      isLunar,
      leapMonth: false
    };
  }
}

/**
 * 格式化输出结果
 */
function formatResult(solar, lunar) {
  const solarStr = `${solar.year}年${solar.month}月${solar.day}日`;

  // 使用中文月份日期表示
  let lunarMonthStr = solarLunar.toChinaMonth(lunar.month);
  // 移除返回结果中已有的 "月" 字，避免重复
  lunarMonthStr = lunarMonthStr.replace('月', '');
  let lunarDayStr = solarLunar.toChinaDay(lunar.day);
  let lunarStr = `${lunar.year}年`;
  if (lunar.isLeap) {
    lunarStr += `闰${lunarMonthStr}月`;
  } else {
    lunarStr += `${lunarMonthStr}月`;
  }
  lunarStr += `${lunarDayStr}`;

  const animal = solarLunar.getAnimal(lunar.year);
  const ganzhi = solarLunar.toGanZhi(lunar.year);

  return {
    solar: {
      year: solar.year,
      month: solar.month,
      day: solar.day,
      formatted: solarStr
    },
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeap: lunar.isLeap,
      formatted: lunarStr
    },
    zodiac: animal,
    ganzhi: ganzhi
  };
}

/**
 * 验证公历日期是否合法
 */
function isValidSolarDate(year, month, day) {
  if (year < 1900 || year > 2100) {
    return { valid: false, reason: '年份范围仅支持 1900-2100' };
  }
  if (month < 1 || month > 12) {
    return { valid: false, reason: '月份必须在 1-12 之间' };
  }

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 处理闰年2月
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }

  if (day < 1 || day > daysInMonth[month - 1]) {
    return {
      valid: false,
      reason: `${year}年${month}月只有 ${daysInMonth[month - 1]} 天，日期 ${day} 不合法`
    };
  }

  return { valid: true };
}

/**
 * 主转换函数
 */
function convert(input) {
  const parsed = parseDate(input);
  if (!parsed) {
    return {
      success: false,
      error: '日期格式不正确，请使用类似: 2024-01-01 或 2024年正月初一 格式'
    };
  }

  const { year, month, day, isLunar, leapMonth } = parsed;

  if (isLunar) {
    // 农历转公历
    if (year < 1900 || year > 2100) {
      return {
        success: false,
        error: '农历年份范围仅支持 1900-2100'
      };
    }
    if (month < 1 || month > 12) {
      return {
        success: false,
        error: '农历月份必须在 1-12 之间'
      };
    }
    if (day < 1 || day > 30) {
      return {
        success: false,
        error: '农历日期必须在 1-30 之间'
      };
    }

    try {
      const converted = solarLunar.lunar2solar(year, month, day, leapMonth);
      if (!converted.cYear) {
        return { success: false, error: '无效的农历日期，请检查输入' };
      }
      const solar = {
        year: converted.cYear,
        month: converted.cMonth,
        day: converted.cDay
      };
      const check = isValidSolarDate(solar.year, solar.month, solar.day);
      if (!check.valid) {
        return { success: false, error: check.reason };
      }
      const lunarInfo = {
        year: converted.lYear,
        month: converted.lMonth,
        day: converted.lDay,
        isLeap: converted.isLeap
      };
      const result = formatResult(solar, lunarInfo);
      // 使用转换结果中的干支和生肖
      result.zodiac = converted.animal;
      result.ganzhi = converted.gzYear;
      return { success: true, result, direction: 'lunar-to-solar' };
    } catch (e) {
      return { success: false, error: `转换失败: ${e.message}` };
    }
  } else {
    // 公历转农历
    const check = isValidSolarDate(year, month, day);
    if (!check.valid) {
      return { success: false, error: check.reason };
    }

    try {
      const converted = solarLunar.solar2lunar(year, month, day);
      const solar = { year, month, day };
      const lunar = {
        year: converted.lYear,
        month: converted.lMonth,
        day: converted.lDay,
        isLeap: converted.isLeap
      };
      const result = formatResult(solar, lunar);
      // 使用转换结果中的干支和生肖
      result.zodiac = converted.animal;
      result.ganzhi = converted.gzYear;
      return { success: true, result, direction: 'solar-to-lunar' };
    } catch (e) {
      return { success: false, error: `转换失败: ${e.message}` };
    }
  }
}

/**
 * 生成中文节日/节气提示
 */
function getLunarFestivals(lunar) {
  const festivals = {
    '1-1': '春节',
    '1-15': '元宵节',
    '5-5': '端午节',
    '7-7': '七夕节',
    '8-15': '中秋节',
    '9-9': '重阳节',
    '12-8': '腊八节',
    '12-23': '小年',
    '12-30': '除夕'
  };
  return festivals[`${lunar.month}-${lunar.day}`] || null;
}

/**
 * 导出技能
 */
module.exports = {
  name: 'lunar-calendar',
  description: '农历↔公历互相转换，支持闰月、2月29日等特殊日期处理',
  version: '1.0.0',
  author: 'xuzhisheng',
  usage: '/lunar-calendar <date>',
  options: [
    {
      name: '--date',
      description: '要转换的日期，公历格式: YYYY-MM-DD，农历格式: YYYY年闰MM月DD日',
      required: true
    }
  ],
  run: async (args, options, context) => {
    let dateStr = args[0] || options.date;

    if (!dateStr) {
      return {
        success: false,
        message: '请提供要转换的日期\n\n使用示例:\n  /lunar-calendar 2024-02-10          公历转农历\n  /lunar-calendar 2024年正月初一       农历转公历\n  /lunar-calendar 2023年闰二月初十      闰月转换'
      };
    }

    // 如果是多个参数拼接
    if (Array.isArray(args) && args.length > 1) {
      dateStr = args.join(' ');
    }

    const conversion = convert(dateStr);

    if (!conversion.success) {
      return {
        success: false,
        message: `转换失败: ${conversion.error}`
      };
    }

    const { result, direction } = conversion;
    const festival = getLunarFestivals(result.lunar);

    let output = '';
    output += `📅 日期转换结果\n`;
    output += `────────────────\n`;

    if (direction === 'solar-to-lunar') {
      output += `公历: ${result.solar.formatted}\n`;
      output += `农历: ${result.lunar.formatted}\n`;
    } else {
      output += `农历: ${result.lunar.formatted}\n`;
      output += `公历: ${result.solar.formatted}\n`;
    }

    output += `────────────────\n`;
    output += `生肖: ${result.zodiac}\n`;
    output += `干支: ${result.ganzhi}\n`;

    if (festival) {
      output += `节日: ${festival}\n`;
    }

    // 特殊提示
    if (result.lunar.isLeap) {
      output += `\nℹ️  注: 这是闰月日期\n`;
    }

    if (result.solar.month === 2 && result.solar.day === 29) {
      output += `\nℹ️  注: 这是闰年2月29日\n`;
    }

    return {
      success: true,
      message: output,
      data: result
    };
  },

  // 导出转换函数供其他模块使用
  convert,
  parseDate,
  formatResult
};