"use client";

import { useEffect, useState, useRef } from "react";
import { LogOut, Shield } from "lucide-react";

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (!user) return null;

  const initial = user.email?.charAt(0).toUpperCase() || "U";
  const isAdmin = user.role === "admin";

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="navbar-avatar"
        onClick={() => setOpen(!open)}
        title={user.email}
      >
        {initial}
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <span className="user-menu-email">{user.email}</span>
            {isAdmin && <span className="user-menu-role">管理员</span>}
          </div>
          <div className="user-menu-divider" />
          {isAdmin && (
            <a href="/admin" className="user-menu-item">
              <Shield size={15} strokeWidth={1.5} />
              管理后台
            </a>
          )}
          <button className="user-menu-item user-menu-item-danger" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.5} />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
