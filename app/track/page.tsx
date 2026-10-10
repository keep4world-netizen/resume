"use client";

import { useState } from "react";
import Link from "next/link";

export default function Track() {
  const [code, setCode] = useState("");
  const [nc, setNc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<any>(null);

  async function check() {
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const r = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, nationalCode: nc }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setRes(j);
      else setErr(j.error || "پیگیری انجام نشد.");
    } catch {
      setErr("ارتباط با سرور برقرار نشد.");
    }
    setBusy(false);
  }

  return (
    <main className="wrap narrow" style={{ maxWidth: 480, paddingTop: "8vh" }}>
      <h1>پیگیری درخواست</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="field">
          <label className="lbl">کد پیگیری</label>
          <input type="text" className="ltr" placeholder="RZ-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="lbl">کد ملی</label>
          <input type="text" className="ltr" inputMode="numeric" value={nc} onChange={(e) => setNc(e.target.value)} />
        </div>
        {err && <div className="err box">{err}</div>}
        <button className="btn primary" style={{ marginTop: 16 }} onClick={check} disabled={busy}>
          {busy ? "در حال بررسی..." : "پیگیری"}
        </button>
      </div>

      {res && (
        <div className="card" style={{ marginTop: 16 }}>
          <p>{res.firstName} عزیز، وضعیت درخواست شما:</p>
          <p>
            <span className="badge" style={{ fontSize: "1rem" }}>
              {res.status}
            </span>
          </p>
          <p>{res.text}</p>
          <p className="muted">تاریخ ثبت: {res.date}</p>
        </div>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">بازگشت به صفحه اصلی</Link>
      </p>
    </main>
  );
}
