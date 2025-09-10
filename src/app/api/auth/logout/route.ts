import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    // tenta invalidar no backend se houver rota
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).catch(() => {});
    }
  } catch {}
  const res = NextResponse.json({ ok: true });
  res.cookies.set("authToken", "", { maxAge: 0, path: "/" });
  return res;
}
