"use client";

import {
  Coffee, Cpu, Calculator, Landmark, TrendingUp, Clock, Scale, GitMerge
} from "lucide-react";
import { GAMES } from "@/games.config";

const ICON_MAP = { Coffee, Cpu, Calculator, Landmark, TrendingUp, Scale, GitMerge };
const DIFFICULTY_STARS = { easy: 1, medium: 2, hard: 3 };
const DIFFICULTY_LABELS = { easy: "入门", medium: "中级", hard: "进阶" };

export default function Home() {
  const firstGame = GAMES[0];

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">FinPlay Hub</p>
          <h1>用游戏驱动投行训练</h1>
          <p className="lead">
            专为 M&A 新手打造，从核心概念到业务模拟，通过游戏掌握投行工作语言。
          </p>
          <div className="actions">
            <a className="btn hero-btn-primary" href={`/games/${firstGame.slug}/`}>
              进入奶茶店
            </a>
            <a className="btn hero-btn-ghost" href="#game-library">
              查看游戏列表
            </a>
          </div>
        </div>
        <div className="glass-card">
          <div className="glass-card-head">
            <span className="glass-card-title">最近训练任务</span>
            <span className="glass-pill">进行中</span>
          </div>
          <div className="glass-card-body">
            <div className="glass-game-row">
              <div className="glass-game-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="10" r="1" fill="rgba(255,255,255,0.8)"/>
                  <circle cx="15" cy="10" r="1" fill="rgba(255,255,255,0.8)"/>
                </svg>
              </div>
              <div className="glass-game-info">
                <p className="glass-game-title">Milk Tea Pro</p>
                <p className="glass-game-meta">经营模拟 · EBITDA 训练</p>
              </div>
              <a className="btn btn-orange" href={`/games/${firstGame.slug}/`}>
                继续挑战
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="game-library">
        <h2>游戏库</h2>
        <div className="game-grid">
          {GAMES.map((game) => {
            const stars = DIFFICULTY_STARS[game.difficulty] || 1;
            const IconComp = ICON_MAP[game.icon];
            return (
              <div className="game-card" key={game.slug}>
                <div className="game-card-thumb css-thumb">
                  {IconComp && (
                    <IconComp size={56} strokeWidth={1.2} className="css-thumb-icon" style={{ color: game.iconColor }} />
                  )}
                  <span className="css-thumb-label">{game.module}</span>
                </div>
                <div className="game-card-body">
                  <h3 className="game-card-title">{game.title}</h3>
                  <p className="game-card-category">{game.description}</p>
                  <div className="game-card-stats">
                    <span className="stat">
                      <svg viewBox="0 0 16 16" fill="none"><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" fill="#f59e0b"/></svg>
                      {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                    </span>
                    <span className="stat" style={{ color: "#64748b", fontSize: "11px" }}>
                      {DIFFICULTY_LABELS[game.difficulty]}
                    </span>
                  </div>
                  <a className="btn btn-train" href={`/games/${game.slug}/`}>
                    开始训练
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
