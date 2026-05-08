"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { MaterialWithStock } from "@/lib/types";

interface MaterialSearchProps {
  initialCode?: string;
  onSelect: (material: MaterialWithStock | null) => void;
}

export function MaterialSearch({ initialCode = "", onSelect }: MaterialSearchProps) {
  const [code, setCode] = useState(initialCode);
  const [material, setMaterial] = useState<MaterialWithStock | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(searchCode?: string) {
    const q = (searchCode ?? code).trim();
    if (!q) {
      setError("資材コードを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    setMaterial(null);
    onSelect(null);
    try {
      const res = await fetch(`/api/materials/${encodeURIComponent(q)}`);
      if (!res.ok) {
        setError(`資材コード "${q}" は登録されていません`);
        return;
      }
      const data: MaterialWithStock = await res.json();
      setMaterial(data);
      onSelect(data);
    } catch {
      setError("検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="資材コードを入力 (例: MAT-001)"
          className="input flex-1 font-mono"
        />
        <button
          onClick={() => search()}
          disabled={loading}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {material && <MaterialInfo material={material} />}
    </div>
  );
}

export function MaterialInfo({ material }: { material: MaterialWithStock }) {
  const qty = material.stock?.currentQuantity ?? 0;
  const isLow = qty < material.minimumStock;
  const isInactive = ["SUSPENDED", "DISCONTINUED"].includes(material.status);

  return (
    <div className={`rounded-lg p-4 border-2 ${isInactive ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
      {isInactive && (
        <div className="mb-3 flex items-center gap-2 text-red-700 font-semibold bg-red-100 px-3 py-2 rounded">
          ⚠ この資材は「{material.status === "SUSPENDED" ? "使用停止" : "廃止"}」です。処理前に必ず確認してください。
        </div>
      )}
      {material.previousMaterialCode && (
        <div className="mb-2 text-sm text-gray-500">
          旧コード: <span className="font-mono font-semibold">{material.previousMaterialCode}</span> から移行
        </div>
      )}
      {material.successorMaterialCode && (
        <div className="mb-2 text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
          後継コード: <span className="font-mono font-semibold">{material.successorMaterialCode}</span> があります
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InfoItem label="資材コード" value={material.materialCode} mono large />
        <InfoItem label="資材名" value={material.materialName} large />
        <InfoItem label="ステータス" value={<StatusBadge status={material.status} />} />
        <InfoItem label="カテゴリ" value={material.category} />
        <InfoItem label="仕様" value={material.specification || "-"} />
        <InfoItem label="単位" value={material.unit || "-"} />
        <InfoItem label="現在庫" value={
          <span className={`font-bold text-xl ${qty === 0 ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-800"}`}>
            {qty} {material.unit}
            {qty === 0 && <span className="ml-2 text-sm font-normal text-red-500">在庫切れ</span>}
            {qty > 0 && isLow && <span className="ml-2 text-sm font-normal text-orange-500">⚠ 最低在庫割れ</span>}
          </span>
        } />
        <InfoItem label="最低在庫数" value={`${material.minimumStock} ${material.unit}`} />
        <InfoItem label="保管場所" value={material.storageLocation || "-"} />
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono, large }: { label: string; value: React.ReactNode; mono?: boolean; large?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} ${large ? "font-semibold text-base" : "text-sm"}`}>
        {value}
      </div>
    </div>
  );
}
