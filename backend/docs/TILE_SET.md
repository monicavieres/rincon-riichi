# Set de fichas de Mahjong Riichi

Este documento define el inventario físico y la codificación técnica del set usado por el dominio.

## Resumen

Una partida estándar de cuatro jugadores usa **136 fichas físicas**:

| Familia | Identidades | Copias por identidad | Total |
| --- | ---: | ---: | ---: |
| Manzu (caracteres) | 9 | 4 | 36 |
| Pinzu (círculos) | 9 | 4 | 36 |
| Souzu (bambúes) | 9 | 4 | 36 |
| Vientos | 4 | 4 | 16 |
| Dragones | 3 | 4 | 12 |
| **Total** | **34** | **4** | **136** |

No se usan flores, estaciones, jokers ni comodines.

## Codificación

El código es `<rango><familia>`:

- `m`: manzu.
- `p`: pinzu.
- `s`: souzu.
- `z`: honores.
- `0m`, `0p` y `0s`: cinco rojo de la familia correspondiente.

Los códigos rojos son variantes físicas del rango 5. Para forma, esperas, secuencias y multiplicidad, `0m` equivale a `5m`, `0p` a `5p` y `0s` a `5s`. Solo conservan una marca adicional de aka dora.

## Inventario completo

| Código | Nombre en español | Categoría | Cantidad sin aka | Cantidad con 1 aka por palo |
| --- | --- | --- | ---: | ---: |
| `1m` | Uno de manzu | Terminal | 4 | 4 |
| `2m` | Dos de manzu | Simple | 4 | 4 |
| `3m` | Tres de manzu | Simple | 4 | 4 |
| `4m` | Cuatro de manzu | Simple | 4 | 4 |
| `5m` | Cinco de manzu | Simple | 4 | 3 |
| `0m` | Cinco rojo de manzu | Simple, aka | 0 | 1 |
| `6m` | Seis de manzu | Simple | 4 | 4 |
| `7m` | Siete de manzu | Simple | 4 | 4 |
| `8m` | Ocho de manzu | Simple | 4 | 4 |
| `9m` | Nueve de manzu | Terminal | 4 | 4 |
| `1p` | Uno de pinzu | Terminal | 4 | 4 |
| `2p` | Dos de pinzu | Simple | 4 | 4 |
| `3p` | Tres de pinzu | Simple | 4 | 4 |
| `4p` | Cuatro de pinzu | Simple | 4 | 4 |
| `5p` | Cinco de pinzu | Simple | 4 | 3 |
| `0p` | Cinco rojo de pinzu | Simple, aka | 0 | 1 |
| `6p` | Seis de pinzu | Simple | 4 | 4 |
| `7p` | Siete de pinzu | Simple | 4 | 4 |
| `8p` | Ocho de pinzu | Simple | 4 | 4 |
| `9p` | Nueve de pinzu | Terminal | 4 | 4 |
| `1s` | Uno de souzu | Terminal | 4 | 4 |
| `2s` | Dos de souzu | Simple | 4 | 4 |
| `3s` | Tres de souzu | Simple | 4 | 4 |
| `4s` | Cuatro de souzu | Simple | 4 | 4 |
| `5s` | Cinco de souzu | Simple | 4 | 3 |
| `0s` | Cinco rojo de souzu | Simple, aka | 0 | 1 |
| `6s` | Seis de souzu | Simple | 4 | 4 |
| `7s` | Siete de souzu | Simple | 4 | 4 |
| `8s` | Ocho de souzu | Simple | 4 | 4 |
| `9s` | Nueve de souzu | Terminal | 4 | 4 |
| `1z` | Este | Viento, honor | 4 | 4 |
| `2z` | Sur | Viento, honor | 4 | 4 |
| `3z` | Oeste | Viento, honor | 4 | 4 |
| `4z` | Norte | Viento, honor | 4 | 4 |
| `5z` | Dragón blanco | Dragón, honor | 4 | 4 |
| `6z` | Dragón verde | Dragón, honor | 4 | 4 |
| `7z` | Dragón rojo | Dragón, honor | 4 | 4 |

Por eso existen **37 códigos gráficos** (34 identidades más tres variantes aka), pero nunca 148 fichas. Con tres aka sigue habiendo 136: `3 × cinco normal + 1 × cinco rojo` en cada palo.

## Categorías derivadas

- **Simples:** rangos 2–8 de manzu, pinzu y souzu.
- **Terminales:** rangos 1 y 9 de los tres palos.
- **Honores:** los cuatro vientos y los tres dragones.
- **Yaochuuhai:** terminales u honores.
- **Fichas de valor:** dragones, viento de asiento y viento de ronda; una misma pareja o grupo puede ser viento de asiento y de ronda a la vez.

Los honores no forman secuencias. Solo pueden formar pareja, pon o kan.

## Ciclos de indicadores dora

- Palos: `1 → 2 → … → 9 → 1`.
- Vientos: Este `1z` → Sur `2z` → Oeste `3z` → Norte `4z` → Este.
- Dragones: blanco `5z` → verde `6z` → rojo `7z` → blanco.
- Un indicador de cinco normal o rojo señala el seis. El color rojo no altera el ciclo.

## Distribución física

- Cada jugador comienza normalmente con 13 fichas; el dealer comienza su primer turno con 14.
- El muro completo se arma con cuatro lados de **17 pilas de dos fichas**, es decir, 34 fichas por lado.
- El muro muerto contiene siempre 14 fichas.
- Al declarar un kan se roba una ficha de reemplazo del rinshan y una ficha del extremo vivo pasa a mantener el muro muerto en 14.

## Invariantes para validación

1. La suma de muro vivo, muro muerto, manos, melds y descartes debe corresponder a las 136 fichas físicas.
2. Nunca puede haber más de cuatro copias físicas de una identidad normalizada.
3. Para el rango cinco: `count(5x) + count(0x) <= 4` para `x ∈ {m,p,s}`.
4. Un kan consume cuatro copias físicas, aunque cuenta como un único grupo en la forma `4 grupos + 1 par`.
5. El backend compara forma con el código normalizado, pero conserva `isRed` para calcular aka dora.
6. Los assets visuales oficiales del proyecto están en `assets/tiles-fluffystuff-normalized/`; el nombre de archivo coincide con el código.

## Modelo recomendado

```ts
type NumberSuit = 'm' | 'p' | 's';
type HonorSuit = 'z';

interface Tile {
  suit: NumberSuit | HonorSuit;
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  isRed: boolean;
}
```

Para honores solo son válidos los rangos 1–7. `isRed` solo puede ser `true` para rango 5 y palo numerado.
