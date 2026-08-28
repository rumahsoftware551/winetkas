import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatNumber, humanize } from "@/lib/format";

export type ModulePageData = {
  title: string;
  description: string;
  permission: string;
  columns: string[];
  rows: Array<Array<string>>;
  kpis?: Array<{ label: string; value: string; tone?: "success" | "warning" | "danger" }>;
  primaryAction?: { label: string; href: string; permission: string };
  notice?: string;
};

const configs: Record<string, Pick<ModulePageData, "title" | "description" | "permission">> = {
  "keuangan/kas-bank": { title: "Kas dan Bank", description: "Pantau saldo dan rekening operasional perusahaan.", permission: "finance.view" },
  "keuangan/utang-piutang": { title: "Utang & Piutang", description: "Monitor kewajiban pemasok dan tagihan pelanggan berdasarkan umur.", permission: "finance.view" },
  "keuangan/pembelanjaan": { title: "Pembelanjaan", description: "Kelola pembelian barang dan biaya beserta status penerimaannya.", permission: "finance.view" },
  "keuangan/anggaran-bulanan": { title: "Anggaran Bulanan", description: "Bandingkan anggaran, komitmen, realisasi, dan sisa biaya.", permission: "finance.view" },
  "keuangan/transaksi": { title: "Transaksi", description: "Daftar terpusat seluruh transaksi keuangan yang dapat ditelusuri.", permission: "finance.view" },
  "tagihan/daftar-pelanggan": { title: "Daftar Pelanggan", description: "Kelola pelanggan, paket internet, dan nilai tagihan bulanannya.", permission: "billing.view" },
  "tagihan/status-tagihan": { title: "Status Tagihan", description: "Pantau tagihan terbuka, sebagian, lunas, dan jatuh tempo.", permission: "billing.view" },
  "tagihan/transaksi-pembayaran": { title: "Transaksi Pembayaran", description: "Penerimaan pembayaran pelanggan yang telah dicatat.", permission: "billing.view" },
  "tagihan/riwayat-pembayaran": { title: "Riwayat Pembayaran", description: "Telusuri pembayaran, referensi, rekening tujuan, dan status posting.", permission: "billing.view" },
  "inventory/stock-gudang": { title: "Stock Gudang", description: "Lihat stok tersedia, dialokasikan, dalam perjalanan, dan stok kritis.", permission: "inventory.view" },
  "inventory/database-barang": { title: "Database Barang", description: "Master SKU, kategori, harga rata-rata, dan minimum stock.", permission: "inventory.view" },
  "inventory/movement-barang": { title: "Movement Barang", description: "Telusuri perpindahan barang dari sumber hingga diterima tujuan.", permission: "inventory.view" },
  "inventory/outstanding": { title: "Outstanding", description: "Barang pada teknisi, pelanggan, atau masih dalam perjalanan.", permission: "inventory.view" },
  "laporan/laba-rugi": { title: "Laporan Laba Rugi", description: "Ringkasan pendapatan dan beban pada periode terpilih.", permission: "reports.view" },
  "laporan/arus-kas": { title: "Laporan Arus Kas", description: "Arus masuk, keluar, serta saldo kas dan bank.", permission: "reports.view" },
  "laporan/piutang-pelanggan": { title: "Piutang Pelanggan", description: "Sisa piutang dan aging per pelanggan.", permission: "reports.view" },
  "laporan/stock-on-hand": { title: "Stock on Hand", description: "Kuantitas dan nilai persediaan per lokasi.", permission: "reports.view" },
  "settings/pengguna": { title: "Pengguna & Hak Akses", description: "Kelola pengguna serta peran yang menentukan izin aplikasi.", permission: "settings.manage" },
  "settings/profil-perusahaan": { title: "Profil Perusahaan", description: "Identitas perusahaan, mata uang, dan zona waktu.", permission: "settings.manage" },
  "settings/cabang-gudang": { title: "Cabang & Gudang", description: "Struktur lokasi operasional dan penyimpanan barang.", permission: "settings.manage" },
  "settings/akun": { title: "Kategori & Akun Keuangan", description: "Chart of accounts dan pemetaan kategori transaksi.", permission: "settings.manage" },
  "settings/nomor-dokumen": { title: "Nomor Dokumen", description: "Format nomor unik dan berurutan untuk setiap dokumen.", permission: "settings.manage" },
  "settings/persetujuan": { title: "Persetujuan", description: "Aturan approval transaksi, anggaran, dan adjustment stok.", permission: "settings.manage" },
  "settings/backup": { title: "Backup & Ekspor", description: "Panduan backup harian serta kebijakan retensi data.", permission: "settings.manage" },
  "settings/audit-log": { title: "Audit Log", description: "Jejak aktivitas penting yang tidak dapat diubah pengguna biasa.", permission: "audit.view" },
};

export async function getModulePageData(companyId: string, slug: string, query = ""): Promise<ModulePageData | null> {
  const config = configs[slug];
  if (!config) return null;
  const contains = query ? { contains: query, mode: "insensitive" as const } : undefined;

  if (slug === "keuangan/kas-bank") {
    const rows = await prisma.cashAccount.findMany({ where: { companyId, ...(contains ? { name: contains } : {}) }, orderBy: { name: "asc" } });
    return { ...config, columns: ["Kode", "Rekening", "Bank", "Nomor", "Saldo"], rows: rows.map((row) => [row.code, row.name, row.bankName ?? "Kas", row.accountNumber ?? "—", formatCurrency(row.currentBalance)]), kpis: [{ label: "Total saldo", value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.currentBalance), 0)), tone: "success" }] };
  }
  if (slug === "tagihan/daftar-pelanggan") {
    const rows = await prisma.customer.findMany({ where: { companyId, ...(contains ? { OR: [{ name: contains }, { customerNumber: contains }, { phone: contains }] } : {}) }, include: { servicePackage: true, branch: true }, orderBy: { createdAt: "desc" }, take: 50 });
    const totals = await prisma.customer.aggregate({ where: { companyId, status: "ACTIVE" }, _sum: { monthlyBill: true }, _avg: { monthlyBill: true }, _count: true });
    return { ...config, columns: ["ID", "Pelanggan", "Paket", "Cabang", "Tagihan/Bulan", "Status"], rows: rows.map((row) => [row.customerNumber, row.name, row.servicePackage?.name ?? "—", row.branch.name, formatCurrency(row.monthlyBill), row.status]), kpis: [{ label: "Pelanggan aktif", value: formatNumber(totals._count) }, { label: "Total tagihan bulanan", value: formatCurrency(totals._sum.monthlyBill ?? 0), tone: "success" }, { label: "Rata-rata tagihan", value: formatCurrency(totals._avg.monthlyBill ?? 0) }], primaryAction: { label: "+ Pelanggan", href: "/tagihan/daftar-pelanggan/new", permission: "billing.manage" } };
  }
  if (slug === "tagihan/status-tagihan") {
    const rows = await prisma.invoice.findMany({ where: { companyId, ...(contains ? { OR: [{ documentNumber: contains }, { customer: { name: contains } }] } : {}) }, include: { customer: true }, orderBy: { dueDate: "desc" }, take: 50 });
    const outstanding = rows.reduce((sum, row) => sum + Number(row.remainingAmount), 0);
    return { ...config, columns: ["No. Tagihan", "Periode", "Pelanggan", "Total", "Sisa", "Jatuh Tempo", "Status"], rows: rows.map((row) => [row.documentNumber, row.period, row.customer.name, formatCurrency(row.total), formatCurrency(row.remainingAmount), formatDate(row.dueDate), humanize(row.status)]), kpis: [{ label: "Data ditampilkan", value: formatNumber(rows.length) }, { label: "Sisa tagihan", value: formatCurrency(outstanding), tone: outstanding > 0 ? "warning" : "success" }] };
  }
  if (slug === "tagihan/transaksi-pembayaran" || slug === "tagihan/riwayat-pembayaran") {
    const rows = await prisma.payment.findMany({ where: { companyId, ...(contains ? { documentNumber: contains } : {}) }, include: { cashAccount: true, allocations: { include: { invoice: { include: { customer: true } } } } }, orderBy: { paymentDate: "desc" }, take: 50 });
    return { ...config, columns: ["No. Pembayaran", "Tanggal", "Pelanggan", "Rekening", "Metode", "Nominal", "Status"], rows: rows.map((row) => [row.documentNumber, formatDate(row.paymentDate), row.allocations[0]?.invoice.customer.name ?? "—", row.cashAccount.name, row.method, formatCurrency(row.amount), humanize(row.status)]), kpis: [{ label: "Total penerimaan", value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.amount), 0)), tone: "success" }] };
  }
  if (slug === "keuangan/pembelanjaan") {
    const rows = await prisma.purchase.findMany({ where: { companyId, ...(contains ? { OR: [{ documentNumber: contains }, { supplier: { name: contains } }] } : {}) }, include: { supplier: true, warehouse: true }, orderBy: { purchaseDate: "desc" }, take: 50 });
    return { ...config, columns: ["No. Pembelanjaan", "Tanggal", "Supplier", "Gudang", "Jenis", "Total", "Status"], rows: rows.map((row) => [row.documentNumber, formatDate(row.purchaseDate), row.supplier.name, row.warehouse?.name ?? "—", row.type, formatCurrency(row.total), humanize(row.status)]) };
  }
  if (slug === "inventory/database-barang") {
    const rows = await prisma.item.findMany({ where: { companyId, ...(contains ? { OR: [{ sku: contains }, { name: contains }] } : {}) }, include: { category: true, inventoryBalances: true }, orderBy: { name: "asc" }, take: 50 });
    return { ...config, columns: ["SKU", "Nama Barang", "Kategori", "Satuan", "Stock", "Minimum", "Harga Rata-rata", "Status"], rows: rows.map((row) => [row.sku, row.name, row.category.name, row.unit, formatNumber(row.inventoryBalances.reduce((sum, item) => sum + Number(item.onHand), 0)), formatNumber(row.minimumStock), formatCurrency(row.averageCost), row.isActive ? "Aktif" : "Nonaktif"]), primaryAction: { label: "+ Barang", href: "/inventory/database-barang/new", permission: "inventory.manage" } };
  }
  if (slug === "inventory/stock-gudang" || slug === "laporan/stock-on-hand") {
    const rows = await prisma.inventoryBalance.findMany({ where: { warehouse: { branch: { companyId } }, ...(contains ? { item: { OR: [{ sku: contains }, { name: contains }] } } : {}) }, include: { item: true, warehouse: true }, orderBy: { item: { name: "asc" } }, take: 50 });
    const value = rows.reduce((sum, row) => sum + Number(row.onHand) * Number(row.item.averageCost), 0);
    return { ...config, columns: ["Gudang", "SKU", "Barang", "On Hand", "Dialokasikan", "Tersedia", "Dalam Perjalanan", "Nilai"], rows: rows.map((row) => [row.warehouse.name, row.item.sku, row.item.name, formatNumber(row.onHand), formatNumber(row.allocated), formatNumber(Number(row.onHand) - Number(row.allocated)), formatNumber(row.inTransit), formatCurrency(Number(row.onHand) * Number(row.item.averageCost))]), kpis: [{ label: "Nilai persediaan", value: formatCurrency(value), tone: "success" }] };
  }
  if (slug === "inventory/movement-barang" || slug === "inventory/outstanding") {
    const outstandingOnly = slug.endsWith("outstanding");
    const rows = await prisma.stockMovement.findMany({ where: { companyId, ...(outstandingOnly ? { status: { in: ["SUBMITTED", "APPROVED", "IN_TRANSIT"] } } : {}), ...(contains ? { documentNumber: contains } : {}) }, include: { sourceWarehouse: true, targetWarehouse: true, lines: { include: { item: true } } }, orderBy: { movementDate: "desc" }, take: 50 });
    return { ...config, columns: ["No. Movement", "Tanggal", "Jenis", "Sumber", "Tujuan/Pemegang", "Barang", "Qty", "Status"], rows: rows.map((row) => [row.documentNumber, formatDate(row.movementDate), humanize(row.type), row.sourceWarehouse?.name ?? "Eksternal", row.targetWarehouse?.name ?? row.holderName ?? "—", row.lines.map((line) => line.item.name).join(", "), formatNumber(row.lines.reduce((sum, line) => sum + Number(line.quantity), 0)), humanize(row.status)]), kpis: outstandingOnly ? [{ label: "Outstanding aktif", value: formatNumber(rows.length), tone: rows.length ? "warning" : "success" }] : undefined, primaryAction: outstandingOnly ? undefined : { label: "+ Movement Barang", href: "/inventory/movement-barang/new", permission: "inventory.manage" } };
  }
  if (slug === "settings/pengguna") {
    const rows = await prisma.user.findMany({ where: { companyId, ...(contains ? { OR: [{ name: contains }, { email: contains }] } : {}) }, include: { userRoles: { include: { role: true } } }, orderBy: { name: "asc" } });
    return { ...config, columns: ["Nama", "Email", "Peran", "Status", "Dibuat"], rows: rows.map((row) => [row.name, row.email, row.userRoles.map((item) => item.role.name).join(", "), humanize(row.status), formatDate(row.createdAt)]) };
  }
  if (slug === "settings/cabang-gudang") {
    const rows = await prisma.branch.findMany({ where: { companyId }, include: { warehouses: true } });
    return { ...config, columns: ["Kode", "Cabang", "Alamat", "Gudang", "Status"], rows: rows.map((row) => [row.code, row.name, row.address ?? "—", row.warehouses.map((warehouse) => warehouse.name).join(", "), row.isActive ? "Aktif" : "Nonaktif"]) };
  }
  if (slug === "settings/akun") {
    const rows = await prisma.account.findMany({ where: { companyId, ...(contains ? { OR: [{ code: contains }, { name: contains }] } : {}) }, orderBy: { code: "asc" } });
    return { ...config, columns: ["Kode", "Nama Akun", "Tipe", "Saldo Normal", "Status"], rows: rows.map((row) => [row.code, row.name, humanize(row.type), humanize(row.normalBalance), row.isActive ? "Aktif" : "Nonaktif"]) };
  }
  if (slug === "settings/audit-log") {
    const rows = await prisma.auditLog.findMany({ where: { companyId, ...(contains ? { OR: [{ module: contains }, { action: contains }] } : {}) }, include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 });
    return { ...config, columns: ["Waktu", "Pengguna", "Modul", "Tindakan", "Entitas", "Alasan"], rows: rows.map((row) => [formatDate(row.createdAt), row.user?.name ?? "Sistem", row.module, row.action, row.entityType ?? "—", row.reason ?? "—"]) };
  }
  if (slug === "settings/profil-perusahaan") {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
    return { ...config, columns: ["Pengaturan", "Nilai"], rows: [["Nama perusahaan", company.name], ["Mata uang", company.currency], ["Zona waktu", company.timezone]], notice: "Perubahan profil akan diaktifkan setelah approval dan validasi settings selesai." };
  }
  if (slug === "laporan/piutang-pelanggan" || slug === "keuangan/utang-piutang") {
    const rows = await prisma.invoice.groupBy({ where: { companyId, remainingAmount: { gt: 0 } }, by: ["customerId"], _sum: { total: true, paidAmount: true, remainingAmount: true }, _count: true });
    const customers = await prisma.customer.findMany({ where: { id: { in: rows.map((row) => row.customerId) } } });
    const names = new Map(customers.map((row) => [row.id, row.name]));
    return { ...config, columns: ["Pelanggan", "Jumlah Tagihan", "Nilai Tagihan", "Dibayar", "Sisa Piutang"], rows: rows.map((row) => [names.get(row.customerId) ?? "—", formatNumber(row._count), formatCurrency(row._sum.total ?? 0), formatCurrency(row._sum.paidAmount ?? 0), formatCurrency(row._sum.remainingAmount ?? 0)]), kpis: [{ label: "Total piutang", value: formatCurrency(rows.reduce((sum, row) => sum + Number(row._sum.remainingAmount ?? 0), 0)), tone: "warning" }] };
  }
  if (slug === "laporan/arus-kas") {
    const rows = await prisma.cashAccount.findMany({ where: { companyId } });
    return { ...config, columns: ["Kode", "Rekening", "Saldo Awal", "Saldo Akhir", "Perubahan"], rows: rows.map((row) => [row.code, row.name, formatCurrency(row.openingBalance), formatCurrency(row.currentBalance), formatCurrency(Number(row.currentBalance) - Number(row.openingBalance))]), kpis: [{ label: "Total saldo akhir", value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.currentBalance), 0)), tone: "success" }] };
  }
  if (slug === "laporan/laba-rugi") {
    const revenue = await prisma.invoice.aggregate({ where: { companyId, status: { notIn: ["DRAFT", "CANCELLED"] } }, _sum: { total: true } });
    const expense = await prisma.transaction.aggregate({ where: { companyId, type: "EXPENSE", status: "POSTED" }, _sum: { amount: true } });
    const revenueValue = Number(revenue._sum.total ?? 0); const expenseValue = Number(expense._sum.amount ?? 0);
    return { ...config, columns: ["Kelompok", "Nilai"], rows: [["Pendapatan layanan", formatCurrency(revenueValue)], ["Beban operasional", formatCurrency(expenseValue)], ["Laba/rugi sementara", formatCurrency(revenueValue - expenseValue)]], kpis: [{ label: "Laba/rugi sementara", value: formatCurrency(revenueValue - expenseValue), tone: revenueValue - expenseValue >= 0 ? "success" : "danger" }] };
  }
  if (slug === "keuangan/transaksi") {
    const rows = await prisma.transaction.findMany({ where: { companyId, ...(contains ? { OR: [{ documentNumber: contains }, { description: contains }] } : {}) }, include: { cashAccount: true }, orderBy: { transactionDate: "desc" }, take: 50 });
    return { ...config, columns: ["No. Transaksi", "Tanggal", "Tipe", "Deskripsi", "Kas/Bank", "Nominal", "Status"], rows: rows.map((row) => [row.documentNumber, formatDate(row.transactionDate), row.type, row.description, row.cashAccount?.name ?? "—", formatCurrency(row.amount), humanize(row.status)]), notice: rows.length ? undefined : "Belum ada transaksi umum. Pembayaran pelanggan tetap tersedia pada modul Tagihan." };
  }
  if (slug === "keuangan/anggaran-bulanan") {
    const rows = await prisma.budget.findMany({ where: { companyId }, include: { account: true, branch: true }, orderBy: { period: "desc" }, take: 50 });
    return { ...config, columns: ["Periode", "Cabang", "Akun", "Anggaran", "Komitmen", "Realisasi", "Sisa", "Status"], rows: rows.map((row) => [row.period, row.branch.name, row.account.name, formatCurrency(row.amount), formatCurrency(row.committed), formatCurrency(row.realized), formatCurrency(Number(row.amount) - Number(row.realized)), humanize(row.status)]), notice: rows.length ? undefined : "Belum ada anggaran. Workflow pengajuan dan approval masuk milestone Budget & Reporting." };
  }

  return { ...config, columns: ["Status implementasi"], rows: [["Fondasi data tersedia; workflow lengkap dijadwalkan pada milestone berikutnya."]], notice: "Halaman ini tersedia agar navigasi dan permission dapat diuji tanpa tombol palsu." };
}
