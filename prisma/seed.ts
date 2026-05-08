import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const materials = [
    {
      materialCode: "MAT-001",
      materialName: "検査キット外箱",
      category: "箱",
      specification: "",
      unit: "個",
      status: "ACTIVE",
      minimumStock: 50,
      storageLocation: "A棚-01",
      note: "",
      successorMaterialCode: "MAT-002",
    },
    {
      materialCode: "MAT-002",
      materialName: "検査キット外箱",
      category: "箱",
      specification: "改訂版",
      unit: "個",
      status: "TRANSITIONING",
      previousMaterialCode: "MAT-001",
      minimumStock: 50,
      storageLocation: "A棚-02",
      note: "",
    },
    {
      materialCode: "MAT-003",
      materialName: "説明書",
      category: "同梱物",
      specification: "",
      unit: "枚",
      status: "ACTIVE",
      minimumStock: 100,
      storageLocation: "B棚-01",
      note: "",
    },
    {
      materialCode: "MAT-004",
      materialName: "採取容器",
      category: "容器",
      specification: "",
      unit: "個",
      status: "SUSPENDED",
      minimumStock: 30,
      storageLocation: "C棚-01",
      note: "",
    },
    {
      materialCode: "MAT-005",
      materialName: "返送用封筒",
      category: "封筒",
      specification: "",
      unit: "枚",
      status: "ACTIVE",
      minimumStock: 100,
      storageLocation: "D棚-01",
      note: "",
    },
  ];

  const stockQuantities: Record<string, number> = {
    "MAT-001": 120,
    "MAT-002": 80,
    "MAT-003": 300,
    "MAT-004": 20,
    "MAT-005": 0,
  };

  for (const mat of materials) {
    const created = await prisma.material.upsert({
      where: { materialCode: mat.materialCode },
      update: mat,
      create: mat,
    });

    const qty = stockQuantities[mat.materialCode] ?? 0;
    await prisma.stock.upsert({
      where: { materialId: created.id },
      update: { currentQuantity: qty },
      create: { materialId: created.id, currentQuantity: qty },
    });

    if (qty > 0) {
      const existing = await prisma.stockTransaction.findFirst({
        where: { materialId: created.id, reason: "初期在庫登録" },
      });
      if (!existing) {
        await prisma.stockTransaction.create({
          data: {
            transactionType: "INBOUND",
            materialId: created.id,
            materialCodeSnapshot: created.materialCode,
            materialNameSnapshot: created.materialName,
            quantity: qty,
            beforeQuantity: 0,
            afterQuantity: qty,
            reason: "初期在庫登録",
            operatedBy: "system",
          },
        });
      }
    }
  }

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "管理者", email: "admin@example.com", role: "ADMIN" },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
