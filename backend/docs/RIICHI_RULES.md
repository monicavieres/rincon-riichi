# Reglas canónicas de Mahjong Riichi

Este es el contrato de dominio de **Rincón Riichi**. Describe mahjong riichi japonés de cuatro jugadores. Su objetivo es mantener consistentes el backend, los ejercicios y el contenido pedagógico.

La referencia internacional es [WRC Rules 2025](https://www.worldriichi.org/wrc-rules). Las diferencias de mesa deben modelarse como opciones explícitas; nunca como condiciones ocultas en una vista.

## 1. Objetivo y condición de victoria

El objetivo de una mano es declarar una forma ganadora que tenga **al menos un yaku** válido.

Formas ganadoras:

1. **Forma regular:** cuatro grupos y una pareja.
2. **Chiitoitsu:** siete parejas distintas.
3. **Kokushi musou:** una copia de cada uno de los 13 terminales/honores y un duplicado de uno de ellos.

Un grupo es:

- **Shuntsu:** secuencia de tres números consecutivos del mismo palo. No existe con honores.
- **Koutsu:** tres fichas idénticas.
- **Kantsu:** cuatro fichas idénticas; para la estructura cuenta como un grupo.

Tener una forma completa no basta si no existe yaku. Dora, ura dora y aka dora agregan han, pero **no son yaku**.

Se gana de dos formas:

- **Tsumo:** la ficha ganadora se roba del muro.
- **Ron:** se reclama el descarte de otro jugador, sujeto a furiten.

## 2. Preparación

- Se usan 136 fichas según [`TILE_SET.md`](./TILE_SET.md).
- Cada lado del muro contiene 17 pilas dobles: 34 fichas.
- Se separan 14 fichas como muro muerto.
- Cada jugador recibe 13 fichas. Este, el dealer, recibe o roba la ficha 14 para iniciar.
- Los asientos siguen el orden Este → Sur → Oeste → Norte.
- La partida estándar recorre las manos de la ronda Este y Sur. Duración, puntos iniciales, uma, oka, tobi y condiciones de alargue pertenecen al perfil competitivo.

## 3. Flujo de un turno

En un turno normal el jugador:

1. roba una ficha del extremo vivo del muro;
2. puede declarar tsumo o una acción legal;
3. descarta una ficha;
4. los demás reciben la oportunidad de reclamar ese descarte.

La mano normalmente alterna entre 13 fichas fuera del turno y 14 antes del descarte. Un kan altera la cantidad física visible, no la estructura de cuatro grupos y pareja.

La prioridad de reclamos es:

1. ron;
2. pon o kan abierto;
3. chii.

Las reglas para ron simultáneo —atamahane, doble ron o triple ron— pertenecen al perfil activo.

## 4. Llamadas y apertura de mano

### Chii

- Reclama el descarte del jugador inmediatamente anterior.
- Forma una secuencia del mismo palo.
- No se puede hacer con honores.

### Pon

- Reclama el descarte de cualquier rival.
- Forma un triplete con dos copias de la mano.

### Kan

- **Daiminkan:** kan abierto reclamando un descarte con tres copias propias.
- **Shouminkan/kakan:** se añade la cuarta copia a un pon abierto existente.
- **Ankan:** cuatro copias se declaran desde la mano cerrada.

Tras un kan legal se roba del rinshan, se repone el muro muerto desde el muro vivo y se habilita un nuevo indicador de kan dora según el perfil. Un shouminkan puede ser robado con chankan. La posibilidad excepcional de robar un ankan con kokushi depende del perfil.

Chii, pon, daiminkan y shouminkan abren la mano. Un ankan no rompe por sí solo el estado cerrado, aunque debe respetar las restricciones de riichi.

## 5. Mano cerrada

Una mano es **menzen** si no contiene grupos abiertos. Ganar por ron no convierte una mano cerrada en abierta para el valor de los yaku; sí influye en el cálculo de fu. Un ankan se muestra, pero sigue siendo cerrado.

## 6. Riichi

Para declarar riichi el jugador debe:

- tener la mano cerrada;
- estar en tenpai;
- pagar una apuesta de 1.000 puntos;
- cumplir las restricciones del perfil sobre saldo y fichas restantes.

Procedimiento: declarar “riichi”, descartar lateralmente la ficha de declaración y colocar el palito de 1.000. Si el descarte completa la mano de un rival, el ron tiene prioridad y la declaración no se completa.

Después de riichi la mano queda bloqueada. El jugador roba y descarta la misma ficha salvo victoria o un ankan permitido que no cambie la interpretación de la espera bajo el reglamento activo.

Consecuencias:

- riichi vale 1 han;
- puede existir ippatsu si se gana dentro de la ventana correspondiente sin una llamada que la interrumpa;
- al ganar se revelan los indicadores ura dora;
- pasar una oportunidad de ron produce furiten de riichi por el resto de la mano.

## 7. Tenpai, espera y furiten

- **Tenpai:** falta exactamente una ficha para completar una forma ganadora.
- **Espera:** conjunto de fichas que completan la forma, aun si alguna de ellas no aporta yaku por sí sola.
- **Noten:** la mano no está en tenpai.

Un jugador está en furiten si se cumple cualquiera de estos casos:

1. **Furiten por descarte:** alguna ficha de su espera actual aparece en sus propios descartes.
2. **Furiten temporal:** dejó pasar una ficha con la que podía declarar ron; dura hasta su siguiente robo propio.
3. **Furiten de riichi:** tras declarar riichi dejó pasar un ron; dura hasta el final de la mano.

Furiten impide **ron sobre todas las fichas de la espera**, no solo sobre la ficha descartada. No impide ganar por tsumo.

Para calcular furiten siempre se recalcula la espera actual; no se usa una espera histórica.

## 8. Dora

La dora es la ficha siguiente al indicador:

- números: 1 → 2 → … → 9 → 1;
- vientos: Este → Sur → Oeste → Norte → Este;
- dragones: blanco → verde → rojo → blanco.

Tipos:

- **Dora visible:** indicada en el muro muerto.
- **Kan dora:** indicadores adicionales habilitados por kan.
- **Ura dora:** indicadores bajo los visibles, contados solo si el ganador declaró riichi.
- **Aka dora:** cincos rojos opcionales.

Cada copia suma 1 han. Una ficha puede sumar por más de una razón, por ejemplo ser aka y además dora indicada.

## 9. Finales de mano

Una mano termina por:

- ron;
- tsumo;
- empate exhaustivo al acabarse el muro vivo;
- empate abortivo permitido por el perfil;
- infracción que obligue a terminarla.

En empate exhaustivo se comprueba tenpai. La práctica habitual reparte un total de 3.000 puntos entre jugadores tenpai y noten; la configuración exacta pertenece al perfil.

Empates abortivos que el perfil puede habilitar:

- kyuushu kyuuhai: nueve tipos distintos de terminales/honores en la primera mano propia;
- suufon renda: cuatro primeros descartes del mismo viento sin llamadas;
- suucha riichi: los cuatro jugadores declaran riichi;
- suukaikan: cuatro kans, con la excepción definida para cuatro kans de un mismo jugador;
- sancha hou: tres jugadores reclaman ron sobre el mismo descarte.

Nagashi mangan es opcional y debe declararse expresamente en el perfil.

## 10. Dealer, ronda y honba

- El dealer es el asiento Este.
- Si el dealer gana, normalmente conserva el dealer y aumenta el honba.
- En empate, la continuidad del dealer depende de su tenpai y del perfil.
- Si el dealer rota, los vientos de asiento avanzan y progresa el contador de mano de la ronda.
- Cada honba agrega normalmente 300 puntos a un ron o 100 de cada rival a un tsumo.
- Las apuestas de riichi acumuladas las recibe el ganador conforme a la regla de ron simultáneo del perfil.

## 11. Han, fu y pagos

### Han

El han proviene de yaku y bonos dora. Primero debe existir al menos un yaku; después se suman dora.

### Fu

Reglas base:

- toda mano parte de 20 fu;
- ron con mano cerrada agrega 10 fu;
- tsumo agrega 2 fu, excepto la forma especial pinfu tsumo;
- parejas de dragón, viento de asiento y viento de ronda dan fu;
- tripletes y kans dan fu según sean simples o terminales/honores y abiertos o cerrados;
- tanki, kanchan y penchan agregan 2 fu;
- chiitoitsu vale 25 fu fijos;
- pinfu tsumo vale 20 fu;
- una mano abierta por ron que quedaría en 20 se trata normalmente como 30 fu;
- salvo 25 fu, el total se redondea hacia arriba a la decena.

### Fórmula base

Para manos sin límite:

`puntos base = fu × 2^(2 + han)`

Cada pago se redondea hacia arriba a la centena:

- no dealer por ron: `4 × base`;
- dealer por ron: `6 × base`;
- no dealer por tsumo: dealer paga `2 × base`, los otros pagan `1 × base`;
- dealer por tsumo: cada rival paga `2 × base`.

### Límites

| Clase | Han/condición habitual | Puntos base |
| --- | --- | ---: |
| Mangan | 5 han, o umbral de fu/han | 2.000 |
| Haneman | 6–7 han | 3.000 |
| Baiman | 8–10 han | 4.000 |
| Sanbaiman | 11–12 han | 6.000 |
| Yakuman | yakuman reconocido | 8.000 |

Kiriage mangan, kazoe yakuman, yakuman dobles y acumulación de yakuman son opciones del perfil.

## 12. Catálogo base de yaku

El valor entre paréntesis es `cerrado/abierto`; “—” significa que exige mano cerrada.

### Un han

- Riichi (1/—)
- Ippatsu (1/—)
- Menzen tsumo (1/—)
- Tanyao (1/1 si kuitan está habilitado)
- Pinfu (1/—)
- Iipeikou (1/—)
- Yakuhai: dragones, viento de asiento o viento de ronda (1/1 por grupo)
- Rinshan kaihou (1/1)
- Chankan (1/1)
- Haitei raoyue (1/1)
- Houtei raoyui (1/1)

### Dos han o valor reducido al abrir

- Double riichi (2/—)
- Chiitoitsu (2/—)
- Sanshoku doujun (2/1)
- Ittsu (2/1)
- Chanta (2/1)
- Toitoi (2/2)
- Sanankou (2/2)
- Sankantsu (2/2)
- Sanshoku doukou (2/2)
- Honroutou (2/2)
- Shousangen (2/2)

### Tres han o más

- Honitsu (3/2)
- Junchan (3/2)
- Ryanpeikou (3/—)
- Chinitsu (6/5)

### Yakuman base

- Kokushi musou
- Suuankou
- Daisangen
- Shousuushii
- Daisuushii
- Tsuuiisou
- Chinroutou
- Ryuuiisou
- Chuuren poutou
- Suukantsu
- Tenhou
- Chiihou

Formas dobles, renhou y yaku locales no se asumen; deben activarse en el perfil.

## 13. Parámetros obligatorios de un perfil

Todo motor debe recibir o resolver un perfil con al menos:

```ts
interface RiichiRuleProfile {
  playerCount: 4;
  startingPoints: number;
  redFives: {
    manzu: 0 | 1 | 2 | 3 | 4;
    pinzu: 0 | 1 | 2 | 3 | 4;
    souzu: 0 | 1 | 2 | 3 | 4;
  };
  openTanyao: boolean;
  multipleRon: 'head-bump' | 'double' | 'triple';
  abortiveDraws: boolean;
  nagashiMangan: boolean;
  kiriageMangan: boolean;
  kazoeYakuman: 'sanbaiman' | 'yakuman';
  doubleYakuman: boolean;
  yakumanStacking: boolean;
  riichiRequiresLiveWallTile: boolean;
  riichiRequiresAtLeast1000Points: boolean;
}
```

El perfil predeterminado debe tener nombre y versión. No se deben mezclar reglas de plataformas distintas en una misma partida.

## 14. Invariantes del backend

1. No se puede ganar sin forma completa y al menos un yaku.
2. Dora nunca satisface el requisito de yaku.
3. Furiten bloquea ron, no tsumo.
4. Un ankan cuenta como grupo cerrado; los demás kans son abiertos.
5. Un kan usa cuatro fichas físicas, roba rinshan y mantiene el muro muerto en 14.
6. La suma de todas las zonas físicas debe ser 136.
7. No puede haber más de cuatro copias de una identidad normalizada.
8. Las esperas y el furiten se calculan usando la forma actual completa, no solo la ficha candidata.
9. La puntuación redondea cada pago al centenar después de aplicar el multiplicador.
10. Penalizaciones, chombo y conducta de torneo pertenecen al reglamento organizativo, no al validador básico de una mano.

## 15. Casos que siempre deben probarse

- forma válida sin yaku: no puede ganar;
- mano con solo dora: no puede ganar;
- espera múltiple con una de sus fichas en descartes propios: furiten para todo ron;
- mismo caso por tsumo: puede ganar;
- `0p` y `5p` cuentan juntos para el límite de cuatro copias;
- kan seguido de rinshan y nuevo indicador;
- chankan sobre shouminkan;
- pinfu tsumo a 20 fu;
- chiitoitsu a 25 fu;
- pareja que es a la vez viento de asiento y de ronda;
- redondeo de pagos de dealer y no dealer;
- ciclos dora de 9 a 1, Norte a Este y rojo a blanco.

## Fuentes

- [WRC Rules 2025 y documentos asociados](https://www.worldriichi.org/wrc-rules)
- [World Riichi Rules Overview](https://www.worldriichi.org/rulesoverview)
- [Riichi Wiki](https://riichi.wiki/)

Última revisión documental: 2026-09-23.
