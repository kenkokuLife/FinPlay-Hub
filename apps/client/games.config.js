// 游戏注册表 — 替代 DB Game 表
// 所有游戏元数据、难度、侧边栏 terms 在此统一定义
// difficulty: "easy" | "medium" | "hard"
// icon: lucide-react 图标名（字符串）
// terms: 侧边栏学习手册，key = 游戏 postMessage 的 action 名
//   iconName: lucide-react 图标名
//   iconColor: 图标颜色
//   highlight: 点亮的术语词（term-active）
//   words: [{ word, desc }]

export const GAMES = [
  {
    slug: "milk-tea-pro",
    title: "奶茶经营模拟",
    description: "通过经营奶茶店，理解 EBITDA、CAPEX、OPEX 的核心概念",
    difficulty: "easy",
    icon: "Coffee",
    iconColor: "#60a5fa",
    module: "MODULE: OPEX/CAPEX",
    terms: {
      start: {
        title: "欢迎进入训练",
        iconName: "BookOpenCheck",
        iconColor: "#a5b4fc",
        highlight: null,
        words: [
          { word: "EBITDA", desc: "Earnings Before Interest, Taxes, Depreciation & Amortization。扣除利息、税、折旧与摊销前的利润，衡量核心经营能力。" },
          { word: "EBIT", desc: "Earnings Before Interest & Taxes。营业利润，EBITDA 减去折旧后的结果。买机器后 EBIT 会被折旧拖低。" },
          { word: "利润表 (P&L)", desc: "Profit & Loss Statement，记录一段时间内的收入、成本和利润，是评估公司经营状况的核心报表。" },
        ]
      },
      marketing: {
        title: "你做了营销",
        iconName: "Megaphone",
        iconColor: "#9ca3af",
        highlight: "CAC",
        words: [
          { word: "SG&A 费用", desc: "Selling, General & Administrative Expenses。营销费属于 SG&A 的一部分，是经营性现金支出，直接减少 EBITDA。" },
          { word: "需求弹性", desc: "Price/Marketing Elasticity。营销投入 ¥200 带来 40 杯增量需求，边际收入 = 40 × 单价。当边际收入 > ¥200 时，这笔营销划算。" },
          { word: "CAC", desc: "Customer Acquisition Cost，获客成本。本场景中 CAC = ¥200 / 40 = ¥5/杯。对比单杯毛利可判断营销效率。" },
        ]
      },
      hire: {
        title: "你招了新员工",
        iconName: "UserPlus",
        iconColor: "#9ca3af",
        highlight: "固定成本 vs 变动成本",
        words: [
          { word: "固定成本 vs 变动成本", desc: "工资是固定成本（不随销量变化），原料是变动成本（随销量正比增长）。固定成本越高，盈亏平衡点越高。" },
          { word: "经营杠杆", desc: "Operating Leverage。固定成本占比越大，营收波动对利润的放大效应越强——赚得多时利润飙升，需求下滑时亏损也更剧烈。" },
          { word: "人效比", desc: "Revenue per Employee。衡量每位员工贡献的收入。招人增加产能但也增加固定工资支出，需确保需求匹配。" },
        ]
      },
      machine: {
        title: "你购买了机器",
        iconName: "Cpu",
        iconColor: "#f59e0b",
        highlight: "CapEx",
        words: [
          { word: "CapEx", desc: "Capital Expenditure，资本性支出。购买机器的 ¥5,000 是 CapEx，不会一次性计入利润表，而是通过折旧分摊。" },
          { word: "PP&E 折旧", desc: "Property, Plant & Equipment Depreciation。¥5,000 / 20 天 = 每天 ¥250 折旧。折旧减少 EBIT 但不影响 EBITDA（核心区别）。" },
          { word: "EBITDA vs EBIT", desc: "买机器后，EBITDA 不变（经营能力未变）但 EBIT 下降（多了折旧），这正是 M&A 中用 EBITDA 估值的原因——排除资本结构影响。" },
          { word: "EV/EBITDA 倍数", desc: "Enterprise Value / EBITDA，并购中最常用的估值倍数。本游戏用 10x EBITDA 作为参考估值。" },
        ]
      },
      settle: {
        title: "日结算完成",
        iconName: "BarChart3",
        iconColor: "#60a5fa",
        highlight: "收入确认",
        words: [
          { word: "收入确认", desc: "Revenue Recognition。销量 × 单价 = 营业收入。受 min(需求, 产能) 约束——产能不足会损失潜在收入。" },
          { word: "毛利率", desc: "Gross Margin = (收入 - 原料成本) / 收入。本游戏中单杯毛利 = ¥18 - ¥6 = ¥12，毛利率 ≈ 66.7%。" },
          { word: "现金流 vs 利润", desc: "Cash Flow ≠ Net Income。折旧是非现金费用：减少利润但不减少现金。买机器时现金流出但利润不变——这是财报分析的核心概念。" },
        ]
      },
      goal_pass: {
        title: "目标达成！",
        iconName: "Trophy",
        iconColor: "#fbbf24",
        highlight: "价值创造",
        words: [
          { word: "价值创造", desc: "Value Creation。你成功将 EBITDA 提升至 ¥1,000+，企业估值 = ¥1,000 × 10 = ¥10,000。这就是 M&A 中「经营改善提升估值」的核心逻辑。" },
          { word: "并购退出倍数", desc: "Exit Multiple。PE 基金买入后通过运营优化提升 EBITDA，再以相同或更高的倍数退出——这就是 LBO 的盈利模型。" },
        ]
      },
      goal_fail: {
        title: "目标未达成",
        iconName: "TrendingDown",
        iconColor: "#f87171",
        highlight: "盈亏平衡分析",
        words: [
          { word: "盈亏平衡分析", desc: "Break-even Analysis。固定成本 / 单杯边际贡献 = 盈亏平衡杯数。当需求或产能不足时，固定成本会吞噬利润。" },
          { word: "产能利用率", desc: "Capacity Utilization = 实际销量 / 产能。利用率过低意味着固定成本（工资、折旧）在空转，拖累 EBITDA。" },
        ]
      },
    }
  },

  {
    slug: "semiconductor",
    title: "半导体 M&A",
    description: "品牌收购、专利打击与股权融资，理解 M&A 中的 IP 估值逻辑",
    difficulty: "medium",
    icon: "Cpu",
    iconColor: "#a78bfa",
    module: "MODULE: M&A / IP",
    terms: {
      start: {
        title: "欢迎进入训练",
        iconName: "BookOpenCheck",
        iconColor: "#a5b4fc",
        highlight: null,
        words: [
          { word: "EBITDA", desc: "Earnings Before Interest, Taxes, Depreciation & Amortization。息税折旧摊销前利润，衡量并购资产赚取现金的能力。" },
          { word: "资产摊销", desc: "Amortization。专利类资产随时间贬值，每秒按 原值/寿命 扣减账面价值，归零后资产消失、收益停止。" },
          { word: "对手竞争", desc: "Rival Capital 每秒自动累积现金，代表市场竞争压力。你需要在对手积累足够资本前达成目标 EBITDA。" },
        ]
      },
      buy_brand: {
        title: "你并购了品牌资产",
        iconName: "ShoppingCart",
        iconColor: "#f59e0b",
        highlight: "品牌价值 (Brand)",
        words: [
          { word: "品牌价值 (Brand)", desc: "品牌类资产寿命无限（life: Infinity），不会摊销。一旦购入便永久产生收益，是最稳定的现金流来源。" },
          { word: "并购对价", desc: "Acquisition Cost。支付的现金即为资产入账价值。品牌 ¥5,000 → 每秒 +¥100，回本周期 = 50 秒。" },
          { word: "EV/EBITDA", desc: "Enterprise Value / EBITDA，并购中最常用的估值倍数。你的出价隐含了对未来现金流的预期。" },
        ]
      },
      buy_patent: {
        title: "你并购了专利资产",
        iconName: "Shield",
        iconColor: "#8b5cf6",
        highlight: "专利打击 (Strike)",
        words: [
          { word: "专利打击 (Strike)", desc: "Patent Strike。购买专利可降低对手的 EBITDA（rivalEbitda -= strike），这是并购战中的竞争壁垒策略。" },
          { word: "有限寿命", desc: "专利有使用寿命（life 字段），每秒摊销 = cost / life。价值归零后资产自动移出 Portfolio，收益停止。" },
          { word: "CapEx vs OpEx", desc: "专利购买是资本性支出 (CapEx)，通过摊销分期进入利润表；而非一次性费用化的经营支出 (OpEx)。" },
        ]
      },
      funding: {
        title: "你接受了股权融资",
        iconName: "Landmark",
        iconColor: "#10b981",
        highlight: "股权稀释",
        words: [
          { word: "股权稀释", desc: "Equity Dilution。出让 20% 股权后，你只保留 80% 的收益权。每秒实际收入 = EBITDA × 0.8。" },
          { word: "估值隐含", desc: "Implied Valuation。¥50,000 买 20% 股权 → 隐含估值 = ¥250,000。投资人认为你的公司值这么多。" },
          { word: "资金成本", desc: "Cost of Capital。股权融资没有利息但有机会成本——永久分走 20% 利润。需确保融资后能加速达成目标。" },
        ]
      },
      amortize: {
        title: "资产摊销发生中",
        iconName: "Clock",
        iconColor: "#fb923c",
        highlight: "账面价值",
        words: [
          { word: "账面价值", desc: "Book Value = 原值 - 累计摊销。当账面价值归零时资产到期移除，对应收入消失。" },
          { word: "重置投资", desc: "Replacement Investment。专利到期前需购入新资产维持收入水平，否则 EBITDA 会断崖式下降。" },
          { word: "折旧 vs 摊销", desc: "Depreciation 用于有形资产（机器），Amortization 用于无形资产（专利/品牌）。本游戏中专利使用摊销。" },
        ]
      },
    }
  },

  {
    slug: "actuary-pro",
    title: "精算师模拟",
    description: "风险定价、准备金计算与保险估值，理解精算学核心概念",
    difficulty: "medium",
    icon: "Calculator",
    iconColor: "#34d399",
    module: "MODULE: VALUATION",
    terms: {}
  },

  {
    slug: "bank_tycoon",
    htmlFile: "bank_tycoon.html",
    title: "银行大亨",
    description: "利差经营、资本充足率与信贷风险，理解银行业务核心逻辑",
    difficulty: "medium",
    icon: "Landmark",
    iconColor: "#f59e0b",
    module: "MODULE: BANKING",
    terms: {}
  },

  {
    slug: "short-squeeze",
    title: "逼空战",
    description: "做空机制、保证金风险与市场博弈，理解空头逼仓的核心原理",
    difficulty: "hard",
    icon: "TrendingUp",
    iconColor: "#f43f5e",
    module: "MODULE: TRADING",
    terms: {}
  },

  {
    slug: "ma-valuation",
    title: "M&A 估值通关",
    description: "通过概念问答掌握 DCF、EV/EBITDA、协同效应等并购估值核心方法论",
    difficulty: "medium",
    icon: "Scale",
    iconColor: "#38bdf8",
    module: "MODULE: VALUATION",
    terms: {
      start: {
        title: "估值桥梁入门",
        iconName: "Scale",
        iconColor: "#38bdf8",
        highlight: "Equity Value",
        words: [
          { word: "Equity Value（权益价值）", desc: "股东真正拿走的价值 = EV - 净负债 + 现金。并购谈判中的最终成交价就是围绕这个数字展开的。" },
          { word: "EV（企业价值）", desc: "Enterprise Value = EBITDA × 行业倍数。反映整个企业（含负债）的市场价值，是并购定价的起点。本游戏使用 6x 倍数。" },
          { word: "EBITDA 正常化", desc: "Normalized EBITDA。并购尽调的核心工作：剔除非经常性项目、非业务支出，还原公司'真实赚钱能力'。" },
        ]
      },
      ebitda_adj: {
        title: "EBITDA 调增识别",
        iconName: "TrendingUp",
        iconColor: "#10b981",
        highlight: "EBITDA 正常化",
        words: [
          { word: "EBITDA 正常化", desc: "Non-recurring / Non-operating 项目需要加回（add-back）。如高管私人开销、一次性事故损失——这些不代表业务持续盈利能力。" },
          { word: "Add-back 乘数效应", desc: "加回 X 万 EBITDA，估值增加 X × EV/EBITDA 倍数。本游戏倍数 6x：加回 300 万 → 估值 +1,800 万，这就是尽调的价值所在。" },
          { word: "Quality of Earnings", desc: "QoE 报告的核心章节，分析 EBITDA 中有多少是真实可持续的，加回/调减后得出'高质量 EBITDA'。" },
        ]
      },
      debt_adj: {
        title: "Net Debt 调减识别",
        iconName: "TrendingDown",
        iconColor: "#f43f5e",
        highlight: "Debt-like Item",
        words: [
          { word: "Debt-like Item（类负债）", desc: "不在资产负债表上的'坑'：未付薪酬、坏账、环境修复义务等。买家接手后必须支付，因此从成交价 1:1 扣除。" },
          { word: "Net Debt 调整", desc: "Net Debt = 有息负债 - 现金 + 类负债。尽调中每发现一个 Debt-like Item，Equity Value 直接下调，这是保护买家的核心机制。" },
          { word: "惯例价格调整", desc: "Closing Adjustment。签约时约定基准净负债值，交割时按实际差额调整最终价格，防止卖方在交割前转移现金或积累隐性负债。" },
        ]
      },
      wrong_choice: {
        title: "判断偏差 — 重新理解",
        iconName: "BookOpenCheck",
        iconColor: "#f59e0b",
        highlight: null,
        words: [
          { word: "调整分类框架", desc: "核心判断：这个项目影响的是'持续赚钱能力'（→ 调 EBITDA）还是'一次性的坑'（→ 调 Net Debt）？持续性影响调 EBITDA，历史遗留一次性债务调 Net Debt。" },
          { word: "频率检验法", desc: "判断技巧：问自己'这件事明年还会发生吗？'若不会 → 加回 EBITDA；若是历史欠账 → 放入 Net Debt。" },
        ]
      },
      complete: {
        title: "尽调完成！",
        iconName: "Trophy",
        iconColor: "#fbbf24",
        highlight: "最终 Equity Value",
        words: [
          { word: "最终 Equity Value", desc: "经过正常化调整后的估值才是真实成交价基础。你找出了所有隐藏的 add-back 和 debt-like items，让买家避免了高估成本。" },
          { word: "并购分析师的价值", desc: "M&A Analyst 的核心工作不是搭 DCF 模型，而是找出财报背后的真相——每一个 add-back / Debt-like Item 都可能改变数千万的成交价。" },
        ]
      },
    }
  },

  {
    slug: "bridge-hunter",
    title: "价值桥猎手",
    description: "模拟并购谈判，识别价值差距、拆解交易结构，掌握 Value Bridge 分析框架",
    difficulty: "hard",
    icon: "GitMerge",
    iconColor: "#fb7185",
    module: "MODULE: M&A / DEAL",
    terms: {}
  },
]
