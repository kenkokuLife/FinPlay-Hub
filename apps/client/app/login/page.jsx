"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <svg className="login-logo" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="13" stroke="#1a2e50" strokeWidth="2" />
            <path d="M14 6v10l7 4" stroke="#1a2e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="14" cy="14" r="3" fill="#1a2e50" />
            <circle cx="21" cy="20" r="2" fill="#e55d4b" />
          </svg>
          <h1>FinPlay Hub</h1>
          <p>登录以开始你的投行训练</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn login-submit" disabled={loading}>
            <LogIn size={16} strokeWidth={2} />
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
