# OpenClaw Skills Index

This repository contains OpenClaw-compatible skills. Each skill exposes a slash command backed by a Node.js `index.js` entry point.

## Skills

### bocha

- Command: `/bocha <query> [options]`
- Path: `./bocha`
- Purpose: Search the web through Bocha AI and return AI-friendly results, summaries, domain-filtered results, or image results.
- Requires: `BOCHA_API_KEY`
- Use when: The assistant needs current web information, web links, search snippets, or summarized search results.
- Key options: `--freshness`, `--summary`, `--include`, `--exclude`, `--count`, `--images`

### wecom

- Command: `/wecom <content> [options]`
- Path: `./wecom-notify`
- Purpose: Send text or Markdown notifications to a WeCom group robot, optionally mentioning users by mobile number or everyone.
- Requires: `WECOM_WEBHOOK_KEY` or `--key`
- Use when: The assistant needs to notify a WeCom group or send operational reminders.
- Key options: `--mobiles`, `--at-all`, `--type`, `--key`

### workplan-check

- Command: `/workplan-check [file_path [check-date] | [check-date]] [options]`
- Path: `./workplan-check`
- Purpose: Check overdue unfinished work plans from Feishu Base or a local Excel file and generate reminder messages grouped by owner.
- Requires: Feishu environment variables only when using Feishu Base mode.
- Use when: The assistant needs to inspect project schedules and produce overdue-task reminders.
- Key options: `--sheets`, `--output`

### lunar-calendar

- Command: `/lunar-calendar <date>`
- Path: `./lunar-calendar`
- Purpose: Convert between Gregorian and Chinese lunar calendar dates, including leap months, zodiac, Ganzhi year, and traditional festivals.
- Requires: No environment variables.
- Use when: The assistant needs Chinese lunar calendar conversion or festival/date lookup.
- Key options: `--date`

### wps-downloader

- Command: `/wps-downloader <wps-url> [options]`
- Path: `./wps-downloader`
- Purpose: Open a public WPS or Kingsoft Docs share link in a browser and automatically download the shared file.
- Requires: Publicly accessible share link with download permission; Puppeteer dependency installed.
- Use when: The assistant needs to download a WPS or Kingsoft Docs shared file for later processing.
- Key options: `--output`, `--timeout`, `--headless`

### wps-content-extractor

- Command: `/wps-content-extractor <wps-url> [options]`
- Path: `./wps-content-extractor`
- Purpose: Open a public WPS or Kingsoft Docs share link and extract text from one or more sheets using copy-based extraction with DOM fallback.
- Requires: Publicly accessible share link; Puppeteer dependency installed.
- Use when: The assistant needs text content from online WPS or Kingsoft Docs documents.
- Key options: `--output`, `--timeout`, `--headless`, `--sheets`

## Expected Skill Layout

Each skill should use this layout:

```text
skill-name/
├── SKILL.md
├── README.md
├── index.js
├── package.json
├── package-lock.json      # if dependencies are installed with npm
└── .env.example           # if environment variables are required
```

## Discovery Notes

- `SKILL.md` is the model-facing manifest for a single skill.
- `README.md` is the human-facing usage guide for a single skill.
- `skills.md` is the repository-level index for OpenClaw, agents, and large language models.
- The `name` exported from `index.js` is the canonical slash-command name. Some directories may be more descriptive than the command name, such as `wecom-notify` exporting `/wecom`.
