# NEXORA — Showreel 16:9 · SPEC

GOAL:    En 34 s el espectador entiende que NEXORA es un estudio de diseño y motion con trabajo real
         (Picadas Argentinas, el sitio NEXORA, la presentación 9:16) y se lleva los tres contactos.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, MP4 H.264 + AAC.
BASE:    el video vertical original (1080x1920, 34 s). Se conserva su estructura y su lenguaje:
         marco HUD + REC, logo NEXORA con decodificado y encendido rojo, "CREATIVITY IN MOTION",
         "01 — STUDIO", "SELECTED WORK", "SERVICES · FIVE DISCIPLINES · ONE TIMELINE",
         "LET'S WORK TOGETHER" con tarjetas de contacto, cierre "IDEAS INTO VISUAL EXPERIENCES."
TIME:    34 s x 30 = 1020 frames. Música: la pista del original, 120 BPM (15 frames por tiempo,
         60 por compás), desplazada -1.0 s => compases en segundos impares.
         Drop 3.0 · hats densos 9.0 · breakdown 21.0 (golpe 24.0) · retorno 25.0 · salida 31.0 ·
         cola con eco a tempo (500/1000 ms) hasta 34.0. -14 LUFS, pico -4.9 dBFS.

LOOK:    fondo #050505 con neblina roja radial (rgba 255,43,43 de 0.10 a 0.55 según escena),
         grilla 64 px al 3.5 %, polvo determinístico en 3 capas de profundidad (7 % rojo),
         grano 6 %, viñeta 38 % en bordes.
         Tinta #f4f3ef, secundaria #c9c8c3, apagado #8b8a86, acento #ff2b2b (rojo profundo #c8101e).
         Rojo sólo en: logo, una palabra por titular, índices, barras de tarjetas, cabezal de timeline.
         Display: Archivo 900, ancho 125 %, MAYÚSCULAS, interlineado 0.9, tracking -1 %, 120–230 px.
         Cuerpo: Archivo 300–800 ancho 100 %, 34–46 px. Etiquetas: JetBrains Mono 20–30 px, tracking 0.32–0.6 em.
         Profundidad: sombras 0 40 120 rgba(0,0,0,.6); glow del logo 0 0 34 px rgba(255,43,43,.5),
         destello 0 0 90 px en el impacto.

OBJECTS: logo NEXORA (tipográfico, como en el sitio); reproductor 16:9 con barra "MOTION DESIGN · 00:12"
         (la tarjeta del sitio); muro de key visuals de Picadas; ventana de navegador oscura con el sitio real;
         teléfono con el sitio móvil real; cuadro vertical 9:16 con la presentación original;
         panel de demo por servicio con los motivos del sitio (timeline, arcos+curva, grilla de slides,
         wireframe web, </> + frames); tarjetas de contacto con glifos oficiales (Simple Icons, CC0).

MOTION:  entradas expo.out 0.45–0.6 s; cámara power2.inOut / sine.inOut; salidas y zooms power3.in,
         40–50 % más cortas que la entrada. Stagger: letras 0.05–0.07 s, palabras/líneas 0.1–0.12 s,
         ítems 0.05 s. Desenfoque de movimiento: 8–16 px en el frame más rápido de cada whip/zoom.
         Golpes musicales = tl.set de 0 ms. Títulos quietos una vez aterrizados; se mueve el mundo (paralaje).

SHOTS:
  1 INTRO        0.0–3.0  HUD se dibuja; NEXORA en contorno se decodifica letra a letra (0.12–0.85);
                          1.0 golpe: se enciende rojo + destello + barrido de luz; tagline decodifica 1.15–1.85;
                          2.5–3.0 zoom a través del logo (x9, power3.in, blur 14 px) => corte en el drop.
  2 PRESENTACIÓN 3.0–8.0  "BIENVENIDO A / NEXORA, / TU MUNDO / A EDITAR." (titular del sitio) con máscaras;
                          rol tipo tragamonedas aterriza en "Editor de video" a 4.5; 5.0 cámara "scroll" vertical
                          a "Cada frame con intención." + 3 pilares (5.85/6.2/6.55); 7.6 whip izquierda.
  3 PORTFOLIO    8.0–20.0 "SELECTED WORK" => el marco crece y se vuelve el reproductor (9.0);
                          01 Picadas reel: montaje a tempo 9.0–13.0 (PICADAS, CARRERA, COMPETENCIA, PRECISIÓN, LEYENDA);
                          02 Key visuals: muro de 6 stills en paralaje opuesto 13.0–15.0;
                          03 Sitio NEXORA: navegador con scroll real + móvil 15.0–18.5;
                          04 Presentación 9:16 18.5–20.0 => crece y atraviesa el cuadro.
  4 SERVICIOS    20.0–25.0 una timeline con cabezal rojo; cada segundo una disciplina con demo propia;
                          HYPERFRAMES cae en el golpe de 24.0; salida con desenfoque 24.6.
  5 CONTACTO     25.0–30.0 retorno del beat: "LET'S WORK / TOGETHER"; tarjetas a 25.35/25.85/26.35;
                          lectura quieta 27–29.5; barrido de luz por tarjeta 27.0/27.15/27.3.
  6 CIERRE       30.0–34.0 línea roja + NEXORA sube desde la línea; 31.0 impacto (corte de la música):
                          destello, barrido, esquinas HUD vuelven; tagline 31.15–31.9; 33.0 salida:
                          letras se comprimen en la línea, la línea se vuelve el punto rojo del favicon, negro a 34.0.

BANNED:  trabajos inventados (los 5 proyectos "espacio de ejemplo" de projects.js NO aparecen);
         URL inventada en el navegador; fades + slide-up genéricos en todo; títulos que siguen moviéndose;
         loops de respiración/pulso; tres tarjetas en fila; logo en una esquina; efectos de sonido extra;
         glitch RGB; lens flares; texto de lectura < 28 px.
QA:      0.9 (contorno), 1.1 (encendido), 2.9 (zoom), 4.6 (titular completo), 6.8 (pilares), 8.5 (marco),
         10.6 (CARRERA), 14.0 (muro), 16.5 y 18.0 (web), 19.2 (9:16), 20.5/21.5/22.5/23.5/24.3 (servicios),
         27.5 (contactos legibles), 31.6 (logo final), 33.85 (punto rojo).
