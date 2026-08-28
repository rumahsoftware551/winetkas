import type { LucideIcon } from "lucide-react";
import { Boxes, FileChartColumn, LayoutDashboard, ReceiptText, Settings, WalletCards } from "lucide-react";

export type NavigationItem = { label: string; href: string; permission: string };
export type NavigationGroup = { label: string; icon: LucideIcon; href?: string; permission: string; items?: NavigationItem[] };

export const navigation: NavigationGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", permission: "dashboard.view" },
  {
    label: "Keuangan", icon: WalletCards, permission: "finance.view", items: [
      { label: "Kas dan Bank", href: "/keuangan/kas-bank", permission: "finance.view" },
      { label: "Utang & Piutang", href: "/keuangan/utang-piutang", permission: "finance.view" },
      { label: "Pembelanjaan", href: "/keuangan/pembelanjaan", permission: "finance.view" },
      { label: "Anggaran Bulanan", href: "/keuangan/anggaran-bulanan", permission: "finance.view" },
      { label: "Transaksi", href: "/keuangan/transaksi", permission: "finance.view" },
    ],
  },
  {
    label: "Tagihan", icon: ReceiptText, permission: "billing.view", items: [
      { label: "Daftar Pelanggan", href: "/tagihan/daftar-pelanggan", permission: "billing.view" },
      { label: "Status Tagihan", href: "/tagihan/status-tagihan", permission: "billing.view" },
      { label: "Transaksi Pembayaran", href: "/tagihan/transaksi-pembayaran", permission: "billing.view" },
      { label: "Riwayat Pembayaran", href: "/tagihan/riwayat-pembayaran", permission: "billing.view" },
    ],
  },
  {
    label: "Inventory", icon: Boxes, permission: "inventory.view", items: [
      { label: "Stock Gudang", href: "/inventory/stock-gudang", permission: "inventory.view" },
      { label: "Database Barang", href: "/inventory/database-barang", permission: "inventory.view" },
      { label: "Movement Barang", href: "/inventory/movement-barang", permission: "inventory.view" },
      { label: "Outstanding", href: "/inventory/outstanding", permission: "inventory.view" },
    ],
  },
  {
    label: "Laporan", icon: FileChartColumn, permission: "reports.view", items: [
      { label: "Laba Rugi", href: "/laporan/laba-rugi", permission: "reports.view" },
      { label: "Arus Kas", href: "/laporan/arus-kas", permission: "reports.view" },
      { label: "Piutang Pelanggan", href: "/laporan/piutang-pelanggan", permission: "reports.view" },
      { label: "Stock on Hand", href: "/laporan/stock-on-hand", permission: "reports.view" },
    ],
  },
  {
    label: "Settings", icon: Settings, permission: "settings.manage", items: [
      { label: "Pengguna & Hak Akses", href: "/settings/pengguna", permission: "settings.manage" },
      { label: "Profil Perusahaan", href: "/settings/profil-perusahaan", permission: "settings.manage" },
      { label: "Cabang & Gudang", href: "/settings/cabang-gudang", permission: "settings.manage" },
      { label: "Kategori & Akun", href: "/settings/akun", permission: "settings.manage" },
      { label: "Nomor Dokumen", href: "/settings/nomor-dokumen", permission: "settings.manage" },
      { label: "Persetujuan", href: "/settings/persetujuan", permission: "settings.manage" },
      { label: "Backup & Ekspor", href: "/settings/backup", permission: "settings.manage" },
      { label: "Audit Log", href: "/settings/audit-log", permission: "audit.view" },
    ],
  },
];
