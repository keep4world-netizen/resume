import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { STATUS, normStatus } from "@/lib/status";
import { fa } from "@/lib/query";
import { steps } from "@/lib/formConfig";
import { fmt, rowsOf } from "@/lib/format";
import AdminBar from "@/components/AdminBar";
import PrintButton from "@/components/PrintButton";
import { updateApp } from "./actions";

export const dynamic = "force-dynamic";

export default async function Detail({ params }: { params: { id: string } }) {
  const a = await prisma.application.findUnique({ where: { id: params.id } });
  if (!a) notFound();
  const d: any = a.data || {};

  return (
    <main className="wrap">
      <AdminBar />
      <div className="noprint" style={{ marginBottom: 12 }}>
        <Link href="/admin">← بازگشت به لیست</Link>
      </div>

      <section className="card">
        <div className="top">
          {a.photo && <img className="pic" src={a.photo} alt="عکس پرسنلی" />}
          <div>
            <h1>
              {a.firstName} {a.lastName}
            </h1>
            <div className="muted">
              کد پیگیری: <span className="ltr">{a.trackingCode}</span> · ثبت‌شده در {fa(a.createdAt)}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className={`badge ${normStatus(a.status)}`}>{STATUS[normStatus(a.status)] || normStatus(a.status)}</span>
            </div>
          </div>
          <div style={{ marginRight: "auto" }}>
            <PrintButton />
          </div>
        </div>
      </section>

      <form action={updateApp.bind(null, a.id)} className="card noprint" style={{ marginTop: 16 }}>
        <h2>وضعیت و یادداشت داخلی</h2>
        <div className="field">
          <label className="lbl">وضعیت</label>
          <select name="status" defaultValue={normStatus(a.status)}>
            {Object.entries(STATUS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="lbl">یادداشت (فقط برای مدیر)</label>
          <textarea name="note" rows={3} defaultValue={a.note || ""} />
        </div>
        <button className="btn primary" style={{ marginTop: 12 }}>
          ذخیره
        </button>
      </form>

      {steps.map((s) => {
        const fields = (s.fields || []).filter((f) => f.type !== "photo" && fmt(d[f.name]));
        const tables = (s.tables || []).map((t) => ({ t, rows: rowsOf(d[t.name], t.cols) })).filter((x) => x.rows.length);
        const list = s.list ? (d[s.list.name] || []).filter(Boolean) : [];
        if (!fields.length && !tables.length && !list.length) return null;
        return (
          <section className="card" key={s.title} style={{ marginTop: 16 }}>
            <h2>{s.title}</h2>
            {fields.length > 0 && (
              <dl className="sum">
                {fields.map((f) => (
                  <div key={f.name} style={{ display: "contents" }}>
                    <dt>{f.label}</dt>
                    <dd>{fmt(d[f.name])}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tables.map(({ t, rows }) => (
              <div key={t.name} className="scroll">
                <h3>{t.title}</h3>
                <table className="list">
                  <thead>
                    <tr>
                      {t.cols.map((c) => (
                        <th key={c.name}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        {t.cols.map((c) => (
                          <td key={c.name}>{fmt(r[c.name])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {list.length > 0 && (
              <div>
                <h3>{s.list!.title}</h3>
                <ol>
                  {list.map((x: string, i: number) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
