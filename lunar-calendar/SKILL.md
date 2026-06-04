---
name: lunar-calendar
description: 农历公历互相转换工具，支持闰月、闰年 2 月 29 日、多种中文和数字日期格式，并输出生肖、干支和传统节日信息。
version: 1.0.0
author: xuzhisheng
usage: /lunar-calendar <date>
keywords:
  - lunar-calendar
  - solar-calendar
  - date-conversion
  - chinese-calendar
  - openclaw-skill
trigger:
  - prefix: "/lunar-calendar"
    description: "进行农历和公历互相转换"
options:
  - name: --date
    description: "要转换的日期。推荐直接作为位置参数传入，也可通过 --date 指定"
    required: false
examples:
  - command: "/lunar-calendar 2024-02-10"
    description: "将公历 2024 年 2 月 10 日转换为农历"
  - command: "/lunar-calendar 2024/02/10"
    description: "使用斜杠格式输入公历日期"
  - command: "/lunar-calendar 2024年正月初一"
    description: "将农历日期转换为公历"
  - command: "/lunar-calendar 2023年闰二月初十"
    description: "转换带闰月的农历日期"
---

## 功能说明

农历公历互转技能支持 1900 年到 2100 年之间的日期转换，能够识别常见中文日期格式，正确处理闰月和闰年日期，并返回生肖、干支纪年和传统节日。

## 适用场景

- 查询某个公历日期对应的农历日期
- 查询农历生日、传统节日对应的公历日期
- 处理带闰月的农历日期
- 获取生肖、干支和节日信息
