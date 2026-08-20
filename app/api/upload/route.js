import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "../../../lib/auth";

export const runtime = "nodejs";
const MAX_SIZE = 4 * 1024 * 1024;
const SAFE_EXTENSIONS = new Set(["jpg","jpeg","png","webp","gif","pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","zip","rar","7z"]);
const IMAGE_EXTENSIONS = new Set(["jpg","jpeg","png","webp","gif"]);
const safeName = (name) => String(name || "archivo").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "No se recibió archivo." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ ok: false, error: "Cada archivo debe pesar menos de 4 MB en esta demo de Vercel." }, { status: 400 });

    const extension = String(file.name).split(".").pop()?.toLowerCase() || "";
    if (!SAFE_EXTENSIONS.has(extension)) return NextResponse.json({ ok: false, error: `La extensión .${extension || "?"} no está permitida.` }, { status: 400 });
    if ((kind === "image" || kind === "director") && !IMAGE_EXTENSIONS.has(extension)) return NextResponse.json({ ok: false, error: "Para fotografías usa JPG, PNG, WEBP o GIF." }, { status: 400 });

    const folder = kind === "director" ? "directors" : kind === "image" ? "images" : "documents";
    const blob = await put(`sindicato/${folder}/${Date.now()}-${safeName(file.name)}`, file, { access: "public", addRandomSuffix: true });
    return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname, fileName: file.name, mimeType: file.type || "application/octet-stream", extension });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
