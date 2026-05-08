import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MATERIAL_STATUS_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";

  const materials = await prisma.material.findMany({
    where: {
      ...(code && { materialCode: { contains: code } }),
      ...(name && { materialName: { contains: name } }),
      ...(category && { category: { contains: category } }),
      ...(status && { status }),
    },
    include: { stock: true },
    orderBy: { materialCode: "asc" },
  });

  const header = [
    "資材コード", "資材名", "カテゴリ", "仕様・内容", "単位", "ステータス",
    "旧資材コード", "後継資材コード", "最低在庫数", "保管場所", "備考",
    "登録日時", "更新日時",
  ];

  const rows = materials.map((m) => [
    m.materialCode, m.materialName, m.category, m.specification, m.unit,
    MATERIAL_STATUS_LABELS[m.status] ?? m.status,
    m.previousMaterialCode ?? "", m.successorMaterialCode ?? "",
    m.minimumStock, m.storageLocation, m.note,
    m.createdAt.toISOString(), m.updatedAt.toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="materials.csv"',
    },
  });
}
