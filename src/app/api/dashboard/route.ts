import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [materials, stocks, recentTransactions] = await Promise.all([
    prisma.material.findMany({ include: { stock: true } }),
    prisma.stock.findMany(),
    prisma.stockTransaction.findMany({
      orderBy: { operatedAt: "desc" },
      take: 10,
    }),
  ]);

  const totalMaterials = materials.length;
  const zeroStock = stocks.filter((s) => s.currentQuantity === 0).length;
  const lowStock = materials.filter(
    (m) => m.stock && m.stock.currentQuantity < m.minimumStock && m.stock.currentQuantity > 0
  ).length;
  const inactiveWithStock = materials.filter(
    (m) =>
      (m.status === "SUSPENDED" || m.status === "DISCONTINUED") &&
      m.stock &&
      m.stock.currentQuantity > 0
  ).length;

  const recentInbound = recentTransactions.filter((t) => t.transactionType === "INBOUND").length;
  const recentOutbound = recentTransactions.filter((t) => t.transactionType === "OUTBOUND").length;

  return NextResponse.json({
    totalMaterials,
    zeroStock,
    lowStock,
    inactiveWithStock,
    recentInbound,
    recentOutbound,
  });
}
