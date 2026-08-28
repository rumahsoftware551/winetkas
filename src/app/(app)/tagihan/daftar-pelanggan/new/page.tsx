import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/master-forms";

export default async function NewCustomerPage() {
  const user = await requireUser();
  if (!user.permissions.has("billing.manage")) return <div className="forbidden"><div><h1>Akses dibatasi</h1><p className="page-description">Anda tidak memiliki izin menambah pelanggan.</p></div></div>;
  const [branches, packages] = await Promise.all([prisma.branch.findMany({ where: { companyId: user.companyId, isActive: true }, orderBy: { name: "asc" } }), prisma.servicePackage.findMany({ where: { companyId: user.companyId, isActive: true }, orderBy: { monthlyPrice: "asc" } })]);
  return <><div className="page-heading"><div><div className="eyebrow">Tagihan · Pelanggan</div><h1>Tambah Pelanggan</h1><p className="page-description">Nomor pelanggan dibuat otomatis oleh server setelah data berhasil disimpan.</p></div></div><CustomerForm branches={branches.map((row) => ({ id: row.id, label: row.name }))} packages={packages.map((row) => ({ id: row.id, label: row.name, price: Number(row.monthlyPrice) }))} /></>;
}
