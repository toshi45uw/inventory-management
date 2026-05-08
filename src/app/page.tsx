"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  totalMaterials: number;
  zeroStock: number;
  lowStock: number;
  inactiveWithStock: number;
  recentInbound: number;
  recentOutbound: number;
}

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setDashboard)
      .catch(() => {});
  }, []);

  const navCards = [
    { href: "/ocr", label: "OCR読込", desc: "画像から資材コードを読み取る", color: "bg-purple-600", icon: "📷" },
    { href: "/inbound", label: "入庫登録", desc: "在庫を追加する", color: "bg-green-600", icon: "📥" },
    { href: "/outbound", label: "出庫登録", desc: "在庫を減らす", color: "bg-orange-600", icon: "📤" },
    { href: "/stock", label: "在庫一覧", desc: "現在庫を確認する", color: "bg-blue-600", icon: "📦" },
    { href: "/history", label: "入出庫履歴", desc: "処理履歴を確認する", color: "bg-gray-600", icon: "📋" },
    { href: "/materials", label: "資材マスタ", desc: "資材情報を管理する", color: "bg-indigo-600", icon: "⚙️" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Material Stock Manager</h1>
        <p className="text-gray-500 mt-1">資材在庫管理システム</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {navCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} text-white rounded-lg p-5 hover:opacity-90 transition-opacity shadow-md`}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="font-bold text-lg">{card.label}</div>
            <div className="text-sm opacity-80 mt-1">{card.desc}</div>
          </Link>
        ))}
      </div>

      {/* Dashboard */}
      {dashboard && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">ダッシュボード</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="総資材数" value={dashboard.totalMaterials} color="text-blue-700" />
            <StatCard
              label="在庫切れ"
              value={dashboard.zeroStock}
              color={dashboard.zeroStock > 0 ? "text-red-600" : "text-green-600"}
              suffix="件"
            />
            <StatCard
              label="最低在庫割れ"
              value={dashboard.lowStock}
              color={dashboard.lowStock > 0 ? "text-orange-600" : "text-green-600"}
              suffix="件"
            />
            <StatCard
              label="停止/廃止で在庫あり"
              value={dashboard.inactiveWithStock}
              color={dashboard.inactiveWithStock > 0 ? "text-yellow-600" : "text-green-600"}
              suffix="件"
            />
            <StatCard label="直近入庫" value={dashboard.recentInbound} suffix="件" color="text-green-700" />
            <StatCard label="直近出庫" value={dashboard.recentOutbound} suffix="件" color="text-orange-700" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, suffix = "" }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>
        {value}
        <span className="text-base font-normal ml-1">{suffix}</span>
      </div>
    </div>
  );
}
