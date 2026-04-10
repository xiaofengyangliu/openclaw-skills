# 工作计划检查提醒技能 / Workplan Check Reminder Skill

为openclaw开发的工作计划自动检查提醒技能，支持飞书多维表格和本地Excel文件两种数据源，按照预定规则检查过期未完成任务，自动分类统计并生成提醒消息。

## 功能特性

- 支持两种数据源：飞书多维表格 / 本地Excel文件
- 同时检查多个排期sheet（支持后端/前端分类）
- 按照规则自动判断任务完成状态
- 智能识别需要提醒的过期任务
- 按责任人分组生成标准格式提醒
- 支持自定义检查日期（默认为昨天）
- Excel自动表头识别，适配不同表格结构

## 检查规则

1. **范围筛选**: 筛选所有计划完成时间 ≤ 目标日期的任务
2. **状态判断**:
   - ✅ 已完成: `完成 / 已完成 / 做完 / 结束 / 测试完成 / 已上线` → 不推送
   - 📊 关注状态: `未开始 / 待审核 / 暂停 / 已暂停 / 已提测 / 待联调 / 待测试 / 待开发` → 仅统计，不推送
   - ⚠️ 其他: 判定为未完成，进一步检查
3. **未完成任务豁免条件**（满足则不推送）:
   - 预计完成时间不为空
   - 备注字数不少于 5 个字
   - 备注包含「预计/延期/完成」关键词，并且包含 > 检查日期的日期格式

## 配置

在环境变量中配置：

```bash
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_APP_TOKEN=your_base_app_token
FEISHU_TABLE_IDS_BACKEND=sheet_id1,sheet_id2
FEISHU_TABLE_IDS_FRONTEND=sheet_id1,sheet_id2
```

## 使用方法

### 飞书多维表格模式（需要配置环境变量）

```bash
# 检查昨天过期的任务（默认）
/workplan-check

# 检查指定日期过期的任务
/workplan-check 2026-04-07
```

### Excel文件模式（直接使用，不需要配置飞书）

```bash
# 检查Excel文件中昨天过期的任务
/workplan-check ./workplan.xlsx

# 检查Excel文件中指定日期过期的任务
/workplan-check ./workplan.xlsx 2026-04-07

# 指定只检查特定sheet（多个用逗号分隔，支持模糊匹配）
/workplan-check ./workplan.xlsx --sheets 后端排期,前端排期
/workplan-check ./workplan.xlsx 2026-04-07 --sheets 后端

# 将结果保存到文件
/workplan-check ./workplan.xlsx --sheets 后端排期 --output result.txt
/workplan-check ./workplan.xlsx 2026-04-07 --sheets 后端,前端 --output ./output/result.txt
```

Excel要求：第一行为表头，自动识别常用字段名（责任人、计划完成时间、状态、备注等），默认读取所有sheet（跳过Wps图片缓存sheet）。

## 输出格式

按照标准模板生成提醒消息，包含：
- 按责任人分组整理
- 任务名称显示（核心目标 → 产品需求名称 → 主要工作 → 项目 优先级 fallback）
- 问题说明
- 尾部统一提示

## License

MIT
