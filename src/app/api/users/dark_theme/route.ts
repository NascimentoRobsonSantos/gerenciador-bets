import { NextResponse } from "next/server";

const WEBHOOK_URL = "https://webhook.storeprodigital.site/webhook/bet/users/dark_theme";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao enviar dark_theme' }, { status: 500 });
  }
}

