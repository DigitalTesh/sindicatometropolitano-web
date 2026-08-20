import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { loadState, saveState, publicContent, passwordMatches, changePassword, deleteAsset } from "../../../lib/state";

export const dynamic = "force-dynamic";
const fail = (message, status = 400) => NextResponse.json({ ok: false, error: message }, { status });

async function deleteFiles(items = []) {
  for (const item of items) if (item?.url) await deleteAsset(item.url);
}

export async function GET() {
  if (!(await isAdmin())) return fail("No autorizado.", 401);
  const state = await loadState();
  return NextResponse.json({ ok: true, content: publicContent(state) }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request) {
  if (!(await isAdmin())) return fail("No autorizado.", 401);
  try {
    const body = await request.json();
    const state = await loadState();
    const content = state.content;
    const action = body.action;

    if (action === "add-news") {
      if (!body.title?.trim() || !body.excerpt?.trim()) return fail("Título y descripción son obligatorios.");
      content.news.unshift({
        id: Date.now(), title: body.title.trim(), category: body.category || "Comunicado",
        date: new Date().toLocaleDateString("es-CL"), excerpt: body.excerpt.trim(),
        images: Array.isArray(body.images) ? body.images.slice(0, 10) : [],
        files: Array.isArray(body.files) ? body.files.slice(0, 10) : [],
        links: Array.isArray(body.links) ? body.links.slice(0, 10) : [],
      });
    } else if (action === "add-gallery") {
      if (!body.title?.trim() || !Array.isArray(body.images) || !body.images.length) return fail("Título y al menos una fotografía son obligatorios.");
      content.gallery.unshift({ id: Date.now(), title: body.title.trim(), description: String(body.description || "").trim(), images: body.images.slice(0, 10) });
    } else if (action === "add-documents") {
      if (!Array.isArray(body.documents) || !body.documents.length) return fail("Selecciona al menos un archivo.");
      const now = Date.now();
      body.documents.slice(0, 10).reverse().forEach((doc, index) => content.documents.unshift({
        id: now + index,
        title: String(doc.title || doc.fileName || "Documento").trim(),
        type: String(doc.type || "Documento"), url: doc.url || "", fileName: doc.fileName || "archivo", mimeType: doc.mimeType || "application/octet-stream",
      }));
    } else if (action === "delete-news") {
      const item = content.news.find((x) => x.id === body.id);
      await deleteFiles(item?.images); await deleteFiles(item?.files);
      content.news = content.news.filter((x) => x.id !== body.id);
    } else if (action === "delete-gallery") {
      const item = content.gallery.find((x) => x.id === body.id);
      await deleteFiles(item?.images);
      content.gallery = content.gallery.filter((x) => x.id !== body.id);
    } else if (action === "delete-document") {
      const item = content.documents.find((x) => x.id === body.id);
      if (item?.url) await deleteAsset(item.url);
      content.documents = content.documents.filter((x) => x.id !== body.id);
    } else if (action === "save-directors") {
      if (!Array.isArray(body.directors) || !body.directors.length) return fail("Debe existir al menos un director.");
      content.directors = body.directors.slice(0, 12).map((d, index) => ({
        id: d.id || Date.now() + index, name: String(d.name || "").trim(), role: String(d.role || "").trim(), area: String(d.area || "").trim(),
        phone: String(d.phone || "").replace(/\D/g, ""), photoUrl: d.photoUrl || "",
      }));
    } else if (action === "delete-director") {
      const item = content.directors.find((x) => x.id === body.id);
      if (item?.photoUrl) await deleteAsset(item.photoUrl);
      content.directors = content.directors.filter((x) => x.id !== body.id);
      if (!content.directors.length) return fail("Debe quedar al menos un director.");
    } else if (action === "change-password") {
      if (!passwordMatches(state, String(body.currentPassword || ""))) return fail("La contraseña actual no coincide.", 401);
      const next = String(body.newPassword || "");
      if (next.length < 6) return fail("La nueva contraseña debe tener al menos 6 caracteres.");
      await changePassword(state, next);
      return NextResponse.json({ ok: true, content: publicContent(state) });
    } else return fail("Acción no reconocida.");

    await saveState(state);
    return NextResponse.json({ ok: true, content: publicContent(state) });
  } catch (error) {
    return fail(error.message, 500);
  }
}
