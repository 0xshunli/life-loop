# 人生进程 — AI 驱动的模拟人生

一款基于 AI 大语言模型驱动的 Web 模拟人生游戏。每一次选择都会改变你的人生轨迹，每一段故事都由 AI 实时生成，独一无二。

## 特性

- **AI 叙事引擎** — 基于 DeepSeek / OpenAI 兼容 API，每回合生成 200-500 字的沉浸式故事
- **自由创建角色** — 自定义姓名、性别、性格特征和背景故事，支持 AI 辅助生成
- **四大世界观** — 现代都市 / 古代王朝 / 奇幻大陆 / 星际时代
- **动态场景系统** — 背景色随剧情类型、天气、季节、心情四维混合实时过渡
- **天气与季节** — 雨雪粒子动画，春夏秋冬色调变化
- **人生里程碑** — AI 自动识别重大事件并生成成就徽章
- **属性追踪** — 六维属性（健康/智力/魅力/财富/幸福/社交）全程记录趋势
- **富文本叙事** — 对话高亮、内心独白渲染、场景分类色彩条
- **人生总览面板** — 属性趋势图、情绪轨迹、事件分布、成就回顾
- **钱包存档** — 支持 MetaMask 等 EIP-1193 钱包，存档绑定链上地址
- **快捷键** — `1` `2` `3` 快速选择 / `Esc` 设置 / `Tab` 总览
- **自由输入** — 除了预设选项，可以输入任何你想做的事

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vue 3 + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 样式 | Tailwind CSS 3 |
| AI | DeepSeek API（OpenAI 兼容格式） |
| 钱包 | EIP-1193（MetaMask 等） |
| 存储 | localStorage |

## 项目结构

```
src/
├── views/
│   ├── StartScreen.vue      # 首页
│   ├── CharacterCreate.vue   # 角色创建（四步表单）
│   ├── WorldSelect.vue       # 世界选择
│   └── GameMain.vue          # 主游戏界面
├── components/
│   ├── NarrativeRenderer.vue # 富文本叙事渲染
│   ├── LifeDashboard.vue     # 人生统计面板
│   └── SettingsPanel.vue     # 设置面板
├── stores/
│   └── gameStore.js          # 游戏状态管理
├── services/
│   ├── ai.js                 # AI 接口封装
│   └── wallet.js             # 钱包连接服务
├── router/
│   └── index.js              # 路由配置
├── styles/
│   └── main.css              # 全局样式与动画
├── App.vue
└── main.js
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 API Key：

```env
VITE_API_KEY=sk-your-api-key-here
VITE_API_URL=https://api.deepseek.com
VITE_MODEL=deepseek-chat
```

> 支持任何兼容 OpenAI Chat Completions API 的服务，只需修改 `VITE_API_URL` 和 `VITE_MODEL`。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`。

### 4. 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 游戏流程

```
首页 → 创建角色 → 选择世界 → 开始游戏
                                  ↓
                          ┌───────────────┐
                          │  AI 生成故事   │
                          │  展示叙事文本   │
                          │  属性变化通知   │
                          └───────┬───────┘
                                  ↓
                          ┌───────────────┐
                          │  玩家做出选择   │←─── 或自由输入
                          └───────┬───────┘
                                  ↓
                            时间推进一个月
                            记录属性快照
                            检查里程碑
                                  ↓
                          ┌───────────────┐
                          │  循环 / 游戏结束│
                          └───────────────┘
```

## 配置说明

### AI 接口

游戏内可通过 **设置面板**（`Esc` 打开）随时修改 API 地址、Key 和模型，无需重启。

### 钱包连接

- 非必需功能，不连接钱包也可正常游玩
- 连接后存档将绑定钱包地址，换设备可通过同一钱包恢复存档
- 支持 MetaMask 及所有 EIP-1193 兼容钱包

### 游戏设置

| 设置 | 说明 |
|---|---|
| 文字速度 | 打字机效果每字间隔（10-80ms） |
| 打字机效果 | 开关逐字显示 |
| 环境粒子 | 开关世界主题浮动粒子 |
| 自动保存 | 每回合自动存档 |

## License

MIT
