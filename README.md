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

## Arquitectura

La interfaz está construida con React + TypeScript y usa una organización **screaming architecture**: al abrir `src/` se ven primero las capacidades del producto, no los detalles técnicos.

```
rincon-riichi/
├── src/
│   ├── app/                    # Bootstrap y composición de la aplicación
│   ├── features/
│   │   ├── home/               # Portada y catálogo de módulos
│   │   ├── learn/              # Tutoriales y referencias
│   │   ├── practice/           # Ejercicios y quizzes
│   │   └── resources/          # Fuentes y enlaces
│   └── shared/                 # UI reutilizable sin conocimiento del dominio
├── aprender/                   # Entradas multipágina de Vite
├── practicar/                  # Entradas multipágina de Vite
├── recursos/                   # Entradas multipágina de Vite
├── legacy-pages/               # Copia de seguridad del HTML anterior
├── backend/docs/               # Reglas canónicas e inventario del dominio
├── assets/                     # Chibis, fichas y mesa
├── data/                       # Datos heredados durante la migración
├── js/                         # Adaptadores de motores heredados
└── tools/                      # Scripts de migración y assets
```

La fuente de verdad para reglas, validadores y generadores está en [`backend/docs/`](./backend/docs/README.md). Las vistas y las ilustraciones no deben redefinir el dominio.

## Desarrollo local

```bash
npm install
npm run dev
```

Luego abre `http://127.0.0.1:8765`.

Validaciones disponibles:

```bash
npm run typecheck
npm run build
```

## Despliegue en GitHub Pages

Publica el contenido generado por `npm run build` desde `dist/`.

Tu sitio estará en: `https://tu-usuario.github.io/rincon-riichi/`

## Próximos pasos

- [ ] Mejorar motor de manos para yaku, esperas y validación de victoria
- [ ] Guardar progreso local por concepto
- [ ] Añadir más lecciones cortas en Aprender
