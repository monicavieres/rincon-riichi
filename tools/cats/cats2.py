#!/usr/bin/env python3
"""Four fluffy cats playing mahjong around the site's isometric table, dressed for each theme (sketch).
The table comes from tools/design/generate-illustrations.py (without the open drawer); the cats are round,
outlined sprites in the same ink and flat shading."""
import math, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).parent
SRC = (HERE.parent / "design" / "generate-illustrations.py").read_text(encoding="utf8")
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
g = {"__file__": str(HERE.parent / "design" / "generate-illustrations.py")}
sys.argv = ["x", str(OUT)]
exec(SRC[:SRC.index("SCENES = {")], g)
P, Scene, shade = g["P"], g["Scene"], g["shade"]
TABLE_SRC = SRC[SRC.index("def scene_table(t):"):SRC.index("def scene_dice(t):")]
TABLE_BODY = [l[4:] for l in TABLE_SRC.splitlines()[1:] if "return s.svg" not in l and "open_drawer(s)" not in l]

FURS = {  # fur, shade, belly
    "orange": ("#f39a45", "#d27326", "#fff3e2"), "grey": ("#b9bdc8", "#8e94a4", "#f1f2f6"),
    "black": ("#45455a", "#2c2c3b", "#7a7a90"), "white": ("#fffaf2", "#e6d8c2", "#ffffff"),
}
OUTFITS = {
    "light": ["#e0457f", "#55bdeb", "#7b5cc4", "#f2b42c"], "dark": ["#ff2d95", "#00e5ff", "#9d4edd", "#ffd400"],
    "cute": ["#ff9ec7", "#b18cff", "#7fd6bf", "#ffd36e"], "samurai": ["#2f4670", "#8a1f2a", "#3d2b22", "#5b6b3a"],
    "cyberpunk": ["#fcee0a", "#ff2a6d", "#00f0ff", "#b967ff"], "vaquero": ["#8b3a1f", "#3b5b7a", "#c98a4b", "#5a4632"],
    "frutiger": ["#5aa9ff", "#7ed957", "#ff6fa5", "#ffd93d"], "fox": ["#d9531e", "#2f5d46", "#f0b347", "#7a3510"],
}

def fluff(cx, cy, rx, ry, bumps=14, amp=0.09, start=0.0):
    """A soft, scalloped ellipse: each bump is a little arc pushed outward, so the outline reads as fur."""
    pts = [(cx + rx * math.cos(start + 2 * math.pi * k / bumps), cy + ry * math.sin(start + 2 * math.pi * k / bumps)) for k in range(bumps)]
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for k in range(bumps):
        a = start + 2 * math.pi * (k + 0.5) / bumps
        c = (cx + rx * (1 + amp * 2.2) * math.cos(a), cy + ry * (1 + amp * 2.2) * math.sin(a))
        e = pts[(k + 1) % bumps]
        d += f" Q{c[0]:.1f} {c[1]:.1f} {e[0]:.1f} {e[1]:.1f}"
    return d + "Z"

def accessory(theme, outfit, ink, back):
    """Drawn around a head centred at (0, -150) with radius ~56."""
    if theme == "samurai":
        return (f'<path d="M-58 -168 Q0 -186 58 -168 L56 -156 Q0 -172 -56 -156Z" fill="#fff6e5" stroke="{ink}" stroke-width="4"/>'
                + ('' if back else f'<circle cx="0" cy="-174" r="7" fill="#c0392b" stroke="{ink}" stroke-width="3"/>')
                + f'<path d="M-8 -206 Q0 -224 8 -206Z" fill="#2b2b36" stroke="{ink}" stroke-width="3.5"/>')
    if theme == "vaquero":
        return (f'<ellipse cx="0" cy="-190" rx="86" ry="18" fill="#8b5a2b" stroke="{ink}" stroke-width="4.5"/>'
                f'<path d="M-42 -192 Q-46 -246 0 -240 Q46 -246 42 -192Z" fill="#a8703a" stroke="{ink}" stroke-width="4.5"/>'
                f'<path d="M-43 -202 Q0 -192 43 -202" fill="none" stroke="{outfit}" stroke-width="8"/>'
                + ('' if back else f'<path d="M-40 -96 L0 -70 L40 -96 Z" fill="#c0392b" stroke="{ink}" stroke-width="4"/>'))
    if theme == "cyberpunk":
        if back:
            return f'<path d="M-60 -156 H60" stroke="{outfit}" stroke-width="9" stroke-linecap="round"/>'
        return (f'<rect x="-50" y="-170" width="100" height="28" rx="14" fill="{outfit}" fill-opacity=".9" stroke="{ink}" stroke-width="4.5"/>'
                f'<path d="M-38 -162 H-8" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>')
    if theme == "dark":
        return (f'<path d="M-56 -150 Q-60 -222 0 -224 Q60 -222 56 -150" fill="none" stroke="{ink}" stroke-width="9"/>'
                f'<rect x="-70" y="-168" width="22" height="40" rx="10" fill="{outfit}" stroke="{ink}" stroke-width="4"/>'
                f'<rect x="48" y="-168" width="22" height="40" rx="10" fill="{outfit}" stroke="{ink}" stroke-width="4"/>')
    if theme == "cute":
        return (f'<path d="M14 -206 L-20 -224 L-20 -190Z M14 -206 L48 -224 L48 -190Z" fill="{outfit}" stroke="{ink}" stroke-width="4" stroke-linejoin="round"/>'
                f'<circle cx="14" cy="-206" r="9" fill="{shade(outfit, 0.85)}" stroke="{ink}" stroke-width="4"/>')
    if theme == "fox":
        return (f'<path d="M-46 -102 Q0 -84 46 -102 L44 -90 Q0 -72 -44 -90Z" fill="#c0392b" stroke="{ink}" stroke-width="4"/>'
                + ('' if back else f'<circle cx="0" cy="-78" r="10" fill="#f0b347" stroke="{ink}" stroke-width="3.5"/>'))
    if theme == "frutiger":
        if back:
            return f'<path d="M-58 -158 H58" stroke="{outfit}" stroke-width="8" stroke-linecap="round"/>'
        return (f'<circle cx="-22" cy="-156" r="21" fill="#d8f6ff" fill-opacity=".7" stroke="{outfit}" stroke-width="6"/>'
                f'<circle cx="22" cy="-156" r="21" fill="#d8f6ff" fill-opacity=".7" stroke="{outfit}" stroke-width="6"/>'
                f'<path d="M-6 -158 H6" stroke="{outfit}" stroke-width="6"/>')
    # light: a cosy scarf with a hanging end
    return (f'<path d="M-50 -104 Q0 -82 50 -104 L50 -88 Q0 -66 -50 -88Z" fill="{outfit}" stroke="{ink}" stroke-width="4.5"/>'
            + ('' if back else f'<path d="M18 -86 L28 -40 L44 -46 L34 -90Z" fill="{outfit}" stroke="{ink}" stroke-width="4.5"/>'))

def cat_sprite(theme, fur, outfit, ink, back=False, glasses=False, eye="#2b2540", tiles_back="#f3c63d"):
    f, f2, belly = FURS[fur]
    o = []
    # fluffy body in its outfit, with a furry chest showing at the collar
    o.append(f'<path d="{fluff(0, -40, 78, 72, 16, 0.07)}" fill="{outfit}" stroke="{ink}" stroke-width="5" stroke-linejoin="round"/>')
    if back:
        o.append(f'<path d="M58 -6 Q120 -10 112 -70 Q106 -100 86 -92 Q98 -60 54 -40Z" fill="{f}" stroke="{ink}" stroke-width="5" stroke-linejoin="round"/>')  # tail
        o.append(f'<path d="M-40 -60 Q0 -48 40 -60" fill="none" stroke="{shade(outfit, 0.7)}" stroke-width="5" stroke-linecap="round"/>')
    else:
        o.append(f'<path d="{fluff(0, -88, 36, 26, 10, 0.12, math.pi / 10)}" fill="{belly}" stroke="{ink}" stroke-width="4"/>')
    # ears
    for sx in (-1, 1):
        o.append(f'<path d="M{sx*24} -192 L{sx*54} -232 L{sx*60} -170Z" fill="{f}" stroke="{ink}" stroke-width="5" stroke-linejoin="round"/>')
        if not back:
            o.append(f'<path d="M{sx*32} -192 L{sx*51} -219 L{sx*53} -180Z" fill="#f4a6b8"/>')
    # fluffy head with cheek tufts
    o.append(f'<path d="{fluff(0, -150, 64, 54, 18, 0.06, math.pi / 18)}" fill="{f}" stroke="{ink}" stroke-width="5" stroke-linejoin="round"/>')
    if back:
        o.append(f'<path d="M-22 -190 Q0 -176 22 -190 M-28 -176 Q0 -162 28 -176" fill="none" stroke="{f2}" stroke-width="5" stroke-linecap="round"/>')
    else:
        o.append(f'<path d="{fluff(0, -128, 30, 18, 8, 0.12)}" fill="{belly}"/>')
        for sx in (-1, 1):
            o.append(f'<ellipse cx="{sx*24}" cy="-154" rx="10" ry="13" fill="{eye}"/><circle cx="{sx*24+3}" cy="-159" r="4" fill="#fff"/>')
            o.append(f'<ellipse cx="{sx*40}" cy="-132" rx="9" ry="5" fill="#f4a6b8" opacity=".7"/>')
            o.append(f'<path d="M{sx*34} -130 L{sx*74} -138 M{sx*34} -124 L{sx*74} -120" stroke="{ink}" stroke-width="3" stroke-linecap="round"/>')
        o.append(f'<path d="M-7 -138 H7 L0 -131Z" fill="#e0457f" stroke="{ink}" stroke-width="3" stroke-linejoin="round"/>')
        o.append(f'<path d="M0 -131 V-126 M0 -126 Q-6 -119 -12 -124 M0 -126 Q6 -119 12 -124" fill="none" stroke="{ink}" stroke-width="3" stroke-linecap="round"/>')
        if glasses:
            o.append(f'<circle cx="-24" cy="-154" r="17" fill="none" stroke="{ink}" stroke-width="4"/><circle cx="24" cy="-154" r="17" fill="none" stroke="{ink}" stroke-width="4"/><path d="M-7 -156 H7" stroke="{ink}" stroke-width="4"/>')
    o.append(accessory(theme, outfit, ink, back))
    # paws resting on the table edge (the tiles stay on the table, not in their paws)
    if not back:
        for sx in (-1, 1):
            o.append(f'<path d="{fluff(sx*44, -12, 17, 12, 7, 0.1)}" fill="{f}" stroke="{ink}" stroke-width="4"/>')
    return "".join(o)

def scene(theme):
    t = g["THEMES"][theme]
    s = Scene(t)
    ink, outfits = t["ink"], OUTFITS[theme]
    g2 = dict(g); g2["Scene"] = lambda _t: s
    exec(compile("def _f(t):\n" + "\n".join("    " + l for l in TABLE_BODY), "table", "exec"), g2)
    g2["_f"](t)
    # seats at the middle of each table edge, just outside the rail, at table-top height
    seats = [  # (x, y, fur, outfit, back, glasses, eye, key)
        (5, 300, "grey", outfits[1], False, True, "#2b2540", -3e8),     # West, upper left: faces us
        (300, 5, "black", outfits[2], False, False, "#ffd84a", -3.1e8), # North, upper right: faces us
        (300, 660, "white", outfits[3], True, False, "#2b2540", 3e9),      # South, lower left: back to us
        (660, 300, "orange", outfits[0], True, False, "#2b2540", 3.1e9),   # East, lower right: back to us
    ]
    for x, y, fur, outfit, back, glasses, eye, key in seats:
        sx, sy = P(x, y, 96 if not back else 40)
        k = 1.15 if back else 1.1
        flip = -1 if (x < 300 and not back) or (y > 300 and back) else 1
        s.pts += [(sx - 110 * k, sy - 250 * k), (sx + 130 * k, sy + 10 * k)]
        s.raw((key, 0), f'<g transform="translate({sx:.1f} {sy:.1f}) scale({k * flip} {k})">{cat_sprite(theme, fur, outfit, ink, back, glasses, eye, t["back"])}</g>')
    # a hanging lamp over the middle of the table
    lx, ly = P(300, 300, 520)
    top = P(300, 300, 760)
    s.pts += [top]
    lampc = t["gold"]
    s.raw((4e9, 0), f'<path d="M{top[0]:.1f} {top[1]:.1f} V{ly - 40:.1f}" stroke="{ink}" stroke-width="3"/>'
                    f'<path d="M{lx - 90:.1f} {ly + 20:.1f} Q{lx:.1f} {ly - 110:.1f} {lx + 90:.1f} {ly + 20:.1f}Z" fill="{lampc}" stroke="{ink}" stroke-width="5"/>'
                    f'<ellipse cx="{lx:.1f}" cy="{ly + 20:.1f}" rx="90" ry="14" fill="#fff6c2" stroke="{ink}" stroke-width="4"/>')
    return s.svg("Cuatro gatos jugando mahjong")

for th in ["light", "samurai", "vaquero", "cyberpunk", "dark", "cute", "frutiger", "fox"]:
    (OUT / f"cats-table-{th}.svg").write_text(scene(th), encoding="utf8")
cells = "".join(f'<figure><img src="out/cats-table-{n}.svg"><figcaption>{n}</figcaption></figure>' for n in ["light", "samurai", "vaquero", "cyberpunk"])
html = f'<!doctype html><meta charset="utf-8"><style>body{{margin:0;padding:18px;width:1240px;background:#f1e4c6;font-family:Helvetica}}.g{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}img{{width:600px;background:#faf3e6;border:3px solid #23203f;border-radius:12px}}figure{{margin:0}}figcaption{{font:800 13px Helvetica;text-transform:uppercase;color:#4a3a8c}}</style><div class="g">{cells}</div>'
sheet = HERE / "cats2-preview.html"; sheet.write_text(html, encoding="utf8")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={HERE / 'cats2-preview.png'}", "--window-size=1280,1160", f"file://{sheet}"], check=True, capture_output=True)
print("ok")
