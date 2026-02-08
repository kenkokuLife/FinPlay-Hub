"use client";

import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/login/") return null;

  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        <svg className="navbar-logo" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="13" stroke="#1a2e50" strokeWidth="2" />
          <path d="M14 6v10l7 4" stroke="#1a2e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="14" r="3" fill="#1a2e50" />
          <circle cx="21" cy="20" r="2" fill="#e55d4b" />
        </svg>
        FINPLAY HUB
      </a>
      <div className="navbar-right">
        <UserMenu />
      </div>
    </nav>
  );
}
