# ISPfinance V1.0

Sistem keuangan, tagihan pelanggan, pembelanjaan, dan inventory terpadu untuk perusahaan Internet Service Provider (ISP). Antarmuka menggunakan Bahasa Indonesia, mata uang IDR, serta role Pemilik/Direktur, Admin Keuangan, dan Admin Gudang.

## Fitur yang tersedia

- Login berbasis secure HTTP-only session dan password hash bcrypt.
- RBAC granular yang diperiksa di server.
- Dashboard dari database: kas/bank, pendapatan, pengeluaran, laba/rugi sementara, piutang, utang, stock on hand, outstanding, grafik 12 bulan, stok kritis, dan audit terbaru.
- Pelanggan, total tagihan bulanan, status invoice, pembayaran, serta riwayat pembayaran.
- Kas/bank, pembelanjaan, transaksi, dan laporan awal.
- Master barang, stock gudang, stock on hand, movement, dan outstanding.
- Tambah pelanggan dan barang dengan audit log.
- Movement ke teknisi/pelanggan/rusak dengan pengecekan stok dan transaksi database atomik.
- PostgreSQL, Prisma migration, seed development, unit test, Docker Compose, Caddy HTTPS, dan CI/CD GitHub Actions.

Status lengkap dan batasan saat ini tersedia di [`docs/implementation-status.md`](docs/implementation-status.md).

## Menjalankan secara lokal

Prasyarat: Node.js 22+, npm, dan PostgreSQL.

```bash
cp .env.example .env
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

## Akun development

| Peran | Email |
|---|---|
| Pemilik/Direktur | `direktur@ispfinance.local` |
| Admin Keuangan | `keuangan@ispfinance.local` |
| Admin Gudang | `gudang@ispfinance.local` |

Kata sandi mengikuti nilai `SEED_ADMIN_PASSWORD`. Default development hanya `ChangeMe-123!` dan wajib diganti untuk deployment sebenarnya.

## Pemeriksaan kualitas

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment VPS

Seluruh komponen production dijalankan di VPS menggunakan Docker Compose:

- `app`: Next.js standalone;
- `db`: PostgreSQL dengan persistent volume;
- `caddy`: reverse proxy, HTTPS, dan security headers.

Ikuti [`docs/VPS-DEPLOY.md`](docs/VPS-DEPLOY.md). Jangan commit `.env.production`, private key, password, atau secret VPS.

Target production: `https://ispfinance.rumahsoftware.site` pada VPS `157.20.233.22`.

## Struktur utama

```text
src/app/          routes, layout, dashboard, health check
src/actions/      server actions terotorisasi
src/components/   UI shell, tabel, grafik, dan form
src/lib/          autentikasi, query dashboard, format, business rules
prisma/           schema, migration, dan seed
scripts/          deployment VPS
docs/             arsitektur, asumsi, status, dan deployment
```
