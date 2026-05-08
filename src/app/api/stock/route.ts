import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const location = searchParams.get("location") ?? "";
  const lowStock = searchParams.get("lowStock") === "true";
  const zeroStock = searchParams.get("zeroStock") === "true";

  const materials = await prisma.material.findMany({
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

  let filtered = materials;
  if (lowStock) {
    filtered = filtered.filter(
      (m) => m.stock && m.stock.currentQuantity < m.minimumStock
    );
  }
  if (zeroStock) {
    filtered = filtered.filter((m) => !m.stock || m.stock.currentQuantity === 0);
  }

  return NextResponse.json(filtered);
}
