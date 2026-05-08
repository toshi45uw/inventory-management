import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Material Stock Manager",
  description: "資材在庫管理システム",
};

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/ocr", label: "OCR読込" },
  { href: "/inbound", label: "入庫" },
  { href: "/outbound", label: "出庫" },
  { href: "/stock", label: "在庫一覧" },
  { href: "/history", label: "履歴" },
  { href: "/materials", label: "資材マスタ" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
            <Link href="/" className="text-lg font-bold whitespace-nowrap">
              Material Stock Manager
            </Link>
            <nav className="flex gap-1 flex-wrap">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
