import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
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
        operatedAt: { lte: new Date(new Date(to).setDate(new Date(to).getDate() + 1)) },
      }),
    },
    orderBy: { operatedAt: "desc" },
  });

  const header = [
    "処理ID", "処理区分", "資材コード", "資材名", "数量",
    "処理前在庫", "処理後在庫", "理由", "使用先/入庫元", "備考",
    "処理者", "処理日時",
  ];

  const rows = transactions.map((t) => [
    t.id,
    TRANSACTION_TYPE_LABELS[t.transactionType] ?? t.transactionType,
    t.materialCodeSnapshot, t.materialNameSnapshot, t.quantity,
    t.beforeQuantity, t.afterQuantity, t.reason,
    t.destinationOrSource, t.note, t.operatedBy,
    t.operatedAt.toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="history.csv"',
    },
  });
}
