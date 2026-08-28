const toneFor = (value: string) => {
  const normalized = value.toLowerCase();
  if (["aktif", "lunas", "paid", "posted", "selesai", "received", "disetujui"].some((word) => normalized.includes(word))) return "success";
  if (["jatuh tempo", "overdue", "sebagian", "menunggu", "transit", "warning"].some((word) => normalized.includes(word))) return "warning";
  if (["batal", "cancel", "reverse", "nonaktif", "rusak", "hilang"].some((word) => normalized.includes(word))) return "danger";
  return "";
};

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<string>> }) {
  if (!rows.length) return <div className="empty"><strong>Belum ada data</strong><br /><span>Ubah filter atau tambahkan data baru jika fitur sudah tersedia.</span></div>;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cellIndex === row.length - 1 && /status/i.test(columns[cellIndex] ?? "") ? <span className={`badge ${toneFor(cell)}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
