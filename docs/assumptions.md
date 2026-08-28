# Asumsi Implementasi

1. Tagihan V1.0 dibuat manual; seed menyediakan data 12 bulan untuk validasi dashboard.
2. Pembayaran melebihi sisa tagihan akan ditolak ketika workflow pembayaran baru diaktifkan.
3. Serial number dan MAC bersifat opsional per barang.
4. Perangkat pada pelanggan tetap ditelusuri sebagai perangkat perusahaan; perlakuan penyusutan belum dipaksakan.
5. Valuasi stok menggunakan weighted average.
6. Approval threshold harus dikonfigurasi melalui Settings dan tidak di-hardcode.
7. Model mendukung multi-cabang dan multi-gudang; seed awal menggunakan satu cabang dan satu gudang.
8. Chart of accounts minimum mengikuti blueprint.
9. Migrasi data lama belum termasuk fase foundation.
10. Production menggunakan VPS Linux, Docker Compose, PostgreSQL, dan satu domain/subdomain yang diarahkan ke VPS.

Keputusan akuntansi final, domain production, kapasitas VPS, batas approval, data migrasi, dan kebijakan backup harus dikonfirmasi sebelum go-live.
