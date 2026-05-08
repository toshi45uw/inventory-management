import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json(materials);
  } catch (e) {
    console.error("[GET /api/materials]", e);
    return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 }); }
  const {
    materialCode,
    materialName,
    category = "",
    specification = "",
    unit = "",
    status = "ACTIVE",
    previousMaterialCode,
    successorMaterialCode,
    minimumStock = 0,
    storageLocation = "",
    note = "",
  } = body;

  if (!materialCode || !materialName) {
    return NextResponse.json({ error: "資材コードと資材名は必須です" }, { status: 400 });
  }

  const existing = await prisma.material.findUnique({ where: { materialCode } });
  if (existing) {
    return NextResponse.json({ error: "この資材コードは既に登録されています" }, { status: 409 });
  }

  const material = await prisma.material.create({
    data: {
      materialCode,
      materialName,
      category,
      specification,
      unit,
      status,
      previousMaterialCode: previousMaterialCode || null,
      successorMaterialCode: successorMaterialCode || null,
      minimumStock: Number(minimumStock),
      storageLocation,
      note,
      stock: { create: { currentQuantity: 0 } },
    },
    include: { stock: true },
  });

  return NextResponse.json(material, { status: 201 });
}
