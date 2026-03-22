"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpenCheck, Megaphone, UserPlus, Cpu, BarChart3, Trophy,
  TrendingDown, ShoppingCart, Clock, Shield, Landmark,
  Coffee, Calculator, TrendingUp, Scale, GitMerge
} from "lucide-react";
import { GAMES } from "@/games.config";

const ICON_MAP = {
  BookOpenCheck, Megaphone, UserPlus, Cpu, BarChart3, Trophy,
  TrendingDown, ShoppingCart, Clock, Shield, Landmark,
  Coffee, Calculator, TrendingUp, Scale, GitMerge
};

const ICON_PROPS = { size: 18, strokeWidth: 1.5 };

function TermIcon({ name, color }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon {...ICON_PROPS} style={{ color }} />;
}

export default function GamePage({ params }) {
  const game = GAMES.find((g) => g.slug === params.slug);

  const hasTerms = game && Object.keys(game.terms || {}).length > 0;

  const [entries, setEntries] = useState(() => {
    if (!game || !game.terms?.start) return [];
    return [{ action: "start", ...game.terms.start }];
  });
  const [expanded, setExpanded] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTerm, setActiveTerm] = useState(null);
  const [scrollKey, setScrollKey] = useState(0);
  const groupRefs = useRef({});

  const pushTerm = useCallback((action) => {
    if (!game) return;
    const termData = game.terms?.[action];
    if (!termData) return;
    const entry = { action, ...termData };
    setEntries((prev) => {
      const existIdx = prev.findIndex((e) => e.action === action);
      if (existIdx >= 0) {
        setExpanded(existIdx);
        setSidebarOpen(true);
        setActiveTerm(termData.highlight || null);
        setScrollKey((k) => k + 1);
        return prev;
      }
      setExpanded(0);
      setSidebarOpen(true);
      setActiveTerm(termData.highlight || null);
      setScrollKey((k) => k + 1);
      return [entry, ...prev];
    });
  }, [game]);

  // Scroll to expanded group
  useEffect(() => {
    if (scrollKey === 0) return;
    requestAnimationFrame(() => {
      const node = groupRefs.current[expanded];
      if (node) node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [scrollKey, expanded]);

  // Listen for postMessage from iframe
  useEffect(() => {
    if (!game) return;
    const handler = (e) => {
      if (e.data?.source === game.slug && e.data?.action) {
        pushTerm(e.data.action);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [game, pushTerm]);

  // Launch tracking
  useEffect(() => {
    if (!game) return;
    fetch(`/api/games/${game.slug}/launch`, { method: "POST" }).catch(() => {});
  }, [game]);

  // Playtime tracking
  useEffect(() => {
    if (!game) return;
    const id = setInterval(() => {
      fetch(`/api/games/${game.slug}/playtime`, { method: "POST" }).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, [game]);

  if (!game) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "calc(100vh - 56px)", marginTop: "56px", color: "#64748b", fontSize: "14px"
      }}>
        游戏不存在
      </div>
    );
  }

  const htmlFile = game.htmlFile ?? "index.html";

  return (
    <div className="game-layout">
      <div className="game-main">
        <iframe
          src={`/games/${game.slug}/${htmlFile}`}
          className="game-iframe"
          title={game.title}
        />
      </div>

      {hasTerms && (
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
                  ? <><span>当前聚焦：</span><strong className="sidebar-hint-term">{activeTerm}</strong></>
                  : "操作游戏时，这里会自动弹出对应的专业术语解释"}
              </p>

              <div className="sidebar-list">
                {entries.map((entry, idx) => (
                  <div
                    key={`${entry.action}-${idx}`}
                    ref={(el) => { groupRefs.current[idx] = el; }}
                    className={`term-group ${expanded === idx ? "term-latest" : ""}`}
                  >
                    <button
                      className="term-group-header"
                      onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                    >
                      <span className="term-group-icon">
                        <TermIcon name={entry.iconName} color={entry.iconColor} />
                      </span>
                      <span className="term-group-title">{entry.title}</span>
                      <span className={`term-chevron ${expanded === idx ? "open" : ""}`}>‹</span>
                    </button>

                    {expanded === idx && (
                      <div className="term-cards">
                        {(entry.words || []).map((t) => (
                          <div
                            key={t.word}
                            className={`term-card ${activeTerm === t.word ? "term-active" : ""}`}
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
      )}
    </div>
  );
}
