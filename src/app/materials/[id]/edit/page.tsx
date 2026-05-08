import { prisma } from "@/lib/prisma";
import { MaterialForm } from "@/components/MaterialForm";
import { notFound } from "next/navigation";

export default async function EditMaterialPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return notFound();

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">資材マスタ 編集</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <MaterialForm
          initial={{
            ...material,
            previousMaterialCode: material.previousMaterialCode ?? "",
            successorMaterialCode: material.successorMaterialCode ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
