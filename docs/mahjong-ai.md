# IA de mahjong en el backend

Este documento resume las opciones evaluadas para que Rincón Riichi tenga una IA que juegue mahjong riichi
(sugerir descartes, explicar eficiencia, decidir llamadas y riichi, rivales simples), el plan elegido y cómo
conectar más adelante una IA más fuerte (Mortal) sin cambiar el frontend.

## Resumen

- **Hoy:** un motor propio de eficiencia (shanten + ukeire) en JavaScript, sin dependencias, en
  `backend/mahjong-ai/`, expuesto como función serverless de Vercel en `POST /api/mahjong/advise`.
- **Mañana:** el mismo endpoint puede delegar en Mortal (u otro bot mjai) que corra como **servicio aparte**,
  mediante el adaptador `mortal` (`backend/mahjong-ai/engines.js`). El frontend no cambia.

## Opciones evaluadas

| Opción | Qué es | Licencia | Qué necesita para correr | ¿Vercel serverless? |
| --- | --- | --- | --- | --- |
| **Mortal** ([Equim-chan/Mortal](https://github.com/Equim-chan/Mortal)) | IA de nivel muy alto (red neuronal, aprendizaje por refuerzo). Habla el protocolo mjai. | AGPL-3.0-or-later | Rust (`libriichi`) + Python + PyTorch. La inferencia va bien en CPU; la GPU solo hace falta para entrenar. **Los pesos entrenados oficiales no se publican**: el autor dijo que no planea liberarlos y que el servicio en línea ya cumple ese papel. Hay checkpoints de terceros en Hugging Face, con licencia y procedencia a revisar caso por caso. | **No.** PyTorch solo ya ocupa cientos de MB (el límite de una función es de unos 250 MB descomprimida), el arranque en frío sería lento y hacen falta los pesos. Tiene que ir como servicio aparte (Docker en Cloud Run, Fly.io, Render…). |
| **mjai-reviewer** ([Equim-chan/mjai-reviewer](https://github.com/Equim-chan/mjai-reviewer), [mjai.ekyu.moe](https://mjai.ekyu.moe/)) | Herramienta que **revisa partidas ya jugadas** (logs de Tenhou/Mahjong Soul) con Mortal o akochan y genera un informe. | Apache-2.0 (el código del revisor; los motores tienen su propia licencia) | Rust + un motor (Mortal con pesos o akochan). | **No**, y además no es una API de decisión en tiempo real: sirve para "análisis post partida", no para un rival en vivo. El sitio público no ofrece una API documentada para integrarlo. |
| **Protocolo mjai** ([gimite/mjai](https://github.com/gimite/mjai), variante usada por Mortal) | Protocolo JSON de eventos (`start_kyoku`, `tsumo`, `dahai`, `pon`, `reach`, `hora`…). El bot responde con su acción. | Protocolo abierto (implementación original en Ruby, BSD) | Nada en sí mismo: es el "idioma" común entre servidores y bots. | Sí: la traducción es puro JS y ya está en `backend/mahjong-ai/mjai.js`. |
| **akochan** ([critter-mj/akochan](https://github.com/critter-mj/akochan)) | IA fuerte basada en búsqueda y evaluación de jugadas (no es una red neuronal grande). Habla mjai. | **Licencia propia, no libre** (利用規約): uso libre solo para investigación privada; publicar sus resultados solo sin fines de lucro y con crédito; cualquier otro uso requiere permiso del autor; prohíbe redistribuir versiones modificadas de la parte de IA. | C++ (Boost), compilación nativa; ficheros de parámetros incluidos en el repo. CPU. | **No** recomendable: binario nativo pesado y, sobre todo, la licencia no encaja con un sitio público sin permiso expreso. |
| **Motor propio de eficiencia** (shanten / ukeire) | Calcula a cuántas fichas está la mano de tenpai (shanten), cuántas fichas la mejoran (ukeire) y elige el descarte que más acepta. | El del proyecto | JS puro, sin dependencias, milisegundos por consulta. | **Sí.** Es lo implementado. |

Notas sobre AGPL (Mortal): si se modifica Mortal y se ofrece a usuarios por red, hay que poner el código fuente
de esa versión a su disposición. Mantenerlo como **servicio separado** que solo recibe eventos mjai aísla esa
obligación al servicio y no afecta al código del sitio. Antes de usar pesos de terceros hay que comprobar su
licencia y que se puedan usar en público.

## Plan elegido y por qué

1. **Primera versión: motor de eficiencia propio.** Es lo que de verdad necesitan los tutoriales y minijuegos
   para principiantes: explicar *por qué* un descarte es mejor (fichas que acepta, forma de la espera, fichas
   aisladas, dora, yakuhai). Una red neuronal elige bien pero no explica. Además corre en Vercel sin servicios
   extra, es determinista (los tests pueden fijar la respuesta esperada) y no tiene problemas de licencia.
2. **Interfaz de adaptadores** (`MahjongEngine` en `backend/mahjong-ai/engines.js`): cada motor implementa
   `advise(state)` y opcionalmente `adviseCall(state)`. El endpoint elige el motor con el campo `engine`.
3. **Más adelante: Mortal como servicio aparte** para un "rival fuerte" o un modo de revisión. Ver
   [Conectar Mortal](#conectar-mortal-u-otro-bot-mjai).

## El motor de eficiencia

Código en `backend/mahjong-ai/`:

- `tiles.js`: códigos de ficha del sitio (ver [`backend/docs/TILE_SET.md`](../backend/docs/TILE_SET.md)),
  conversión a un arreglo de 34 conteos, forma compacta `"123m406p55z"`, dora a partir del indicador.
- `shanten.js`: shanten de la forma normal (4 grupos + pareja), siete parejas y trece huérfanos. Admite manos
  abiertas (cada llamada fija un grupo y la mano oculta tiene 3 fichas menos; siete parejas y kokushi no aplican).
- `efficiency.js`: `advise` (descarte, riichi, tsumo) y `adviseCall` (pon, chi, kan, ron).
- `mjai.js`: traducción de fichas y eventos al protocolo mjai.
- `engines.js`: registro de motores y adaptador HTTP para Mortal.
- `http.js`: manejo de la petición, compartido entre la función de Vercel y el servidor de desarrollo de Vite.

Cómo decide un descarte:

1. Para cada descarte distinto calcula el shanten resultante y el **ukeire**: qué fichas bajarían el shanten y
   cuántas copias quedan sin ver (se descuentan la mano, las llamadas, los descartes visibles y los indicadores de dora).
2. Ordena por menor shanten, luego por mayor ukeire.
3. Desempata con un "valor de conservar": se descartan antes los vientos que no dan yaku, luego terminales,
   y se conservan dora, cincos rojos y parejas de yakuhai.

Llamadas (heurística pensada para enseñar): pon de yakuhai si no hace la mano más lenta; pon/chi para tanyao
solo si la mano queda toda de simples y mejora; en otro caso, mantener la mano cerrada. Los kan se informan pero
no se recomiendan. Ron si la ficha completa la mano y no hay furiten (según `ownDiscards`).

Limitaciones conocidas (para iteraciones siguientes): no lee a los rivales (sin defensa ni betaori), no
verifica yaku en manos abiertas (eso corresponde al motor de yaku), no mira la calidad de la espera más allá del
número de fichas, ni la eficiencia a dos pasos. La regla de *kuikae* solo impide descartar la misma ficha llamada.

## API

`POST /api/mahjong/advise` (en desarrollo lo sirve Vite; en producción, la función `api/mahjong/advise.js`).
`GET` en la misma ruta devuelve los motores disponibles y un ejemplo.

### Pedir un descarte

```json
{
  "hand": ["1m", "2m", "3m", "4p", "5p", "6p", "3s", "4s", "5s", "1z", "1z", "6z", "6z", "9p"],
  "melds": [],
  "discards": { "self": ["9m"], "right": ["1p"], "across": [], "left": ["7z"] },
  "doraIndicators": ["3p"],
  "seatWind": "E",
  "roundWind": "E",
  "points": 25000,
  "wallRemaining": 60
}
```

Solo `hand` es obligatorio. `hand` puede ser un arreglo o un texto compacto (`"123m456p345s1166z9p"`).
`discards` puede ser un arreglo plano o un objeto por jugador. Con 13 fichas (o 13 − 3 por llamada) devuelve
las fichas que mejoran la mano (las esperas si está tenpai), con 14 devuelve el descarte.

Respuesta (resumida):

```json
{
  "version": 1,
  "engine": "efficiency",
  "action": "discard",
  "shanten": 0,
  "tenpai": true,
  "recommended": {
    "discard": "9p",
    "shanten": 0,
    "ukeire": { "tiles": [{ "tile": "1z", "remaining": 2 }, { "tile": "6z", "remaining": 2 }], "total": 4, "kinds": 2 },
    "reasons": [{ "code": "max_acceptance", "tiles": 4 }, { "code": "tenpai", "waits": ["1z", "6z"] }, { "code": "isolated" }]
  },
  "riichi": { "possible": true, "recommended": true, "reason": "tenpai_closed" },
  "candidates": [ "… todos los descartes ordenados, con el mismo formato …" ]
}
```

`action` puede ser `discard`, `tsumo` (la mano ya está completa) o `wait` (mano de 13 fichas).
En una mano de 14 fichas, `shanten` es el que queda **después** del mejor descarte (convención habitual).

### Pedir una llamada

Se añade `tile` (la ficha descartada por otro) y `from` (`left`, `across`, `right`; el chi solo es posible desde
`left`), con la mano de 13 fichas:

```json
{ "hand": "77z139m468p2479s5z", "tile": "7z", "from": "across" }
```

Devuelve `action` (`pon`, `chi`, `kan`, `ron` o `pass`), la llamada recomendada y todas las opciones con el
shanten tras la llamada y el descarte que vendría después.

### Textos para el usuario

La API devuelve **códigos** (`reasons[].code`, `riichi.reason`, `options[].reason`) y códigos de ficha, nunca
frases. El frontend los convierte en texto en es/en/pt usando los nombres de ficha de
`src/features/learn/domain/tilesCopy.ts` ("el nueve de círculos", no "9p"). Códigos actuales:

| Código | Significado |
| --- | --- |
| `max_acceptance` | Es el descarte que deja más fichas útiles. |
| `tenpai` | Con este descarte la mano queda a una ficha de ganar (`waits`). |
| `complete` | La mano ya está completa. |
| `breaks_shape` | Este descarte aleja la mano de tenpai. |
| `isolated` | La ficha no conecta con ninguna otra. |
| `guest_wind` | Viento que no da yaku en esta posición. |
| `yakuhai` | Honor que da yaku (`paired`: si ya hay pareja). |
| `dora` | La ficha es dora o cinco rojo (`value`). |
| `tenpai_closed`, `few_waits_but_riichi_gives_yaku`, `open_hand`, `not_tenpai`, `not_enough_points`, `wall_too_short`, `no_live_waits` | Consejo de riichi. |
| `yakuhai_pon`, `tanyao`, `already_has_yaku`, `no_improvement`, `no_yaku_after_call`, `yaku_depends_on_yakuhai_pair`, `kan_not_recommended`, `furiten` | Consejo de llamadas. |

### Enrutado en Vercel

`vercel.json` reescribe `/api/:path*` hacia el API externo de Render. En Vercel las reescrituras se aplican
después de comprobar el sistema de archivos, así que `api/mahjong/advise.js` (una función) responde primero y el
resto de `/api/*` sigue yendo a Render. En desarrollo, un pequeño plugin en `vite.config.ts` sirve
`/api/mahjong/advise` antes del proxy.

## Conectar Mortal (u otro bot mjai)

1. **Servicio aparte.** Montar un contenedor con Mortal (Rust + Python + PyTorch CPU) y unos pesos cuya
   licencia permita el uso público. Exponer un endpoint HTTP que reciba `{ "events": [...] }` (eventos mjai),
   los pase al bot en orden y devuelva la reacción al último evento, por ejemplo
   `{ "type": "dahai", "actor": 0, "pai": "C", "tsumogiri": false }`.
2. **Configurar Vercel** (variables de entorno, sin tocar código): `MORTAL_ENGINE_URL` y, si el servicio exige
   token, `MORTAL_ENGINE_TOKEN` (se envía como `Authorization: Bearer`).
3. **Usarlo** con `"engine": "mortal"` en la petición. La respuesta tiene el mismo formato; `recommended.discard`
   viene de Mortal y se mantiene el análisis de shanten/ukeire del motor propio para poder explicar la jugada.
   La reacción cruda va en `mjai`.

### Traducción de fichas al protocolo mjai

| Sitio | mjai |
| --- | --- |
| `1m`–`9m`, `1p`–`9p`, `1s`–`9s` | igual |
| `0m`, `0p`, `0s` (cincos rojos) | `5mr`, `5pr`, `5sr` |
| `1z` `2z` `3z` `4z` (Este, Sur, Oeste, Norte) | `E` `S` `W` `N` |
| `5z` `6z` `7z` (dragón blanco, verde, rojo) | `P` `F` `C` |
| ficha oculta | `?` |

`buildMjaiEvents` genera `start_game`, `start_kyoku` (con `bakaze`, `oya` calculado desde el viento de asiento,
`dora_marker`, manos rivales como `?`), un evento `dora` por indicador extra y el `tsumo` de la ficha robada.
El jugador del sitio es siempre el `actor` 0. Hoy el adaptador solo admite manos cerradas de 14 fichas y no
reproduce los descartes rivales (el estado del sitio no tiene orden de turnos); para un rival de verdad, el
minijuego debería llevar el registro completo de la partida en eventos mjai y enviarlo entero.

Para añadir otro motor: implementar `MahjongEngine` y llamar a `registerEngine('id', motor)` en `engines.js`.

## Tests

```bash
npm test
```

Cubren valores de shanten conocidos (mano completa, tenpai, nueve puertas, siete parejas, kokushi de 13 esperas,
manos abiertas), esperas, elecciones de descarte típicas (espera de dos lados frente a espera simple, viento
invitado antes que terminal, conservar dora y cinco rojo), ukeire con fichas visibles, riichi, llamadas
(pon de dragón, no pon de viento invitado, chi para tanyao solo desde la izquierda, ron y furiten), traducción
mjai, el adaptador de Mortal con un servicio simulado y la función de Vercel. Además comparan el motor con un
verificador de manos independiente sobre cientos de manos aleatorias.
