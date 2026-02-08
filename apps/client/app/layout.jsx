import "./globals.css";

export const metadata = {
  title: "FinPlay Hub",
  description: "FinPlay Hub dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
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
            <a href="/progress" className="navbar-link">我的进度</a>
            <a href="/admin" className="navbar-link">管理员后台</a>
            <div className="navbar-avatar">U</div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
