export const metadata = { title: "ورود مدیر" };

export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <main className="wrap narrow" style={{ maxWidth: 420 }}>
      <h1>ورود مدیر</h1>
      <form action="/api/admin/login" method="post" className="card" style={{ marginTop: 16 }}>
        <div className="field">
          <label className="lbl">نام کاربری</label>
          <input type="text" name="user" className="ltr" autoComplete="username" required />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="lbl">رمز عبور</label>
          <input type="password" name="pass" className="ltr" autoComplete="current-password" required />
        </div>
        {searchParams.e && <div className="err box">نام کاربری یا رمز عبور درست نیست.</div>}
        <button className="btn primary" style={{ marginTop: 16 }}>
          ورود
        </button>
      </form>
    </main>
  );
}
