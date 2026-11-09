#!/usr/bin/env python3
"""Draws the point-stick proposal (flat + isometric, in the table's drawer style) as a preview sheet. Not wired into the site yet."""
import math, pathlib, subprocess

OUT = pathlib.Path(__file__).with_name("sticks-preview.html")
PNG = pathlib.Path(__file__).with_name("sticks-preview.png")
INK = "#23203f"
# value: (top, side, end, dots, dot colour, length, thickness, label)
SPEC = [
    (10000, "#e85a52", "#b0302c", "#c9423c", 5, "#fff", 150, 22),
    (5000, "#f6c340", "#c98c14", "#dba51f", 3, "#d9701c", 138, 20),
    (1000, "#4a78e8", "#2447a5", "#3563cc", 5, "#fff", 126, 18),
    (500, "#43b87d", "#1f7a4d", "#2f9a63", 3, "#fff", 112, 16),
    (100, "#fffdf6", "#cfcbbf", "#e6e2d6", 1, "#23203f", 96, 14),
]
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))

def flat(top, side, dots, dot, L, W, stripes):
    H = 7  # visible front face
    out = [f'<g>']
    out.append(f'<rect x="1.5" y="{W+1.5-2}" width="{L}" height="{H+2}" rx="5" fill="{side}" stroke="{INK}" stroke-width="3"/>')
    out.append(f'<rect x="1.5" y="1.5" width="{L}" height="{W}" rx="{W/2.6:.1f}" fill="{top}" stroke="{INK}" stroke-width="3"/>')
    out.append(f'<rect x="6" y="5" width="{L-9}" height="3" rx="1.5" fill="#fff" opacity=".35"/>')
    if stripes:
        out.append(f'<path d="M9 {W*0.28:.1f}H{L-6}M9 {W*0.78:.1f}H{L-6}" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>')
    for i in range(dots):
        x = 1.5 + L * (0.5 if dots == 1 else 0.22 + 0.56 * i / (dots - 1))
        out.append(f'<ellipse cx="{x:.1f}" cy="{1.5+W/2+0.5:.1f}" rx="{2.6 if dots>1 else 3.4}" ry="{W*0.27:.1f}" fill="{dot}"/>')
    out.append('</g>')
    return "".join(out)

def iso(top, side, end, dots, dot, L, W, stripes, ox, oy):
    s = 1.0
    H = 9
    def P(u, v, z=0):  # u along the stick, v across, z up
        return (ox + (u * C30 - v * C30) * s, oy + (u * S30 + v * S30) * s - z)
    def poly(pts, fill):
        d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        return f'<polygon points="{d}" fill="{fill}" stroke="{INK}" stroke-width="2.6" stroke-linejoin="round"/>'
    topface = [P(0, 0, H), P(L, 0, H), P(L, W, H), P(0, W, H)]
    leftface = [P(0, W, H), P(L, W, H), P(L, W, 0), P(0, W, 0)]
    endface = [P(L, 0, H), P(L, W, H), P(L, W, 0), P(L, 0, 0)]
    out = [poly(leftface, side), poly(endface, end), poly(topface, top)]
    # highlight along the top edge
    a, b = P(4, 3, H), P(L - 4, 3, H)
    out.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>')
    if stripes:
        for v in (W * 0.27, W * 0.73):
            a, b = P(8, v, H), P(L - 5, v, H)
            out.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>')
    for i in range(dots):
        u = L * (0.5 if dots == 1 else 0.22 + 0.56 * i / (dots - 1))
        x, y = P(u, W / 2, H)
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{2.4 if dots>1 else 3.4}" ry="{W*0.2:.1f}" fill="{dot}" transform="rotate(30 {x:.1f} {y:.1f})"/>')
    return "".join(out)

rows_flat, rows_iso = [], []
for n, (value, top, side, end, dots, dot, L, W) in enumerate(SPEC):
    stripes = value == 100
    rows_flat.append(f'<div class="r"><svg viewBox="0 0 170 40" width="220" height="52">{flat(top, side, dots, dot, L, W, stripes)}</svg><b>{value:,}</b></div>'.replace(",", " "))
    rows_iso.append(iso(top, side, end, dots, dot, L, W, stripes, 20 + n * 26 * 0.0 + 10, 40 + n * 54))
iso_svg = f'<svg viewBox="0 20 330 300" width="400" height="364">{"".join(rows_iso)}</svg>'

html = f"""<!doctype html><meta charset="utf-8"><style>
body {{ margin: 0; padding: 26px 30px; width: 1180px; font-family: Palatino, Georgia, serif; color: #2b2540; background: #f1e4c6 }}
h1 {{ margin: 0 0 4px; font: 400 26px Cochin, Georgia, serif; color: #4a3a8c }} p {{ margin: 0 0 14px; font-style: italic }}
.cols {{ display: grid; grid-template-columns: 330px 440px 260px; gap: 22px; align-items: start }} .box {{ padding: 14px 18px; border: 1.5px solid #2b2540; border-radius: 12px; background: rgba(255,255,255,.55) }} h2 {{ margin: 0 0 10px; font: 700 12px 'Avenir Next', Helvetica; letter-spacing: 1px; text-transform: uppercase; color: #a8322b }}
.r {{ display: flex; align-items: center; gap: 12px; margin: 8px 0 }} .r b {{ font-size: 15px; min-width: 70px }}
.small .r svg {{ width: 110px; height: auto }} .small .r {{ margin: 4px 0 }} .small b {{ font-size: 12px }}
</style>
<h1>Palitos de puntos · propuesta</h1><p>Mismo trazo grueso y paleta del cajón de la mesa; el largo y el grosor crecen con el valor.</p>
<div class="cols">
  <div class="box"><h2>Plano · guías, tutorial y sitio</h2>{"".join(rows_flat)}</div>
  <div class="box"><h2>Isométrico · como el cajón</h2>{iso_svg}</div>
  <div class="box small"><h2>Tamaño real en las guías</h2>{"".join(rows_flat)}</div>
</div>"""
OUT.write_text(html, encoding="utf8")
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", f"--screenshot={PNG}", "--window-size=1240,610", f"file://{OUT}"], check=True, capture_output=True)
print("ok", PNG)
