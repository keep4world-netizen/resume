export function toEnDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export function validNationalCode(c: string): boolean {
  if (!/^\d{10}$/.test(c) || /^(\d)\1{9}$/.test(c)) return false;
  const sum =
    c
      .split("")
      .slice(0, 9)
      .reduce((a, d, i) => a + Number(d) * (10 - i), 0) % 11;
  const check = Number(c[9]);
  return sum < 2 ? check === sum : check === 11 - sum;
}

export function validMobile(p: string): boolean {
  return /^09\d{9}$/.test(p);
}
