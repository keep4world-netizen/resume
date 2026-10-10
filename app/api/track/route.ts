import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toEnDigits } from "@/lib/utils";
import { STATUS, APPLICANT_TEXT } from "@/lib/status";
import { fa } from "@/lib/query";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const code = toEnDigits(String(b?.code || "")).trim().toUpperCase();
  const nc = toEnDigits(String(b?.nationalCode || "")).trim();
  if (!code || !nc) {
    return NextResponse.json({ error: "کد پیگیری و کد ملی را وارد کنید." }, { status: 400 });
  }
  const a = await prisma.application.findUnique({
    where: { trackingCode: code },
    select: { nationalCode: true, status: true, createdAt: true, firstName: true },
  });
  if (!a || a.nationalCode !== nc) {
    return NextResponse.json({ error: "اطلاعات واردشده با هیچ درخواستی مطابقت ندارد." }, { status: 404 });
  }
  return NextResponse.json({
    firstName: a.firstName,
    status: STATUS[a.status] || a.status,
    text: APPLICANT_TEXT[a.status] || "",
    date: fa(a.createdAt),
  });
}
