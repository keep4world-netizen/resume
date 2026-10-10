# فرم ثبت نام متقاضی کار

Next.js + Prisma (Postgres) + Vercel Blob. رابط فارسی، راست‌به‌چپ، تاریخ شمسی.

## اجرای محلی
1. `npm install`
2. فایل `.env.example` را به `.env` کپی کنید و مقادیر را پر کنید
3. `npx prisma db push` و سپس `npm run dev`

## متغیرهای محیطی
- `DATABASE_URL`: رشته اتصال Postgres
- `BLOB_READ_WRITE_TOKEN`: توکن Vercel Blob (برای عکس پرسنلی)
