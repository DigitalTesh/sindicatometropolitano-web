import { list, put, del } from "@vercel/blob";
import { DEFAULT_CONTENT } from "./default-data";
import { encryptText, decryptText, passwordHash } from "./crypto";

const PATH = "sindicato/system/state.json";

async function findStateBlob() {
  const result = await list({ prefix: PATH, limit: 10 });
  return result.blobs.find((blob) => blob.pathname === PATH) || null;
}

function normalizeContent(content = {}) {
  const base = structuredClone(DEFAULT_CONTENT);
  const directors = Array.isArray(content.directors) ? content.directors : base.directors;
  const news = Array.isArray(content.news) ? content.news : base.news;
  const gallery = Array.isArray(content.gallery) ? content.gallery : base.gallery;
  const documents = Array.isArray(content.documents) ? content.documents : base.documents;

  return {
    site: { ...base.site, ...(content.site || {}) },
    directors: directors.map((d, index) => ({
      id: d.id ?? Date.now() + index,
      name: d.name || `Director ${index + 1}`,
      role: d.role || "Director/a",
      area: d.area || "",
      phone: String(d.phone || "").replace(/\D/g, ""),
      photoUrl: d.photoUrl || "",
    })),
    news: news.map((n, index) => ({
      id: n.id ?? Date.now() + index,
      title: n.title || "Noticia",
      category: n.category || "Comunicado",
      date: n.date || "",
      excerpt: n.excerpt || "",
      images: Array.isArray(n.images) ? n.images : (n.imageUrl ? [{ url: n.imageUrl, fileName: "imagen" }] : []),
      files: Array.isArray(n.files) ? n.files : [],
      links: Array.isArray(n.links) ? n.links : [],
    })),
    gallery: gallery.map((g, index) => ({
      id: g.id ?? Date.now() + index,
      title: g.title || "Actividad",
      description: g.description || "",
      images: Array.isArray(g.images) ? g.images : (g.imageUrl ? [{ url: g.imageUrl, fileName: "fotografía" }] : []),
    })),
    documents: documents.map((d, index) => ({
      id: d.id ?? Date.now() + index,
      title: d.title || d.fileName || "Documento",
      type: d.type || "Documento",
      url: d.url || "",
      fileName: d.fileName || "archivo",
      mimeType: d.mimeType || "application/octet-stream",
    })),
  };
}

async function createInitialState() {
  const state = {
    version: 3,
    updatedAt: new Date().toISOString(),
    content: structuredClone(DEFAULT_CONTENT),
    auth: { encryptedPasswordHash: encryptText(passwordHash("demo1234")) },
  };
  await saveState(state);
  return state;
}

export async function loadState() {
  const blob = await findStateBlob();
  if (!blob) return await createInitialState();
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error("No fue posible leer el estado desde Vercel Blob.");
  const state = await response.json();
  state.content = normalizeContent(state.content);
  return state;
}

export async function saveState(state) {
  state.version = 3;
  state.content = normalizeContent(state.content);
  state.updatedAt = new Date().toISOString();
  await put(PATH, JSON.stringify(state, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  return state;
}

export function publicContent(state) {
  return { ...normalizeContent(state.content), updatedAt: state.updatedAt };
}

export function passwordMatches(state, password) {
  return decryptText(state.auth.encryptedPasswordHash) === passwordHash(password);
}

export async function changePassword(state, password) {
  state.auth.encryptedPasswordHash = encryptText(passwordHash(password));
  await saveState(state);
}

export async function deleteAsset(url) {
  if (!url) return;
  try { await del(url); } catch {}
}
