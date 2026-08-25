# Rincón Riichi

Sitio web para aprender y practicar conceptos de mahjong riichi con enfoque visual, ejercicios cortos y guía chibi.

## Características

- **Home** orientada a aprender y practicar, no a jugar partidas completas
- **Aprender**: fichas, tutorial paso a paso, tipos de espera, guía de yakus, dora, eficiencia, defensa y reglas especiales
- **Practicar**: yaku, esperas, fu, han, puntajes, valores, furiten y reconocimiento de fichas
- **Recursos**: fuentes y créditos, comunidades, sitios para jugar y bibliotecas
- **Idiomas**: selector ES / EN / PT
- **Fichas**: set visual basado en tiles de dominio público
- **Diseño**: responsive, tema claro/oscuro, botones coloridos y chibis
- **Accesibilidad**: respeta `prefers-reduced-motion`, navegación por teclado, ARIA labels

## Estructura

```
rincon-riichi/
├── index.html        # Página principal
├── aprender/         # Módulos de aprendizaje (machi, yaku, dora, tutorial, …)
├── practicar/        # Módulos de práctica (waits, fu, han, calc, …)
├── recursos/         # Fuentes, comunidades, jugar, bibliotecas
├── css/              # Estilos por módulo + shared
├── js/               # Lógica por módulo + shared (menu, tutorial, …)
├── data/             # Datos de referencia (yaku-data, dora-data, …)
├── assets/           # Chibis, fichas y mesa
└── tools/            # Scripts de build / reorganización
```

## Desarrollo local

```bash
# Opción 1: Python
python3 -m http.server 8000

# Opción 2: Node.js (npx serve)
npx serve .

# Opción 3: VS Code Live Server
# Click derecho en index.html > "Open with Live Server"
```

Luego abre `http://localhost:8000`

## Despliegue en GitHub Pages

1. Sube el repo a GitHub
2. Ve a **Settings > Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / **root**
5. Save

Tu sitio estará en: `https://tu-usuario.github.io/rincon-riichi/`

## Próximos pasos

- [ ] Mejorar motor de manos para yaku, esperas y validación de victoria
- [ ] Guardar progreso local por concepto
- [ ] Añadir más lecciones cortas en Aprender
