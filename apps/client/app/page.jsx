 "use client";

import { useEffect, useState } from "react";
import { Coffee, Clock } from "lucide-react";

const DIFFICULTY_STARS = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
const CATEGORY_LABELS = {
  FINANCE: "财务",
  STRATEGY: "策略",
  OPERATIONS: "运营",
  INVESTING: "投资",
  OTHER: "其他"
};

function formatPlayTime(minutes) {
  if (!minutes || minutes === 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Home() {
  const [games, setGames] = useState([]);
  const [newGames, setNewGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [gamesRes, discoverRes] = await Promise.all([
          fetch("/api/games"),
          fetch("/api/games/discover")
        ]);
        if (active) {
          if (gamesRes.ok) {
            const gData = await gamesRes.json();
            setGames((gData.games || []).filter((g) => g.status === "ACTIVE"));
          }
          if (discoverRes.ok) {
            const dData = await discoverRes.json();
            setNewGames(dData.newGames || []);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const handleRegister = async (slug) => {
    setRegisterError("");
    setRegistering((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch("/api/games/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRegisterError(data.error || "注册失败");
        return;
      }
      setNewGames((prev) => prev.filter((item) => item !== slug));
    } finally {
      setRegistering((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const firstGame = games[0];

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">FinPlay Hub</p>
          <h1>用游戏驱动投行训练</h1>
          <p className="lead">
            专为 M&A 专业人士打造，通过模拟实战掌握财报与估值核心。
          </p>
          <div className="actions">
            <a className="btn hero-btn-primary" href={firstGame ? `/games/${firstGame.slug}/` : "#game-library"}>
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
              <a className="btn btn-orange" href={firstGame ? `/games/${firstGame.slug}/` : "/games/milk-tea-pro/"}>
                继续挑战
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="game-library">
        <h2>游戏库</h2>
        {games.length === 0 && !loading ? (
          <div className="empty-state">
            <p className="empty-title">暂无已上线的游戏</p>
            <p className="empty-text">管理员需要先在后台将游戏状态设为「已上线」</p>
          </div>
        ) : (
          <div className="game-grid">
            {games.map((game) => {
              const stars = DIFFICULTY_STARS[game.difficulty] || 2;
              const playTime = formatPlayTime(game.totalPlayTime);
              return (
                <div className="game-card" key={game.id}>
                  <div className="game-card-thumb css-thumb">
                    <Coffee size={56} strokeWidth={1.2} className="css-thumb-icon" />
                    <span className="css-thumb-label">MODULE: OPEX/CAPEX</span>
                    {playTime && (
                      <span className="css-thumb-time">
                        <Clock size={12} strokeWidth={2} />
                        {playTime}
                      </span>
                    )}
                  </div>
                  <div className="game-card-body">
                    <h3 className="game-card-title">{game.title}</h3>
                    <p className="game-card-category">
                      分类：{CATEGORY_LABELS[game.category] || game.category}
                    </p>
                    <div className="game-card-stats">
                      <span className="stat">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" fill="#f59e0b"/></svg>
                        {"★".repeat(stars)}{"☆".repeat(5 - stars)}
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
        )}
      </section>

      <section className="section">
        <h2>新发现</h2>
        {loading ? (
          <div className="empty-state">
            <div className="empty-spinner" />
            <p className="empty-text">扫描游戏目录中...</p>
          </div>
        ) : newGames.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-illustration" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="35" width="70" height="50" rx="6" stroke="#c4b5a4" strokeWidth="2" fill="#f0ebe4"/>
              <path d="M25 55h70" stroke="#c4b5a4" strokeWidth="2"/>
              <path d="M40 35l20-18 20 18" stroke="#c4b5a4" strokeWidth="2" fill="#f0ebe4" strokeLinejoin="round"/>
              <circle cx="60" cy="68" r="6" stroke="#c4b5a4" strokeWidth="2" fill="none"/>
              <path d="M57 68h6M60 65v6" stroke="#c4b5a4" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="empty-title">宝箱还空着</p>
            <p className="empty-text">更多专业挑战即将上线，敬请期待...</p>
          </div>
        ) : (
          <div className="game-grid">
            {newGames.map((slug) => (
              <div className="game-card" key={slug}>
                <span className="card-badge">New</span>
                <div className="game-card-thumb game-card-thumb-placeholder">
                  <svg viewBox="0 0 48 48" fill="none"><rect x="8" y="14" width="32" height="22" rx="4" stroke="#94a3b8" strokeWidth="2"/><path d="M18 25l4-4 4 4 6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="21" r="2" fill="#94a3b8"/></svg>
                </div>
                <div className="game-card-body">
                  <h3 className="game-card-title">{slug}</h3>
                  <p className="game-card-category">等待完善元数据</p>
                  <div className="game-card-actions">
                    <button
                      className="btn btn-train"
                      type="button"
                      onClick={() => handleRegister(slug)}
                      disabled={registering[slug]}
                    >
                      {registering[slug] ? "写入中..." : "写入数据库"}
                    </button>
                    <a className="btn btn-train-ghost" href={`/games/${slug}/`}>
                      预览
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {registerError ? <p className="empty-text" style={{ color: "var(--accent)", marginTop: 12 }}>{registerError}</p> : null}
      </section>
    </div>
  );
}
