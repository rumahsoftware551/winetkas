# Deployment ISPfinance ke VPS

## Kebutuhan minimum

- Ubuntu 24.04 LTS atau Debian 12;
- 2 vCPU, RAM 4 GB, storage SSD 40 GB untuk tahap awal;
- Docker Engine, Docker Compose v2, dan Git;
- port 22, 80, dan 443 dibuka;
- domain/subdomain dengan A record mengarah ke IP publik VPS.

## 1. Siapkan direktori

Masuk ke VPS menggunakan SSH, lalu:

```bash
sudo mkdir -p /opt/ispfinance
sudo chown "$USER":"$USER" /opt/ispfinance
git clone https://github.com/rumahsoftware551/winetkas.git /opt/ispfinance
cd /opt/ispfinance
```

Untuk repository private, gunakan deploy key/read-only token GitHub yang disimpan di VPS, bukan password akun.

## 2. Buat konfigurasi production

```bash
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

Wajib ubah `DOMAIN`, `APP_URL`, `POSTGRES_PASSWORD`, `DATABASE_URL`, dan `SEED_ADMIN_PASSWORD`. Password database dalam `DATABASE_URL` harus sama dengan `POSTGRES_PASSWORD` dan karakter khusus harus di-URL-encode.

## 3. Deployment pertama

```bash
docker compose build --pull
docker compose up -d
docker compose exec -T app ./node_modules/.bin/prisma migrate deploy
docker compose exec -T app npm run db:seed
docker compose ps
curl -fsS "https://DOMAIN_ANDA/api/health"
```

Setelah login berhasil, ganti akun/password development sebelum memasukkan data produksi.

## 4. Deployment berikutnya

```bash
cd /opt/ispfinance
sh scripts/deploy.sh
```

Atau isi GitHub Environment `production` dengan secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`

Workflow `.github/workflows/deploy-vps.yml` kemudian menjalankan deployment ketika perubahan masuk ke `main`.

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
