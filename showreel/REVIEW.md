# REVIEW — NEXORA showreel 16:9

## Decisiones creativas
- Base: el video vertical original (34 s). Se conservaron su estructura y sus piezas: marco HUD + REC,
  logo con decodificado y encendido rojo, "CREATIVITY IN MOTION", "01 — STUDIO", "SELECTED WORK",
  "SERVICES · FIVE DISCIPLINES · ONE TIMELINE", "LET'S WORK TOGETHER" con tarjetas, cierre
  "IDEAS INTO VISUAL EXPERIENCES.". Se reacomodó todo a 16:9 y se rehízo el ritmo.
- Música: la pista del original (120 BPM), corrida 1 s para que el drop caiga en 3.0 s y el retorno
  del beat en 25.0 s, que son los cortes pedidos. Cola con eco a tempo para llegar a 34 s. Sin SFX extra.
- Portfolio sólo con trabajo real del repositorio: reel de Picadas Argentinas, sus 6 key visuals,
  el sitio NEXORA (capturas reales escritorio + móvil) y un fragmento de la presentación 9:16 original.
  Los 5 proyectos "espacio de ejemplo" de `js/projects.js` no aparecen.
- Servicios: cada disciplina tiene una demo animada construida con los motivos que el sitio ya usa en
  sus portadas de servicios (timeline, arcos + curva, grilla de slides, wireframe web, `</>` + frames).
- Contacto: glifos oficiales de Simple Icons (CC0) para Instagram, WhatsApp y Gmail.

## Medido / mirado
- `hyperframes check`: ok. Advertencias que quedan a propósito:
  - `text_below_floor`: etiquetas mono de 17–22 px (lenguaje HUD del original; no son texto de lectura).
  - `line_unread` en el rodillo de roles (efecto tragamonedas) y en las etiquetas/código de servicios
    (cada disciplina dura 1 s, el título grande es la lectura).
  - `nested_media_start_basis_ambiguous`: los `data-start` de video son locales a su escena, como corresponde.
- Audio: medido (-14 LUFS integrado, pico -4.9 dBFS), no escuchado.

## Más débil / con más tiempo
- La pieza 9:16 dura 1.6 s: alcanza para leer el formato, no para recorrerla.
- Con material de presentaciones reales (decks) el bloque Presentaciones podría mostrar un caso propio.
