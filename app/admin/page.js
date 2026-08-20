"use client";

import { useEffect, useState } from "react";

const ACCEPTED_FILES = ".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z";
const MAX_BATCH = 10;

function parseLinks(text = "") {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [labelPart, urlPart] = line.includes("|") ? line.split("|", 2).map((x) => x.trim()) : ["", line];
    let url = urlPart || "";
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    return { label: labelPart || url, url };
  }).filter((x) => x.url);
}

export default function AdminPage() {
  const [auth, setAuth] = useState(null);
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [view, setView] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function adminFetch(options = {}) {
    const response = await fetch("/api/admin", { cache: "no-store", ...options });
    const json = await response.json();
    if (response.status === 401) { setAuth(false); setData(null); }
    if (!response.ok) throw new Error(json.error || "Ocurrió un error.");
    return json;
  }

  async function load() {
    try { const json = await adminFetch(); setData(json.content); setAuth(true); }
    catch { setAuth(false); }
  }

  useEffect(() => { load(); }, []);

  async function login(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "No fue posible ingresar.");
      setPassword(""); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch("/api/logout", { method: "POST" }); setAuth(false); setData(null); }

  async function action(payload) {
    setBusy(true); setError(""); setMessage("");
    try {
      const json = await adminFetch({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (json.content) setData(json.content);
      setMessage("Cambios guardados. Ya están disponibles en todos los dispositivos.");
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setBusy(false); }
  }

  async function upload(file, kind = "file") {
    if (!file) throw new Error("Selecciona un archivo.");
    const form = new FormData(); form.append("file", file); form.append("kind", kind);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const json = await response.json();
    if (!response.ok) throw new Error(`${file.name}: ${json.error || "No fue posible subir el archivo."}`);
    return json;
  }

  async function uploadMany(fileList, kind = "file", max = MAX_BATCH) {
    const files = Array.from(fileList || []);
    if (files.length > max) throw new Error(`Puedes seleccionar como máximo ${max} archivos por vez.`);
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      setMessage(`Subiendo ${i + 1} de ${files.length}: ${files[i].name}`);
      uploaded.push(await upload(files[i], kind));
    }
    return uploaded;
  }

  const changeView = (next) => { setView(next); setMenuOpen(false); setMessage(""); setError(""); };

  if (auth === null) return <div className="loading">Verificando sesión...</div>;
  if (!auth) return <div className="login-wrap"><div className="login-card">
    <img className="login-logo" src="/digitaltesh-logo.svg" alt="DigitalTesh" />
    <div className="login-context">Demo · Sindicato Metropolitano</div>
    <h1>Administración</h1><p className="hint">Contraseña inicial: <strong>demo1234</strong></p>
    {error && <div className="error">{error}</div>}
    <form onSubmit={login}><label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label><button className="btn primary" disabled={busy}>{busy ? "Ingresando..." : "Ingresar"}</button></form>
  </div></div>;
  if (!data) return <div className="loading">Cargando administración...</div>;

  const setDirector = (index, field, value) => setData((previous) => ({ ...previous, directors: previous.directors.map((director, i) => i === index ? { ...director, [field]: value } : director) }));
  const addDirector = () => setData((previous) => ({ ...previous, directors: [...previous.directors, { id: Date.now(), name: "", role: "Director/a", area: "", phone: "", photoUrl: "" }] }));

  const navItems = [["dashboard","⌂ Resumen"],["news","📰 Noticias"],["gallery","📷 Galería"],["documents","📄 Documentos"],["directors","👥 Directores"],["settings","⚙ Configuración"]];

  return <div className="admin-page">
    <div className="admin-mobile-bar"><img src="/digitaltesh-logo.svg" alt="DigitalTesh"/><button className="menu-btn" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"}</button></div>
    <div className={`admin-overlay ${menuOpen ? "show" : ""}`} onClick={()=>setMenuOpen(false)} />
    <div className="admin-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-brand"><img src="/digitaltesh-logo.svg" alt="DigitalTesh"/><small>Demo · Sindicato Metropolitano</small></div>
        <nav className="side-nav">{navItems.map(([id,label]) => <button className={view === id ? "active" : ""} key={id} onClick={()=>changeView(id)}>{label}</button>)}</nav>
        <div className="bottom"><a className="btn secondary" href="/">🌐 Ver página pública</a><button className="btn danger" onClick={logout}>Cerrar sesión</button></div>
      </aside>

      <main className="admin-main">
        <div className="admin-top"><div><div className="tag">Panel online</div><h1>Administración de contenidos</h1><p>Gestiona la página desde PC, iPhone o Android.</p></div><button className="btn secondary" onClick={load}>↻ Actualizar</button></div>
        {message && <div className="success">{message}</div>}{error && <div className="error">{error}</div>}

        {view === "dashboard" && <>
          <div className="admin-kpis"><div className="kpi"><span>Noticias</span><strong>{data.news.length}</strong></div><div className="kpi"><span>Álbumes</span><strong>{data.gallery.length}</strong></div><div className="kpi"><span>Documentos</span><strong>{data.documents.length}</strong></div><div className="kpi"><span>Directores</span><strong>{data.directors.length}</strong></div></div>
          <div className="admin-card"><h2>Acciones rápidas</h2><div className="quick-actions"><button className="btn primary" onClick={()=>changeView("news")}>+ Nueva noticia</button><button className="btn primary" onClick={()=>changeView("gallery")}>+ Nuevo álbum</button><button className="btn primary" onClick={()=>changeView("documents")}>+ Subir archivos</button><button className="btn secondary-blue" onClick={()=>changeView("directors")}>Gestionar directores</button></div></div>
        </>}

        {view === "news" && <div className="admin-grid">
          <div className="admin-card"><h2>Nueva noticia</h2><p className="hint">Puedes adjuntar fotografías, documentos y enlaces.</p><form onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setError("");
            try {
              const form = e.currentTarget;
              const images = await uploadMany(form.elements.namedItem("images").files, "image", 10);
              const files = await uploadMany(form.elements.namedItem("files").files, "file", 10);
              const links = parseLinks(form.elements.namedItem("links").value);
              const ok = await action({ action:"add-news", title:form.elements.namedItem("title").value, category:form.elements.namedItem("category").value, excerpt:form.elements.namedItem("excerpt").value,
                images: images.map(x=>({url:x.url,fileName:x.fileName,mimeType:x.mimeType})),
                files: files.map(x=>({url:x.url,fileName:x.fileName,mimeType:x.mimeType})), links });
              if (ok) form.reset();
            } catch (err) { setError(err.message); } finally { setBusy(false); }
          }}>
            <label>Título<input name="title" required /></label><label>Categoría<select name="category"><option>Comunicado</option><option>Actividad</option><option>Beneficio</option><option>Información importante</option></select></label>
            <label>Descripción<textarea name="excerpt" rows="5" required /></label>
            <label>Fotografías (hasta 10)<input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple /></label>
            <label>Documentos adjuntos (hasta 10)<input name="files" type="file" accept={ACCEPTED_FILES} multiple /></label>
            <label>Enlaces <span className="field-help">Uno por línea. Puedes usar: Nombre | https://sitio.cl</span><textarea name="links" rows="4" placeholder={'Sitio oficial | https://ejemplo.cl\nhttps://otro-enlace.cl'} /></label>
            <button className="btn primary" disabled={busy}>{busy ? "Procesando..." : "Publicar noticia"}</button>
          </form></div>
          <div className="admin-card"><h2>Publicaciones</h2>{data.news.map((news)=><div className="list-item" key={news.id}><div><strong>{news.title}</strong><small>{news.category} · {news.date} · {news.images?.length||0} foto(s) · {news.files?.length||0} archivo(s)</small></div><button className="btn danger compact" onClick={()=>action({action:"delete-news",id:news.id})}>Eliminar</button></div>)}</div>
        </div>}

        {view === "gallery" && <div className="admin-grid">
          <div className="admin-card"><h2>Nuevo álbum de fotografías</h2><p className="hint">Selecciona hasta 10 fotografías de una sola vez.</p><form onSubmit={async (e)=>{
            e.preventDefault(); setBusy(true); setError("");
            try { const form=e.currentTarget; const images=await uploadMany(form.elements.namedItem("images").files,"image",10); if(!images.length)throw new Error("Selecciona al menos una fotografía.");
              const ok=await action({action:"add-gallery",title:form.elements.namedItem("title").value,description:form.elements.namedItem("description").value,images:images.map(x=>({url:x.url,fileName:x.fileName,mimeType:x.mimeType}))}); if(ok)form.reset();
            } catch(err){setError(err.message)} finally{setBusy(false)}
          }}><label>Título del álbum<input name="title" required /></label><label>Comentario o descripción<textarea name="description" rows="4" placeholder="Describe la actividad, lugar o fecha..." /></label><label>Fotografías (máximo 10)<input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple required /></label><button className="btn primary" disabled={busy}>{busy?"Subiendo...":"Publicar álbum"}</button></form></div>
          <div className="admin-card"><h2>Álbumes publicados</h2>{data.gallery.map((album)=><div className="list-item" key={album.id}><div><strong>{album.title}</strong><small>{album.images?.length||0} fotografía(s){album.description?` · ${album.description.slice(0,60)}`:""}</small></div><button className="btn danger compact" onClick={()=>action({action:"delete-gallery",id:album.id})}>Eliminar</button></div>)}</div>
        </div>}

        {view === "documents" && <div className="admin-grid">
          <div className="admin-card"><h2>Subir documentos y archivos</h2><p className="hint">Puedes seleccionar hasta 10 archivos de una vez: PDF, imágenes, Word, Excel, PowerPoint, TXT, CSV o archivos comprimidos.</p><form onSubmit={async(e)=>{
            e.preventDefault();setBusy(true);setError("");
            try{const form=e.currentTarget;const uploaded=await uploadMany(form.elements.namedItem("files").files,"file",10);if(!uploaded.length)throw new Error("Selecciona al menos un archivo.");
              const baseTitle=form.elements.namedItem("title").value.trim();const documents=uploaded.map((x,i)=>({title: uploaded.length===1&&baseTitle?baseTitle:(baseTitle?`${baseTitle} ${i+1}`:x.fileName.replace(/\.[^.]+$/, "")),type:form.elements.namedItem("type").value,url:x.url,fileName:x.fileName,mimeType:x.mimeType}));
              const ok=await action({action:"add-documents",documents});if(ok)form.reset();
            }catch(err){setError(err.message)}finally{setBusy(false)}
          }}><label>Título o grupo (opcional)<input name="title" placeholder="Ej: Documentos Asamblea Agosto" /></label><label>Categoría<select name="type"><option>Documento</option><option>Estatuto</option><option>Convenio</option><option>Comunicado</option><option>Formulario</option><option>Imagen</option><option>Otro</option></select></label><label>Archivos (máximo 10)<input name="files" type="file" accept={ACCEPTED_FILES} multiple required /></label><button className="btn primary" disabled={busy}>{busy?"Subiendo...":"Subir archivos"}</button></form></div>
          <div className="admin-card"><h2>Archivos publicados</h2>{data.documents.map((doc)=><div className="list-item" key={doc.id}><div><strong>{doc.title}</strong><small>{doc.type} · {doc.fileName}</small></div><div className="inline-actions">{doc.url&&<a className="btn secondary compact" href={doc.url} target="_blank">Abrir</a>}<button className="btn danger compact" onClick={()=>action({action:"delete-document",id:doc.id})}>Eliminar</button></div></div>)}</div>
        </div>}

        {view === "directors" && <>
          <div className="admin-section-title"><div><h2>Directores</h2><p>Agrega, modifica o elimina integrantes de la directiva.</p></div><button className="btn primary" onClick={addDirector}>+ Añadir director</button></div>
          <div className="directors-admin-grid">{data.directors.map((director,index)=><div className="admin-card director-editor" key={director.id}>
            <div className="director-editor-head">{director.photoUrl?<img src={director.photoUrl} alt=""/>:<div className="avatar">D{index+1}</div>}<div><strong>{director.name||`Director ${index+1}`}</strong><small>{director.role}</small></div></div>
            <label>Fotografía<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async(e)=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const up=await upload(file,"director");setDirector(index,"photoUrl",up.url);setMessage("Fotografía cargada. Presiona Guardar directores para confirmar.");}catch(err){setError(err.message)}finally{setBusy(false)}}}/></label>
            <label>Nombre<input value={director.name} onChange={(e)=>setDirector(index,"name",e.target.value)} /></label><label>Cargo<input value={director.role} onChange={(e)=>setDirector(index,"role",e.target.value)} /></label><label>Área / función<input value={director.area} onChange={(e)=>setDirector(index,"area",e.target.value)} /></label><label>WhatsApp<input value={director.phone} onChange={(e)=>setDirector(index,"phone",e.target.value)} placeholder="56912345678" /></label>
            <button className="btn danger" onClick={async()=>{if(confirm("¿Eliminar este director?"))await action({action:"delete-director",id:director.id})}}>Eliminar director</button>
          </div>)}</div>
          <div className="sticky-save"><button className="btn primary" disabled={busy} onClick={()=>action({action:"save-directors",directors:data.directors})}>Guardar directores</button></div>
        </>}

        {view === "settings" && <div className="admin-card settings-card"><h2>Cambiar contraseña compartida</h2><p>La nueva contraseña será la misma para todos los administradores.</p><form onSubmit={async(e)=>{e.preventDefault();const form=e.currentTarget;if(form.elements.namedItem("next").value!==form.elements.namedItem("repeat").value){setError("Las nuevas contraseñas no coinciden.");return}const ok=await action({action:"change-password",currentPassword:form.elements.namedItem("current").value,newPassword:form.elements.namedItem("next").value});if(ok)form.reset()}}><label>Contraseña actual<input type="password" name="current" required /></label><label>Nueva contraseña<input type="password" name="next" minLength="6" required /></label><label>Repetir nueva contraseña<input type="password" name="repeat" minLength="6" required /></label><button className="btn primary" disabled={busy}>Cambiar contraseña</button></form></div>}
      </main>
    </div>
  </div>;
}
