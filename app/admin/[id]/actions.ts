"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { STATUS } from "@/lib/status";

export async function updateApp(id: string, formData: FormData) {
  if (!(await verifyToken(cookies().get("admin")?.value))) throw new Error("unauthorized");
  const status = String(formData.get("status") || "");
  if (!STATUS[status]) return;
  const note = String(formData.get("note") || "").slice(0, 2000);
  await prisma.application.update({ where: { id }, data: { status, note } });
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");
}
