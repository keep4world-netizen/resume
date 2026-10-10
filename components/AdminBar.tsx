import Link from "next/link";

export default function AdminBar() {
  return (
    <div className="abar noprint">
      <Link href="/admin" className="abtitle">
        مدیریت رزومه‌ها
      </Link>
      <form action="/api/admin/logout" method="post">
        <button className="btn">خروج</button>
      </form>
    </div>
  );
}
