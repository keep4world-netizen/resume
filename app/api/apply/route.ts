import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { toEnDigits, validMobile, validNationalCode } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const data = body?.data;
  if (!data || typeof data !== "object" || JSON.stringify(data).length > 200_000) {
    return NextResponse.json({ error: "اطلاعات ارسالی نامعتبر است." }, { status: 400 });
  }

  const firstName = String(data.firstName || "").trim();
  const lastName = String(data.lastName || "").trim();
  const nationalCode = toEnDigits(String(data.nationalCode || "")).trim();
  const phone = toEnDigits(String(data.phone || "")).trim();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "نام و نام خانوادگی الزامی است." }, { status: 400 });
  }
  if (!validNationalCode(nationalCode)) {
    return NextResponse.json({ error: "کد ملی معتبر نیست." }, { status: 400 });
  }
  if (!validMobile(phone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست (مثال: 09121234567)." }, { status: 400 });
  }

  const trackingCode = "RZ-" + randomBytes(4).toString("hex").toUpperCase();
  await prisma.application.create({
    data: {
      trackingCode,
      firstName,
      lastName,
      nationalCode,
      phone,
      photoUrl: data.photoUrl ? String(data.photoUrl) : null,
      data: { ...data, nationalCode, phone },
    },
  });

  return NextResponse.json({ trackingCode });
}
