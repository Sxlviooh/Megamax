# MEGAMAX · Watch (con panel admin protegido)

Reproductor público de solo lectura + panel de administrador con contraseña.
Solo quien conozca la contraseña puede cambiar qué se muestra; el resto de
visitantes solo ven la página pública, sin controles de edición.

## Estructura

- `server.js` — backend Express: guarda el estado actual en `db.json` y
  protege la ruta de edición con sesión + contraseña.
- `public/index.html` — página pública (reproductor + chat). Sin botones de
  edición.
- `public/admin.html` — login + formulario para cambiar el vídeo, el canal
  de chat y el modo de retraso.

## Instalación local

```bash
npm install
cp .env.example .env
# Edita .env y pon tu propia contraseña y un secreto de sesión aleatorio
npm start
```

Luego abre:
- `http://localhost:3000/` → página pública
- `http://localhost:3000/admin.html` → panel de administrador

## Desplegar en internet

Necesitas un hosting que ejecute Node.js (no vale un hosting solo-estático,
porque hay backend). Opciones sencillas y con capa gratuita: Render,
Railway, Fly.io o un VPS propio.

Pasos generales:
1. Sube este proyecto a un repositorio (GitHub, GitLab, etc.).
2. En el proveedor, crea un "Web Service" apuntando al repo.
3. Configura las variables de entorno `ADMIN_PASSWORD` y `SESSION_SECRET`
   desde el panel del proveedor (nunca subas tu `.env` real al repositorio).
4. Comando de arranque: `npm start`.
5. Cuando el servicio esté desplegado, entra en `tudominio.com/admin.html`
   para configurar el vídeo por primera vez.

## Notas importantes

- El vídeo se referencia por **URL** (por ejemplo, alojado en tu propio
  almacenamiento, un CDN, o cualquier servidor tuyo). Este proyecto no
  incluye subida de archivos al servidor; si quieres poder subir el archivo
  directamente desde el panel admin y que se aloje ahí, se puede añadir
  (requiere espacio en disco o un servicio de almacenamiento como S3).
- Cambia `ADMIN_PASSWORD` por una contraseña fuerte antes de publicar el
  sitio — la que viene en `.env.example` es solo un placeholder.
- La página pública consulta el estado cada 15 segundos, así que un cambio
  que hagas en el panel admin tarda como mucho eso en reflejarse para quien
  ya tenga la página abierta.
