# Sindicato Metropolitano — Demo V3 DigitalTesh

Versión mejorada de la demo para Vercel, manteniendo el almacenamiento central en **Vercel Blob** y la contraseña compartida del panel administrador.

## Mejoras de esta versión

- Diseño visual renovado: fondo blanco, tipografía más contenida y botones azules.
- Menú público 100% responsive con botón hamburguesa en móvil.
- Administración responsive con menú lateral tipo app en teléfono.
- Branding demo DigitalTesh en página pública, panel y PWA.
- Directores dinámicos:
  - botón **Añadir director**;
  - fotografía por director;
  - nombre, cargo, área y WhatsApp;
  - eliminar director.
- Documentos:
  - carga de hasta 10 archivos por vez;
  - PDF, imágenes, Word, Excel, PowerPoint, TXT, CSV, ZIP/RAR/7Z;
  - previsualización pequeña para PDF e imágenes;
  - botón Abrir;
  - botón Descargar.
- Noticias:
  - hasta 10 fotografías;
  - hasta 10 archivos adjuntos;
  - enlaces externos;
  - descripción y categoría.
- Galería:
  - álbumes de hasta 10 fotografías por carga;
  - título + comentario/descripción;
  - mosaico de 4 fotos;
  - indicador `+N` cuando hay más de 4;
  - visor ampliado de todas las fotos.
- Migración automática del contenido de la versión anterior.
- `cacheControlMaxAge` corregido a 60 segundos para Vercel Blob.
- PWA online instalable como **Sindicato Admin**.

## Archivos admitidos

Cada archivo puede pesar hasta **4 MB** en esta demo, para mantener compatibilidad con la carga mediante Function en Vercel.

Extensiones admitidas:

- JPG, JPEG, PNG, WEBP, GIF
- PDF
- DOC, DOCX
- XLS, XLSX
- PPT, PPTX
- TXT, CSV
- ZIP, RAR, 7Z

## Importante: no borres Vercel Blob

Esta versión utiliza la misma ruta central:

`/sindicato/system/state.json`

Por eso puedes actualizar el código sin eliminar el Blob Store. El contenido existente se adapta automáticamente al nuevo formato cuando se lee.

Tampoco elimines estas variables de Vercel:

- `BLOB_READ_WRITE_TOKEN`
- `APP_SECRET`

## Contraseña

Se conserva el sistema de una sola contraseña compartida.

Si el estado es nuevo, la contraseña inicial es:

`demo1234`

Si ya cambiaste la contraseña en la versión anterior, se mantiene mientras conserves el mismo Blob Store y `APP_SECRET`.

## Actualizar el proyecto existente en GitHub

No necesitas crear otro proyecto Vercel.

1. Descomprime este ZIP.
2. Abre la carpeta `sindicatometropolitano_vercel_v3`.
3. En GitHub entra al repositorio que ya está conectado a Vercel.
4. En la raíz del repositorio usa **Add file → Upload files**.
5. Arrastra **el contenido interior** de `sindicatometropolitano_vercel_v3`, no la carpeta completa como subcarpeta.
6. Debes ver en la raíz `app`, `lib`, `public`, `package.json`, etc.
7. GitHub reemplazará los archivos con el mismo nombre y agregará los nuevos.
8. Escribe un mensaje como `Actualiza demo Sindicato V3`.
9. Presiona **Commit changes** sobre la rama `main`.

Vercel detectará el commit y creará automáticamente un nuevo deployment.

## Vercel después del commit

1. Entra al proyecto actual `sindicatometropolitano-web`.
2. No borres Storage.
3. No desconectes Blob.
4. No cambies `BLOB_READ_WRITE_TOKEN`.
5. No cambies `APP_SECRET`.
6. Ve a **Deployments**.
7. Espera el deployment creado por el commit de GitHub.
8. Debe terminar con estado **Ready**.
9. Si no se genera automáticamente, selecciona el último deployment y usa **Redeploy**.

## Prueba mínima recomendada

### Página pública

- Abre `/` en PC.
- Abre `/` en iPhone.
- Comprueba el menú hamburguesa.
- Comprueba que `Administrar` aparezca en el menú móvil.

### Directores

- Entra a `/admin`.
- Directores → **Añadir director**.
- Sube una fotografía.
- Completa nombre/cargo/WhatsApp.
- Presiona **Guardar directores**.
- Abre la web desde otro dispositivo y actualiza.

### Documentos

- Documentos → selecciona 2 o 3 archivos a la vez.
- Prueba, por ejemplo, un PDF y una imagen.
- Publica.
- En la web pública deberían aparecer como tarjetas.
- El PDF/imagen debe mostrar una vista previa pequeña.
- Prueba **Abrir** y **Descargar**.

### Noticias

- Crea una noticia.
- Añade varias fotografías.
- Añade un documento.
- En enlaces escribe, por ejemplo:

`DigitalTesh | https://digitaltesh.com`

- Publica y revisa la página pública.

### Galería

- Crea un álbum.
- Selecciona entre 5 y 10 fotos.
- Escribe un comentario.
- En la web deberían verse 4 fotos y `+N` sobre la cuarta.
- Pulsa el álbum para visualizar todas.

## Instalación como app

### iPhone

1. Safari → abre `/admin`.
2. Compartir.
3. **Añadir a pantalla de inicio**.
4. Quedará el acceso `Sindicato Admin`.

### Android

1. Chrome → abre `/admin`.
2. Menú ⋮.
3. **Instalar aplicación** o **Agregar a pantalla principal**.

La app está diseñada para trabajar **online**. No se guarda contenido offline.
