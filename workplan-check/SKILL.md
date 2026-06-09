---
name: workplan-check
description: 工作计划过期检查提醒 - 检查飞书多维表格、飞书在线表格或本地 Excel 文件中过期未完成的工作计划，按规则分类统计并生成提醒消息。
version: 1.5.0
author: Openclaw
usage: /workplan-check [file_path|feishu_sheets_url [check-date] | [check-date]] [options]
keywords:
  - workplan
  - overdue-check
  - reminder
  - feishu
  - excel
  - sheets
  - openclaw-skill
trigger:
  - prefix: "/workplan-check"
    description: "检查过期未完成的工作计划并生成提醒消息"
environment:
  - name: FEISHU_APP_ID
    description: "飞书应用 App ID，飞书多维表格和飞书在线表格模式需要"
    required: false
  - name: FEISHU_APP_SECRET
    description: "飞书应用 App Secret，飞书多维表格和飞书在线表格模式需要"
    required: false
  - name: FEISHU_APP_TOKEN
    description: "飞书多维表格 app token，飞书多维表格模式需要"
    required: false
  - name: FEISHU_TABLE_IDS_BACKEND
    description: "后端排期表 table id 列表，多个用逗号分隔"
    required: false
  - name: FEISHU_TABLE_IDS_FRONTEND
    description: "前端排期表 table id 列表，多个用逗号分隔"
    required: false
options:
  - name: --sheets
    description: "Excel 和飞书在线表格模式下指定只检查哪些 sheet，多个用逗号分隔，支持模糊匹配"
  - name: --output
    description: "将检查结果保存到文件，不指定文件名则自动使用 YYYY-MM-DD-gjzc.txt 格式保存到原文件目录"
examples:
  - command: "/workplan-check"
    description: "使用飞书多维表格模式检查昨天过期的任务"
  - command: "/workplan-check 2026-04-07"
    description: "使用飞书多维表格模式检查指定日期过期的任务"
  - command: "/workplan-check https://ucn063xfxncx.feishu.cn/sheets/EiR4sWnQMhI8oItcndqcJMx8nYu"
    description: "检查飞书在线表格中昨天过期的任务"
  - command: "/workplan-check https://ucn063xfxncx.feishu.cn/sheets/EiR4sWnQMhI8oItcndqcJMx8nYu 2026-04-07 --sheets 后端,前端"
    description: "检查飞书在线表格中指定日期和指定 sheet 的任务"
  - command: "/workplan-check ./workplan.xlsx"
    description: "检查 Excel 文件中昨天过期的任务"
  - command: "/workplan-check ./workplan.xlsx 2026-04-07 --sheets 后端,前端"
    description: "检查 Excel 文件中指定日期和指定 sheet 的任务"
  - command: "/workplan-check ./workplan.xlsx --output result.txt"
    description: "检查 Excel 文件并将结果保存到指定文件"
---

## 功能说明

工作计划过期检查提醒技能支持飞书多维表格、飞书在线表格和本地 Excel 文件三种数据源，按照预设规则筛选计划完成时间已到但仍未完成的任务，并按责任人分组生成提醒消息。

## 适用场景

- 定期检查项目排期表中的过期未完成任务
- 从飞书多维表格生成工作提醒
- 从飞书在线表格生成工作提醒
- 从本地 Excel 排期表生成工作提醒
- 将检查结果保存为文本文件后发送给团队
