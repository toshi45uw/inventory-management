import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MATERIAL_STATUS_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const location = searchParams.get("location") ?? "";
  const lowStock = searchParams.get("lowStock") === "true";
  const zeroStock = searchParams.get("zeroStock") === "true";

  let materials = await prisma.material.findMany({
    where: {
      ...(code && { materialCode: { contains: code } }),
      ...(name && { materialName: { contains: name } }),
      ...(category && { category: { contains: category } }),
      ...(status && { status }),
      ...(location && { storageLocation: { contains: location } }),
    },
    include: { stock: true },
    orderBy: { materialCode: "asc" },
  });

  if (lowStock) materials = materials.filter((m) => m.stock && m.stock.currentQuantity < m.minimumStock);
  if (zeroStock) materials = materials.filter((m) => !m.stock || m.stock.currentQuantity === 0);

  const header = [
    "資材コード", "資材名", "カテゴリ", "ステータス", "現在庫",
    "最低在庫数", "保管場所", "旧資材コード", "後継資材コード",
  ];

  const rows = materials.map((m) => [
    m.materialCode, m.materialName, m.category,
    MATERIAL_STATUS_LABELS[m.status] ?? m.status,
    m.stock?.currentQuantity ?? 0, m.minimumStock, m.storageLocation,
    m.previousMaterialCode ?? "", m.successorMaterialCode ?? "",
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="stock.csv"',
    },
  });
}
