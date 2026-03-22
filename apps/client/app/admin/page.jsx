"use client";

import { useEffect, useState, useCallback } from "react";
import { Gamepad2, Clock, RefreshCw } from "lucide-react";
import { GAMES } from "@/games.config";

const DIFFICULTY_LABELS = { easy: "入门", medium: "中级", hard: "进阶" };

function formatPlayTime(minutes) {
  if (!minutes || minutes === 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AdminPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        const data = await res.json();
        const map = {};
        for (const s of (data.stats || [])) {
          map[s.gameSlug] = s;
        }
        setStats(map);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  const totalLaunches = Object.values(stats).reduce((s, v) => s + (v.totalLaunches || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>管理员后台</h1>
        <button
          className="btn admin-refresh"
          onClick={() => { setLoading(true); loadStats().finally(() => setLoading(false)); }}
        >
          <RefreshCw size={14} strokeWidth={2} />
          刷新
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-total">
            <Gamepad2 size={22} strokeWidth={1.5} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{GAMES.length}</span>
            <span className="admin-stat-label">游戏总数</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-active">
            <Clock size={22} strokeWidth={1.5} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{totalLaunches}</span>
            <span className="admin-stat-label">总启动次数</span>
          </div>
        </div>
      </div>

      <section className="admin-section">
        <h2>游戏统计</h2>
        {loading ? (
          <div className="empty-state">
            <div className="empty-spinner" />
            <p className="empty-text">加载中...</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>Slug</th>
                  <th>难度</th>
                  <th>启动次数</th>
                  <th>游玩时长</th>
                </tr>
              </thead>
              <tbody>
                {GAMES.map((game) => {
                  const s = stats[game.slug] || {};
                  return (
                    <tr key={game.slug}>
                      <td className="admin-cell-title">{game.title}</td>
                      <td className="admin-cell-slug">{game.slug}</td>
                      <td>{DIFFICULTY_LABELS[game.difficulty] || game.difficulty}</td>
                      <td className="admin-cell-launches">{s.totalLaunches || 0}</td>
                      <td>{formatPlayTime(s.totalPlayTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
