# El Rincón de Mahjong

Sitio web para aprender Mahjong con estilo tradicional pero moderno.

## Características

- **Home** con bienvenida y 3 secciones principales: Fichas, Yakus, Puntaje
- **Diseño**: Paleta rosa/dorado, femenina, moderna y elegante
- **Animaciones**: Pétalos flotantes, hover 3D en tarjetas, micro-interacciones
- **Accesibilidad**: Respeta `prefers-reduced-motion`, navegación por teclado, ARIA labels
- **Responsive**: Mobile-first, funciona en todos los dispositivos

## Estructura

```
mahjong-rincon/
├── index.html      # Página principal
├── styles.css      # Estilos y animaciones
├── script.js       # Interacciones JavaScript
└── README.md
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

Tu sitio estará en: `https://tu-usuario.github.io/mahjong-rincon/`

## Próximos pasos

- [ ] Implementar sección Fichas (mini-juego de reconocimiento)
- [ ] Implementar sección Yakus (buscador interactivo)
- [ ] Implementar sección Puntaje (calculadora con ejemplos)
- [ ] Añadir modo oscuro automático
- [ ] PWA para instalación móvil