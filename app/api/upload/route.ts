import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشد." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type) || file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "فقط عکس JPG، PNG یا WebP تا ۲ مگابایت مجاز است." }, { status: 400 });
  }
  const ext = file.type.split("/")[1];
  const blob = await put(`photos/photo.${ext}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
