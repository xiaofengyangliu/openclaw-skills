const skill = require('./index.js');

// 从skill模块中提取函数 - 由于它们没有直接导出，需要重新实现或从skill中提取
const processRecords = (records, checkDate) => {
  // 模拟调用skill的run函数来测试
  // 由于processRecords没有直接导出，我们直接复制逻辑测试
  const result = {
    completed: 0,
    watching: {},
    needPush: [],
    okUnfinished: []
  };

  for (const record of records) {
    const fields = record.fields || {};
    const planFinishDate = fields['计划完成时间'] ? new Date(fields['计划完成时间']) : null;
    const hasNoPlanDate = !planFinishDate || isNaN(planFinishDate.getTime());

    let isFuturePlan = false;
    if (!hasNoPlanDate) {
      const taskDateOnly = new Date(
        planFinishDate.getFullYear(),
        planFinishDate.getMonth(),
        planFinishDate.getDate()
      );
      const checkDateOnly = new Date(
        checkDate.getFullYear(),
        checkDate.getMonth(),
        checkDate.getDate()
      );
      isFuturePlan = taskDateOnly > checkDateOnly;
    }

    if (isFuturePlan) {
      continue;
    }

    // 判断需要推送的条件
    if (hasNoPlanDate) {
      result.needPush.push({
        name: fields['任务名称'],
        assignee: fields['责任人'],
        problem: '缺少预计完成时间信息，请补充预计完成时间并更新进度'
      });
    } else if (!fields['备注'] || String(fields['备注']).length < 5) {
      result.needPush.push({
        name: fields['任务名称'],
        assignee: fields['责任人'],
        problem: '备注信息不足，请补充说明当前进度和预计完成时间'
      });
    }
  }

  return result;
};

// 测试数据：包含一个计划完成时间为空的任务
const testRecords = [
  {
    fields: {
      '任务名称': '测试任务1 - 无计划完成时间',
      '责任人': '张三',
      '状态': '进行中',
      '备注': '正在开发中'
      // 没有计划完成时间字段
    }
  },
  {
    fields: {
      '任务名称': '测试任务2 - 有计划完成时间已过期',
      '责任人': '李四',
      '状态': '进行中',
      '计划完成时间': '2026-05-01',
      '备注': '备注不足'
    }
  },
  {
    fields: {
      '任务名称': '测试任务3 - 未来日期跳过',
      '责任人': '王五',
      '状态': '进行中',
      '计划完成时间': '2026-12-31',
      '备注': '未来任务'
    }
  }
];

const checkDate = new Date('2026-05-15');
const result = processRecords(testRecords, checkDate);

console.log('=== 测试结果 ===');
console.log('需要提醒的任务数:', result.needPush.length);
console.log('跳过的未来任务数:', 3 - result.completed - Object.values(result.watching).reduce((a, b) => a + b, 0) - result.needPush.length - result.okUnfinished.length);
console.log('');
result.needPush.forEach((task, i) => {
  console.log(`任务${i + 1}:`, task.name);
  console.log('  问题:', task.problem);
  console.log('');
});
