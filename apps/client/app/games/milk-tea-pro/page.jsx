"use client";

import { useEffect, useRef, useState } from "react";

const TERMS = {
  start: {
    title: "欢迎进入训练",
    icon: "📘",
    terms: [
      {
        word: "EBITDA",
        desc: "Earnings Before Interest, Taxes, Depreciation & Amortization。扣除利息、税、折旧与摊销前的利润，衡量核心经营能力。"
      },
      {
        word: "EBIT",
        desc: "Earnings Before Interest & Taxes。营业利润，EBITDA 减去折旧后的结果。买机器后 EBIT 会被折旧拖低。"
      },
      {
        word: "利润表 (P&L)",
        desc: "Profit & Loss Statement，记录一段时间内的收入、成本和利润，是评估公司经营状况的核心报表。"
      }
    ]
  },
  marketing: {
    title: "你做了营销",
    icon: "📢",
    terms: [
      {
        word: "SG&A 费用",
        desc: "Selling, General & Administrative Expenses。营销费属于 SG&A 的一部分，是经营性现金支出，直接减少 EBITDA。"
      },
      {
        word: "需求弹性",
        desc: "Price/Marketing Elasticity。营销投入 ¥200 带来 40 杯增量需求，边际收入 = 40 × 单价。当边际收入 > ¥200 时，这笔营销划算。"
      },
      {
        word: "CAC",
        desc: "Customer Acquisition Cost，获客成本。本场景中 CAC = ¥200 / 40 = ¥5/杯。对比单杯毛利可判断营销效率。"
      }
    ]
  },
  hire: {
    title: "你招了新员工",
    icon: "👤",
    terms: [
      {
        word: "固定成本 vs 变动成本",
        desc: "工资是固定成本（不随销量变化），原料是变动成本（随销量正比增长）。固定成本越高，盈亏平衡点越高。"
      },
      {
        word: "经营杠杆",
        desc: "Operating Leverage。固定成本占比越大，营收波动对利润的放大效应越强——赚得多时利润飙升，需求下滑时亏损也更剧烈。"
      },
      {
        word: "人效比",
        desc: "Revenue per Employee。衡量每位员工贡献的收入。招人增加产能但也增加固定工资支出，需确保需求匹配。"
      }
    ]
  },
  machine: {
    title: "你购买了机器",
    icon: "🏭",
    terms: [
      {
        word: "CapEx",
        desc: "Capital Expenditure，资本性支出。购买机器的 ¥5,000 是 CapEx，不会一次性计入利润表，而是通过折旧分摊。"
      },
      {
        word: "PP&E 折旧",
        desc: "Property, Plant & Equipment Depreciation。¥5,000 / 20 天 = 每天 ¥250 折旧。折旧减少 EBIT 但不影响 EBITDA（核心区别）。"
      },
      {
        word: "EBITDA vs EBIT",
        desc: "买机器后，EBITDA 不变（经营能力未变）但 EBIT 下降（多了折旧），这正是 M&A 中用 EBITDA 估值的原因——排除资本结构影响。"
      },
      {
        word: "EV/EBITDA 倍数",
        desc: "Enterprise Value / EBITDA，并购中最常用的估值倍数。本游戏用 10x EBITDA 作为参考估值。"
      }
    ]
  },
  settle: {
    title: "日结算完成",
    icon: "📊",
    terms: [
      {
        word: "收入确认",
        desc: "Revenue Recognition。销量 × 单价 = 营业收入。受 min(需求, 产能) 约束——产能不足会损失潜在收入。"
      },
      {
        word: "毛利率",
        desc: "Gross Margin = (收入 - 原料成本) / 收入。本游戏中单杯毛利 = ¥18 - ¥6 = ¥12，毛利率 ≈ 66.7%。"
      },
      {
        word: "现金流 vs 利润",
        desc: "Cash Flow ≠ Net Income。折旧是非现金费用：减少利润但不减少现金。买机器时现金流出但利润不变——这是财报分析的核心概念。"
      }
    ]
  },
  goal_pass: {
    title: "目标达成！",
    icon: "🏆",
    terms: [
      {
        word: "价值创造",
        desc: "Value Creation。你成功将 EBITDA 提升至 ¥1,000+，企业估值 = ¥1,000 × 10 = ¥10,000。这就是 M&A 中「经营改善提升估值」的核心逻辑。"
      },
      {
        word: "并购退出倍数",
        desc: "Exit Multiple。PE 基金买入后通过运营优化提升 EBITDA，再以相同或更高的倍数退出——这就是 LBO 的盈利模型。"
      }
    ]
  },
  goal_fail: {
    title: "目标未达成",
    icon: "📉",
    terms: [
      {
        word: "盈亏平衡分析",
        desc: "Break-even Analysis。固定成本 / 单杯边际贡献 = 盈亏平衡杯数。当需求或产能不足时，固定成本会吞噬利润。"
      },
      {
        word: "产能利用率",
        desc: "Capacity Utilization = 实际销量 / 产能。利用率过低意味着固定成本（工资、折旧）在空转，拖累 EBITDA。"
      }
    ]
  }
};

export default function MilkTeaProPage() {
  const [entries, setEntries] = useState([TERMS.start]);
  const [expanded, setExpanded] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (!d || d.source !== "milk-tea-pro") return;
      const entry = TERMS[d.action];
      if (!entry) return;
      setEntries((prev) => {
        if (prev[0] === entry) return prev;
        return [entry, ...prev];
      });
      setExpanded(0);
      setSidebarOpen(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [entries]);

  return (
    <div className="game-layout">
      <div className="game-main">
        <iframe
          src="/games/milk-tea-pro/index.html"
          className="game-iframe"
          title="Milk Tea Pro"
        />
      </div>

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
              <span className="sidebar-icon">📖</span>
              <h3>实时学习手册</h3>
            </div>
            <p className="sidebar-hint">
              操作游戏时，这里会自动弹出对应的专业术语解释
            </p>

            <div className="sidebar-list" ref={listRef}>
              {entries.map((entry, idx) => (
                <div
                  key={`${entry.title}-${idx}`}
                  className={`term-group ${idx === 0 ? "term-latest" : ""}`}
                >
                  <button
                    className="term-group-header"
                    onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                  >
                    <span className="term-group-icon">{entry.icon}</span>
                    <span className="term-group-title">{entry.title}</span>
                    <span className={`term-chevron ${expanded === idx ? "open" : ""}`}>
                      ‹
                    </span>
                  </button>

                  {expanded === idx && (
                    <div className="term-cards">
                      {entry.terms.map((t) => (
                        <div className="term-card" key={t.word}>
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
}
