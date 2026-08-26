function escapeCsvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
export function toCsv<T>(
  rows: T[],
  columns: {
    key: keyof T;
    header: string;
  }[]
): string {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) =>
        escapeCsvField(row[c.key] as string | number | null | undefined)
      )
      .join(',')
  );
  return [headerLine, ...lines].join('\r\n');
}
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
