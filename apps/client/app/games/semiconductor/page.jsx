"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  BookOpenCheck,
  ShoppingCart,
  Clock,
  Shield,
  Landmark
} from "lucide-react";
import './semiconductor.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ICON_PROPS = { size: 18, strokeWidth: 1.5 };

// --- Master 数据 ---
const MASTER_DATA = {
  gameId: "semiconductor",
  title: "奶茶并购大亨：资本博弈",
  initial: { cash: 10000, rivalEbitda: 50, targetEbitda: 1000 },
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
    { id: 'm1', name: '加盟店配方', type: 'BRAND', cost: 5000, income: 100, life: Infinity, unlock: 0, color: '#f59e0b', msg: '核心配方已入库，品牌价值确立。' },
    { id: 'p1', name: '全自动封装专利', type: 'PATENT', cost: 15000, income: 450, life: 100, unlock: 8000, color: '#8b5cf6', strike: 150, msg: '专利布局成功！拦截了竞争对手的供应链。' },
    { id: 'p2', name: '冷链物流专利', type: 'PATENT', cost: 40000, income: 1100, life: 150, unlock: 25000, color: '#a78bfa', strike: 300, msg: '全线冷链封锁，对手利润大幅缩减。' }
  ],
  funding: {
    threshold: 300,
    amount: 50000,
    equityAfter: 0.8,
    title: "融资机会！",
    desc: "出让20%股权获取 ¥50,000",
    btn: "接受注入",
    log: "A轮融资完成：现金+50k，股权稀释20%",
  },
};

// --- 学习手册术语 ---
const TERMS = {
  start: {
    title: "欢迎进入训练",
    icon: <BookOpenCheck {...ICON_PROPS} style={{ color: "#a5b4fc" }} />,
    terms: [
      { word: "EBITDA", desc: "Earnings Before Interest, Taxes, Depreciation & Amortization。息税折旧摊销前利润，衡量并购资产赚取现金的能力。" },
      { word: "资产摊销", desc: "Amortization。专利类资产随时间贬值，每秒按 原值/寿命 扣减账面价值，归零后资产消失、收益停止。" },
      { word: "对手竞争", desc: "Rival Capital 每秒自动累积现金，代表市场竞争压力。你需要在对手积累足够资本前达成目标 EBITDA。" }
    ]
  },
  buy_brand: {
    title: "你并购了品牌资产",
    icon: <ShoppingCart {...ICON_PROPS} style={{ color: "#f59e0b" }} />,
    terms: [
      { word: "品牌价值 (Brand)", desc: "品牌类资产寿命无限（life: Infinity），不会摊销。一旦购入便永久产生收益，是最稳定的现金流来源。" },
      { word: "并购对价", desc: "Acquisition Cost。支付的现金即为资产入账价值。品牌 ¥5,000 → 每秒 +¥100，回本周期 = 50 秒。" },
      { word: "EV/EBITDA", desc: "Enterprise Value / EBITDA，并购中最常用的估值倍数。你的出价隐含了对未来现金流的预期。" }
    ]
  },
  buy_patent: {
    title: "你并购了专利资产",
    icon: <Shield {...ICON_PROPS} style={{ color: "#8b5cf6" }} />,
    terms: [
      { word: "专利打击 (Strike)", desc: "Patent Strike。购买专利可降低对手的 EBITDA（rivalEbitda -= strike），这是并购战中的竞争壁垒策略。" },
      { word: "有限寿命", desc: "专利有使用寿命（life 字段），每秒摊销 = cost / life。价值归零后资产自动移出 Portfolio，收益停止。" },
      { word: "CapEx vs OpEx", desc: "专利购买是资本性支出 (CapEx)，通过摊销分期进入利润表；而非一次性费用化的经营支出 (OpEx)。" }
    ]
  },
  funding: {
    title: "你接受了股权融资",
    icon: <Landmark {...ICON_PROPS} style={{ color: "#10b981" }} />,
    terms: [
      { word: "股权稀释", desc: "Equity Dilution。出让 20% 股权后，你只保留 80% 的收益权。每秒实际收入 = EBITDA × 0.8。" },
      { word: "估值隐含", desc: "Implied Valuation。¥50,000 买 20% 股权 → 隐含估值 = ¥250,000。投资人认为你的公司值这么多。" },
      { word: "资金成本", desc: "Cost of Capital。股权融资没有利息但有机会成本——永久分走 20% 利润。需确保融资后能加速达成目标。" }
    ]
  },
  amortize: {
    title: "资产摊销发生中",
    icon: <Clock {...ICON_PROPS} style={{ color: "#fb923c" }} />,
    terms: [
      { word: "账面价值", desc: "Book Value = 原值 - 累计摊销。当账面价值归零时资产到期移除，对应收入消失。" },
      { word: "重置投资", desc: "Replacement Investment。专利到期前需购入新资产维持收入水平，否则 EBITDA 会断崖式下降。" },
      { word: "折旧 vs 摊销", desc: "Depreciation 用于有形资产（机器），Amortization 用于无形资产（专利/品牌）。本游戏中专利使用摊销。" }
    ]
  }
};

const HIGHLIGHT_MAP = {
  buy_brand: "品牌价值 (Brand)",
  buy_patent: "专利打击 (Strike)",
  funding: "股权稀释",
  amortize: "账面价值"
};

const LOG_COLORS = { buy: 'sc-color-buy', strike: 'sc-color-strike', info: 'sc-color-info' };

export default function SemiconductorPage() {
  // --- Game state ---
  const [state, setState] = useState({
    cash: MASTER_DATA.initial.cash,
    ebitda: 0,
    assets: 0,
    amort: 0,
    rivalCash: 10000,
    rivalEbitda: MASTER_DATA.initial.rivalEbitda,
    portfolio: [],
    equity: 1,
    fundingUsed: false,
    logs: []
  });

  // --- Sidebar state ---
  const [entries, setEntries] = useState([TERMS.start]);
  const [expanded, setExpanded] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTerm, setActiveTerm] = useState(null);
  const [scrollKey, setScrollKey] = useState(0);
  const listRef = useRef(null);
  const groupRefs = useRef({});
  const amortNotified = useRef(false);

  // --- Sidebar helper ---
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

  // Scroll to expanded group
  useEffect(() => {
    if (scrollKey === 0) return;
    requestAnimationFrame(() => {
      const node = groupRefs.current[expanded];
      if (node) node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [scrollKey, expanded]);

  // --- Game log ---
  const addLog = useCallback((msg, type) => {
    const newLog = { id: Date.now(), time: new Date().toLocaleTimeString().split(' ')[0], msg, color: LOG_COLORS[type] || 'sc-color-default' };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 10) }));
  }, []);

  // --- Game tick ---
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        let income = 0;
        let amortTotal = prev.amort;
        let hasAmort = false;

        const updatedPortfolio = prev.portfolio.map(a => {
          income += a.income;
          if (a.life !== Infinity) {
            const step = a.original / a.life;
            amortTotal += step;
            hasAmort = true;
            return { ...a, val: Math.max(0, a.val - step) };
          }
          return a;
        }).filter(a => a.val > 0);

        if (hasAmort && !amortNotified.current) {
          amortNotified.current = true;
          setTimeout(() => pushTerm('amortize'), 0);
        }

        const currentAssets = updatedPortfolio.reduce((sum, a) => sum + a.val, 0);

        return {
          ...prev,
          cash: prev.cash + (income * prev.equity),
          ebitda: income,
          assets: currentAssets,
          amort: amortTotal,
          portfolio: updatedPortfolio,
          rivalCash: prev.rivalCash + prev.rivalEbitda,
          rivalEbitda: prev.rivalEbitda + 0.2
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pushTerm]);

  // --- Buy action ---
  const buy = (item) => {
    if (state.cash < item.cost) return;
    setState(prev => ({
      ...prev,
      cash: prev.cash - item.cost,
      portfolio: [...prev.portfolio, { ...item, val: item.cost, original: item.cost }],
      rivalEbitda: item.strike ? Math.max(10, prev.rivalEbitda - item.strike) : prev.rivalEbitda
    }));
    addLog(item.msg, 'buy');
    if (item.strike) addLog(`专利打击！对手收益降低 ¥${item.strike}`, 'strike');
    pushTerm(item.type === 'BRAND' ? 'buy_brand' : 'buy_patent');
  };

  // --- Funding action ---
  const acceptFunding = () => {
    const f = MASTER_DATA.funding;
    setState(prev => ({ ...prev, cash: prev.cash + f.amount, equity: f.equityAfter, fundingUsed: true }));
    addLog(f.log, "info");
    pushTerm('funding');
  };

  // --- Chart data ---
  const chartData = {
    labels: ['专利', '品牌'],
    datasets: [{
      data: [
        state.portfolio.filter(a => a.type === 'PATENT').reduce((s, a) => s + a.val, 0),
        state.portfolio.filter(a => a.type === 'BRAND').reduce((s, a) => s + a.val, 0)
      ],
      backgroundColor: ['#8b5cf6', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const { labels, funding } = MASTER_DATA;

  return (
    <div className="game-layout">
      {/* ========== 左侧：游戏主体 ========== */}
      <div className="game-main">
        <div className="sc-root">
          <div className="sc-container">

            {/* 顶部面板 */}
            <div className="sc-top-row">
              <div className="sc-panel sc-panel-player">
                <div>
                  <p className="sc-label sc-label-player">{labels.player}</p>
                  <h1 className="sc-cash">¥{Math.floor(state.cash).toLocaleString()}</h1>
                  <p className="sc-sub">股权: {state.equity*100}% | EBITDA: ¥{Math.floor(state.ebitda*state.equity)}/s</p>
                </div>
                <div className="sc-text-right">
                  <p className="sc-small-label">{labels.targetLabel}</p>
                  <p className="sc-target">¥{MASTER_DATA.initial.targetEbitda.toLocaleString()}</p>
                </div>
              </div>
              <div className="sc-panel sc-panel-rival">
                <div>
                  <p className="sc-label sc-label-rival">{labels.rival}</p>
                  <h1 className="sc-cash sc-cash-rival">¥{Math.floor(state.rivalCash).toLocaleString()}</h1>
                </div>
                <div className="sc-text-right">
                  <p className="sc-small-label">{labels.pressureLabel}</p>
                  <p className="sc-pressure">+¥{Math.floor(state.rivalEbitda)}/s</p>
                </div>
              </div>
            </div>

            {/* 三栏主体 */}
            <div className="sc-main-grid">
              {/* 左栏：市场 */}
              <div className="sc-market sc-glass">
                <h3 className="sc-section-title">{labels.marketTitle}</h3>
                {state.ebitda >= funding.threshold && !state.fundingUsed && (
                  <div className="sc-funding">
                    <p className="sc-funding-title">{funding.title}</p>
                    <p className="sc-funding-desc">{funding.desc}</p>
                    <button onClick={acceptFunding} className="sc-btn-fund">{funding.btn}</button>
                  </div>
                )}
                {MASTER_DATA.market.map(item => (
                  <div key={item.id} className="sc-market-item">
                    <div>
                      <p className="sc-item-name">{item.name}</p>
                      <p className="sc-item-cost">¥{item.cost.toLocaleString()} | +{item.income}/s</p>
                    </div>
                    <button
                      disabled={state.cash < item.cost}
                      onClick={() => buy(item)}
                      className={`sc-btn-buy ${state.cash >= item.cost ? 'sc-btn-buy-active' : 'sc-btn-buy-disabled'}`}>
                      并购
                    </button>
                  </div>
                ))}
              </div>

              {/* 中栏：分析 */}
              <div className="sc-center">
                <div className="sc-center-top">
                  <div className="sc-card sc-chart-card">
                    <h4 className="sc-card-title sc-card-title-amber">{labels.assetTitle}</h4>
                    <div className="sc-chart-container">
                      <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }} />
                    </div>
                  </div>
                  <div className="sc-card sc-log-card">
                    <h4 className="sc-card-title sc-card-title-blue">{labels.logTitle}</h4>
                    <div className="sc-log-list">
                      {state.logs.map(log => (
                        <div key={log.id} className={`sc-log-entry ${log.color}`}>
                          <span className="sc-log-time">[{log.time}]</span>{log.msg}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="sc-card sc-portfolio-card">
                  <h4 className="sc-card-title sc-card-title-slate">{labels.portfolioTitle}</h4>
                  <div className="sc-portfolio-grid">
                    {state.portfolio.map((a, i) => (
                      <div key={i} className="sc-portfolio-item" style={{ borderColor: a.color }}>
                        <span className="sc-portfolio-name">{a.name}</span>
                        <span className="sc-portfolio-val">¥{Math.floor(a.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右栏留空（手册已移到侧边栏） */}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 右侧：实时学习手册 ========== */}
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
              <span className="sidebar-icon"><BookOpenCheck size={20} strokeWidth={1.5} style={{ color: "#a5b4fc" }} /></span>
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
                    <span className={`term-chevron ${expanded === idx ? "open" : ""}`}>
                      ‹
                    </span>
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
}
