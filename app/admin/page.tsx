import Link from "next/link";
import { prisma } from "@/lib/db";
import { STATUS } from "@/lib/status";
import { buildWhere, fa } from "@/lib/query";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";
const PER = 20;

export default async function Admin({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const q = searchParams.q || "";
  const status = searchParams.status || "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where = buildWhere(q, status);

  const [total, items] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER,
      take: PER,
      select: { id: true, trackingCode: true, firstName: true, lastName: true, nationalCode: true, phone: true, status: true, createdAt: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER));
  const qs = (p: number) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (status) s.set("status", status);
    if (p > 1) s.set("page", String(p));
    const r = s.toString();
    return r ? `?${r}` : "";
  };
  const exportQs = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString();

  return (
    <main className="wrap" style={{ maxWidth: 1100 }}>
      <AdminBar />
      <form className="filters" method="get">
        <input type="text" name="q" defaultValue={q} placeholder="جستجو: نام، کد ملی، موبایل یا کد پیگیری" />
        <select name="status" defaultValue={status}>
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <button className="btn primary">جستجو</button>
        <a className="btn" href={`/api/admin/export${exportQs ? "?" + exportQs : ""}`}>
          خروجی Excel
        </a>
      </form>

      <p className="muted">{total} رزومه</p>
      <div className="scroll">
        <table className="list">
          <thead>
            <tr>
              <th>کد پیگیری</th>
              <th>نام و نام خانوادگی</th>
              <th>کد ملی</th>
              <th>موبایل</th>
              <th>تاریخ ثبت</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td className="ltr">
                  <Link href={`/admin/${a.id}`}>{a.trackingCode}</Link>
                </td>
                <td>
                  <Link href={`/admin/${a.id}`}>
                    {a.firstName} {a.lastName}
                  </Link>
                </td>
                <td className="ltr">{a.nationalCode}</td>
                <td className="ltr">{a.phone}</td>
                <td>{fa(a.createdAt)}</td>
                <td>
                  <span className={`badge ${a.status}`}>{STATUS[a.status] || a.status}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  رزومه‌ای پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="nav">
          {page > 1 && (
            <Link className="btn" href={`/admin${qs(page - 1)}`}>
              قبلی
            </Link>
          )}
          <span className="muted" style={{ alignSelf: "center" }}>
            صفحه {page} از {pages}
          </span>
          {page < pages && (
            <Link className="btn" href={`/admin${qs(page + 1)}`}>
              بعدی
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
