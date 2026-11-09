#!/usr/bin/env python3
"""Draws the point-stick proposal (flat + isometric, in the table's drawer style) as a preview sheet. Not wired into the site yet."""
import math, pathlib, subprocess

OUT = pathlib.Path(__file__).with_name("sticks-preview.html")
PNG = pathlib.Path(__file__).with_name("sticks-preview.png")
INK = "#23203f"
# value: (top, side, end, dots, dot colour, length, thickness, label)
LENGTH, THICK = 150, 22   # every stick is the same size, whatever it is worth
def grid(us, vs):
    return [(u, v) for v in vs for u in us]
PATTERNS = {
    10000: ([(0.5, 0.5), (0.34, 0.5), (0.42, 0.5), (0.58, 0.5), (0.66, 0.5), (0.45, 0.3), (0.55, 0.3), (0.45, 0.7), (0.55, 0.7)], 2.1, "#fff"),  # a small rosette
    5000: ([(0.46, 0.3), (0.54, 0.3), (0.5, 0.5), (0.46, 0.7), (0.54, 0.7)], 2.4, "#d9331f"),                                                  # five, like a die
    1000: ([(0.5, 0.5)], 3.2, "#fff"),                                                                                                           # one
    500: (grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68]), 1.9, "#fff"),                                                                          # two rows of four
    100: (grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68]), 1.9, "#23203f"),
}
SPEC = [
    (10000, "#e85a52", "#b0302c", "#c9423c"),
    (5000, "#f6c340", "#c98c14", "#dba51f"),
    (1000, "#4a78e8", "#2447a5", "#3563cc"),
    (500, "#2fae86", "#1c7a5c", "#27956f"),
    (100, "#fffdf6", "#cfcbbf", "#e6e2d6"),
]
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))

def flat(value, top, side):
    L, W = LENGTH, THICK + 6
    dots, r, col = PATTERNS[value]
    gid = f"g{value}"
    out = [f'<g><defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset=".62" stop-color="{top}"/><stop offset="1" stop-color="{side}"/></linearGradient></defs>']
    out.append(f'<rect x="1.5" y="1.5" width="{L}" height="{W}" rx="{W/2.8:.1f}" fill="url(#{gid})" stroke="{INK}" stroke-width="3"/>')
    out.append(f'<rect x="7" y="5" width="{L-12}" height="2.6" rx="1.3" fill="#fff" opacity=".4"/>')
    for u, v in dots:
        out.append(f'<circle cx="{1.5 + L*u:.1f}" cy="{1.5 + W*v:.1f}" r="{r}" fill="{col}"/>')
    out.append('</g>')
    return "".join(out)

def iso(value, top, side, end, ox, oy):
    L, W, H = LENGTH, THICK, 9
    dots, r, col = PATTERNS[value]
    def P(u, v, z=0):
        return (ox + (u * C30 - v * C30), oy + (u * S30 + v * S30) - z)
    def poly(pts, fill):
        d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        return f'<polygon points="{d}" fill="{fill}" stroke="{INK}" stroke-width="2.6" stroke-linejoin="round"/>'
    out = [poly([P(0, W, H), P(L, W, H), P(L, W, 0), P(0, W, 0)], side), poly([P(L, 0, H), P(L, W, H), P(L, W, 0), P(L, 0, 0)], end), poly([P(0, 0, H), P(L, 0, H), P(L, W, H), P(0, W, H)], top)]
    a, b = P(4, 3, H), P(L - 4, 3, H)
    out.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>')
    for u, v in dots:
        x, y = P(L * u, W * v, H)
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r*0.62:.1f}" fill="{col}"/>')
    return "".join(out)

rows_flat, rows_iso = [], []
for n, (value, top, side, end) in enumerate(SPEC):
    rows_flat.append(f'<div class="r"><svg viewBox="0 0 160 36" width="220" height="50">{flat(value, top, side)}</svg><b>{value:,}</b></div>'.replace(",", " "))
    rows_iso.append(iso(value, top, side, end, 20, 40 + n * 54))
iso_svg = f'<svg viewBox="0 20 330 350" width="400" height="424">{"".join(rows_iso)}</svg>'

html = f"""<!doctype html><meta charset="utf-8"><style>
body {{ margin: 0; padding: 26px 30px; width: 1180px; font-family: Palatino, Georgia, serif; color: #2b2540; background: #f1e4c6 }}
h1 {{ margin: 0 0 4px; font: 400 26px Cochin, Georgia, serif; color: #4a3a8c }} p {{ margin: 0 0 14px; font-style: italic }}
.cols {{ display: grid; grid-template-columns: 330px 440px 260px; gap: 22px; align-items: start }} .box {{ padding: 14px 18px; border: 1.5px solid #2b2540; border-radius: 12px; background: rgba(255,255,255,.55) }} h2 {{ margin: 0 0 10px; font: 700 12px 'Avenir Next', Helvetica; letter-spacing: 1px; text-transform: uppercase; color: #a8322b }}
.r {{ display: flex; align-items: center; gap: 12px; margin: 8px 0 }} .r b {{ font-size: 15px; min-width: 70px }}
.small .r svg {{ width: 110px; height: auto }} .small .r {{ margin: 4px 0 }} .small b {{ font-size: 12px }}
</style>
<h1>Palitos de puntos · propuesta</h1><p>Mismo trazo grueso y paleta del cajón de la mesa; todos miden lo mismo, sin importar su valor; cambian el color y los puntitos.</p>
<div class="cols">
  <div class="box"><h2>Plano · guías, tutorial y sitio</h2>{"".join(rows_flat)}</div>
  <div class="box"><h2>Isométrico · como el cajón</h2>{iso_svg}</div>
  <div class="box small"><h2>Tamaño real en las guías</h2>{"".join(rows_flat)}</div>
</div>"""
OUT.write_text(html, encoding="utf8")
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", f"--screenshot={PNG}", "--window-size=1240,610", f"file://{OUT}"], check=True, capture_output=True)
print("ok", PNG)
