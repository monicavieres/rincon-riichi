# Fuente de verdad del dominio

Esta carpeta contiene las reglas que debe respetar cualquier backend, generador de ejercicios, validador de manos o vista de **Rincón Riichi**.

## Documentos canónicos

1. [`RIICHI_RULES.md`](./RIICHI_RULES.md): flujo de una partida, manos válidas, llamadas, riichi, furiten, dora, finales y puntuación.
2. [`TILE_SET.md`](./TILE_SET.md): inventario físico de fichas, códigos internos, cantidades, categorías y restricciones.

## Precedencia

Cuando dos fuentes discrepen, se aplica este orden:

1. Perfil de reglas explícito del ejercicio o partida.
2. Estos documentos.
3. WRC Rules 2025 y sus aclaraciones.
4. Contenido pedagógico o ilustraciones de la interfaz.

Una imagen nunca modifica las reglas del motor. Por ejemplo, un dibujo aproximado del muro no cambia que el set de cuatro jugadores tenga 136 fichas y 17 pilas dobles por lado.

## Perfil base del proyecto

- Mahjong riichi japonés de **cuatro jugadores**.
- Referencia internacional: **WRC Rules 2025**.
- Los detalles que varían entre mesas deben vivir en un perfil de reglas y no quedar dispersos en componentes.
- Los tres aka dora (`0m`, `0p`, `0s`) están disponibles para ejercicios. Cada uno reemplaza un cinco normal cuando el perfil los habilita.
- Sanma, flores, comodines y reglas locales quedan fuera del perfil base.

## Regla para el código nuevo

Toda implementación de dominio debe enlazar en su comentario o documentación al apartado correspondiente de esta carpeta. Si se agrega una variante, primero se documenta aquí y luego se implementa como una opción explícita.

## Referencias externas

- [WRC Rules 2025](https://www.worldriichi.org/wrc-rules)
- [Descripción del estándar WRC](https://www.worldriichi.org/rulesoverview)
- [Riichi Wiki](https://riichi.wiki/)

Última revisión documental: 2026-09-23.
