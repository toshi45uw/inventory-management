"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { MaterialWithStock } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/constants";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialWithStock[]>([]);
  const [filters, setFilters] = useState({ code: "", name: "", category: "", status: "" });
  const [loading, setLoading] = useState(true);

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    const res = await fetch(`/api/materials?${p}`);
    const data = await res.json();
    setMaterials(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  function exportCsv() {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    window.location.href = `/api/export/materials?${p}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">資材マスタ一覧</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn-secondary text-sm">
            CSV出力
          </button>
          <Link href="/materials/new" className="btn-primary text-sm">
            + 新規登録
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          placeholder="資材コード"
          value={filters.code}
          onChange={(e) => setFilter("code", e.target.value)}
          className="input text-sm"
        />
        <input
          placeholder="資材名"
          value={filters.name}
          onChange={(e) => setFilter("name", e.target.value)}
          className="input text-sm"
        />
        <input
          placeholder="カテゴリ"
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
          className="input text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
          className="input text-sm"
        >
          <option value="">全ステータス</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
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
                <th className="th">仕様</th>
                <th className="th">ステータス</th>
                <th className="th">単位</th>
                <th className="th">最低在庫</th>
                <th className="th">保管場所</th>
                <th className="th">旧コード</th>
                <th className="th">後継コード</th>
                <th className="th">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((m) => (
                <tr key={m.id} className={`hover:bg-gray-50 ${["SUSPENDED","DISCONTINUED"].includes(m.status) ? "opacity-60" : ""}`}>
                  <td className="td font-mono font-semibold">{m.materialCode}</td>
                  <td className="td">{m.materialName}</td>
                  <td className="td">{m.category}</td>
                  <td className="td text-gray-500">{m.specification}</td>
                  <td className="td"><StatusBadge status={m.status} /></td>
                  <td className="td text-center">{m.unit}</td>
                  <td className="td text-right">{m.minimumStock}</td>
                  <td className="td">{m.storageLocation}</td>
                  <td className="td text-gray-500 font-mono text-xs">{m.previousMaterialCode ?? "-"}</td>
                  <td className="td text-gray-500 font-mono text-xs">{m.successorMaterialCode ?? "-"}</td>
                  <td className="td">
                    <Link href={`/materials/${m.id}/edit`} className="text-blue-600 hover:underline text-xs">
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-gray-500">{materials.length} 件</p>
    </div>
  );
}
