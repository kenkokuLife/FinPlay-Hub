# FinPlay-Hub 游戏开发规范

> 本文档是项目内新建游戏的唯一参考手册，基于 milk-tea-pro 和 semiconductor 两个游戏总结而成。

---

## 1. 架构选型

> **结论：新游戏统一使用 Type B（React 原生）。** Type A 仅 milk-tea-pro 保留，不再新建。

| | Type A — iframe 游戏（遗留） | Type B — React 原生游戏（推荐） |
|---|---|---|
| 示例 | milk-tea-pro（仅此一个） | semiconductor |
| 游戏逻辑 | `public/games/{slug}/index.html` + JS | `page.jsx` 内 useState + setInterval |
| 侧边栏通信 | `window.postMessage` | 直接调用 `pushTerm()` |
| 适合场景 | ~~独立 HTML 游戏移植~~ **已停用** | 所有新游戏 |

---

## 2. 目录结构 & 注册流程

```
# Type B（新游戏统一用这个）
apps/client/app/games/{slug}/
  ├── page.jsx            ← 游戏逻辑 + 侧边栏
  └── {slug}.css          ← 游戏专属样式（sc- 前缀参照 semiconductor）

# Type A（遗留，仅 milk-tea-pro，不再新建）
apps/client/public/games/milk-tea-pro/
  ├── index.html
  └── script.js
apps/client/app/games/milk-tea-pro/
  └── page.jsx            ← iframe wrapper + 侧边栏
```

**注册步骤：**
1. 首页「新发现」区域点击「写入数据库」
2. 进后台 `/admin` → 将状态改为 `ACTIVE`
3. 在 [apps/client/app/page.jsx](apps/client/app/page.jsx) 的 `GAME_CARD_META` 里加图标配置（见第 6 节）

---

## 3. 侧边栏学习手册

**所有 CSS 类名已在 `globals.css` 中定义，不需要自己写，直接用。**

### 3.1 TERMS 数据结构

```js
import { BookOpenCheck, ShoppingCart, Clock } from "lucide-react";

const ICON_PROPS = { size: 18, strokeWidth: 1.5 };

const TERMS = {
  start: {
    title: "欢迎进入训练",
    icon: <BookOpenCheck {...ICON_PROPS} style={{ color: "#a5b4fc" }} />,
    terms: [
      { word: "术语名称", desc: "术语解释，建议 40-80 字。" },
    ]
  },
  some_action: {
    title: "你做了某个操作",
    icon: <ShoppingCart {...ICON_PROPS} style={{ color: "#f59e0b" }} />,
    terms: [
      { word: "术语名称", desc: "解释文字。" },
    ]
  },
};

// action → 高亮的具体 term word
const HIGHLIGHT_MAP = {
  some_action: "术语名称",
};
```

### 3.2 State & pushTerm

```js
const [entries, setEntries] = useState([TERMS.start]);
const [expanded, setExpanded] = useState(0);
const [sidebarOpen, setSidebarOpen] = useState(true);
const [activeTerm, setActiveTerm] = useState(null);
const [scrollKey, setScrollKey] = useState(0);
const listRef = useRef(null);
const groupRefs = useRef({});

const pushTerm = useCallback((action) => {
  const entry = TERMS[action];
  if (!entry) return;
  setEntries(prev => {
    const existIdx = prev.indexOf(entry);
    if (existIdx >= 0) {
      setExpanded(existIdx);
      setSidebarOpen(true);
      setActiveTerm(HIGHLIGHT_MAP[action] || null);
      setScrollKey(k => k + 1);
      return prev;
    }
    setExpanded(0);
    setSidebarOpen(true);
    setActiveTerm(HIGHLIGHT_MAP[action] || null);
    setScrollKey(k => k + 1);
    return [entry, ...prev];
  });
}, []);

// 自动滚动到展开项
useEffect(() => {
  if (scrollKey === 0) return;
  requestAnimationFrame(() => {
    const node = groupRefs.current[expanded];
    if (node) node.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}, [scrollKey, expanded]);
```

### 3.3 JSX 结构（完整骨架）

```jsx
return (
  <div className="game-layout">
    {/* 游戏主体 */}
    <div className="game-main">
      {/* Type A: <iframe src="/games/{slug}/index.html" className="game-iframe" /> */}
      {/* Type B: 游戏 UI */}
    </div>

    {/* 侧边栏 */}
    <aside className={`game-sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "收起" : "展开手册"}
      >
        {sidebarOpen ? "›" : "‹"}
      </button>

      {sidebarOpen && (
        <>
          <div className="sidebar-header">
            <span className="sidebar-icon">
              <BookOpenCheck size={20} strokeWidth={1.5} style={{ color: "#a5b4fc" }} />
            </span>
            <h3>实时学习手册</h3>
          </div>
          <p className="sidebar-hint">
            {activeTerm
              ? <>当前聚焦：<strong className="sidebar-hint-term">{activeTerm}</strong></>
              : "操作游戏时，这里会自动弹出对应的专业术语解释"}
          </p>

          <div className="sidebar-list" ref={listRef}>
            {entries.map((entry, idx) => (
              <div
                key={`${entry.title}-${idx}`}
                ref={(el) => { groupRefs.current[idx] = el; }}
                className={`term-group ${expanded === idx ? "term-latest" : ""}`}
              >
                <button
                  className="term-group-header"
                  onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                >
                  <span className="term-group-icon">{entry.icon}</span>
                  <span className="term-group-title">{entry.title}</span>
                  <span className={`term-chevron ${expanded === idx ? "open" : ""}`}>‹</span>
                </button>
                {expanded === idx && (
                  <div className="term-cards">
                    {entry.terms.map((t) => (
                      <div
                        className={`term-card ${activeTerm === t.word ? "term-active" : ""}`}
                        key={t.word}
                      >
                        <div className="term-word">{t.word}</div>
                        <div className="term-desc">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  </div>
);
```

### 3.4 Type A（iframe）的通信写法

```js
// 游戏 HTML 内发送事件
window.parent.postMessage({ source: "{slug}", action: "some_action" }, "*");

// page.jsx 内监听
useEffect(() => {
  function onMessage(e) {
    const d = e.data;
    if (!d || d.source !== "{slug}") return;
    pushTerm(d.action);
  }
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}, [pushTerm]);
```

---

## 4. CSS 规范

### 4.1 可直接复用的 globals.css 类名

| 用途 | 类名 |
|---|---|
| 整体布局 | `.game-layout` `.game-main` `.game-iframe` |
| 侧边栏容器 | `.game-sidebar` `.game-sidebar.open` `.game-sidebar.closed` |
| 侧边栏内部 | `.sidebar-toggle` `.sidebar-header` `.sidebar-hint` `.sidebar-hint-term` `.sidebar-list` `.sidebar-icon` |
| 术语组 | `.term-group` `.term-group.term-latest` `.term-group-header` `.term-group-icon` `.term-group-title` `.term-chevron` `.term-chevron.open` |
| 术语卡片 | `.term-cards` `.term-card` `.term-card.term-active` `.term-word` `.term-desc` |

### 4.2 游戏专属 CSS

- 文件放在 `app/games/{slug}/{slug}.css`
- 类名统一加前缀，避免污染全局（如 `sc-` for semiconductor，`bt-` for bank-tycoon）
- `.sc-root` 设 `height: 100%; overflow-y: auto`（适配 `.game-main` 容器，不用 `min-height: 100vh`）

### 4.3 视觉规范

**玻璃拟态面板：**
```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

**色彩语义（游戏内通用）：**
```
#10b981  绿   玩家 / 收益 / 正向事件
#f43f5e  红   对手 / 风险 / 负向事件
#8b5cf6  紫   专利 / 技术资产
#f59e0b  橙   品牌 / 实物资产
#60a5fa  蓝   信息 / 融资
#fb7185  玫红 打击 / 惩罚
```

**字体规则：**
- 金额/数字：`font-family: ui-monospace, monospace`
- 标签/章节标题：`font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em`
- 卡片正文：`font-size: 12px; line-height: 1.625`

**禁止使用 emoji**，图标统一用 `lucide-react`：
```js
import { SomeIcon } from "lucide-react";
// 默认规格
<SomeIcon size={18} strokeWidth={1.5} />
```

---

## 5. MASTER_DATA（Type B 必须）

React 原生游戏所有可变内容必须集中在 `MASTER_DATA`，禁止在 JSX 中硬编码文案。

```js
const MASTER_DATA = {
  gameId: "{slug}",
  title: "游戏标题",
  initial: {
    cash: 10000,          // 初始资金
    rivalEbitda: 50,      // 对手初始收益/s
    targetEbitda: 1000,   // 胜利条件
  },
  labels: {
    player: "Player Corp",
    rival: "Rival Capital",
    targetLabel: "Target EBITDA",
    pressureLabel: "Pressure",
    marketTitle: "M&A Market",
    assetTitle: "Asset Structure",
    logTitle: "Audit Log",
    portfolioTitle: "Portfolio / 持有明细",
  },
  market: [
    {
      id: "m1",
      name: "资产名称",
      type: "BRAND",           // BRAND（永久）或 PATENT（有寿命）
      cost: 5000,
      income: 100,             // 每秒收益
      life: Infinity,          // BRAND 用 Infinity，PATENT 用数字（秒数）
      unlock: 0,               // 解锁所需现金（暂未实现，留作扩展）
      color: "#f59e0b",        // Portfolio 显示颜色
      msg: "购买成功的日志文字。",
      strike: undefined,       // PATENT 专用：降低对手 rivalEbitda 的数值
    },
  ],
  funding: {
    threshold: 300,            // 触发融资机会的 EBITDA 阈值
    amount: 50000,             // 融资金额
    equityAfter: 0.8,          // 融资后保留股权比例
    title: "融资机会！",
    desc: "出让20%股权获取 ¥50,000",
    btn: "接受注入",
    log: "A轮融资完成：现金+50k，股权稀释20%",
  },
};
```

---

## 6. 首页卡片配置

新游戏注册后，在 [apps/client/app/page.jsx](apps/client/app/page.jsx) 的 `GAME_CARD_META` 中添加一行：

```js
// 先 import 图标
import { Coffee, Clock, Cpu, /* 新图标 */ } from "lucide-react";

const GAME_CARD_META = {
  "milk-tea-pro":  { icon: Coffee, label: "MODULE: OPEX/CAPEX", iconColor: "#60a5fa" },
  "semiconductor": { icon: Cpu,    label: "MODULE: M&A / IP",   iconColor: "#a78bfa" },
  // 新增：
  "{slug}":        { icon: XxxIcon, label: "MODULE: XXX",        iconColor: "#10b981" },
};
```

---

## 7. 埋点追踪（必须添加）

每个游戏的 `page.jsx` 都必须加以下两个 `useEffect`：

```js
// 页面加载时记录一次 launch
useEffect(() => {
  fetch("/api/games/{slug}/launch/", { method: "POST" }).catch(() => {});
}, []);

// 每 60 秒记录在线时长
useEffect(() => {
  const id = setInterval(() => {
    fetch("/api/games/{slug}/playtime/", { method: "POST" }).catch(() => {});
  }, 60000);
  return () => clearInterval(id);
}, []);
```

---

## 8. 可用依赖

| 库 | 用途 | 示例 |
|---|---|---|
| `lucide-react` | 所有图标 | `<Cpu size={18} strokeWidth={1.5} />` |
| `chart.js` + `react-chartjs-2` | 图表（饼图等） | `<Doughnut data={...} options={...} />` |
| `@prisma/client` | 数据库（API routes 中） | `prisma.game.findMany(...)` |
| `jsonwebtoken` | JWT 鉴权（API routes 中） | 已封装在 `lib/auth.js` |

---

## 9. 快速 Checklist

新建游戏时按顺序确认：

- [ ] 确定架构类型（iframe / React 原生）
- [ ] 创建对应目录和文件
- [ ] `page.jsx` 顶部加 `"use client"`
- [ ] 侧边栏 5 个 state + `pushTerm()` + `scrollKey` effect 全部加上
- [ ] JSX 最外层用 `.game-layout`，侧边栏用 `<aside class="game-sidebar open|closed">`
- [ ] MASTER_DATA 包含所有文案（无硬编码）
- [ ] 游戏专属 CSS 文件类名加前缀
- [ ] 埋点：launch + playtime 两个 useEffect
- [ ] 首页 `GAME_CARD_META` 加图标配置
- [ ] Docker 热更新自动生效，刷新页面验证
- [ ] 后台注册并设为 ACTIVE
