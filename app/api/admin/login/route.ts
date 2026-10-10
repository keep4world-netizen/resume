import { NextResponse } from "next/server";
import { makeToken } from "@/lib/auth";

export async function POST(req: Request) {
  const f = await req.formData();
  const u = String(f.get("user") || "");
  const p = String(f.get("pass") || "");
  const ok =
    !!process.env.ADMIN_USER &&
    !!process.env.ADMIN_PASSWORD &&
    !!process.env.ADMIN_SECRET &&
    u === process.env.ADMIN_USER &&
    p === process.env.ADMIN_PASSWORD;
  const res = NextResponse.redirect(new URL(ok ? "/admin" : "/admin/login?e=1", req.url), 303);
  if (ok) {
    res.cookies.set("admin", await makeToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
  }
  return res;
}
