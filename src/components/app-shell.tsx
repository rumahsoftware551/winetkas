"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, LogOut, Menu, X } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { logoutAction } from "@/actions/auth";

type AppShellProps = {
  user: { name: string; email: string; companyName: string; roles: string[]; permissions: string[] };
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const allowed = (permission: string) => user.permissions.includes(permission);
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">IF</div>
          <div><div className="brand-name">ISPfinance</div><div className="brand-version">VERSION 1.0</div></div>
          <button className="icon-button mobile-menu" style={{ marginLeft: "auto", color: "white" }} onClick={() => setOpen(false)} aria-label="Tutup menu"><X size={19} /></button>
        </div>
        <nav className="nav" aria-label="Navigasi utama">
          {navigation.filter((group) => allowed(group.permission)).map((group) => {
            const Icon = group.icon;
            if (group.href) return <Link key={group.label} href={group.href} onClick={() => setOpen(false)} className={`nav-link ${pathname === group.href ? "active" : ""}`}><Icon size={17} />{group.label}</Link>;
            return (
              <div key={group.label}>
                <div className="nav-parent"><Icon size={17} />{group.label}</div>
                {group.items?.filter((item) => allowed(item.permission)).map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`nav-link nav-child ${pathname === item.href ? "active" : ""}`}>{item.label}</Link>)}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">{user.companyName}<br />© 2026 ISPfinance</div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu size={20} /></button>
            <div><div className="user-name">{user.companyName}</div><div className="user-role">Ruang kerja operasional</div></div>
          </div>
          <div className="topbar-actions">
            <div className="period-chip"><CalendarDays size={15} /> Agustus 2026</div>
            <button className="icon-button" aria-label="Notifikasi"><Bell size={18} /></button>
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div className="user-copy"><div className="user-name">{user.name}</div><div className="user-role">{user.roles.join(", ")}</div></div>
            </div>
            <form action={logoutAction}><button className="icon-button" title="Keluar" aria-label="Keluar"><LogOut size={17} /></button></form>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
