import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/master-forms";

export default async function NewItemPage() {
  const user = await requireUser();
  if (!user.permissions.has("inventory.manage")) return <div className="forbidden"><div><h1>Akses dibatasi</h1><p className="page-description">Anda tidak memiliki izin menambah barang.</p></div></div>;
  const categories = await prisma.itemCategory.findMany({ where: { companyId: user.companyId, isActive: true }, orderBy: { name: "asc" } });
  return <><div className="page-heading"><div><div className="eyebrow">Inventory · Database Barang</div><h1>Tambah Barang</h1><p className="page-description">Gunakan SKU unik dan tentukan minimum stock agar peringatan dapat bekerja.</p></div></div><ItemForm categories={categories.map((row) => ({ id: row.id, label: row.name }))} /></>;
}
