import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p === "/admin/login" || p === "/api/admin/login") return NextResponse.next();
  if (await verifyToken(req.cookies.get("admin")?.value)) return NextResponse.next();
  if (p.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
