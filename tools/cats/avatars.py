#!/usr/bin/env python3
"""Front-facing cat avatars (one per fur, dressed per theme) for the tutorial's flow slide.
Writes assets/illustrations/cats/<theme>-<fur>.svg."""
import pathlib, sys
sys.argv = [sys.argv[0]]
HERE = pathlib.Path(__file__).parent
src = (HERE / "cats2.py").read_text(encoding="utf8")
ns = {"__file__": str(HERE / "cats2.py")}
exec(src[:src.index("def scene(theme):")], ns)
OUT = HERE.parents[1] / "assets" / "illustrations" / "cats"; OUT.mkdir(parents=True, exist_ok=True)
ORDER = ["white", "orange", "grey", "black"]  # you, right, across, left
for theme, outfits in ns["OUTFITS"].items():
    t = ns["g"]["THEMES"][theme]
    for i, fur in enumerate(ORDER):
        outfit = outfits[[3, 0, 1, 2][i]]
        body = ns["cat_sprite"](theme, fur, outfit, t["ink"], False, fur == "grey")
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-104 -252 208 260">{body}</svg>'
        (OUT / f"{theme}-{fur}.svg").write_text(svg, encoding="utf8")
print("ok", len(list(OUT.glob("*.svg"))))
