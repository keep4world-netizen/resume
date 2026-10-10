import Link from "next/link";

export default function Home() {
  return (
    <main className="wrap narrow">
      <h1 className="big">فرم ثبت نام متقاضی کار</h1>
      <p className="lead">
        اطلاعات خود را در چند مرحله کوتاه وارد کنید. اگر وسط کار صفحه را ببندید، اطلاعاتتان در همین
        مرورگر نگه داشته می‌شود و می‌توانید ادامه دهید. پس از ارسال، یک کد پیگیری دریافت می‌کنید.
      </p>
      <Link href="/apply" className="btn primary">
        شروع تکمیل فرم
      </Link>{" "}
      <Link href="/track" className="btn">
        پیگیری درخواست
      </Link>
    </main>
  );
}
