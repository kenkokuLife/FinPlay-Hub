"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Gamepad2,
  CheckCircle,
  Clock,
  Trash2,
  FolderSearch,
  RefreshCw
} from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "ACTIVE", "ARCHIVED"];
const DIFFICULTY_OPTIONS = ["EASY", "MEDIUM", "HARD", "EXPERT"];
const CATEGORY_OPTIONS = ["FINANCE", "STRATEGY", "OPERATIONS", "INVESTING", "OTHER"];

const STATUS_LABELS = { PENDING: "待审核", ACTIVE: "已上线", ARCHIVED: "已归档" };
const DIFFICULTY_LABELS = { EASY: "简单", MEDIUM: "中等", HARD: "困难", EXPERT: "专家" };
const CATEGORY_LABELS = {
  FINANCE: "财务",
  STRATEGY: "策略",
  OPERATIONS: "运营",
  INVESTING: "投资",
  OTHER: "其他"
};

export default function AdminPage() {
  const [games, setGames] = useState([]);
  const [newGames, setNewGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch {}
  }, []);

  const loadDiscover = useCallback(async () => {
    try {
      const res = await fetch("/api/games/discover");
      if (res.ok) {
        const data = await res.json();
        setNewGames(data.newGames || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([loadGames(), loadDiscover()]).finally(() => setLoading(false));
  }, [loadGames, loadDiscover]);

  const handleRegister = async (slug) => {
    setRegistering((p) => ({ ...p, [slug]: true }));
    try {
      const res = await fetch("/api/games/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      if (res.ok) {
        setNewGames((p) => p.filter((s) => s !== slug));
        await loadGames();
      }
    } finally {
      setRegistering((p) => ({ ...p, [slug]: false }));
    }
  };

  const handleUpdate = async (id, field, value) => {
    const key = `${id}-${field}`;
    setUpdating((p) => ({ ...p, [key]: true }));
    try {
      const res = await fetch(`/api/games/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const data = await res.json();
        setGames((p) => p.map((g) => (g.id === id ? data.game : g)));
      }
    } finally {
      setUpdating((p) => ({ ...p, [key]: false }));
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`确定删除「${title}」？此操作不可撤销。`)) return;
    setDeleting((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/games/${id}/`, { method: "DELETE" });
      if (res.ok) {
        setGames((p) => p.filter((g) => g.id !== id));
        await loadDiscover();
      }
    } finally {
      setDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  const activeCount = games.filter((g) => g.status === "ACTIVE").length;
  const pendingCount = games.filter((g) => g.status === "PENDING").length;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>管理员后台</h1>
        <button
          className="btn admin-refresh"
          onClick={() => { loadGames(); loadDiscover(); }}
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
            <span className="admin-stat-value">{games.length}</span>
            <span className="admin-stat-label">游戏总数</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-active">
            <CheckCircle size={22} strokeWidth={1.5} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{activeCount}</span>
            <span className="admin-stat-label">已上线</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-icon-pending">
            <Clock size={22} strokeWidth={1.5} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{pendingCount}</span>
            <span className="admin-stat-label">待审核</span>
          </div>
        </div>
      </div>

      {newGames.length > 0 && (
        <section className="admin-section">
          <div className="admin-section-header">
            <FolderSearch size={18} strokeWidth={1.5} />
            <h2>新发现</h2>
            <span className="admin-badge">{newGames.length}</span>
          </div>
          <div className="admin-discover-grid">
            {newGames.map((slug) => (
              <div className="admin-discover-card" key={slug}>
                <span className="admin-discover-slug">{slug}</span>
                <button
                  className="btn btn-train"
                  onClick={() => handleRegister(slug)}
                  disabled={registering[slug]}
                >
                  {registering[slug] ? "写入中..." : "写入数据库"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2>游戏列表</h2>
        {loading ? (
          <div className="empty-state">
            <div className="empty-spinner" />
            <p className="empty-text">加载中...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">暂无游戏</p>
            <p className="empty-text">请先从「新发现」区域注册游戏</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>Slug</th>
                  <th>状态</th>
                  <th>难度</th>
                  <th>分类</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td className="admin-cell-title">{game.title}</td>
                    <td className="admin-cell-slug">{game.slug}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={game.status}
                        onChange={(e) => handleUpdate(game.id, "status", e.target.value)}
                        disabled={updating[`${game.id}-status`]}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        value={game.difficulty}
                        onChange={(e) => handleUpdate(game.id, "difficulty", e.target.value)}
                        disabled={updating[`${game.id}-difficulty`]}
                      >
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        value={game.category}
                        onChange={(e) => handleUpdate(game.id, "category", e.target.value)}
                        disabled={updating[`${game.id}-category`]}
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="admin-btn-delete"
                        onClick={() => handleDelete(game.id, game.title)}
                        disabled={deleting[game.id]}
                        title="删除"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
