import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // suporta {email, password} ou {token}
    let token = body?.token as string | undefined;
    if (!token) {
      const resp = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (!resp.ok) {
        const t = await resp.text();
        return NextResponse.json({ error: t || "Credenciais inválidas" }, { status: 401 });
      }
      const data = await resp.json();
      if (Array.isArray(data)) {
        token = (data[0]?.token as string) || undefined;
      } else {
        token = (data?.token || data?.access_token || data?.authToken) as string | undefined;
      }
    }
    if (!token) return NextResponse.json({ error: "Token não retornado" }, { status: 400 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("authToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Falha no login" }, { status: 500 });
  }
}
