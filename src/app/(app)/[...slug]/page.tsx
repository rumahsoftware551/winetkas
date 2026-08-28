import Link from "next/link";
import { AlertCircle, Filter, Search } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getModulePageData } from "@/lib/module-data";
import { DataTable } from "@/components/data-table";

export default async function ModulePage({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<{ q?: string }> }) {
  const [{ slug: parts }, query] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const slug = parts.join("/");
  const data = await getModulePageData(user.companyId, slug, query.q ?? "");
  if (!data) notFound();
  if (!user.permissions.has(data.permission)) return <div className="forbidden"><div><h1>Akses dibatasi</h1><p className="page-description">Hubungi administrator bila Anda memerlukan akses ke modul ini.</p></div></div>;
  const primaryVisible = data.primaryAction && user.permissions.has(data.primaryAction.permission);
  return (
    <>
      <div className="page-heading"><div><div className="eyebrow">ISPfinance · {parts[0]}</div><h1>{data.title}</h1><p className="page-description">{data.description}</p></div>{primaryVisible ? <Link className="primary-button" href={data.primaryAction!.href}>{data.primaryAction!.label}</Link> : null}</div>
      {data.kpis?.length ? <section className="metric-grid">{data.kpis.map((kpi) => <article className="metric-card" key={kpi.label}><div className="metric-label">{kpi.label}</div><div className="metric-value">{kpi.value}</div><div className={`badge ${kpi.tone ?? ""}`} style={{ marginTop: 12 }}>Data terfilter</div></article>)}</section> : null}
      {data.notice ? <div className="notice"><AlertCircle size={17} /><span>{data.notice}</span></div> : null}
      <form className="filter-bar" method="get"><div className="search-field"><Search size={16} /><input className="input" name="q" defaultValue={query.q ?? ""} placeholder="Cari data..." /></div><button className="secondary-button" type="submit"><Filter size={15} /> Terapkan</button>{query.q ? <Link className="secondary-button" href={`/${slug}`}>Reset</Link> : null}</form>
      <section className="panel"><DataTable columns={data.columns} rows={data.rows} /></section>
    </>
  );
}
