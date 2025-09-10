import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (res.status === 401) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
  } catch (e) {
    return NextResponse.json({ error: "Falha ao buscar usuário" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    });
    if (res.status === 401) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
  } catch (e) {
    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 });
  }
}

