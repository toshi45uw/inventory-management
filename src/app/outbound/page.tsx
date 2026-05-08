"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MaterialSearch } from "@/components/MaterialSearch";
import { MaterialWithStock } from "@/lib/types";
import { OUTBOUND_REASONS } from "@/lib/constants";

function OutboundForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") ?? "";

  const [material, setMaterial] = useState<MaterialWithStock | null>(null);
  const [form, setForm] = useState({ quantity: "", reason: "使用", destination: "", note: "" });
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
          transactionType: "OUTBOUND",
          materialCode: material.materialCode,
          quantity: Number(form.quantity),
          reason: form.reason,
          destinationOrSource: form.destination,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(`出庫完了！処理後在庫: ${data.afterQuantity} ${material.unit}`);
      setForm({ quantity: "", reason: "使用", destination: "", note: "" });
      setMaterial(null);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const qty = Number(form.quantity);
  const currentQty = material?.stock?.currentQuantity ?? 0;
  const canSubmit = material && qty > 0 && Number.isInteger(qty) && qty <= currentQty;
  const overstock = qty > 0 && qty > currentQty;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">出庫登録</h1>

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded flex justify-between items-center">
          <span>✓ {success}</span>
          <div className="flex gap-2">
            <button onClick={() => { setSuccess(""); router.push("/stock"); }} className="btn-secondary text-sm">在庫一覧</button>
            <button onClick={() => setSuccess("")} className="btn-primary text-sm">続けて出庫</button>
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
          <h2 className="font-semibold">出庫情報の入力</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出庫数量 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                max={currentQty}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={`input w-40 text-xl text-right ${overstock ? "border-red-400" : ""}`}
                placeholder="0"
              />
              <span className="text-gray-600">{material.unit}</span>
              <span className="text-sm text-gray-400">(在庫: {currentQty} {material.unit})</span>
            </div>
            {overstock && (
              <p className="text-red-600 text-sm mt-1">⚠ 現在庫({currentQty})を超える出庫はできません</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出庫理由</label>
            <select value={form.reason} onChange={(e) => set("reason", e.target.value)} className="input">
              {OUTBOUND_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">使用先</label>
            <input value={form.destination} onChange={(e) => set("destination", e.target.value)} className="input" placeholder="例: 製造ライン A" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea value={form.note} onChange={(e) => set("note", e.target.value)} className="input" rows={2} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}

          {/* Confirm Area */}
          {canSubmit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 space-y-2">
              <h3 className="font-semibold text-yellow-800">確認</h3>
              <div className="text-sm space-y-1">
                <div>資材: <span className="font-semibold">{material.materialCode} {material.materialName}</span></div>
                <div>出庫数量: <span className="font-bold text-lg text-orange-700">-{qty} {material.unit}</span></div>
                <div>処理前在庫: <span className="font-semibold">{currentQty} {material.unit}</span></div>
                <div>処理後在庫(予定): <span className="font-bold text-blue-700">{currentQty - qty} {material.unit}</span></div>
                <div>理由: {form.reason}</div>
                {form.destination && <div>使用先: {form.destination}</div>}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="btn-primary w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "処理中..." : "出庫を確定する"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OutboundPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <OutboundForm />
    </Suspense>
  );
}
