import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { STATUS } from "@/lib/status";
import { buildWhere, fa } from "@/lib/query";
import { steps } from "@/lib/formConfig";
import { fmt, tableText } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const items = await prisma.application.findMany({
    where: buildWhere(sp.get("q") || "", sp.get("status") || ""),
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const cols: { header: string; key: string; width: number }[] = [
    { header: "کد پیگیری", key: "tracking", width: 16 },
    { header: "تاریخ ثبت", key: "date", width: 14 },
    { header: "وضعیت", key: "status", width: 14 },
    { header: "یادداشت", key: "note", width: 30 },
  ];
  for (const s of steps) {
    for (const f of s.fields || []) if (f.type !== "photo") cols.push({ header: f.label, key: f.name, width: 20 });
    for (const t of s.tables || []) cols.push({ header: t.title, key: t.name, width: 45 });
    if (s.list) cols.push({ header: s.list.title, key: s.list.name, width: 30 });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("رزومه‌ها", { views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }] });
  ws.columns = cols;
  ws.getRow(1).font = { bold: true };

  for (const a of items) {
    const d: any = a.data || {};
    const row: Record<string, string> = {
      tracking: a.trackingCode,
      date: fa(a.createdAt),
      status: STATUS[a.status] || a.status,
      note: a.note || "",
    };
    for (const s of steps) {
      for (const f of s.fields || []) if (f.type !== "photo") row[f.name] = fmt(d[f.name]);
      for (const t of s.tables || []) row[t.name] = tableText(d[t.name], t);
      if (s.list) row[s.list.name] = (d[s.list.name] || []).filter(Boolean).join("، ");
    }
    // کد ملی و موبایل به صورت متن بمانند تا صفر اول حذف نشود
    ws.addRow(row).alignment = { vertical: "top", wrapText: true };
  }

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="resumes.xlsx"',
    },
  });
}
