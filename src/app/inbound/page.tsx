"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MaterialSearch } from "@/components/MaterialSearch";
import { MaterialWithStock } from "@/lib/types";
import { INBOUND_REASONS } from "@/lib/constants";

function InboundForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") ?? "";

  const [material, setMaterial] = useState<MaterialWithStock | null>(null);
  const [form, setForm] = useState({ quantity: "", reason: "通常入庫", note: "" });
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit() {
    if (!material) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionType: "INBOUND",
          materialCode: material.materialCode,
          quantity: Number(form.quantity),
          reason: form.reason,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setConfirming(false); return; }
      setSuccess(`入庫完了！処理後在庫: ${data.afterQuantity} ${material.unit}`);
      setForm({ quantity: "", reason: "通常入庫", note: "" });
      setConfirming(false);
      setMaterial(null);
    } catch {
      setError("通信エラーが発生しました");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  const qty = Number(form.quantity);
  const canConfirm = material && qty > 0 && Number.isInteger(qty);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">入庫登録</h1>

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded flex justify-between items-center">
          <span>✓ {success}</span>
          <div className="flex gap-2">
            <button onClick={() => { setSuccess(""); router.push("/stock"); }} className="btn-secondary text-sm">
              在庫一覧
            </button>
            <button onClick={() => setSuccess("")} className="btn-primary text-sm">続けて入庫</button>
          </div>
        </div>
      )}

      {/* Material Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-3">資材の検索</h2>
        <MaterialSearch initialCode={initialCode} onSelect={setMaterial} />
      </div>

      {/* Input Form */}
      {material && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold">入庫情報の入力</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              入庫数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              className="input w-40 text-xl text-right"
              placeholder="0"
            />
            <span className="ml-2 text-gray-600">{material.unit}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入庫理由</label>
            <select value={form.reason} onChange={(e) => set("reason", e.target.value)} className="input">
              {INBOUND_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea value={form.note} onChange={(e) => set("note", e.target.value)} className="input" rows={2} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}

          {/* Confirm Area */}
          {canConfirm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 space-y-2">
              <h3 className="font-semibold text-yellow-800">確認</h3>
              <div className="text-sm space-y-1">
                <div>資材: <span className="font-semibold">{material.materialCode} {material.materialName}</span></div>
                <div>入庫数量: <span className="font-bold text-lg text-green-700">+{qty} {material.unit}</span></div>
                <div>処理前在庫: <span className="font-semibold">{material.stock?.currentQuantity ?? 0} {material.unit}</span></div>
                <div>処理後在庫(予定): <span className="font-bold text-blue-700">{(material.stock?.currentQuantity ?? 0) + qty} {material.unit}</span></div>
                <div>理由: {form.reason}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canConfirm || loading}
            className="btn-primary w-full"
          >
            {loading ? "処理中..." : "入庫を確定する"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function InboundPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <InboundForm />
    </Suspense>
  );
}
