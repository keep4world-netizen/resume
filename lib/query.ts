import { toEnDigits } from "@/lib/utils";
import { STATUS } from "@/lib/status";

export function buildWhere(q?: string, status?: string) {
  const where: any = {};
  if (status && STATUS[status]) where.status = status === "REVIEW" ? { in: ["REVIEW", "NEW"] } : status;
  const t = (q || "").trim();
  if (t) {
    const d = toEnDigits(t);
    where.OR = [
      { firstName: { contains: t, mode: "insensitive" } },
      { lastName: { contains: t, mode: "insensitive" } },
      { nationalCode: { contains: d } },
      { phone: { contains: d } },
      { trackingCode: { contains: t, mode: "insensitive" } },
    ];
  }
  return where;
}

export function fa(date: Date | string): string {
  return new Date(date).toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
