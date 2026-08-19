# Sindicato Metropolitano — Vercel compartido v2

Esta versión corrige el problema anterior: los cambios ya no dependen de localStorage. Usa **Vercel Blob** para guardar un estado central, PDFs e imágenes.

## Contraseña inicial
`demo1234`

## Configuración en Vercel
1. Sube esta carpeta completa a GitHub.
2. Importa el repositorio en Vercel; detectará Next.js.
3. En el proyecto abre **Storage → Create Database → Blob**.
4. Crea un Blob store con acceso **Public** y conéctalo al proyecto.
5. Verifica que exista la variable `BLOB_READ_WRITE_TOKEN`.
6. Ve a **Settings → Environment Variables** y crea `APP_SECRET` con una cadena aleatoria larga (idealmente 40-64 caracteres).
7. Haz **Redeploy**.

## Primera prueba
- Abre `https://TU-PROYECTO.vercel.app/admin`
- Clave: `demo1234`
- Sube un PDF desde iPhone.
- Abre la página pública desde PC y actualiza. El PDF debe aparecer.
- Haz la prueba inversa publicando una noticia desde PC y revisándola desde iPhone.

## Instalar como app
### iPhone
Safari → abrir `/admin` → Compartir → Añadir a pantalla de inicio.

### Android
Chrome → abrir `/admin` → menú ⋮ → Instalar aplicación / Agregar a pantalla principal.

## Una sola contraseña
En `/admin` → Configuración puedes cambiar la contraseña compartida. El cambio queda centralizado y aplica para todos los dispositivos.

## Límites demo
- Imágenes JPG/PNG/WEBP hasta 5 MB.
- PDF hasta 10 MB.
- Pensado para 4 administradores y bajo volumen de cambios.

## Archivos centrales en Blob
- `sindicato/system/state.json`
- `sindicato/images/...`
- `sindicato/documents/...`

## Nota
El estado JSON se guarda en un Blob público para simplificar esta demo; el hash de contraseña va cifrado con `APP_SECRET`. Para una versión productiva más endurecida se puede separar configuración privada o migrar los datos estructurados a un KV/BD pequeña.
