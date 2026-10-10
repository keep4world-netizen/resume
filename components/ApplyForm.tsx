"use client";

import { useEffect, useState } from "react";
import { steps, Field } from "@/lib/formConfig";
import { toEnDigits, validMobile, validNationalCode } from "@/lib/utils";

const KEY = "resume-draft-v1";
const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const YEARS = Array.from({ length: 86 }, (_, i) => String(1405 - i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function JDate({ value, onChange }: { value?: string; onChange: (s: string) => void }) {
  const [y = "", m = "", d = ""] = (value || "").split("/");
  const upd = (a: string, b: string, c: string) => onChange(a || b || c ? `${a}/${b}/${c}` : "");
  return (
    <div className="jdate">
      <select value={d} onChange={(e) => upd(y, m, e.target.value)} aria-label="روز">
        <option value="">روز</option>
        {DAYS.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <select value={m} onChange={(e) => upd(y, e.target.value, d)} aria-label="ماه">
        <option value="">ماه</option>
        {MONTHS.map((x, i) => (
          <option key={x} value={String(i + 1)}>
            {x}
          </option>
        ))}
      </select>
      <select value={y} onChange={(e) => upd(e.target.value, m, d)} aria-label="سال">
        <option value="">سال</option>
        {YEARS.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </div>
  );
}

export default function ApplyForm() {
  const [v, setV] = useState<any>({});
  const [i, setI] = useState(0);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);
  const reviewIndex = steps.length;

  useEffect(() => {
    try {
      const d = localStorage.getItem(KEY);
      if (d) {
        const p = JSON.parse(d);
        setV(p.v || {});
        setI(Math.min(p.i || 0, reviewIndex));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v, i }));
    } catch {}
  }, [v, i]);

  const set = (name: string, val: any) => setV((p: any) => ({ ...p, [name]: val }));

  function validate(index: number): boolean {
    const s = steps[index];
    const e: Record<string, string> = {};
    for (const f of s?.fields || []) {
      if (f.showIf && !f.showIf(v)) continue;
      const val = String(v[f.name] ?? "").trim();
      if (f.required && !val) e[f.name] = "این فیلد الزامی است.";
    }
    if (index === 0) {
      const nc = toEnDigits(String(v.nationalCode || ""));
      const ph = toEnDigits(String(v.phone || ""));
      if (nc && !validNationalCode(nc)) e.nationalCode = "کد ملی معتبر نیست.";
      if (ph && !validMobile(ph)) e.phone = "شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.";
    }
    if (v.email && !/^\S+@\S+\.\S+$/.test(String(v.email))) e.email = "ایمیل معتبر نیست.";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  function go(n: number) {
    setI(n);
    setMsg("");
    window.scrollTo({ top: 0 });
  }

  async function uploadPhoto(file: File) {
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (r.ok) set("photoUrl", j.url);
    else setMsg(j.error || "آپلود عکس انجام نشد.");
  }

  async function submit() {
    for (let k = 0; k < steps.length; k++) {
      if (!validate(k)) {
        go(k);
        return;
      }
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: v }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setCode(j.trackingCode);
        try {
          localStorage.removeItem(KEY);
        } catch {}
      } else setMsg(j.error || "ارسال انجام نشد. دوباره تلاش کنید.");
    } catch {
      setMsg("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
    }
    setBusy(false);
  }

  function renderField(f: Field, value: any, onChange: (x: any) => void, error?: string, compact = false) {
    const cls = f.ltr ? "ltr" : "";
    let input: React.ReactNode;
    if (f.type === "textarea") {
      input = <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    } else if (f.type === "radio") {
      input = (
        <div className="choices">
          {f.options!.map((o) => (
            <label key={o} className="choice">
              <input type="radio" checked={value === o} onChange={() => onChange(o)} /> {o}
            </label>
          ))}
        </div>
      );
    } else if (f.type === "checks") {
      const arr: string[] = value || [];
      input = (
        <div className="choices">
          {f.options!.map((o) => (
            <label key={o} className="choice">
              <input
                type="checkbox"
                checked={arr.includes(o)}
                onChange={(e) => onChange(e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))}
              />{" "}
              {o}
            </label>
          ))}
        </div>
      );
    } else if (f.type === "select") {
      input = (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">انتخاب کنید</option>
          {f.options!.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    } else if (f.type === "jdate") {
      input = <JDate value={value} onChange={onChange} />;
    } else if (f.type === "photo") {
      input = (
        <div className="photo">
          {value && <img src={value} alt="عکس پرسنلی" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
        </div>
      );
    } else {
      input = (
        <input
          className={cls}
          type="text"
          inputMode={f.type === "number" || f.ltr ? "numeric" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    if (compact) return input;
    return (
      <div className="field" key={f.name}>
        <label className="lbl">
          {f.label}
          {f.required && <span className="req"> *</span>}
        </label>
        {input}
        {error && <div className="err">{error}</div>}
      </div>
    );
  }

  if (code) {
    return (
      <div className="card center">
        <h2>فرم شما ثبت شد</h2>
        <p>کد پیگیری خود را نگه دارید:</p>
        <div className="code">{code}</div>
        <p className="muted">با همین کد می‌توانید در آینده از وضعیت درخواست خود سؤال کنید.</p>
      </div>
    );
  }

  const progress = Math.round((i / reviewIndex) * 100);
  const s = steps[i];

  return (
    <div>
      <header className="head">
        <h1>فرم ثبت نام متقاضی کار</h1>
        <div className="muted">
          {i < reviewIndex ? `مرحله ${i + 1} از ${steps.length}` : "مرور و ارسال"}
        </div>
        <div className="bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </header>

      {s ? (
        <section className="card">
          <h2>{s.title}</h2>
          <div className="grid">
            {s.fields?.map((f) => (!f.showIf || f.showIf(v) ? renderField(f, v[f.name], (x) => set(f.name, x), err[f.name]) : null))}
          </div>

          {s.tables?.map((t) => {
            const rows: any[] = v[t.name] || [];
            return (
              <div key={t.name} className="tbl">
                <h3>{t.title}</h3>
                {Array.from({ length: t.rows }).map((_, r) => (
                  <fieldset key={r} className="rowbox">
                    <legend>ردیف {r + 1}</legend>
                    <div className="grid">
                      {t.cols.map((c) => (
                        <div className="field" key={c.name}>
                          <label className="lbl">{c.label}</label>
                          {renderField(
                            c,
                            rows[r]?.[c.name],
                            (x) => {
                              const next = Array.from({ length: t.rows }, (_, k) => ({ ...(rows[k] || {}) }));
                              next[r][c.name] = x;
                              set(t.name, next);
                            },
                            undefined,
                            true
                          )}
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            );
          })}

          {s.list && (
            <div className="tbl">
              <h3>{s.list.title}</h3>
              <div className="grid">
                {Array.from({ length: s.list.count }).map((_, k) => (
                  <div className="field" key={k}>
                    <label className="lbl">اولویت {k + 1}</label>
                    <input
                      type="text"
                      value={(v[s.list!.name] || [])[k] || ""}
                      onChange={(e) => {
                        const arr = Array.from({ length: s.list!.count }, (_, q) => (v[s.list!.name] || [])[q] || "");
                        arr[k] = e.target.value;
                        set(s.list!.name, arr);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="card">
          <h2>مرور و ارسال</h2>
          <dl className="sum">
            <dt>نام</dt>
            <dd>{v.firstName} {v.lastName}</dd>
            <dt>کد ملی</dt>
            <dd className="ltr">{toEnDigits(String(v.nationalCode || ""))}</dd>
            <dt>موبایل</dt>
            <dd className="ltr">{toEnDigits(String(v.phone || ""))}</dd>
          </dl>
          <p className="muted">با دکمه «قبلی» می‌توانید هر مرحله را دوباره ببینید و اصلاح کنید.</p>
          <label className="choice">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> صحت اطلاعات واردشده را تأیید می‌کنم.
          </label>
        </section>
      )}

      {msg && <div className="err box">{msg}</div>}

      <div className="nav">
        {i > 0 && (
          <button className="btn" onClick={() => go(i - 1)} disabled={busy}>
            قبلی
          </button>
        )}
        {i < reviewIndex - 1 && (
          <button className="btn primary" onClick={() => validate(i) && go(i + 1)}>
            بعدی
          </button>
        )}
        {i === reviewIndex - 1 && (
          <button className="btn primary" onClick={() => validate(i) && go(reviewIndex)}>
            مرور نهایی
          </button>
        )}
        {i === reviewIndex && (
          <button className="btn primary" onClick={submit} disabled={busy || !agree}>
            {busy ? "در حال ارسال..." : "ارسال فرم"}
          </button>
        )}
      </div>
    </div>
  );
}
