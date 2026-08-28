# Status Implementasi ISPfinance V1.0

Tanggal baseline: 28 Agustus 2026.

## Selesai pada foundation

- Project Next.js/TypeScript, design system, app shell, responsive navigation, dan UI Bahasa Indonesia.
- PostgreSQL schema, Prisma migration, idempotent development seed, serta 12 bulan data grafik.
- Login/session, tiga role seed, permission server-side, dan audit login.
- Dashboard database-backed.
- Halaman data terfilter untuk menu Keuangan, Tagihan, Inventory, Laporan, dan Settings.
- Form tambah pelanggan, tambah barang, dan post movement dengan validasi stok.
- Audit mutation yang tersedia.
- Unit test business rule dasar.
- Dockerfile, Compose, Caddy HTTPS, health check, CI, dan deployment workflow VPS.

## Implementasi parsial

- Tagihan dan pembayaran saat ini dapat ditampilkan dari database/seed; form posting/reversal lengkap belum tersedia.
- Kas/bank, pembelanjaan, laporan, anggaran, dan settings memiliki data/read model awal; seluruh workflow mutation belum tersedia.
- Jurnal double-entry sudah dimodelkan dan fungsi keseimbangan diuji, tetapi posting journal otomatis untuk semua sumber transaksi belum lengkap.
- Stock movement yang aktif saat ini mencakup pengeluaran ke teknisi, penempatan pelanggan, dan rusak/hilang. Transfer antargudang serta penerimaan pembelian belum memiliki form lengkap.

## Milestone berikutnya

1. Finance & Billing: invoice posting, pembayaran multi-invoice, alokasi, receipt, reversal, cash ledger, journal posting, dan aging lengkap.
2. Purchasing & Inventory: approval, goods receipt partial, weighted-average update, warehouse transfer, receive confirmation, stock opname.
3. Budget & Reporting: budget lifecycle, approval matrix, profit/loss dan cash-flow dari jurnal, XLSX/PDF export.
4. Hardening: rate limit, CSRF review, attachment storage, integration/E2E tests, performance, backup/restore drill, dan UAT.

Tidak ada tombol ekspor atau workflow yang diklaim selesai bila implementasi backend-nya belum tersedia.
