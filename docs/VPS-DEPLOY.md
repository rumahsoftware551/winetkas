# Deployment ISPfinance ke VPS

## Kebutuhan minimum

- Ubuntu 24.04 LTS atau Debian 12;
- 2 vCPU, RAM 4 GB, storage SSD 40 GB untuk tahap awal;
- Docker Engine, Docker Compose v2, dan Git;
- port 22, 80, dan 443 dibuka;
- domain/subdomain dengan A record mengarah ke IP publik VPS.

## Target production

- Domain: `ispfinance.rumahsoftware.site`
- VPS: `157.20.233.22`

## 1. Siapkan GitHub Environment

Buat GitHub Environment bernama `production`, kemudian tambahkan secrets:

- `VPS_USER`: username SSH yang memiliki akses `sudo` tanpa prompt atau akses Docker;
- `VPS_PORT`: port SSH, default `22`;
- `VPS_SSH_KEY`: private key untuk user tersebut;
- `POSTGRES_PASSWORD`: password URL-safe yang kuat dan tetap;
- `SEED_ADMIN_PASSWORD`: kata sandi awal akun aplikasi yang kuat.

IP VPS dan domain sudah ditetapkan pada workflow. Jangan memasukkan password atau private key ke source code.

## 2. Deployment otomatis

Setelah PR digabungkan ke `main`, workflow akan:

1. membuat `/opt/ispfinance` dan clone repository bila belum ada;
2. memasang Docker/Git bila diperlukan;
3. membuat `.env.production` dengan permission terbatas;
4. membangun container aplikasi, PostgreSQL, dan Caddy;
5. menjalankan migration dan seed pada deployment pertama;
6. memverifikasi `https://ispfinance.rumahsoftware.site/api/health`.

User SSH harus dapat menjalankan `sudo -n` saat bootstrap pertama. Bila user baru ditambahkan ke group Docker, jalankan workflow sekali lagi setelah sesi SSH diperbarui.

## 3. Persiapan manual alternatif

Masuk ke VPS menggunakan SSH, lalu:

```bash
sudo mkdir -p /opt/ispfinance
sudo chown "$USER":"$USER" /opt/ispfinance
git clone https://github.com/rumahsoftware551/winetkas.git /opt/ispfinance
cd /opt/ispfinance
```

Untuk repository private, gunakan deploy key/read-only token GitHub yang disimpan di VPS, bukan password akun.

## 4. Buat konfigurasi production manual

```bash
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

Wajib ubah `DOMAIN`, `APP_URL`, `POSTGRES_PASSWORD`, `DATABASE_URL`, dan `SEED_ADMIN_PASSWORD`. Password database dalam `DATABASE_URL` harus sama dengan `POSTGRES_PASSWORD` dan karakter khusus harus di-URL-encode.

## 5. Deployment pertama secara manual

```bash
docker compose build --pull
docker compose up -d
docker compose exec -T app ./node_modules/.bin/prisma migrate deploy
docker compose exec -T app npm run db:seed
docker compose ps
curl -fsS "https://DOMAIN_ANDA/api/health"
```

Setelah login berhasil, ganti akun/password development sebelum memasukkan data produksi.

## 6. Deployment berikutnya

```bash
cd /opt/ispfinance
sh scripts/deploy.sh
```

Workflow `.github/workflows/deploy-vps.yml` otomatis berjalan ketika perubahan masuk ke `main` dan juga dapat dijalankan manual.

## Backup PostgreSQL

Contoh backup harian manual:

```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "ispfinance-$(date +%F).dump"
```

Simpan backup terenkripsi di lokasi terpisah dan uji restore sebelum go-live. Jangan hanya menyimpan backup di disk VPS yang sama.

## Troubleshooting cepat

```bash
docker compose ps
docker compose logs --tail=200 app
docker compose logs --tail=200 db
docker compose logs --tail=200 caddy
```

Deployment dianggap berhasil hanya bila container sehat, migration selesai, health endpoint merespons, halaman login terbuka melalui HTTPS, dan login seed berhasil.
