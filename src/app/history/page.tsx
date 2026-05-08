"use client";

import { useEffect, useState, useCallback } from "react";
import { StockTransaction } from "@/lib/types";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

const TYPE_COLORS: Record<string, string> = {
  INBOUND: "bg-green-100 text-green-800",
  OUTBOUND: "bg-orange-100 text-orange-800",
  ADJUSTMENT: "bg-blue-100 text-blue-800",
  CANCEL: "bg-gray-100 text-gray-600",
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [filters, setFilters] = useState({ code: "", name: "", type: "", from: "", to: "" });
  const [loading, setLoading] = useState(true);

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    const res = await fetch(`/api/transactions?${p}`);
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  function exportCsv() {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    window.location.href = `/api/export/history?${p}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">入出庫履歴</h1>
        <button onClick={exportCsv} className="btn-secondary text-sm">CSV出力</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-3">
        <input placeholder="資材コード" value={filters.code} onChange={(e) => setFilter("code", e.target.value)} className="input text-sm" />
        <input placeholder="資材名" value={filters.name} onChange={(e) => setFilter("name", e.target.value)} className="input text-sm" />
        <select value={filters.type} onChange={(e) => setFilter("type", e.target.value)} className="input text-sm">
          <option value="">全区分</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div>
          <label className="text-xs text-gray-500">開始日</label>
          <input type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} className="input text-sm w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500">終了日</label>
          <input type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} className="input text-sm w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">読み込み中...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">該当する履歴がありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">ID</th>
                <th className="th">区分</th>
                <th className="th">資材コード</th>
                <th className="th">資材名</th>
                <th className="th text-right">数量</th>
                <th className="th text-right">処理前</th>
                <th className="th text-right">処理後</th>
                <th className="th">理由</th>
                <th className="th">使用先/入庫元</th>
                <th className="th">備考</th>
                <th className="th">処理日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="td text-gray-400 text-xs">{t.id}</td>
                  <td className="td">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${TYPE_COLORS[t.transactionType] ?? "bg-gray-100"}`}>
                      {TRANSACTION_TYPE_LABELS[t.transactionType] ?? t.transactionType}
                    </span>
                  </td>
                  <td className="td font-mono text-xs">{t.materialCodeSnapshot}</td>
                  <td className="td">{t.materialNameSnapshot}</td>
                  <td className={`td text-right font-semibold ${t.transactionType === "INBOUND" ? "text-green-700" : "text-orange-700"}`}>
                    {t.transactionType === "INBOUND" ? "+" : "-"}{t.quantity}
                  </td>
                  <td className="td text-right text-gray-500">{t.beforeQuantity}</td>
                  <td className="td text-right font-semibold">{t.afterQuantity}</td>
                  <td className="td text-gray-600">{t.reason}</td>
                  <td className="td text-gray-500">{t.destinationOrSource || "-"}</td>
                  <td className="td text-gray-400 text-xs max-w-24 truncate">{t.note || "-"}</td>
                  <td className="td text-gray-400 text-xs whitespace-nowrap">
                    {new Date(t.operatedAt).toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-gray-500">{transactions.length} 件</p>
    </div>
  );
}
