import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toEnDigits } from "@/lib/utils";
import { STATUS, APPLICANT_TEXT } from "@/lib/status";
import { fa } from "@/lib/query";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const nc = toEnDigits(String(b?.nationalCode || "")).trim();
  const code = toEnDigits(String(b?.code || "")).trim().toUpperCase();
  if (!/^\d{10}$/.test(nc) || !code) {
    return NextResponse.json({ error: "کد ملی (ده رقم) و کد پیگیری را وارد کنید." }, { status: 400 });
  }
  const a = await prisma.application.findFirst({
    where: { nationalCode: nc, trackingCode: code },
    select: { status: true, createdAt: true, firstName: true },
  });
  if (!a) {
    return NextResponse.json({ error: "کد ملی یا کد پیگیری درست نیست." }, { status: 404 });
  }
  return NextResponse.json({
    firstName: a.firstName,
    status: STATUS[a.status] || a.status,
    text: APPLICANT_TEXT[a.status] || "",
    date: fa(a.createdAt),
  });
}
