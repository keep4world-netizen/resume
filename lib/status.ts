export const STATUS: Record<string, string> = {
  REVIEW: "در حال بررسی",
  INTERVIEW: "مصاحبه",
  REJECTED: "رد شده",
  HIRED: "استخدام",
};

// متنی که متقاضی در صفحه پیگیری می‌بیند (هر طور خواستید تغییر دهید)
export const APPLICANT_TEXT: Record<string, string> = {
  REVIEW: "درخواست شما در حال بررسی است.",
  INTERVIEW: "درخواست شما پذیرفته شده و برای مصاحبه با شما تماس گرفته می‌شود.",
  REJECTED: "درخواست شما در این مرحله پذیرفته نشده است.",
  HIRED: "تبریک! درخواست شما پذیرفته شد و همکاری شما تأیید شده است.",
};

// رکوردهای قدیمی با وضعیت «جدید» به «در حال بررسی» تبدیل می‌شوند
export const normStatus = (s: string) => (s === "NEW" ? "REVIEW" : s);
