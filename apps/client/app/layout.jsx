import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "FinPlay Hub",
  description: "FinPlay Hub dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
