import { Field, Table } from "@/lib/formConfig";

export function fmt(v: any): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join("، ");
  return String(v).trim();
}

export function rowsOf(rows: any[] | undefined, cols: Field[]) {
  return (rows || []).filter((r) => r && cols.some((c) => fmt(r[c.name])));
}

export function tableText(rows: any[] | undefined, t: Table): string {
  return rowsOf(rows, t.cols)
    .map((r) => t.cols.map((c) => fmt(r[c.name])).filter(Boolean).join(" | "))
    .join("\n");
}
