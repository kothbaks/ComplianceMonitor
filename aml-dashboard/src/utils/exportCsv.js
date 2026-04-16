export function exportToCsv(data, columns, filename) {
  const header = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
