#!/usr/bin/env python3
"""Front-facing kitten avatars (one per fur and expression, dressed per theme) for the tutorial slides.
Writes assets/illustrations/cats/<theme>-<fur>.svg (default face) and <theme>-<fur>-<expr>.svg."""
import pathlib, sys
HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
from kitten import sprite, sprite_side, EXPRS  # noqa: E402

OUTFITS = {
    "light": ["#e0457f", "#55bdeb", "#7b5cc4", "#f2b42c"], "dark": ["#ff2d95", "#00e5ff", "#9d4edd", "#ffd400"],
    "cute": ["#ff9ec7", "#b18cff", "#7fd6bf", "#ffd36e"], "samurai": ["#2f4670", "#8a1f2a", "#3d2b22", "#5b6b3a"],
    "cyberpunk": ["#fcee0a", "#ff2a6d", "#00f0ff", "#b967ff"], "vaquero": ["#8b3a1f", "#3b5b7a", "#c98a4b", "#5a4632"],
    "frutiger": ["#5aa9ff", "#7ed957", "#ff6fa5", "#ffd93d"], "fox": ["#d9531e", "#2f5d46", "#f0b347", "#7a3510"],
}
DEFAULT = {"white": "happy", "orange": "smile", "grey": "calm", "black": "calm"}
OUT = HERE.parents[1] / "assets" / "illustrations" / "cats"; OUT.mkdir(parents=True, exist_ok=True)
ORDER = ["white", "orange", "grey", "black"]  # you, right, across, left
for theme, outfits in OUTFITS.items():
    for i, fur in enumerate(ORDER):
        outfit = outfits[[3, 0, 1, 2][i]]
        for expr in [None] + EXPRS:
            body = sprite(theme, fur, outfit, expr or DEFAULT[fur], False, f"a{theme}{fur}{expr}")
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-104 -252 208 260">{body}</svg>'
            (OUT / (f"{theme}-{fur}.svg" if expr is None else f"{theme}-{fur}-{expr}.svg")).write_text(svg, encoding="utf8")
        for expr in ("calm", "happy", "excited"):  # three-quarter view, facing right, for the shuffle step
            body = sprite_side(theme, fur, outfit, expr, f"s{theme}{fur}{expr}")
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-104 -252 208 260">{body}</svg>'
            (OUT / f"{theme}-{fur}-side-{expr}.svg").write_text(svg, encoding="utf8")
print("ok", len(list(OUT.glob("*.svg"))))
