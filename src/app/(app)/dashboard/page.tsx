import { Boxes, CircleDollarSign, CircleGauge, HandCoins, Landmark, ReceiptText, TrendingDown, WalletCards } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { formatCurrency, formatDate, humanize } from "@/lib/format";
import { MetricCard } from "@/components/metric-card";
import { RevenueChart } from "@/components/revenue-chart";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.permissions.has("dashboard.view")) return <div className="forbidden"><div><h1>Akses dibatasi</h1><p className="page-description">Anda tidak memiliki izin melihat dashboard.</p></div></div>;
  const data = await getDashboard(user.companyId);
  const metrics = [
    ["Saldo kas & bank", formatCurrency(data.metrics.cash), "Saldo seluruh rekening aktif", Landmark],
    ["Pendapatan bulan ini", formatCurrency(data.metrics.revenue), "Tagihan layanan periode aktif", CircleDollarSign],
    ["Pengeluaran bulan ini", formatCurrency(data.metrics.expenses), "Transaksi biaya posted", TrendingDown],
    ["Laba/rugi sementara", formatCurrency(data.metrics.profit), "Sebelum penyesuaian akhir", CircleGauge],
    ["Piutang pelanggan", formatCurrency(data.metrics.receivables), `${data.metrics.overdue} tagihan jatuh tempo`, ReceiptText],
    ["Utang usaha", formatCurrency(data.metrics.payables), "Pembelanjaan belum diselesaikan", HandCoins],
    ["Nilai stock on hand", formatCurrency(data.metrics.inventoryValue), "Weighted average cost", Boxes],
    ["Outstanding barang", String(data.metrics.outstanding), "Movement belum selesai", WalletCards],
  ] as const;
  return (
    <>
      <div className="page-heading"><div><div className="eyebrow">Ringkasan perusahaan</div><h1>Dashboard</h1><p className="page-description">Selamat datang, {user.name}. Berikut posisi operasional ISPfinance saat ini.</p></div></div>
      <section className="metric-grid">{metrics.map(([label, value, note, icon]) => <MetricCard key={label} label={label} value={value} note={note} icon={icon} />)}</section>
      <section className="dashboard-grid">
        <article className="panel"><div className="panel-header"><div><div className="panel-title">Tren Pendapatan</div><p className="panel-subtitle">Pendapatan layanan 12 bulan terakhir</p></div><span className="badge success">12 Bulan</span></div><div className="panel-content"><RevenueChart data={data.trend} /></div></article>
        <article className="panel"><div className="panel-header"><div><div className="panel-title">Realisasi Anggaran</div><p className="panel-subtitle">Periode bulan berjalan</p></div><strong>{data.budget.percentage}%</strong></div><div className="panel-content"><div className="progress"><span style={{ width: `${Math.min(data.budget.percentage, 100)}%` }} /></div><div className="list-item"><div><div className="list-title">Anggaran</div><div className="list-meta">Total rencana biaya</div></div><strong>{formatCurrency(data.budget.total)}</strong></div><div className="list-item"><div><div className="list-title">Realisasi</div><div className="list-meta">Biaya yang sudah posted</div></div><strong>{formatCurrency(data.budget.realized)}</strong></div></div></article>
      </section>
      <section className="dashboard-grid">
        <article className="panel"><div className="panel-header"><div><div className="panel-title">Aktivitas Terbaru</div><p className="panel-subtitle">Jejak aktivitas penting di dalam sistem</p></div></div><div className="panel-content list">{data.recent.length ? data.recent.map((item) => <div className="list-item" key={item.id}><div><div className="list-title">{humanize(item.action)} · {item.module}</div><div className="list-meta">{item.user} · {formatDate(item.createdAt)}</div></div><span className="badge">Tercatat</span></div>) : <div className="empty">Belum ada aktivitas.</div>}</div></article>
        <article className="panel"><div className="panel-header"><div><div className="panel-title">Stok Kritis</div><p className="panel-subtitle">Barang pada atau di bawah minimum stock</p></div></div><div className="panel-content list">{data.lowStock.length ? data.lowStock.map((item) => <div className="list-item" key={item.sku}><div><div className="list-title">{item.name}</div><div className="list-meta">{item.sku} · minimum {item.minimum}</div></div><span className="badge warning">{item.available} tersedia</span></div>) : <div className="empty">Tidak ada stok kritis.</div>}</div></article>
      </section>
    </>
  );
}
