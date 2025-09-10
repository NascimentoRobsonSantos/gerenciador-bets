import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const res = await fetch(`${API_BASE_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Falha ao enviar dados ao endpoint." }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const res = await fetch(`${API_BASE_URL}/entries`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "application/json";
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Falha ao excluir no endpoint." }), { status: 500 });
  }
}
