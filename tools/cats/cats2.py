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

FURS = {  # fur, stripe/shade, white parts, pattern, eye colour
    "orange": ("#f2a35c", "#d27a35", "#fff4e6", "tabby", "#7fb4e0"),
    "grey": ("#9ea5b2", "#7d8492", "#ffffff", "blaze", "#86bde8"),
    "white": ("#a38c74", "#5f4c3d", "#f6eadb", "tabby", "#8cc0e6"),
    "black": ("#2e2e3a", "#1e1e28", "#ffffff", "tuxedo", "#7fb7e3"),
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

def cat_sprite(theme, fur, outfit, ink, back=False, glasses=False, eye=None, tiles_back="#f3c63d"):
    f, stripe, white, pattern, iris = FURS[fur]
    uid = f"{theme}{fur}{int(back)}{abs(hash(outfit)) % 9999}"
    def grad(name, base, k_lo=0.78, k_hi=1.12):
        return (f'<radialGradient id="{name}{uid}" cx=".36" cy=".30" r=".85">'
                f'<stop offset="0" stop-color="{shade(base, k_hi)}"/><stop offset=".6" stop-color="{base}"/><stop offset="1" stop-color="{shade(base, k_lo)}"/></radialGradient>')
    line = shade(ink, 1.0)
    o = [f'<defs>{grad("o", outfit)}{grad("f", f)}{grad("w", white, 0.9, 1.02)}'
         f'<clipPath id="h{uid}"><path d="{fluff(0, -150, 66, 56, 20, 0.05, math.pi / 20)}"/></clipPath></defs>',
         f'<ellipse cx="6" cy="34" rx="78" ry="15" fill="#000" opacity=".15"/>']
    # body: a soft, round sweater, with a white bib on the white-chested coats
    o.append(f'<path d="{fluff(0, -40, 78, 72, 18, 0.06)}" fill="url(#o{uid})" stroke="{line}" stroke-width="2.2" stroke-linejoin="round"/>')
    if back:
        tail_f = stripe if pattern == "tuxedo" else f
        o.append(f'<path d="M56 -4 Q124 -6 116 -74 Q110 -104 88 -94 Q100 -60 52 -40Z" fill="{tail_f}" stroke="{line}" stroke-width="2.2" stroke-linejoin="round"/>')
        if pattern == "tabby":
            o.append(f'<path d="M84 -26 l14 -6 M96 -52 l14 -3 M100 -78 l12 2" stroke="{stripe}" stroke-width="5" stroke-linecap="round"/>')
        o.append(f'<path d="M-40 -58 Q0 -46 40 -58" fill="none" stroke="{shade(outfit, 0.72)}" stroke-width="2.4" stroke-linecap="round"/>')
    else:
        bib = white if pattern in ("blaze", "tuxedo") else shade(f, 1.12)
        o.append(f'<path d="{fluff(0, -90, 34, 24, 10, 0.12, math.pi / 10)}" fill="{bib}" stroke="{line}" stroke-width="1.8"/>')
    # ears: tall, with a pink inside and little fur tufts
    for sx in (-1, 1):
        o.append(f'<path d="M{sx*20} -194 Q{sx*40} -244 {sx*58} -238 Q{sx*68} -204 {sx*62} -172Z" fill="{f if sx < 0 else shade(f, 0.9)}" stroke="{line}" stroke-width="2.2" stroke-linejoin="round"/>')
        if not back:
            o.append(f'<path d="M{sx*28} -192 Q{sx*42} -228 {sx*55} -228 Q{sx*60} -204 {sx*56} -182Z" fill="#f6b3c2"/>')
            o.append(f'<path d="M{sx*36} -196 l{sx*6} -12 M{sx*42} -192 l{sx*8} -10" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>')
    # round head with fluffy cheeks, clipped markings on top
    o.append(f'<path d="{fluff(0, -150, 66, 56, 20, 0.05, math.pi / 20)}" fill="url(#f{uid})" stroke="{line}" stroke-width="2.2" stroke-linejoin="round"/>')
    marks = []
    if pattern == "tabby":
        marks.append(f'<path d="M-12 -204 l4 20 M0 -207 v22 M12 -204 l-4 20" stroke="{stripe}" stroke-width="5" stroke-linecap="round"/>')  # the forehead "M"
        for sx in (-1, 1):
            marks.append(f'<path d="M{sx*66} -160 q{-sx*14} 2 {-sx*22} 8 M{sx*66} -146 q{-sx*12} 2 {-sx*20} 7" stroke="{stripe}" stroke-width="4.5" stroke-linecap="round" fill="none"/>')
    if pattern in ("blaze", "tuxedo"):
        marks.append(f'<path d="M0 -196 Q-10 -160 -36 -132 Q-40 -96 0 -96 Q40 -96 36 -132 Q10 -160 0 -196Z" fill="{white}"/>')  # white blaze down the face
    if back and pattern == "tabby":
        marks.append(f'<path d="M-30 -190 Q0 -178 30 -190 M-38 -172 Q0 -160 38 -172 M-34 -154 Q0 -144 34 -154" fill="none" stroke="{stripe}" stroke-width="5" stroke-linecap="round"/>')
    if back and pattern == "tuxedo":
        marks = []
    o.append(f'<g clip-path="url(#h{uid})">{"".join(marks)}</g>')
    o.append(f'<ellipse cx="-24" cy="-182" rx="24" ry="10" fill="#fff" opacity=".2"/>')
    if not back:
        # muzzle puffs, big shiny eyes, pink nose
        o.append(f'<ellipse cx="-11" cy="-124" rx="15" ry="11" fill="url(#w{uid})"/><ellipse cx="11" cy="-124" rx="15" ry="11" fill="url(#w{uid})"/>')
        for sx in (-1, 1):
            ex = sx * 26
            o.append(f'<ellipse cx="{ex}" cy="-152" rx="14" ry="16" fill="#fff" stroke="{line}" stroke-width="1.8"/>')
            o.append(f'<ellipse cx="{ex}" cy="-151" rx="11" ry="14" fill="{iris}"/>')
            o.append(f'<ellipse cx="{ex}" cy="-150" rx="6" ry="9" fill="#1b1b26"/>')
            o.append(f'<circle cx="{ex + 4}" cy="-157" r="4.2" fill="#fff"/><circle cx="{ex - 4}" cy="-145" r="2" fill="#fff" opacity=".9"/>')
            o.append(f'<ellipse cx="{sx*44}" cy="-128" rx="9" ry="5" fill="#f6a3b6" opacity=".55"/>')
            o.append(f'<path d="M{sx*26} -126 Q{sx*52} -132 {sx*80} -128 M{sx*26} -120 Q{sx*52} -120 {sx*80} -114" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".95"/>')
            o.append(f'<path d="M{sx*26} -126 Q{sx*52} -132 {sx*80} -128 M{sx*26} -120 Q{sx*52} -120 {sx*80} -114" fill="none" stroke="{line}" stroke-width=".8" stroke-linecap="round" opacity=".5"/>')
        o.append(f'<path d="M-6 -134 Q0 -137 6 -134 Q4 -128 0 -127 Q-4 -128 -6 -134Z" fill="#ef8aa0" stroke="{line}" stroke-width="1.4" stroke-linejoin="round"/>')
        o.append(f'<path d="M0 -127 V-123 M0 -123 Q-5 -117 -10 -121 M0 -123 Q5 -117 10 -121" fill="none" stroke="{line}" stroke-width="1.6" stroke-linecap="round"/>')
        if glasses:
            o.append(f'<circle cx="-26" cy="-152" r="19" fill="#fff" fill-opacity=".12" stroke="{line}" stroke-width="2.2"/><circle cx="26" cy="-152" r="19" fill="#fff" fill-opacity=".12" stroke="{line}" stroke-width="2.2"/><path d="M-7 -154 H7" stroke="{line}" stroke-width="2.2"/>')
    o.append(accessory(theme, outfit, line, back))
    if not back:
        for sx in (-1, 1):
            paw = white if pattern in ("blaze", "tuxedo") else f
            o.append(f'<path d="{fluff(sx*44, -12, 17, 12, 8, 0.1)}" fill="{paw}" stroke="{line}" stroke-width="1.8"/>')
            o.append(f'<path d="M{sx*44 - 6} -8 v-6 M{sx*44} -7 v-7 M{sx*44 + 6} -8 v-6" stroke="{shade(paw, 0.75)}" stroke-width="1.4" stroke-linecap="round"/>')
    return "".join(o)

from kitten import sprite as kitten_sprite

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
        expr = {"grey": "calm", "black": "smile"}.get(fur, "calm")
        s.raw((key, 0), f'<g transform="translate({sx:.1f} {sy:.1f}) scale({k * flip} {k})">{kitten_sprite(theme, fur, outfit, expr, back, f"t{theme}{fur}")}</g>')
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
