import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { toEnDigits, validMobile, validNationalCode } from "@/lib/utils";

async function newCode(): Promise<string> {
  // ابتدا کد ۴ رقمی؛ اگر پر شده بود ۵ رقمی
  for (const [min, span] of [[1000, 9000], [10000, 90000]]) {
    for (let i = 0; i < 30; i++) {
      const c = String(min + randomInt(span));
      const used = await prisma.application.findUnique({ where: { trackingCode: c }, select: { id: true } });
      if (!used) return c;
    }
  }
  return String(100000 + randomInt(900000));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const all = body?.data;
  if (!all || typeof all !== "object") {
    return NextResponse.json({ error: "اطلاعات ارسالی نامعتبر است." }, { status: 400 });
  }
  const { photo, photoUrl, ...data } = all as any;
  if (JSON.stringify(data).length > 200_000) {
    return NextResponse.json({ error: "حجم اطلاعات ارسالی زیاد است." }, { status: 400 });
  }

  let photoData: string | null = null;
  if (photo) {
    if (typeof photo !== "string" || photo.length > 500_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo)) {
      return NextResponse.json({ error: "عکس نامعتبر یا حجیم است. عکس دیگری انتخاب کنید." }, { status: 400 });
    }
    photoData = photo;
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

  let trackingCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    trackingCode = await newCode();
    try {
      await prisma.application.create({
        data: {
          trackingCode,
          firstName,
          lastName,
          nationalCode,
          phone,
          photo: photoData,
          data: { ...data, nationalCode, phone },
        },
      });
      break;
    } catch (e: any) {
      if (e?.code !== "P2002" || attempt === 4) throw e;
    }
  }

  return NextResponse.json({ trackingCode });
}
