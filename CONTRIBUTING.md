# 贡献指南 / Contributing Guide

欢迎贡献新技能或改进现有技能！

## 技能开发规范

### 目录结构
每个技能独立成文件夹，使用小写英文命名：
```
skill-name/
├── index.js          # 技能主入口
├── package.json      # 依赖配置
├── README.md         # 使用说明（中英文优先）
└── .env.example      # 环境变量模板（如需要）
```

### index.js 规范
```javascript
module.exports = {
  name: 'skill-name',          // 技能名称（和文件夹名一致）
  description: '技能描述',      // 简短描述功能
  version: '1.0.0',            // 语义化版本
  author: 'Your Name',         // 作者
  usage: '/skill <args> [options]', // 使用方法
  options: [                   // 支持的参数
    {
      name: '--option',
      description: '参数说明',
      default: 'default-value'
    }
  ],
  async run: async (args, options, context) => {
    // 技能逻辑实现
    return '返回结果字符串'
  }
}
```

### README.md 规范
必须包含：
1. 功能介绍
2. 安装配置方法
3. 使用示例
4. 常见问题解答

优先使用中英文双语说明。

## 提交规范
提交信息格式：
```
<type>(<scope>): <subject>
```

类型说明：
- feat: 新增技能
- fix: 修复技能问题
- docs: 更新文档
- refactor: 代码重构
- chore: 工程化相关修改

## Pull Request 流程
1. Fork 本仓库
2. 创建功能分支
3. 提交修改
4. 创建PR，详细描述修改内容
