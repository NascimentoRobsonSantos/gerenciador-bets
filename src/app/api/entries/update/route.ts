export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const res = await fetch("https://webhook.storeprodigital.site/webhook/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch("https://webhook.storeprodigital.site/webhook/entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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
