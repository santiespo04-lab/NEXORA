/*
  NEXORA — contenido del portfolio
  =================================
  Todo lo que muestra la web sale de este archivo: no hace falta tocar HTML ni CSS.

  · TUS DATOS: editá `site` (nombre, roles, contacto, showreel) y `about`.
  · AGREGAR un proyecto: copiá un bloque dentro de `projects`, poné un `id` único
    y completá los campos. Aparece solo en la grilla, en los filtros y en su vista individual
    (también se puede abrir directo con el link  …/#id-del-proyecto ).
  · MEDIOS: guardá tus archivos en /portfolio/assets/projects/ y apuntá:
      cover:   "assets/projects/mi-portada.jpg"   (imagen 16:9 · si falta, se dibuja una portada generativa)
      video:   "assets/projects/mi-video.mp4"     (preview al pasar el mouse + reproductor)
      gallery: ["assets/projects/1.jpg", ...]     (imágenes extra en la vista individual)
      link:    "https://..."                       (botón "Visitar" para webs o decks online)
      tools:   ["HyperFrames", ...]               (herramientas usadas en ese proyecto)
  · `featured: true` → ocupa el bloque grande arriba de todo.
  · Categorías válidas: "video" | "motion" | "presentations" | "web" | "hyperframes"
*/
window.PORTFOLIO = {
  site: {
    // Nombre del proyecto: título de la pestaña y del link compartido.
    title: "NEXORA",
    // Titular del inicio: una línea por elemento (2.ª en rojo, 3.ª en contorno).
    headline: ["BIENVENIDO A", "NEXORA,", "TU MUNDO A EDITAR."],
    intro:
      "NEXORA es el estudio digital de Santiago Esposito. Edición de video, motion design, presentaciones, diseño web y videos programados con HyperFrames, pensados para que cada pieza tenga ritmo, intención e identidad propia.",
    name: "Santiago Esposito",
    // roles que rotan en el inicio
    roles: ["Editor de video", "Motion designer", "Diseñador de presentaciones", "Diseñador web", "Creador con HyperFrames"],
    location: "Argentina",
    year: "2026",
    // Indicador del menú. Dejalo vacío ("") para ocultarlo.
    availability: "Disponible para proyectos",
    email: "santiespo04@gmail.com",
    whatsapp: {
      number: "5493764262942",
      display: "+54 9 3764 262942",
      message: "Hola Santiago, vi NEXORA y quiero hablar de un proyecto.",
    },
    // Showreel del monitor del inicio (loop, sin sonido hasta que el visitante lo active).
    showreel: {
      video: "assets/projects/picadas-argentinas-reel.mp4",
      poster: "assets/projects/picadas-carrera.jpg",
      label: "Picadas Argentinas",
      project: "picadas-argentinas", // id del proyecto que abre el botón "Ver proyecto"
    },
    // Redes: para sumar otra, agregá { label, handle, url }.
    socials: [{ label: "Instagram", handle: "@santiiagoesposito", url: "https://www.instagram.com/santiiagoesposito/" }],
  },

  about: {
    lead: "Cada frame con intención.",
    body: [
      "Soy Santiago Esposito, editor de video y motion designer en Argentina. Desde NEXORA edito video, animo marcas, diseño presentaciones y páginas web, y programo videos con HyperFrames.",
      "Trabajo cada pieza como un sistema: una idea clara, un ritmo que la sostiene y un diseño que se puede ajustar, versionar y reutilizar. Desde una pieza corta para redes hasta una web completa.",
    ],
    approach: [
      { title: "Ritmo primero", text: "El corte, la música y el movimiento deciden juntos cómo se cuenta la idea." },
      { title: "Identidad en cada frame", text: "Tipografía, color y transiciones que hacen reconocible la pieza." },
      { title: "Diseño que escala", text: "Proyectos editables y versionables: cambiar un texto o un formato no obliga a empezar de cero." },
    ],
    // Herramientas: sumá las que uses (editores, apps de diseño, etc.).
    tools: ["HyperFrames", "GSAP", "HTML · CSS · JavaScript", "FFmpeg"],
    process: [
      { title: "Brief", text: "Entender el objetivo, el público y dónde va a vivir la pieza." },
      { title: "Concepto", text: "Dirección visual, tipografía, ritmo y estructura." },
      { title: "Producción", text: "Edición, animación, diseño y código, con revisiones claras." },
      { title: "Entrega", text: "Formatos listos para cada plataforma y archivos editables." },
    ],
  },

  categories: {
    video: "Edición de video",
    motion: "Motion design",
    presentations: "Presentaciones",
    web: "Diseño web",
    hyperframes: "HyperFrames",
  },

  services: [
    {
      id: "video",
      title: "Edición de video",
      en: "Video Editing",
      text: "Montaje, ritmo y sonido para reels, videoclips, spots y contenido de redes. Entrega lista para cada plataforma.",
      tags: ["Reels", "Videoclips", "Spots", "Contenido audiovisual"],
      clip: [3, 44],
    },
    {
      id: "motion",
      title: "Motion design",
      en: "Motion Design",
      text: "Motion graphics, tipografía cinética, logos animados y transiciones con intención en cada frame.",
      tags: ["Motion graphics", "Tipografía cinética", "Logos animados", "Transiciones"],
      clip: [18, 66],
    },
    {
      id: "presentations",
      title: "Presentaciones",
      en: "Presentations",
      text: "Presentaciones con narrativa visual y animación sutil: diseño que sostiene la idea frente a cualquier público.",
      tags: ["Pitch decks", "Keynotes", "Plantillas"],
      clip: [36, 78],
    },
    {
      id: "web",
      title: "Diseño web",
      en: "Web Design",
      text: "Páginas y landings rápidas, responsive y con identidad propia. Del diseño al código, sin plantillas.",
      tags: ["Landing pages", "Portfolios", "UI", "Front-end"],
      clip: [52, 92],
    },
    {
      id: "hyperframes",
      title: "HyperFrames",
      en: "HyperFrames",
      text: "Videos programados en HTML: piezas editables, versionables y renderizables en lote para escalar contenido.",
      tags: ["Video en código", "Versiones", "1080p · 60 fps", "Plantillas"],
      clip: [8, 97],
    },
  ],

  /*
    Los bloques marcados como espacio de ejemplo están listos para tus trabajos (uno por servicio).
    Reemplazá título, textos y medios; borrá los que no uses o agregá más.
  */
  projects: [
    {
      id: "picadas-argentinas",
      featured: true,
      title: "Picadas Argentinas",
      subtitle: "Reel promocional · llamado a jugar",
      client: "Picadas Argentinas",
      year: "2026",
      duration: "00:12",
      format: "1920×1080 · 60 fps",
      categories: ["motion", "hyperframes", "video"],
      role: ["Dirección", "Motion design", "Sound design", "HyperFrames"],
      tools: ["HyperFrames", "GSAP", "Canvas 2D", "FFmpeg"],
      summary:
        "Reel para invitar a jugar: árbol de largada, la escalera de rangos de novato a leyenda, tacómetro sincronizado con el sonido del motor y un cierre que llama a la acción. Blanco y negro con un único acento naranja, programado y renderizado con HyperFrames.",
      cover: "assets/projects/picadas-carrera.jpg",
      video: "assets/projects/picadas-argentinas-reel.mp4",
      gallery: [
        "assets/projects/picadas-largada.jpg",
        "assets/projects/picadas-carrera.jpg",
        "assets/projects/picadas-competencia.jpg",
        "assets/projects/picadas-precision.jpg",
        "assets/projects/picadas-leyenda.jpg",
        "assets/projects/picadas-entra-y-conduce.jpg",
      ],
    },
    {
      id: "proyecto-video",
      title: "Proyecto de video",
      subtitle: "Reel · videoclip · spot",
      client: "Cliente / marca",
      year: "2026",
      duration: "00:30",
      categories: ["video"],
      role: ["Edición", "Color", "Sonido"],
      tools: [],
      summary: "Contá en dos líneas de qué se trata la pieza, qué problema resolvía y qué aportaste vos.",
      cover: "",
      video: "",
      gallery: [],
    },
    {
      id: "proyecto-motion",
      title: "Proyecto de motion",
      subtitle: "Motion graphics · kinetic type",
      client: "Cliente / marca",
      year: "2026",
      duration: "00:15",
      categories: ["motion"],
      role: ["Dirección de arte", "Animación"],
      tools: [],
      summary: "Describí el concepto visual, la técnica y el resultado.",
      cover: "",
      video: "",
      gallery: [],
    },
    {
      id: "proyecto-presentacion",
      title: "Presentación",
      subtitle: "Pitch deck · keynote",
      client: "Cliente / evento",
      year: "2026",
      duration: "",
      categories: ["presentations"],
      role: ["Narrativa", "Diseño", "Animación"],
      tools: [],
      summary: "Para qué era la presentación y cómo se estructuró la historia.",
      cover: "",
      video: "",
      gallery: [],
      link: "",
    },
    {
      id: "proyecto-web",
      title: "Sitio web",
      subtitle: "Landing · portfolio · UI",
      client: "Cliente / marca",
      year: "2026",
      duration: "",
      categories: ["web"],
      role: ["Diseño UI", "Front-end"],
      tools: [],
      summary: "Objetivo del sitio, decisiones de diseño y tecnologías usadas.",
      cover: "",
      video: "",
      gallery: [],
      link: "",
    },
    {
      id: "proyecto-hyperframes",
      title: "Video en código",
      subtitle: "HyperFrames · render automático",
      client: "Proyecto propio",
      year: "2026",
      duration: "00:15",
      categories: ["hyperframes", "motion"],
      role: ["HyperFrames", "Motion", "Render"],
      tools: [],
      summary: "Qué se automatizó, cuántas versiones salieron del mismo proyecto y cómo se editan.",
      cover: "",
      video: "",
      gallery: [],
    },
  ],
};
