import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const name = (searchParams.get("name") || "archivo").replace(/[\r\n"]/g, "");
    if (!url) return NextResponse.json({ error: "URL requerida." }, { status: 400 });
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("blob.vercel-storage.com")) return NextResponse.json({ error: "Origen no permitido." }, { status: 400 });
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) return NextResponse.json({ error: "No fue posible descargar el archivo." }, { status: upstream.status });
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, { headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    }});
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
