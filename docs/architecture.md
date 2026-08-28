# Arsitektur ISPfinance V1.0

## Pola

ISPfinance menggunakan modular monolith: satu aplikasi Next.js menangani UI dan server logic, sedangkan PostgreSQL menjadi sumber data transaksional. Pemisahan domain dilakukan melalui folder action, query, komponen, dan model data agar dapat dipisahkan menjadi service lain bila skala berkembang.

```text
Browser → Caddy HTTPS → Next.js → Prisma → PostgreSQL
```

## Integritas data

- Nilai uang menggunakan `Decimal` PostgreSQL.
- Dokumen transaksi memiliki UUID, nomor dokumen, status, version, serta metadata posting/reversal sesuai kebutuhan.
- Nomor pelanggan dan movement dibuat server-side menggunakan sequence yang di-update secara atomic.
- Movement memeriksa stok dan memperbarui balance dalam satu database transaction.
- Audit log dibuat pada login serta mutation yang telah tersedia.
- Posted documents dirancang untuk dikoreksi melalui reversal, bukan penghapusan langsung.

## Keamanan

- Session token acak hanya disimpan di secure HTTP-only cookie; database menyimpan SHA-256 hash token.
- Password menggunakan bcrypt cost 12 pada seed.
- Role menghasilkan permission granular; pengecekan dilakukan kembali pada server action dan server page.
- Network database berada pada internal Docker network.
- Caddy menangani TLS dan security response headers.

## Deployment

Docker image menggunakan Next.js standalone output. PostgreSQL, aplikasi, dan Caddy berada dalam satu Compose project pada VPS. Database dan sertifikat menggunakan named volumes agar tetap ada setelah container diperbarui.
