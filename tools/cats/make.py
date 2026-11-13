#!/usr/bin/env python3
"""Sketch: four cats playing mahjong under a hanging lamp (a nod to "Dogs Playing Poker"), dressed for each site theme."""
import pathlib, subprocess

INK = "#23203f"
W, H = 800, 520

THEMES = {
    "light": dict(wall="#f3e6cf", wall2="#e8d6b6", felt="#1f8a78", rail="#b2713c", lamp="#3aa58c", back="#f3c63d",
                  outfits=["#e0457f", "#55bdeb", "#f2b42c", "#7b5cc4"], acc="scarf"),
    "samurai": dict(wall="#ece4d2", wall2="#d8cba9", felt="#2f6b4f", rail="#3d2b22", lamp="#c9a227", back="#2f4670",
                    outfits=["#2f4670", "#8a1f2a", "#3d2b22", "#5b6b3a"], acc="samurai"),
    "vaquero": dict(wall="#f4e3c1", wall2="#e2c896", felt="#2f7d4e", rail="#6a3f1f", lamp="#e9c46a", back="#bb7c40",
                    outfits=["#8b3a1f", "#3b5f8a", "#c98a4b", "#5a4632"], acc="cowboy"),
    "cyberpunk": dict(wall="#0d1522", wall2="#18212f", felt="#103a3f", rail="#18212f", lamp="#00f0ff", back="#12233a",
                      outfits=["#fcee0a", "#ff2d95", "#00f0ff", "#7b4fe0"], acc="visor"),
}
FURS = [("#f08a30", "#c9661a"), ("#a9adb8", "#7c8190"), ("#3a3a48", "#22222d"), ("#fff6e5", "#e3d2b4")]

def tile(x, y, w=16, h=21, face=True, back="#f3c63d", rot=0):
    body = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{"#fffdf6" if face else back}" stroke="{INK}" stroke-width="2"/>'
    edge = f'<rect x="{x}" y="{y + h - 5}" width="{w}" height="5" rx="2" fill="{back}" stroke="{INK}" stroke-width="2"/>' if face else ""
    dots = f'<circle cx="{x + w/2}" cy="{y + h/2 - 2}" r="{w*0.18}" fill="#e0457f"/>' if face else ""
    return f'<g transform="rotate({rot} {x + w/2} {y + h/2})">{body}{edge}{dots}</g>'

def accessory(kind, x, y, s, outfit, i):
    if kind == "scarf":
        return (f'<path d="M{x-30*s} {y+26*s} q{30*s} {16*s} {60*s} 0 l{-4*s} {12*s} q{-26*s} {12*s} {-52*s} 0Z" fill="{outfit}" stroke="{INK}" stroke-width="3"/>'
                f'<path d="M{x+14*s} {y+34*s} l{6*s} {30*s} l{10*s} {-4*s} l{-6*s} {-28*s}Z" fill="{outfit}" stroke="{INK}" stroke-width="3"/>'
                + (f'<circle cx="{x+12*s}" cy="{y-2*s}" r="{9*s}" fill="none" stroke="{INK}" stroke-width="2.6"/><circle cx="{x-12*s}" cy="{y-2*s}" r="{9*s}" fill="none" stroke="{INK}" stroke-width="2.6"/><path d="M{x-3*s} {y-2*s}h{6*s}" stroke="{INK}" stroke-width="2.6"/>' if i == 2 else ""))
    if kind == "samurai":
        return (f'<path d="M{x-27*s} {y-22*s} q{27*s} {-8*s} {54*s} 0 l{-1*s} {7*s} q{-26*s} {-7*s} {-52*s} 0Z" fill="#fff6e5" stroke="{INK}" stroke-width="2.6"/>'
                f'<circle cx="{x}" cy="{y-25*s}" r="{4*s}" fill="#e0457f" stroke="{INK}" stroke-width="2"/>'
                f'<path d="M{x-30*s} {y+28*s} l{30*s} {26*s} l{30*s} {-26*s}" fill="none" stroke="#fff6e5" stroke-width="{6*s}"/>')
    if kind == "cowboy":
        return (f'<ellipse cx="{x}" cy="{y-24*s}" rx="{40*s}" ry="{8*s}" fill="#8b5a2b" stroke="{INK}" stroke-width="3"/>'
                f'<path d="M{x-20*s} {y-25*s} q{-2*s} {-26*s} {20*s} {-24*s} q{22*s} {-2*s} {20*s} {24*s}Z" fill="#a8703a" stroke="{INK}" stroke-width="3"/>'
                f'<path d="M{x-20*s} {y-30*s}h{40*s}" stroke="{outfit}" stroke-width="{4*s}"/>'
                f'<path d="M{x-24*s} {y+24*s} l{24*s} {18*s} l{24*s} {-18*s}Z" fill="#c0392b" stroke="{INK}" stroke-width="3"/>')
    if kind == "visor":
        return (f'<rect x="{x-26*s}" y="{y-10*s}" width="{52*s}" height="{14*s}" rx="{7*s}" fill="{outfit}" fill-opacity=".85" stroke="{INK}" stroke-width="3"/>'
                f'<path d="M{x-22*s} {y-6*s}h{18*s}" stroke="#fff" stroke-width="2" opacity=".8"/>'
                f'<path d="M{x-26*s} {y+30*s}h{52*s}" stroke="{outfit}" stroke-width="{3*s}"/>')
    return ""

def cat(x, y, s, fur, shade, outfit, acc, i, eyes="#2b2540"):
    body = f'<path d="M{x-46*s} {y+120*s} q{-4*s} {-80*s} {46*s} {-90*s} q{50*s} {10*s} {46*s} {90*s}Z" fill="{outfit}" stroke="{INK}" stroke-width="3.5"/>'
    ears = f'<path d="M{x-32*s} {y-8*s} L{x-30*s} {y-44*s} L{x-8*s} {y-26*s}Z M{x+32*s} {y-8*s} L{x+30*s} {y-44*s} L{x+8*s} {y-26*s}Z" fill="{fur}" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>'
    inner = f'<path d="M{x-28*s} {y-14*s} L{x-27*s} {y-34*s} L{x-14*s} {y-24*s}Z M{x+28*s} {y-14*s} L{x+27*s} {y-34*s} L{x+14*s} {y-24*s}Z" fill="{shade}"/>'
    head = f'<ellipse cx="{x}" cy="{y}" rx="{36*s}" ry="{30*s}" fill="{fur}" stroke="{INK}" stroke-width="3.5"/>'
    face = (f'<ellipse cx="{x-13*s}" cy="{y-2*s}" rx="{4.5*s}" ry="{6*s}" fill="{eyes}"/><ellipse cx="{x+13*s}" cy="{y-2*s}" rx="{4.5*s}" ry="{6*s}" fill="{eyes}"/>'
            f'<circle cx="{x-11.6*s}" cy="{y-4*s}" r="{1.6*s}" fill="#fff"/><circle cx="{x+14.4*s}" cy="{y-4*s}" r="{1.6*s}" fill="#fff"/>'
            f'<path d="M{x-4*s} {y+8*s}h{8*s}l{-4*s} {4*s}Z" fill="#e0457f" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M{x} {y+12*s}v{3*s}M{x} {y+15*s}q{-4*s} {4*s} {-8*s} {1*s}M{x} {y+15*s}q{4*s} {4*s} {8*s} {1*s}" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'
            f'<path d="M{x-20*s} {y+10*s}l{-16*s} {-3*s}M{x-20*s} {y+15*s}l{-16*s} {3*s}M{x+20*s} {y+10*s}l{16*s} {-3*s}M{x+20*s} {y+15*s}l{16*s} {3*s}" stroke="{INK}" stroke-width="1.8" stroke-linecap="round"/>')
    return body + ears + inner + head + face + accessory(acc, x, y, s, outfit, i)

def scene(name):
    th = THEMES[name]
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">']
    out.append(f'<rect width="{W}" height="{H}" fill="{th["wall"]}"/>')
    out.append(f'<rect y="{H*0.62}" width="{W}" height="{H*0.38}" fill="{th["wall2"]}"/>')
    # a framed picture of a tile on the wall, a cosy touch like the painting
    out.append(f'<rect x="590" y="60" width="120" height="96" rx="6" fill="#fffaf0" stroke="{INK}" stroke-width="4"/>' + tile(637, 86, 26, 36, True, th["back"]))
    # lamp and its light cone
    out.append(f'<path d="M400 0v60" stroke="{INK}" stroke-width="3"/><path d="M330 110 q70 -70 140 0Z" fill="{th["lamp"]}" stroke="{INK}" stroke-width="4"/>')
    out.append(f'<path d="M335 110 L230 330 H570 L465 110Z" fill="#fff6c2" opacity=".28"/>')
    # cats behind the table
    for i, (cx, cy, s) in enumerate([(205, 255, 1.15), (330, 205, 1.0), (470, 205, 1.0), (600, 255, 1.15)]):
        fur, shade = FURS[i]
        out.append(cat(cx, cy, s, fur, shade, th["outfits"][i], th["acc"], i, "#ffe27a" if i == 2 else "#2b2540"))
    # table
    out.append(f'<path d="M110 360 L200 300 H600 L690 360 V392 H110Z" fill="{th["rail"]}" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>')
    out.append(f'<path d="M140 356 L215 308 H585 L660 356Z" fill="{th["felt"]}" stroke="{INK}" stroke-width="3"/>')
    out.append(f'<path d="M150 392 v110 M650 392 v110" stroke="{INK}" stroke-width="12" stroke-linecap="round"/>')
    # wall of tiles, ponds, compass on the felt
    for k in range(9):
        out.append(f'<rect x="{298 + k*23}" y="314" width="21" height="11" rx="2" fill="{th["back"]}" stroke="{INK}" stroke-width="1.8"/>')
    out.append(f'<rect x="377" y="330" width="46" height="18" rx="4" fill="#55bdeb" stroke="{INK}" stroke-width="2.4"/><text x="400" y="344" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="serif">東</text>')
    for k in range(4):
        out.append(tile(250 + k*18, 330, 14, 17, True, th["back"], -8))
        out.append(tile(470 + k*18, 330, 14, 17, True, th["back"], 8))
    # paws holding their hands of tiles at the table edge
    for (px, rot) in [(185, -18), (330, 0), (452, 0), (580, 18)]:
        out.append(f'<g transform="rotate({rot} {px+30} 300)">' + "".join(tile(px + k*13, 284, 13, 18, True, th["back"]) for k in range(5)) + "</g>")
    for (px, py) in [(178, 300), (238, 300), (322, 296), (372, 296), (446, 296), (496, 296), (560, 300), (620, 300)]:
        out.append(f'<ellipse cx="{px}" cy="{py}" rx="13" ry="9" fill="#fff6e5" stroke="{INK}" stroke-width="3"/>')
    # a little stack of point sticks and a cup of tea
    out.append(f'<rect x="604" y="338" width="44" height="7" rx="3" fill="#e85a52" stroke="{INK}" stroke-width="2"/><rect x="600" y="346" width="44" height="7" rx="3" fill="#4a78e8" stroke="{INK}" stroke-width="2"/>')
    out.append(f'<path d="M156 330 h26 v16 q-13 8 -26 0Z" fill="#fff6e5" stroke="{INK}" stroke-width="2.6"/><path d="M182 334 q8 0 6 8 q-2 4 -6 3" fill="none" stroke="{INK}" stroke-width="2.4"/>')
    out.append("</svg>")
    return "".join(out)

dirp = pathlib.Path(__file__).with_name("out"); dirp.mkdir(exist_ok=True)
for name in THEMES:
    (dirp / f"cats-{name}.svg").write_text(scene(name), encoding="utf8")
cells = "".join(f'<figure><img src="out/cats-{n}.svg"><figcaption>{n}</figcaption></figure>' for n in THEMES)
html = f'<!doctype html><meta charset="utf-8"><style>body{{margin:0;padding:18px;width:1240px;background:#f1e4c6;font-family:Helvetica}}.g{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}img{{width:600px;border:3px solid #23203f;border-radius:12px}}figure{{margin:0}}figcaption{{font:800 13px Helvetica;text-transform:uppercase;color:#4a3a8c}}</style><div class="g">{cells}</div>'
sheet = pathlib.Path(__file__).with_name("preview.html"); sheet.write_text(html, encoding="utf8")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={sheet.with_suffix('.png')}", "--window-size=1280,860", f"file://{sheet}"], check=True, capture_output=True)
print("ok")
