# CommentCraft ✨
**Generador profesional de comentarios ficticios para redes sociales**

Crea comentarios realistas de TikTok, Facebook, Instagram y WhatsApp y descárgalos como imagen PNG.

---

## Instalación y arranque

### Requisitos
- Node.js 18 o superior

### Pasos

```bash
# 1. Entrar a la carpeta del proyecto
cd commentcraft

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar la aplicación
npm start
```

Luego abre tu navegador en: **http://localhost:3000**

---

## Cómo usar

1. **Selecciona la plataforma** — TikTok, Facebook, Instagram o WhatsApp
2. **Rellena el formulario** — username, comentario, likes, verificado, etc.
3. **Haz clic en "Generar preview"** — verás el resultado en el teléfono
4. **Descarga** — haz clic en "Descargar PNG" para guardar la imagen
5. **Guarda en historial** — clic en "💾 Guardar" para acceder luego

---

## Añadir publicidad (Google AdSense)

1. Crea una cuenta en [Google AdSense](https://adsense.google.com)
2. Obtén tu **Publisher ID** (formato: `ca-pub-XXXXXXXXXXXXXXXX`)
3. En `public/index.html`, reemplaza `ca-pub-XXXXXXXXXXXXXXXX` con tu ID real y descomenta las líneas `<ins class="adsbygoogle"...>`

---

## Estructura del proyecto

```
commentcraft/
├── src/
│   ├── server.js          # Servidor Express
│   ├── database/db.js     # Persistencia JSON
│   └── routes/api.js      # Endpoints REST
├── public/
│   ├── index.html         # Aplicación principal
│   ├── css/styles.css     # Estilos
│   ├── js/
│   │   ├── app.js         # Lógica principal
│   │   ├── generators.js  # Generadores por plataforma
│   │   └── download.js    # Descarga PNG
│   └── assets/logo.svg    # Logo
├── data/                  # Historial guardado (se crea automáticamente)
└── package.json
```

---

## Variables de entorno

Copia `.env.example` a `.env` y edita:

```
PORT=3000
```

---

## Licencia
MIT — uso libre para fines personales, educativos y comerciales.
