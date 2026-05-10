# MockPost ✨
**Generador de comentarios ficticios para redes sociales**

Crea comentarios realistas de TikTok, Facebook, Instagram y WhatsApp y descárgalos como imagen PNG de alta calidad.

🌐 **Demo en vivo:** [commentcraft-theta.vercel.app](https://commentcraft-theta.vercel.app)

---

## Instalación y arranque

### Requisitos
- Node.js 18 o superior

### Pasos

```bash
npm install
npm start
```

Luego abre tu navegador en: **http://localhost:3000**

---

## Funcionalidades

- TikTok (comentario clásico + modo globo)
- Facebook (6 tipos de reacciones)
- Instagram
- WhatsApp (modo oscuro, grupos, estados de mensaje)
- Foto de perfil propia (subir archivo o URL)
- Descarga PNG en alta resolución (3×)
- Historial local en el navegador
- Diseño responsive

---

## Estructura del proyecto

```
mockpost/
├── src/
│   └── server.js          # Servidor Express
├── public/
│   ├── index.html         # Aplicación principal
│   ├── privacy.html       # Política de privacidad
│   ├── css/styles.css     # Estilos
│   ├── js/
│   │   ├── app.js         # Lógica principal
│   │   ├── generators.js  # Generadores por plataforma
│   │   └── download.js    # Descarga PNG
│   └── assets/logo.svg    # Logo
└── package.json
```

---

## Licencia
MIT — uso libre para fines personales, educativos y comerciales.
