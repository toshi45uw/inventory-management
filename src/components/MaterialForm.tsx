"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS } from "@/lib/constants";

interface MaterialFormProps {
  initial?: {
    id?: number;
    materialCode?: string;
    materialName?: string;
    category?: string;
    specification?: string;
    unit?: string;
    status?: string;
    previousMaterialCode?: string | null;
    successorMaterialCode?: string | null;
    minimumStock?: number;
    storageLocation?: string;
    note?: string;
  };
  isEdit?: boolean;
}

export function MaterialForm({ initial = {}, isEdit = false }: MaterialFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    materialCode: initial.materialCode ?? "",
    materialName: initial.materialName ?? "",
    category: initial.category ?? "",
    specification: initial.specification ?? "",
    unit: initial.unit ?? "",
    status: initial.status ?? "ACTIVE",
    previousMaterialCode: initial.previousMaterialCode ?? "",
    successorMaterialCode: initial.successorMaterialCode ?? "",
    minimumStock: initial.minimumStock ?? 0,
    storageLocation: initial.storageLocation ?? "",
    note: initial.note ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/materials/${initial.id}` : "/api/materials";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      router.push("/materials");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="資材コード *" required>
          <input
            value={form.materialCode}
            onChange={(e) => set("materialCode", e.target.value)}
            disabled={isEdit}
            className="input"
            placeholder="例: MAT-001"
            required
          />
          {isEdit && <p className="text-xs text-gray-400 mt-1">※ 資材コードは変更できません</p>}
        </Field>

        <Field label="資材名 *" required>
          <input
            value={form.materialName}
            onChange={(e) => set("materialName", e.target.value)}
            className="input"
            placeholder="例: 検査キット外箱"
            required
          />
        </Field>

        <Field label="カテゴリ">
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
            placeholder="例: 箱"
          />
        </Field>

        <Field label="単位">
          <input
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            className="input"
            placeholder="例: 個"
          />
        </Field>

        <Field label="ステータス">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="input"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="最低在庫数">
          <input
            type="number"
            min={0}
            value={form.minimumStock}
            onChange={(e) => set("minimumStock", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="保管場所">
          <input
            value={form.storageLocation}
            onChange={(e) => set("storageLocation", e.target.value)}
            className="input"
            placeholder="例: A棚-01"
          />
        </Field>

        <Field label="仕様・内容">
          <input
            value={form.specification}
            onChange={(e) => set("specification", e.target.value)}
            className="input"
            placeholder="例: 改訂版"
          />
        </Field>

        <Field label="旧資材コード">
          <input
            value={form.previousMaterialCode}
            onChange={(e) => set("previousMaterialCode", e.target.value)}
            className="input"
            placeholder="例: MAT-001"
          />
        </Field>

        <Field label="後継資材コード">
          <input
            value={form.successorMaterialCode}
            onChange={(e) => set("successorMaterialCode", e.target.value)}
            className="input"
            placeholder="例: MAT-002"
          />
        </Field>
      </div>

      <Field label="備考">
        <textarea
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          className="input"
          rows={3}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "処理中..." : isEdit ? "更新する" : "登録する"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          キャンセル
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
