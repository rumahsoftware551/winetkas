import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";
import { MovementForm } from "@/components/master-forms";

export default async function NewMovementPage() {
  const user = await requireUser();
  if (!user.permissions.has("inventory.manage")) return <div className="forbidden"><div><h1>Akses dibatasi</h1><p className="page-description">Anda tidak memiliki izin membuat movement.</p></div></div>;
  const [warehouses, items] = await Promise.all([prisma.warehouse.findMany({ where: { branch: { companyId: user.companyId }, isActive: true }, orderBy: { name: "asc" } }), prisma.item.findMany({ where: { companyId: user.companyId, isActive: true }, include: { inventoryBalances: true }, orderBy: { name: "asc" } })]);
  return <><div className="page-heading"><div><div className="eyebrow">Inventory · Movement</div><h1>Movement Barang</h1><p className="page-description">Sistem menolak transaksi bila stok tersedia tidak mencukupi.</p></div></div><MovementForm warehouses={warehouses.map((row) => ({ id: row.id, label: row.name }))} items={items.map((row) => ({ id: row.id, label: `${row.sku} — ${row.name}`, secondary: `${formatNumber(row.inventoryBalances.reduce((sum, balance) => sum + Number(balance.onHand) - Number(balance.allocated), 0))} tersedia` }))} /></>;
}
