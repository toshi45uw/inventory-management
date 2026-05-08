import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      // treat as materialCode
      const material = await prisma.material.findUnique({
        where: { materialCode: params.id },
        include: { stock: true },
      });
      if (!material) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
      return NextResponse.json(material);
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: { stock: true },
    });
    if (!material) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    return NextResponse.json(material);
  } catch (e) {
    console.error("[GET /api/materials/[id]]", e);
    return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 }); }

  try {
    const {
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

    if (!materialName) {
      return NextResponse.json({ error: "資材名は必須です" }, { status: 400 });
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
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
      },
      include: { stock: true },
    });

    return NextResponse.json(material);
  } catch (e) {
    console.error("[PUT /api/materials/[id]]", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
