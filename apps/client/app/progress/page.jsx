"use client";

import { useEffect, useState } from "react";
import { Target, Clock, Trophy, ArrowRight } from "lucide-react";

const DIFFICULTY_LABELS = { EASY: "简单", MEDIUM: "中等", HARD: "困难", EXPERT: "专家" };
const CATEGORY_LABELS = {
  FINANCE: "财务",
  STRATEGY: "策略",
  OPERATIONS: "运营",
  INVESTING: "投资",
  OTHER: "其他"
};

export default function ProgressPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/games");
        if (res.ok) {
          const data = await res.json();
          setGames((data.games || []).filter((g) => g.status === "ACTIVE"));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>我的进度</h1>
        <p className="progress-subtitle">跟踪你的投行训练旅程</p>
      </div>

      <div className="progress-overview">
        <div className="progress-overview-card">
          <Target size={20} strokeWidth={1.5} />
          <div>
            <span className="progress-overview-value">{games.length}</span>
            <span className="progress-overview-label">可用训练</span>
          </div>
        </div>
        <div className="progress-overview-card">
          <Clock size={20} strokeWidth={1.5} />
          <div>
            <span className="progress-overview-value">0</span>
            <span className="progress-overview-label">已完成</span>
          </div>
        </div>
        <div className="progress-overview-card">
          <Trophy size={20} strokeWidth={1.5} />
          <div>
            <span className="progress-overview-value">--</span>
            <span className="progress-overview-label">最高成绩</span>
          </div>
        </div>
      </div>

      <section className="progress-section">
        <h2>训练列表</h2>
        {loading ? (
          <div className="empty-state">
            <div className="empty-spinner" />
            <p className="empty-text">加载中...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">暂无已上线的训练</p>
            <p className="empty-text">管理员上线游戏后，这里会显示你的训练进度</p>
          </div>
        ) : (
          <div className="progress-list">
            {games.map((game) => (
              <div className="progress-card" key={game.id}>
                <div className="progress-card-left">
                  <div className="progress-card-icon">
                    <Target size={22} strokeWidth={1.5} />
                  </div>
                  <div className="progress-card-info">
                    <h3>{game.title}</h3>
                    <div className="progress-card-meta">
                      <span>{CATEGORY_LABELS[game.category] || game.category}</span>
                      <span className="progress-card-dot" />
                      <span>{DIFFICULTY_LABELS[game.difficulty] || game.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="progress-card-right">
                  <span className="progress-card-status">未开始</span>
                  <a className="btn btn-train" href={`/games/${game.slug}/`}>
                    开始训练
                    <ArrowRight size={14} strokeWidth={2} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
