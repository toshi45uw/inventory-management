"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { MaterialWithStock } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/constants";

export default function StockPage() {
  const [materials, setMaterials] = useState<MaterialWithStock[]>([]);
  const [filters, setFilters] = useState({
    code: "", name: "", category: "", status: "", location: "",
    lowStock: false, zeroStock: false,
  });
  const [loading, setLoading] = useState(true);

  const setFilter = (key: string, value: string | boolean) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const fetchStock = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.code) p.set("code", filters.code);
    if (filters.name) p.set("name", filters.name);
    if (filters.category) p.set("category", filters.category);
    if (filters.status) p.set("status", filters.status);
    if (filters.location) p.set("location", filters.location);
    if (filters.lowStock) p.set("lowStock", "true");
    if (filters.zeroStock) p.set("zeroStock", "true");
    const res = await fetch(`/api/stock?${p}`);
    const data = await res.json();
    setMaterials(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  function exportCsv() {
    const p = new URLSearchParams();
    if (filters.code) p.set("code", filters.code);
    if (filters.name) p.set("name", filters.name);
    if (filters.category) p.set("category", filters.category);
    if (filters.status) p.set("status", filters.status);
    if (filters.location) p.set("location", filters.location);
    if (filters.lowStock) p.set("lowStock", "true");
    if (filters.zeroStock) p.set("zeroStock", "true");
    window.location.href = `/api/export/stock?${p}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">在庫一覧</h1>
        <button onClick={exportCsv} className="btn-secondary text-sm">
          CSV出力
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="資材コード" value={filters.code} onChange={(e) => setFilter("code", e.target.value)} className="input text-sm" />
          <input placeholder="資材名" value={filters.name} onChange={(e) => setFilter("name", e.target.value)} className="input text-sm" />
          <input placeholder="カテゴリ" value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className="input text-sm" />
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="input text-sm">
            <option value="">全ステータス</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input placeholder="保管場所" value={filters.location} onChange={(e) => setFilter("location", e.target.value)} className="input text-sm" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.lowStock} onChange={(e) => setFilter("lowStock", e.target.checked)} className="w-4 h-4" />
            最低在庫割れのみ
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.zeroStock} onChange={(e) => setFilter("zeroStock", e.target.checked)} className="w-4 h-4" />
            在庫0のみ
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">読み込み中...</div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-gray-400">該当する資材がありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">資材コード</th>
                <th className="th">資材名</th>
                <th className="th">カテゴリ</th>
                <th className="th">ステータス</th>
                <th className="th text-right">現在庫</th>
                <th className="th text-right">最低在庫数</th>
                <th className="th">保管場所</th>
                <th className="th">旧コード</th>
                <th className="th">後継コード</th>
                <th className="th">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((m) => {
                const qty = m.stock?.currentQuantity ?? 0;
                const isLow = qty < m.minimumStock;
                const isZero = qty === 0;
                const isInactive = ["SUSPENDED", "DISCONTINUED"].includes(m.status);
                return (
                  <tr key={m.id} className={`hover:bg-gray-50 ${isInactive ? "opacity-60" : ""}`}>
                    <td className="td font-mono font-semibold">{m.materialCode}</td>
                    <td className="td">{m.materialName}</td>
                    <td className="td">{m.category}</td>
                    <td className="td"><StatusBadge status={m.status} /></td>
                    <td className={`td text-right font-bold text-lg ${isZero ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-800"}`}>
                      {qty}
                      {isZero && <span className="ml-1 text-xs font-normal text-red-500">在庫切れ</span>}
                      {!isZero && isLow && <span className="ml-1 text-xs font-normal text-orange-500">⚠ 不足</span>}
                    </td>
                    <td className="td text-right text-gray-500">{m.minimumStock}</td>
                    <td className="td">{m.storageLocation}</td>
                    <td className="td text-gray-400 font-mono text-xs">{m.previousMaterialCode ?? "-"}</td>
                    <td className="td text-gray-400 font-mono text-xs">
                      {m.successorMaterialCode ? (
                        <span className="text-blue-600">{m.successorMaterialCode}</span>
                      ) : "-"}
                    </td>
                    <td className="td">
                      <div className="flex gap-2">
                        <Link href={`/inbound?code=${m.materialCode}`} className="text-green-600 hover:underline text-xs">入庫</Link>
                        <Link href={`/outbound?code=${m.materialCode}`} className="text-orange-600 hover:underline text-xs">出庫</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-gray-500">{materials.length} 件</p>
    </div>
  );
}
