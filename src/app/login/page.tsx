import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <div className="eyebrow" style={{ color: "#78a8ff" }}>ISPfinance V1.0</div>
          <h1>Keuangan dan inventory ISP dalam satu kendali.</h1>
          <p>Pantau pendapatan, tagihan pelanggan, kas, pembelanjaan, dan pergerakan barang melalui antarmuka yang ringkas dan mudah dipahami.</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="brand-mark">IF</div>
          <h2>Selamat datang</h2>
          <p>Masuk menggunakan akun yang telah diberikan administrator.</p>
          <LoginForm />
          <div className="demo-box"><strong>Akun development</strong><br />direktur@ispfinance.local<br />Kata sandi mengikuti <code>SEED_ADMIN_PASSWORD</code>.</div>
        </div>
      </section>
    </main>
  );
}
