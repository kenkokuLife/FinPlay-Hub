import "./globals.css";

export const metadata = {
  title: "FinPlay Hub",
  description: "FinPlay Hub dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
