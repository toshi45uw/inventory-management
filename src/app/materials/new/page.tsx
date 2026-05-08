import { MaterialForm } from "@/components/MaterialForm";

export default function NewMaterialPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">資材マスタ 新規登録</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <MaterialForm />
      </div>
    </div>
  );
}
