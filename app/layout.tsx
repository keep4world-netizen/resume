import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const font = Vazirmatn({ subsets: ["arabic", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: "فرم ثبت نام متقاضی کار",
  description: "ثبت رزومه و درخواست استخدام",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={font.className}>{children}</body>
    </html>
  );
}
