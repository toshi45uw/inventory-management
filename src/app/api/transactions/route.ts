import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") ?? "";
    const name = searchParams.get("name") ?? "";
    const type = searchParams.get("type") ?? "";
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    const transactions = await prisma.stockTransaction.findMany({
      where: {
        ...(code && { materialCodeSnapshot: { contains: code } }),
        ...(name && { materialNameSnapshot: { contains: name } }),
        ...(type && { transactionType: type }),
        ...(from && { operatedAt: { gte: new Date(from) } }),
        ...(to && {
          operatedAt: {
            lte: new Date(new Date(to).setDate(new Date(to).getDate() + 1)),
          },
        }),
      },
      orderBy: { operatedAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (e) {
    console.error("[GET /api/transactions]", e);
    return NextResponse.json({ error: "データ取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 }); }

  try {
    const {
      transactionType,
      materialCode,
      quantity,
      reason = "",
      destinationOrSource = "",
      note = "",
      operatedBy = "現場担当者",
    } = body;

    if (!materialCode || !quantity || !transactionType) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json({ error: "数量は1以上の整数を入力してください" }, { status: 400 });
    }

    const material = await prisma.material.findUnique({
      where: { materialCode },
      include: { stock: true },
    });

    if (!material) {
      return NextResponse.json({ error: "資材コードが見つかりません" }, { status: 404 });
    }

    const currentQty = material.stock?.currentQuantity ?? 0;

    if (transactionType === "OUTBOUND" && qty > currentQty) {
      return NextResponse.json(
        { error: `現在庫(${currentQty})を超える出庫はできません` },
        { status: 400 }
      );
    }

    const afterQty =
      transactionType === "INBOUND"
        ? currentQty + qty
        : transactionType === "OUTBOUND"
        ? currentQty - qty
        : currentQty + qty;

    const [transaction] = await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          transactionType,
          materialId: material.id,
          materialCodeSnapshot: material.materialCode,
          materialNameSnapshot: material.materialName,
          quantity: qty,
          beforeQuantity: currentQty,
          afterQuantity: afterQty,
          reason,
          destinationOrSource,
          note,
          operatedBy,
        },
      }),
      prisma.stock.upsert({
        where: { materialId: material.id },
        update: { currentQuantity: afterQty },
        create: { materialId: material.id, currentQuantity: afterQty },
      }),
    ]);

    return NextResponse.json({ transaction, afterQuantity: afterQty }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/transactions]", e);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}
