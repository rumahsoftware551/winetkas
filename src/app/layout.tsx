import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ISPfinance V1.0", template: "%s | ISPfinance" },
  description: "Sistem keuangan, tagihan, dan inventory terpadu untuk perusahaan ISP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
