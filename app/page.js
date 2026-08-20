"use client";

import { useEffect, useState } from "react";

const fileIcon = (mime = "", name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (mime.startsWith("image/")) return "🖼️";
  if (mime === "application/pdf" || ext === "pdf") return "📕";
  if (["doc","docx"].includes(ext)) return "📘";
  if (["xls","xlsx","csv"].includes(ext)) return "📗";
  if (["ppt","pptx"].includes(ext)) return "📙";
  if (["zip","rar","7z"].includes(ext)) return "🗜️";
  return "📄";
};

function DocumentPreview({ doc }) {
  if (!doc.url) return <div className="file-preview generic"><span>{fileIcon(doc.mimeType, doc.fileName)}</span><small>Demo</small></div>;
  if (doc.mimeType?.startsWith("image/")) return <img className="file-preview image-preview" src={doc.url} alt={doc.title} />;
  if (doc.mimeType === "application/pdf" || doc.fileName?.toLowerCase().endsWith(".pdf")) {
    return <iframe className="file-preview pdf-preview" src={`${doc.url}#toolbar=0&navpanes=0`} title={`Vista previa ${doc.title}`} />;
  }
  return <div className="file-preview generic"><span>{fileIcon(doc.mimeType, doc.fileName)}</span><small>{doc.fileName?.split(".").pop()?.toUpperCase() || "ARCHIVO"}</small></div>;
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(null);

  async function load() {
    const response = await fetch("/api/content", { cache: "no-store" });
    const json = await response.json();
    if (response.ok) setData(json);
  }

  useEffect(() => {
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  if (!data) return <div className="loading">Cargando información...</div>;

  const whatsapp = (director) => `https://wa.me/${director.phone}?text=${encodeURIComponent(`Hola ${director.name}, me comunico desde el sitio web del Sindicato Metropolitano.`)}`;
  const closeMenu = () => setMenuOpen(false);

  return <>
    <header className="site-header">
      <div className="container nav">
        <a className="brand" href="#inicio" onClick={closeMenu}>
          <img className="brand-logo" src="/digitaltesh-logo.svg" alt="DigitalTesh" />
          <div className="brand-context"><strong>Sindicato Metropolitano</strong><small>Demo desarrollada por DigitalTesh</small></div>
        </a>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú" aria-expanded={menuOpen}>{menuOpen ? "✕" : "☰"}</button>
        <nav className={`navlinks ${menuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={closeMenu}>Inicio</a><a href="#directiva" onClick={closeMenu}>Directiva</a><a href="#noticias" onClick={closeMenu}>Noticias</a>
          <a href="#galeria" onClick={closeMenu}>Galería</a><a href="#documentos" onClick={closeMenu}>Documentos</a><a href="#contacto" onClick={closeMenu}>Contacto</a>
          <a className="admin-link" href="/admin">🔐 Administrar</a>
        </nav>
      </div>
    </header>

    <main>
      <section className="hero" id="inicio"><div className="container hero-grid">
        <div>
          <div className="tag">{data.site.tagline}</div>
          <h1>Información sindical clara, cercana y siempre disponible.</h1>
          <p>Noticias, documentos, actividades y contacto directo con la directiva del Sindicato Metropolitano, desde cualquier dispositivo.</p>
          <div className="hero-actions"><a className="btn primary" href="#noticias">Ver últimas noticias</a><button className="btn secondary-blue" onClick={() => setWhatsappOpen(true)}>💬 Contactar directores</button></div>
        </div>
        <div className="hero-card">
          <span className="hero-badge">Comunicado destacado</span>
          <h3>{data.news[0]?.title || "Sin comunicados"}</h3>
          <p>{data.news[0]?.excerpt || "Próximamente publicaremos información."}</p>
          <a className="text-link" href="#noticias">Revisar novedades →</a>
        </div>
      </div></section>

      <section className="section" id="directiva"><div className="container">
        <div className="section-heading"><div><div className="tag">Directiva</div><h2>Conoce a nuestros directores</h2></div><p>Selecciona a la persona con la que necesitas comunicarte.</p></div>
        <div className="directors-grid">{data.directors.map((director, index) => <article className="card director" key={director.id}>
          {director.photoUrl ? <img className="director-photo" src={director.photoUrl} alt={director.name} /> : <div className="director-photo placeholder">D{index + 1}</div>}
          <div className="director-body"><h3>{director.name}</h3><p className="director-role">{director.role}</p><p>{director.area}</p><a className="btn primary full" target="_blank" href={whatsapp(director)}>💬 WhatsApp</a></div>
        </article>)}</div>
      </div></section>

      <section className="section soft" id="noticias"><div className="container">
        <div className="section-heading"><div><div className="tag">Actualidad</div><h2>Noticias y comunicados</h2></div><p>Información relevante, enlaces y archivos asociados a cada publicación.</p></div>
        <div className="news-grid">{data.news.map((news) => <article className="card news-card" key={news.id}>
          {news.images?.[0]?.url && <img className="news-cover" src={news.images[0].url} alt={news.title} />}
          <div className="news-content"><div className="meta">{news.category} · {news.date}</div><h3>{news.title}</h3><p>{news.excerpt}</p>
            {news.images?.length > 1 && <div className="mini-image-row">{news.images.slice(1,4).map((img,i)=><img key={i} src={img.url} alt="" />)}{news.images.length > 4 && <span>+{news.images.length-4}</span>}</div>}
            {news.links?.length > 0 && <div className="news-links">{news.links.map((link,i)=><a key={i} href={link.url} target="_blank" rel="noreferrer">🔗 {link.label || link.url}</a>)}</div>}
            {news.files?.length > 0 && <div className="news-files">{news.files.map((file,i)=><div className="attachment-chip" key={i}><span>{fileIcon(file.mimeType,file.fileName)} {file.fileName}</span><a href={file.url} target="_blank">Abrir</a><a href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}>Descargar</a></div>)}</div>}
          </div>
        </article>)}</div>
      </div></section>

      <section className="section" id="galeria"><div className="container">
        <div className="section-heading"><div><div className="tag">Galería</div><h2>Actividades y encuentros</h2></div><p>Cada actividad puede contener hasta 10 fotografías y una descripción.</p></div>
        {data.gallery.length ? <div className="gallery-albums">{data.gallery.map((album) => {
          const images = album.images || [];
          return <article className="gallery-album card" key={album.id}>
            <div className="gallery-mosaic" onClick={() => setGalleryOpen(album)}>
              {images.slice(0,4).map((image,i)=><div className="mosaic-cell" key={i}><img src={image.url} alt="" />{i===3 && images.length>4 && <div className="more-overlay">+{images.length-4}</div>}</div>)}
            </div>
            <div className="gallery-copy"><h3>{album.title}</h3>{album.description && <p>{album.description}</p>}<button className="text-button" onClick={() => setGalleryOpen(album)}>Ver fotografías →</button></div>
          </article>;
        })}</div> : <div className="empty-state">Aún no hay fotografías cargadas.</div>}
      </div></section>

      <section className="section soft" id="documentos"><div className="container">
        <div className="section-heading"><div><div className="tag">Recursos</div><h2>Documentos y archivos</h2></div><p>Visualiza, abre o descarga documentos disponibles para socios.</p></div>
        <div className="documents-grid">{data.documents.map((doc) => <article className="document-card card" key={doc.id}>
          <DocumentPreview doc={doc}/>
          <div className="document-copy"><span className="document-type">{doc.type}</span><h3>{doc.title}</h3><small>{doc.fileName}</small></div>
          {doc.url && <div className="document-actions"><a className="btn secondary-blue" href={doc.url} target="_blank">Abrir</a><a className="btn primary" href={`/api/download?url=${encodeURIComponent(doc.url)}&name=${encodeURIComponent(doc.fileName)}`}>Descargar</a></div>}
        </article>)}</div>
      </div></section>

      <section className="section" id="contacto"><div className="container"><div className="contact-box"><div><div className="tag">Contacto</div><h2>Sindicato Metropolitano</h2><p>{data.site.email}</p></div><button className="btn primary" onClick={() => setWhatsappOpen(true)}>💬 Contactar directores</button></div></div></section>
    </main>

    <button className="floating" onClick={() => setWhatsappOpen(true)} aria-label="Contactar por WhatsApp">💬</button>

    {whatsappOpen && <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) setWhatsappOpen(false); }}><div className="modal-card"><button className="close" onClick={() => setWhatsappOpen(false)}>×</button><div className="tag">Contacto</div><h2>Selecciona un director</h2>{data.directors.map((director) => <a className="wsp-choice" target="_blank" href={whatsapp(director)} key={director.id}><div><strong>{director.name}</strong><small>{director.role} · {director.area}</small></div><span>→</span></a>)}</div></div>}

    {galleryOpen && <div className="modal gallery-modal" onClick={(e)=>{if(e.target===e.currentTarget)setGalleryOpen(null)}}><div className="modal-card gallery-viewer"><button className="close" onClick={()=>setGalleryOpen(null)}>×</button><h2>{galleryOpen.title}</h2>{galleryOpen.description&&<p>{galleryOpen.description}</p>}<div className="viewer-grid">{galleryOpen.images?.map((image,i)=><img key={i} src={image.url} alt={`${galleryOpen.title} ${i+1}`}/>)}</div></div></div>}

    <footer><div className="container footer-content"><img src="/digitaltesh-logo-white.svg" alt="DigitalTesh"/><span>Demo Sindicato Metropolitano · 2026</span></div></footer>
  </>;
}
