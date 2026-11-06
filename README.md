# NEXORA — portfolio de Santiago Esposito

Sitio web estático: HTML, CSS y JavaScript, sin frameworks ni paquetes externos.
Funciona por sí solo, sin depender de claude.ai. La tipografía, las imágenes y el video se sirven desde tu propio sitio.

```
portfolio/
├─ index.html           la página
├─ css/styles.css       estilos y animaciones
├─ js/projects.js       ← EL CONTENIDO: textos, proyectos, servicios, contacto
├─ js/main.js           interacciones (showreel, filtros, vista de proyecto, etc.)
├─ assets/fonts/        tipografía Archivo + su licencia (OFL)
├─ assets/projects/     imágenes y videos de los proyectos
├─ scripts/build.mjs    verifica el proyecto y genera dist/ (lo que se publica)
├─ scripts/serve.mjs    servidor para probar en tu computadora
├─ vercel.json          configuración de producción para Vercel
└─ package.json         comandos
```

---

## 1. Probar en tu computadora

Necesitás **Node.js 18 o superior** ([nodejs.org](https://nodejs.org), versión LTS). No hace falta instalar ningún paquete.
Abrí una terminal **dentro de la carpeta `portfolio`** y corré:

```bash
npm run dev
```

Abrí <http://localhost:3000>. Para ver exactamente la versión que se publica:

```bash
npm run preview
```

Esa versión queda en <http://localhost:4000>. `Ctrl + C` corta el servidor.

Para revisar que todo esté bien sin generar nada:

```bash
npm run check
```

---

## 2. Publicar en Vercel

Necesitás una cuenta gratuita en [vercel.com](https://vercel.com). Podés entrar con tu cuenta de GitHub.

### Opción A: con GitHub (recomendada)

Con esta opción, cada cambio que subas se publica solo.

1. En [github.com](https://github.com/new) creá un repositorio **vacío**, por ejemplo `nexora`, sin README.
2. En una terminal dentro de la carpeta `portfolio`, corré estos comandos uno por uno:

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "NEXORA"
   ```

   ```bash
   git branch -M main
   ```

   Reemplazá `TU-USUARIO` por tu usuario de GitHub en el siguiente comando:

   ```bash
   git remote add origin https://github.com/TU-USUARIO/nexora.git
   ```

   ```bash
   git push -u origin main
   ```

3. En Vercel elegí **Add New… → Project**, buscá el repositorio `nexora` y tocá **Import**.
4. En la pantalla de configuración:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`. Si subiste la carpeta `HyperFrames` completa, elegí `portfolio`.
   - **Build Command / Output Directory:** no los toques. Vercel los lee de `vercel.json` (`npm run build` → `dist`).
5. Tocá **Deploy**. En alrededor de un minuto te da la dirección, por ejemplo `https://nexora-xxxx.vercel.app`.

De ahí en adelante, cada `git add . && git commit -m "cambio" && git push` publica una versión nueva automáticamente.

### Opción B: desde la terminal, sin GitHub

Dentro de la carpeta `portfolio`, corré:

```bash
npx vercel
```

La primera vez abre el navegador para iniciar sesión y te hace unas preguntas:

- Set up and deploy: **Y**
- Link to existing project: **N**
- Nombre del proyecto: **nexora**
- Directorio: **./**
- Modify settings: **N**

Esto publica una versión de prueba. Para publicar la versión final:

```bash
npx vercel --prod
```

Cada vez que cambies algo, volvé a correr `npx vercel --prod`.

### Dominio propio (opcional)

En Vercel entrá a tu proyecto → **Settings → Domains → Add** y seguí los pasos de DNS que te indica.
Después hacé un nuevo deploy (**Deployments → ⋯ → Redeploy**) para que la vista previa al compartir el link use el dominio nuevo.

---

## 3. Editar el contenido

Todo el contenido está en **`js/projects.js`**. El encabezado del archivo explica cada campo. No hace falta tocar HTML ni CSS.

- **Agregar un proyecto:** copiá un bloque de `projects`, poné un `id` único (minúsculas y guiones) y completá los campos.
- **Imágenes y videos:** guardalos en `assets/projects/` y escribí la ruta, por ejemplo `"assets/projects/mi-video.mp4"`.
  - Video: MP4 (H.264), idealmente de menos de 15 MB.
  - Imágenes: JPG o WebP de 1920×1080.
- **Herramientas, roles y contacto:** están en `site` y en `about`.

Antes de publicar, corré:

```bash
npm run check
```

Si algo falta o está mal escrito, te dice exactamente qué y dónde. Por ejemplo:
`projects[2] (proyecto-video).cover: no existe "assets/projects/portada.jpg"`.

---

## 4. Qué incluye la versión de producción

- **Verificación en cada deploy.** `npm run build` revisa:
  - la sintaxis del JavaScript;
  - los datos de `projects.js`: ids repetidos, categorías inexistentes, correo y WhatsApp mal escritos;
  - que existan todas las imágenes, videos y fuentes, respetando mayúsculas y minúsculas como en Vercel;
  - que los links internos lleven a una sección real.

  Si algo falla, Vercel **no publica** y muestra el error en el log del build. Así nunca queda un sitio roto en línea.
- **Caché eficiente.** El CSS y el JS se publican con un código en el nombre (`styles.d05f2c4758.css`):
  - el navegador los guarda un año y cada cambio genera un nombre nuevo, así nadie ve una versión vieja;
  - las fuentes se guardan un año;
  - las imágenes y los videos se renuevan cada día.
- **Headers de seguridad:** `nosniff`, `Referrer-Policy`, `X-Frame-Options` y `Permissions-Policy`.
- **Vista previa al compartir** el link por WhatsApp, Instagram o LinkedIn: título, descripción e imagen del showreel.
  - Vercel completa la dirección sola (`VERCEL_PROJECT_PRODUCTION_URL`).
  - En otro hosting usá `SITE_URL=https://tudominio.com npm run build`.
- **Responsive:** probado en escritorio (1440 px), tablet (768 px) y celular (375 px).
- **Accesibilidad:** con "reducir movimiento" activado en el sistema, el showreel arranca en pausa y las animaciones se simplifican.

---

## 5. Problemas comunes

| Problema | Solución |
| --- | --- |
| `npm` no se reconoce como comando | Instalá Node.js LTS y abrí una terminal nueva. |
| El deploy falla en Vercel | Abrí el log del build. El error dice qué archivo o dato revisar. Corré `npm run check` en tu compu, corregí y volvé a subir. |
| Cambié una imagen y sigo viendo la vieja | Las imágenes con el mismo nombre pueden tardar hasta un día en actualizarse para quien ya las vio. Guardala con otro nombre o recargá con `Ctrl + F5`. |
| El video no se ve en el celular | Exportalo en MP4 H.264 (no HEVC/H.265) y revisá que la ruta en `projects.js` coincida exactamente con el nombre del archivo. |
