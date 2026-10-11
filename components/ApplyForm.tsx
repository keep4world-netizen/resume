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
  const [ph, setPh] = useState<{ stage: string; pct: number; msg: string }>({ stage: "idle", pct: 0, msg: "" });
  const [pct, setPct] = useState(0);
  const reviewIndex = steps.length;

  useEffect(() => {
    try {
      const d = localStorage.getItem(KEY);
      if (d) {
        const p = JSON.parse(d);
        setV(p.v || {});
        if (p.v?.photo) setPh({ stage: "done", pct: 100, msg: "عکس آماده است." });
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

  function readFile(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = () => rej(new Error("read"));
      r.readAsDataURL(file);
    });
  }

  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("img"));
      im.src = url;
    });
  }

  async function pickPhoto(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPh({ stage: "error", pct: 0, msg: "فقط عکس JPG، PNG یا WebP مجاز است." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPh({ stage: "error", pct: 0, msg: "حجم عکس بیشتر از ۱۰ مگابایت است." });
      return;
    }
    try {
      setPh({ stage: "work", pct: 15, msg: "در حال خواندن عکس..." });
      const url = await readFile(file);
      setPh({ stage: "work", pct: 50, msg: "در حال بهینه‌سازی عکس..." });
      const img = await loadImage(url);
      const k = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      setPh({ stage: "work", pct: 85, msg: "در حال آماده‌سازی..." });
      let q = 0.85;
      let out = c.toDataURL("image/jpeg", q);
      while (out.length > 350_000 && q > 0.4) {
        q -= 0.1;
        out = c.toDataURL("image/jpeg", q);
      }
      set("photo", out);
      setPh({ stage: "done", pct: 100, msg: "عکس با موفقیت آماده شد." });
    } catch {
      setPh({ stage: "error", pct: 0, msg: "عکس خوانده نشد. عکس دیگری انتخاب کنید." });
    }
  }

  function post(body: any, onP: (n: number) => void): Promise<{ ok: boolean; json: any }> {
    return new Promise((res) => {
      const x = new XMLHttpRequest();
      x.open("POST", "/api/apply");
      x.setRequestHeader("Content-Type", "application/json");
      x.upload.onprogress = (e) => {
        if (e.lengthComputable) onP(Math.round((e.loaded / e.total) * 100));
      };
      x.onload = () => {
        let j: any = {};
        try {
          j = JSON.parse(x.responseText);
        } catch {}
        res({ ok: x.status >= 200 && x.status < 300, json: j });
      };
      x.onerror = () => res({ ok: false, json: { error: "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید." } });
      x.send(JSON.stringify(body));
    });
  }

  function cleaned() {
    const out: any = { ...v };
    for (const st of steps) for (const f of st.fields || []) if (f.showIf && !f.showIf(v)) delete out[f.name];
    return out;
  }

  async function submit() {
    for (let k = 0; k < steps.length; k++) {
      if (!validate(k)) {
        go(k);
        return;
      }
    }
    setBusy(true);
    setPct(0);
    setMsg("");
    const r = await post({ data: cleaned() }, setPct);
    if (r.ok) {
      setCode(r.json.trackingCode || "ok");
      try {
        localStorage.removeItem(KEY);
      } catch {}
    } else setMsg(r.json.error || "ارسال انجام نشد. دوباره تلاش کنید.");
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
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && pickPhoto(e.target.files[0])}
            />
            {ph.stage === "work" && (
              <>
                <div className="bar" style={{ marginTop: 8 }}>
                  <div style={{ width: `${ph.pct}%` }} />
                </div>
                <div className="pstat">
                  {ph.msg} {ph.pct}٪
                </div>
              </>
            )}
            {ph.stage === "done" && <div className="pstat ok">✓ {ph.msg}</div>}
            {ph.stage === "error" && <div className="pstat bad">{ph.msg}</div>}
            {value && ph.stage !== "work" && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: 8, padding: "4px 12px" }}
                onClick={() => {
                  onChange("");
                  setPh({ stage: "idle", pct: 0, msg: "" });
                }}
              >
                حذف عکس
              </button>
            )}
          </div>
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
        <p>کد پیگیری شما همان کد ملی شماست:</p>
        <div className="code">{toEnDigits(String(v.nationalCode || ""))}</div>
        <p className="muted">
          برای دیدن وضعیت درخواست از صفحه <a href="/track">پیگیری درخواست</a> استفاده کنید.
        </p>
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
      {busy && (
        <div className="bar" style={{ marginTop: 12 }}>
          <div style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="nav">
        {i > 0 && (
          <button className="btn" onClick={() => go(i - 1)} disabled={busy}>
            قبلی
          </button>
        )}
        {i < reviewIndex - 1 && (
          <button className="btn primary" onClick={() => validate(i) && go(i + 1)} disabled={ph.stage === "work"}>
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
            {busy ? (pct < 100 ? `در حال ارسال... ${pct}٪` : "در حال ثبت...") : "ارسال فرم"}
          </button>
        )}
      </div>
    </div>
  );
}
