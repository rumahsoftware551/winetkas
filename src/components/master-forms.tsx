"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createCustomerAction, createItemAction, createMovementAction } from "@/actions/master";

type Option = { id: string; label: string; secondary?: string };

export function CustomerForm({ branches, packages }: { branches: Option[]; packages: Array<Option & { price: number }> }) {
  const [state, action, pending] = useActionState(createCustomerAction, { error: "" });
  return <form action={action} className="form-card">{state.error ? <div className="form-error">{state.error}</div> : null}<div className="form-grid">
    <div className="field full"><label className="label" htmlFor="name">Nama pelanggan</label><input className="input" id="name" name="name" placeholder="Nama lengkap atau perusahaan" required /></div>
    <div className="field"><label className="label" htmlFor="phone">Nomor telepon</label><input className="input" id="phone" name="phone" placeholder="08xxxxxxxxxx" required /></div>
    <div className="field"><label className="label" htmlFor="branchId">Cabang</label><select className="select" id="branchId" name="branchId" required>{branches.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></div>
    <div className="field"><label className="label" htmlFor="servicePackageId">Paket internet</label><select className="select" id="servicePackageId" name="servicePackageId" required>{packages.map((item) => <option value={item.id} key={item.id}>{item.label} · Rp {item.price.toLocaleString("id-ID")}</option>)}</select></div>
    <div className="field"><label className="label" htmlFor="monthlyBill">Tagihan bulanan</label><input className="input" id="monthlyBill" name="monthlyBill" type="number" min="1" defaultValue={packages[0]?.price} required /><div className="helper">Nilai dapat disesuaikan bila ada harga khusus.</div></div>
    <div className="field full"><label className="label" htmlFor="installAddress">Alamat pemasangan</label><textarea className="textarea" id="installAddress" name="installAddress" required /></div>
  </div><div className="form-actions"><Link className="secondary-button" href="/tagihan/daftar-pelanggan">Batal</Link><button className="primary-button" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Pelanggan"}</button></div></form>;
}

export function ItemForm({ categories }: { categories: Option[] }) {
  const [state, action, pending] = useActionState(createItemAction, { error: "" });
  return <form action={action} className="form-card">{state.error ? <div className="form-error">{state.error}</div> : null}<div className="form-grid">
    <div className="field"><label className="label" htmlFor="sku">SKU</label><input className="input" id="sku" name="sku" placeholder="Contoh: ONU-HG6243C" required /></div>
    <div className="field"><label className="label" htmlFor="categoryId">Kategori</label><select className="select" id="categoryId" name="categoryId" required>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></div>
    <div className="field full"><label className="label" htmlFor="name">Nama barang</label><input className="input" id="name" name="name" required /></div>
    <div className="field"><label className="label" htmlFor="unit">Satuan</label><input className="input" id="unit" name="unit" defaultValue="PCS" required /></div>
    <div className="field"><label className="label" htmlFor="minimumStock">Minimum stock</label><input className="input" id="minimumStock" name="minimumStock" type="number" min="0" step="0.001" defaultValue="0" required /></div>
    <div className="field"><label className="label" htmlFor="averageCost">Harga awal/rata-rata</label><input className="input" id="averageCost" name="averageCost" type="number" min="0" defaultValue="0" required /></div>
  </div><div className="form-actions"><Link className="secondary-button" href="/inventory/database-barang">Batal</Link><button className="primary-button" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Barang"}</button></div></form>;
}

export function MovementForm({ warehouses, items }: { warehouses: Option[]; items: Option[] }) {
  const [state, action, pending] = useActionState(createMovementAction, { error: "" });
  return <form action={action} className="form-card">{state.error ? <div className="form-error">{state.error}</div> : null}<div className="notice">Movement ini langsung diposting sebagai Dalam Perjalanan dan mengurangi stok sumber secara atomik.</div><div className="form-grid">
    <div className="field"><label className="label" htmlFor="type">Jenis movement</label><select className="select" id="type" name="type"><option value="ISSUE_TO_TECHNICIAN">Pengeluaran ke teknisi</option><option value="PLACE_AT_CUSTOMER">Penempatan ke pelanggan</option><option value="DAMAGED_OR_LOST">Barang rusak/hilang</option></select></div>
    <div className="field"><label className="label" htmlFor="sourceWarehouseId">Gudang sumber</label><select className="select" id="sourceWarehouseId" name="sourceWarehouseId">{warehouses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
    <div className="field full"><label className="label" htmlFor="itemId">Barang</label><select className="select" id="itemId" name="itemId">{items.map((item) => <option key={item.id} value={item.id}>{item.label}{item.secondary ? ` · ${item.secondary}` : ""}</option>)}</select></div>
    <div className="field"><label className="label" htmlFor="quantity">Kuantitas</label><input className="input" id="quantity" name="quantity" type="number" min="0.001" step="0.001" required /></div>
    <div className="field"><label className="label" htmlFor="holderName">Teknisi/pelanggan/pemegang</label><input className="input" id="holderName" name="holderName" required /></div>
    <div className="field full"><label className="label" htmlFor="notes">Catatan</label><textarea className="textarea" id="notes" name="notes" /></div>
  </div><div className="form-actions"><Link className="secondary-button" href="/inventory/movement-barang">Batal</Link><button className="primary-button" disabled={pending}>{pending ? "Memproses..." : "Post Movement"}</button></div></form>;
}
