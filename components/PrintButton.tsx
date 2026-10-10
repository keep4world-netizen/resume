"use client";

export default function PrintButton() {
  return (
    <button className="btn noprint" onClick={() => window.print()}>
      چاپ / ذخیره PDF
    </button>
  );
}
