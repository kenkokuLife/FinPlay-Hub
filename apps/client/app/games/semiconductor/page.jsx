"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './semiconductor.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- 这里就是你以后要追加/修改的 Master 数据 ---
const MASTER_DATA = {
  gameId: "milk-tea",
  title: "奶茶并购大亨：资本博弈",
  initial: { cash: 10000, rivalEbitda: 50, targetEbitda: 1000 },
  market: [
    { id: 'm1', name: '加盟店配方', type: 'BRAND', cost: 5000, income: 100, life: Infinity, unlock: 0, color: '#f59e0b', msg: '核心配方已入库，品牌价值确立。' },
    { id: 'p1', name: '全自动封装专利', type: 'PATENT', cost: 15000, income: 450, life: 100, unlock: 8000, color: '#8b5cf6', strike: 150, msg: '专利布局成功！拦截了竞争对手的供应链。' },
    { id: 'p2', name: '冷链物流专利', type: 'PATENT', cost: 40000, income: 1100, life: 150, unlock: 25000, color: '#a78bfa', strike: 300, msg: '全线冷链封锁，对手利润大幅缩减。' }
  ],
  manual: [
    { t: "EBITDA", c: "息税折旧摊销前利润，衡量并购资产赚取现金的能力。" },
    { t: "资产摊销", c: "专利类资产随时间贬值，需在价值归零前并购新资产。" },
    { t: "股权融资", c: "出让股权换取大额现金，但每秒收益会按比例分给股东。" }
  ]
};

const LOG_COLORS = { buy: 'sc-color-buy', strike: 'sc-color-strike', info: 'sc-color-info' };

export default function App() {
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

  const addLog = (msg, type) => {
    const newLog = { id: Date.now(), time: new Date().toLocaleTimeString().split(' ')[0], msg, color: LOG_COLORS[type] || 'sc-color-default' };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 10) }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        let income = 0;
        let amortTotal = prev.amort;

        const updatedPortfolio = prev.portfolio.map(a => {
          income += a.income;
          if (a.life !== Infinity) {
            const step = a.original / a.life;
            amortTotal += step;
            return { ...a, val: Math.max(0, a.val - step) };
          }
          return a;
        }).filter(a => a.val > 0);

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
  }, []);

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
  };

  const acceptFunding = () => {
    setState(prev => ({ ...prev, cash: prev.cash + 50000, equity: 0.8, fundingUsed: true }));
    addLog("A轮融资完成：现金+50k，股权稀释20%", "info");
  };

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

  return (
    <div className="sc-root">
      <div className="sc-container">

        {/* 顶部面板 */}
        <div className="sc-top-row">
          <div className="sc-panel sc-panel-player">
            <div>
              <p className="sc-label sc-label-player">Player Corp</p>
              <h1 className="sc-cash">¥{Math.floor(state.cash).toLocaleString()}</h1>
              <p className="sc-sub">股权: {state.equity*100}% | EBITDA: ¥{Math.floor(state.ebitda*state.equity)}/s</p>
            </div>
            <div className="sc-text-right">
              <p className="sc-small-label">Target EBITDA</p>
              <p className="sc-target">¥1,000</p>
            </div>
          </div>
          <div className="sc-panel sc-panel-rival">
            <div>
              <p className="sc-label sc-label-rival">Rival Capital</p>
              <h1 className="sc-cash sc-cash-rival">¥{Math.floor(state.rivalCash).toLocaleString()}</h1>
            </div>
            <div className="sc-text-right">
              <p className="sc-small-label">Pressure</p>
              <p className="sc-pressure">+¥{Math.floor(state.rivalEbitda)}/s</p>
            </div>
          </div>
        </div>

        <div className="sc-main-grid">
          {/* 左侧：市场 */}
          <div className="sc-market">
            <h3 className="sc-section-title">M&A Market</h3>
            {state.ebitda >= 300 && !state.fundingUsed && (
              <div className="sc-funding">
                <p className="sc-funding-title">融资机会！</p>
                <p className="sc-funding-desc">出让20%股权获取 ¥50,000</p>
                <button onClick={acceptFunding} className="sc-btn-fund">接受注入</button>
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

          {/* 中间：分析 */}
          <div className="sc-center">
            <div className="sc-center-top">
              <div className="sc-card sc-chart-card">
                <h4 className="sc-card-title sc-card-title-amber">Asset Structure</h4>
                <div className="sc-chart-wrap">
                  <Doughnut data={chartData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
                </div>
              </div>
              <div className="sc-card sc-log-card">
                <h4 className="sc-card-title sc-card-title-blue">Audit Log</h4>
                <div className="sc-log-list">
                  {state.logs.map(log => (
                    <div key={log.id} className={`sc-log-entry ${log.color}`}>
                      <span className="sc-log-time">[{log.time}]</span>{log.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sc-card">
              <h4 className="sc-card-title sc-card-title-slate">Portfolio / 持有明细</h4>
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

          {/* 右侧：手册 */}
          <div>
            <div className="sc-manual">
              <h4 className="sc-manual-title">运作手册</h4>
              {MASTER_DATA.manual.map((m, i) => (
                <div key={i}>
                  <p className="sc-manual-term">{m.t}</p>
                  <p className="sc-manual-desc">{m.c}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
