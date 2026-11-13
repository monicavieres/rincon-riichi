#!/usr/bin/env python3
"""Cats playing mahjong around the site's isometric table, dressed for each theme (sketch).
Reuses the illustration generator's scene code (tools/design/generate-illustrations.py)."""
import math, os, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).parent
SRC = (HERE.parent / "design" / "generate-illustrations.py").read_text(encoding="utf8")
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
ns = {"__file__": str(HERE.parent / "design" / "generate-illustrations.py")}
sys.argv = ["x", str(OUT)]
exec(SRC[:SRC.index("SCENES = {")], ns)
g = ns
P, Scene, shade = g["P"], g["Scene"], g["shade"]

FURS = {"orange": ("#f39a45", "#d9772a", "#fff3e2"), "grey": ("#b4b8c4", "#8d93a3", "#eef0f5"), "black": ("#3f3f4f", "#2a2a36", "#6b6b7d")}
OUTFITS = {
    "light": ["#e0457f", "#55bdeb", "#7b5cc4"], "dark": ["#ff2d95", "#00e5ff", "#9d4edd"], "cute": ["#ffb6d3", "#b18cff", "#9fe3cf"],
    "samurai": ["#2f4670", "#8a1f2a", "#3d2b22"], "cyberpunk": ["#fcee0a", "#ff2a6d", "#00f0ff"], "vaquero": ["#8b3a1f", "#3b5b7a", "#c98a4b"],
    "frutiger": ["#5aa9ff", "#7ed957", "#ff6fa5"], "fox": ["#d9531e", "#2f5d46", "#f0b347"],
}

def tri(s, a, b, c, fill, sw=2):
    return s.poly([a, b, c], fill, sw=sw)

def flat_on_x(s, x, y, z, w, h, fill, sw=1.4):
    """A rectangle on the plane x = const (seen on a box's +x face): y from y..y+w, z from z..z+h."""
    return s.poly([(x, y, z), (x, y + w, z), (x, y + w, z + h), (x, y, z + h)], fill, sw=sw)

def flat_on_y(s, x, y, z, w, h, fill, sw=1.4):
    return s.poly([(x, y, z), (x + w, y, z), (x + w, y, z + h), (x, y, z + h)], fill, sw=sw)

def cat(s, theme, x, y, facing, fur, outfit, key, glasses=False):
    """A voxel cat on a stool. (x, y) is the middle of its seat; facing is '+x' or '+y' (toward the table) or '-x' (back to us)."""
    f, f2, belly = FURS[fur]
    ink = s.t["ink"]
    parts = []
    def box(bx, by, bz, w, d, h, top, k=0, **kw):
        n0 = len(s.items)
        s.box(bx, by, bz, w, d, h, top, key=(key[0] + k, key[1]), **kw)
    # stool, body (the outfit), head, ears
    box(x - 30, y - 30, 0, 60, 60, 58, shade(s.t["rail"], 0.9), 0, sw=1.6)
    box(x - 34, y - 34, 58, 68, 68, 74, outfit, 1, sw=1.8)
    hx, hy, hz = x - 33, y - 33, 132
    box(hx, hy, hz, 66, 66, 54, f, 2, sw=1.8)
    # ears: little pyramids on the top of the head, toward the back corners
    def ear(ex, ey):
        top = (ex, ey, hz + 54 + 22)
        b = [(ex - 11, ey - 11, hz + 54), (ex + 11, ey - 11, hz + 54), (ex + 11, ey + 11, hz + 54), (ex - 11, ey + 11, hz + 54)]
        return s.poly([b[1], b[2], top], shade(f, 0.78), sw=1.6) + s.poly([b[2], b[3], top], shade(f, 0.9), sw=1.6)
    if facing == "+x":
        ears = ear(hx + 18, hy + 14) + ear(hx + 18, hy + 52)
    elif facing == "+y":
        ears = ear(hx + 14, hy + 18) + ear(hx + 52, hy + 18)
    else:
        ears = ear(hx + 48, hy + 14) + ear(hx + 48, hy + 52)
    s.raw((key[0] + 3, key[1]), ears)
    # face on the visible side toward the table
    face = ""
    if facing in ("+x", "+y"):
        on = flat_on_x if facing == "+x" else flat_on_y
        X = hx + 66 if facing == "+x" else None
        Y = hy + 66 if facing == "+y" else None
        def at(u, v, w_, h_, col, sw=1.2):
            if facing == "+x":
                return flat_on_x(s, X, hy + u, hz + v, w_, h_, col, sw)
            return flat_on_y(s, hx + u, Y, hz + v, w_, h_, col, sw)
        face += at(14, 26, 10, 13, ink, 0) + at(42, 26, 10, 13, ink, 0)            # eyes
        face += at(16, 33, 4, 4, "#ffffff", 0) + at(44, 33, 4, 4, "#ffffff", 0)    # eye shine
        face += at(28, 16, 10, 7, "#e0457f", 1)                                    # nose
        face += at(10, 4, 46, 12, belly, 1)                                         # muzzle
        if glasses:
            face += at(10, 22, 18, 20, "none", 2.2) + at(38, 22, 18, 20, "none", 2.2)
    else:
        # back of the head: a stripe pattern for the tabby look
        face += flat_on_x(s, hx + 66, hy + 18, hz + 30, 30, 6, f2, 0) + flat_on_x(s, hx + 66, hy + 14, hz + 18, 38, 6, f2, 0)
    s.raw((key[0] + 4, key[1]), face)
    s.raw((key[0] + 5, key[1]), accessory(s, theme, hx, hy, hz, facing, outfit, f))
    # tail curling around the stool
    tx, ty = (x - 40, y + 30) if facing != "-x" else (x + 34, y + 30)
    s.raw((key[0] + 6, key[1]), s.poly([(tx, ty, 40), (tx + 10, ty, 40), (tx + 10, ty + 34, 70), (tx, ty + 34, 70)], f, sw=1.6))

def accessory(s, theme, hx, hy, hz, facing, outfit, fur):
    t = s.t
    out = ""
    if theme in ("samurai",):  # white hachimaki round the head, a topknot
        s.box(hx - 2, hy - 2, hz + 34, 70, 70, 8, "#fff6e5", key=(9e8, 0), sw=1.4)
        s.box(hx + 26, hy + 26, hz + 54, 14, 14, 14, "#2b2b36", key=(9e8 + 1, 0), sw=1.4)
    elif theme == "vaquero":  # cowboy hat
        s.box(hx - 16, hy - 16, hz + 54, 98, 98, 6, "#8b5a2b", key=(9e8, 0), sw=1.6)
        s.box(hx + 10, hy + 10, hz + 60, 46, 46, 28, "#a8703a", key=(9e8 + 1, 0), sw=1.6)
        s.box(hx + 10, hy + 10, hz + 62, 46, 46, 6, outfit, key=(9e8 + 2, 0), sw=1.2)
    elif theme == "cyberpunk":  # visor across the eyes
        if facing == "+x":
            out += s.poly([(hx + 68, hy + 4, hz + 20), (hx + 68, hy + 62, hz + 20), (hx + 68, hy + 62, hz + 40), (hx + 68, hy + 4, hz + 40)], outfit, sw=2) 
        elif facing == "+y":
            out += s.poly([(hx + 4, hy + 68, hz + 20), (hx + 62, hy + 68, hz + 20), (hx + 62, hy + 68, hz + 40), (hx + 4, hy + 68, hz + 40)], outfit, sw=2)
        else:
            out += s.poly([(hx + 68, hy - 2, hz + 26), (hx + 68, hy + 68, hz + 26), (hx + 68, hy + 68, hz + 32), (hx + 68, hy - 2, hz + 32)], outfit, sw=1.6)
    elif theme == "dark":  # headphones
        s.box(hx - 6, hy + 26, hz + 18, 8, 14, 24, outfit, key=(9e8, 0), sw=1.4)
        s.box(hx + 64, hy + 26, hz + 18, 8, 14, 24, outfit, key=(9e8 + 1, 0), sw=1.4)
    elif theme == "cute":  # a bow on top
        s.box(hx + 22, hy + 22, hz + 54, 22, 22, 10, outfit, key=(9e8, 0), sw=1.4)
    elif theme == "fox":  # shrine-style red collar ribbon
        s.box(hx - 2, hy - 2, hz - 8, 70, 70, 8, "#c0392b", key=(9e8, 0), sw=1.4)
    elif theme == "frutiger":  # glossy goggles strap
        s.box(hx - 2, hy - 2, hz + 26, 70, 70, 6, outfit, key=(9e8, 0), sw=1.2)
    else:  # light: a warm scarf at the neck
        s.box(hx - 4, hy - 4, hz - 10, 74, 74, 12, outfit, key=(9e8, 0), sw=1.6)
    return out

def lamp(s, x=300, y=300):
    ink = s.t["ink"]
    zc = 470
    cord = s.poly([(x, y, zc + 200), (x + 1, y + 1, zc + 200), (x + 1, y + 1, zc), (x, y, zc)], ink, sw=1.6)
    top, bot = 26, 80
    sh = s.t.get("gold", "#3aa58c")
    ring = lambda r, z: [(x - r, y - r, z), (x + r, y - r, z), (x + r, y + r, z), (x - r, y + r, z)]
    a, b = ring(top, zc), ring(bot, zc - 60)
    shade_ = s.poly([a[1], a[2], b[2], b[1]], shade(sh, 0.8), sw=2) + s.poly([a[2], a[3], b[3], b[2]], shade(sh, 0.95), sw=2) + s.poly(a, sh, sw=2)
    glow = s.poly([b[0], b[1], b[2], b[3]], "#fff6c2", sw=1.4)
    s.raw((2e9, 0), cord + shade_ + glow)

def scene(theme):
    t = g["THEMES"][theme]
    s = Scene(t)
    outfits = OUTFITS[theme]
    # rivals behind the far sides (drawn before the table so its edge hides their legs) and one with its back to us
    cat(s, theme, -80, 300, "+x", "grey", outfits[1], (-3e8, 0), glasses=True)
    cat(s, theme, 300, -80, "+y", "black", outfits[2], (-3.1e8, 0))
    # the table scene on top
    t_scene = g["scene_table"].__code__
    sc = Scene(t)
    s.items += []  # keep
    tmp = g["scene_table"]
    # rebuild the table into this scene: run its body with s
    def table_into(scene_obj):
        g2 = dict(g); g2["Scene"] = lambda _t: scene_obj
        exec(compile("def _f(t):\n" + "\n".join("    " + l for l in TABLE_BODY), "table", "exec"), g2)
        g2["_f"](t)
    table_into(s)
    cat(s, theme, 690, 300, "-x", "orange", outfits[0], (3e9, 0))
    lamp(s)
    return s.svg("Gatos jugando mahjong")

import inspect
src = inspect.getsource(g["scene_table"]) if False else None
TABLE_SRC = SRC[SRC.index("def scene_table(t):"):SRC.index("def scene_dice(t):")]
TABLE_BODY = [l[4:] for l in TABLE_SRC.splitlines()[1:] if not l.strip().startswith("return s.svg")]

themes = sys.argv[2:] if len(sys.argv) > 2 else ["light", "samurai", "vaquero", "cyberpunk"]
for th in ["light", "samurai", "vaquero", "cyberpunk", "dark", "cute", "frutiger", "fox"]:
    (OUT / f"iso-cats-{th}.svg").write_text(scene(th), encoding="utf8")
cells = "".join(f'<figure><img src="out/iso-cats-{n}.svg"><figcaption>{n}</figcaption></figure>' for n in ["light", "samurai", "vaquero", "cyberpunk"])
html = f'<!doctype html><meta charset="utf-8"><style>body{{margin:0;padding:18px;width:1240px;background:#f1e4c6;font-family:Helvetica}}.g{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}img{{width:600px;background:#faf3e6;border:3px solid #23203f;border-radius:12px}}figure{{margin:0}}figcaption{{font:800 13px Helvetica;text-transform:uppercase;color:#4a3a8c}}</style><div class="g">{cells}</div>'
sheet = HERE / "iso-preview.html"; sheet.write_text(html, encoding="utf8")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={HERE / 'iso-preview.png'}", "--window-size=1280,1100", f"file://{sheet}"], check=True, capture_output=True)
print("ok")
