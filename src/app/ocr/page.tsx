"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MaterialInfo } from "@/components/MaterialSearch";
import { MaterialWithStock } from "@/lib/types";

type OcrStatus = "idle" | "loading" | "done" | "error";

export default function OcrPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [ocrText, setOcrText] = useState("");
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [material, setMaterial] = useState<MaterialWithStock | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setOcrText("");
    setOcrStatus("idle");
    setMaterial(null);
    setSearchError("");
    setCodeInput("");
  }, []);

  async function runOcr() {
    if (!imgSrc) return;
    setOcrStatus("loading");
    setOcrProgress(0);
    setOcrText("");
    setCodeInput("");
    setMaterial(null);
    setSearchError("");

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(imgSrc, "eng+jpn", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });
      const text = result.data.text.trim();
      setOcrText(text);
      setOcrStatus("done");

      // Extract material code candidates (e.g., MAT-001 pattern or alphanumeric codes)
      const candidates = extractCodes(text);
      if (candidates.length > 0) {
        setCodeInput(candidates[0]);
      }
    } catch (e) {
      console.error(e);
      setOcrStatus("error");
    }
  }

  function extractCodes(text: string): string[] {
    // Common patterns: alphanumeric with hyphens like MAT-001, ABC-123, etc.
    const patterns = [
      /[A-Z]{2,}-\d{3,}/g,
      /[A-Z]{2,}\d{4,}/g,
      /\b[A-Z0-9]{2,}-[A-Z0-9]{2,}\b/g,
    ];
    const found = new Set<string>();
    for (const p of patterns) {
      const matches = text.match(p);
      if (matches) matches.forEach((m) => found.add(m));
    }
    return Array.from(found);
  }

  async function searchMaterial() {
    const code = codeInput.trim();
    if (!code) { setSearchError("資材コードを入力してください"); return; }
    setSearching(true);
    setSearchError("");
    setMaterial(null);
    try {
      const res = await fetch(`/api/materials/${encodeURIComponent(code)}`);
      if (!res.ok) {
        setSearchError(`資材コード "${code}" は登録されていません`);
        return;
      }
      const data: MaterialWithStock = await res.json();
      setMaterial(data);
    } catch {
      setSearchError("検索中にエラーが発生しました");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">OCR読込</h1>

      {/* Image Input */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-semibold">画像の選択</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            📁 ファイルを選択
          </button>
          <button onClick={() => cameraRef.current?.click()} className="btn-secondary">
            📷 カメラで撮影
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {imgSrc && (
          <div>
            <img
              src={imgSrc}
              alt="選択された画像"
              className="max-h-64 rounded border border-gray-200 object-contain"
            />
            <button
              onClick={runOcr}
              disabled={ocrStatus === "loading"}
              className="mt-3 btn-primary"
            >
              {ocrStatus === "loading" ? `OCR処理中... ${ocrProgress}%` : "OCRを実行する"}
            </button>
          </div>
        )}

        {ocrStatus === "loading" && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
          </div>
        )}

        {ocrStatus === "error" && (
          <div className="text-red-600 text-sm">
            OCR処理に失敗しました。画像を確認してください。手入力で資材コードを入力できます。
          </div>
        )}
      </div>

      {/* OCR Result */}
      {ocrStatus === "done" && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold">OCR読取結果</h2>
          <div className="bg-gray-50 rounded p-3 text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {ocrText || "(文字が読み取れませんでした)"}
          </div>
          {!ocrText && (
            <p className="text-orange-600 text-sm">
              ⚠ 文字が読み取れませんでした。画像の品質を確認するか、手入力で資材コードを入力してください。
            </p>
          )}
          <p className="text-xs text-gray-500">
            ※ OCR結果は参考情報です。必ず下欄で資材コードを確認・補正してから検索してください。
          </p>
        </div>
      )}

      {/* Code Input & Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-semibold">
          資材コードの確認・補正
          {ocrStatus === "done" && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (OCR結果から自動入力しました。必要に応じて補正してください)
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMaterial()}
            placeholder="資材コードを入力または補正 (例: MAT-001)"
            className="input flex-1 font-mono text-lg"
          />
          <button
            onClick={searchMaterial}
            disabled={searching}
            className="btn-primary"
          >
            {searching ? "検索中..." : "検索"}
          </button>
        </div>

        {searchError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
            {searchError}
          </div>
        )}
      </div>

      {/* Material Info & Actions */}
      {material && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-3">資材情報</h2>
            <MaterialInfo material={material} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/inbound?code=${material.materialCode}`)}
              className="btn-primary flex-1"
            >
              📥 この資材を入庫する
            </button>
            <button
              onClick={() => router.push(`/outbound?code=${material.materialCode}`)}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition-colors font-semibold"
            >
              📤 この資材を出庫する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
