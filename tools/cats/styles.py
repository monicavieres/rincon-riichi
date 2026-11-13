"""Five candidate drawing styles for the tutorial cats (preview sheet).
python3 styles.py -> out/styles.svg + styles-preview.png"""
import subprocess, os

FURS = [  # name, fur, stripe, white, pattern, sweater
    ("you", "#b39a80", "#7a6250", "#f6eadb", "tabby", "#f2c14e"),
    ("grey", "#a9afbb", "#878d9a", "#ffffff", "blaze", "#6fb3e6"),
    ("black", "#3a3a46", "#26262f", "#ffffff", "tuxedo", "#8a6fd6"),
    ("orange", "#f2a560", "#d77f3a", "#fff4e6", "tabby", "#e8628f"),
]
PINK = "#f4a7b5"


def shade(hexc, k):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    f = (lambda c: int(c * k)) if k < 1 else (lambda c: int(c + (255 - c) * (k - 1)))
    return "#%02x%02x%02x" % tuple(max(0, min(255, f(c))) for c in (r, g, b))


def markings(fur, stripe, white, pattern, cx, cy, rx, ry, cid):
    """face markings clipped to head"""
    s = f'<g clip-path="url(#{cid})">'
    if pattern == "tabby":
        for dx, h in ((-14, 16), (0, 20), (14, 16)):
            s += f'<path d="M{cx+dx} {cy-ry+2} q{-2 if dx<0 else 2 if dx>0 else 0} {h/2} 0 {h}" stroke="{stripe}" stroke-width="5" stroke-linecap="round" fill="none"/>'
        for side in (-1, 1):
            x = cx + side * rx
            for k in (0, 10):
                s += f'<path d="M{x} {cy-2+k} l{-side*14} 3" stroke="{stripe}" stroke-width="4" stroke-linecap="round"/>'
    if pattern in ("blaze", "tuxedo"):
        s += f'<path d="M{cx} {cy-ry*0.55} C{cx+10} {cy-6} {cx+rx*0.75} {cy+6} {cx+rx*0.8} {cy+ry} L{cx-rx*0.8} {cy+ry} C{cx-rx*0.75} {cy+6} {cx-10} {cy-6} {cx} {cy-ry*0.55}Z" fill="{white}"/>'
    else:
        s += f'<ellipse cx="{cx}" cy="{cy+ry*0.55}" rx="{rx*0.5}" ry="{ry*0.32}" fill="{white}" opacity=".9"/>'
    return s + "</g>"


def cat(style, fur_t, ox, oy, idx):
    name, fur, stripe, white, pattern, sweater = fur_t
    cid = f"h{style}{idx}"
    g = f'<g transform="translate({ox},{oy})">'
    # proportions per style
    P = {
        1: dict(rx=64, ry=54, cy=92, ear=30, body=(46, 40), ol="#6b5446", sw=2.6),
        2: dict(rx=60, ry=50, cy=96, ear=26, body=(50, 44), ol=None, sw=0),
        3: dict(rx=62, ry=50, cy=100, ear=24, body=(58, 46), ol="#7a6252", sw=2.2),
        4: dict(rx=60, ry=52, cy=94, ear=28, body=(50, 44), ol=None, sw=0),
        5: dict(rx=58, ry=50, cy=96, ear=28, body=(48, 44), ol="#6e5a48", sw=1.6),
    }[style]
    cx, cy, rx, ry = 100, P["cy"], P["rx"], P["ry"]
    ol, sw = P["ol"], P["sw"]
    stroke = f' stroke="{ol}" stroke-width="{sw}" stroke-linejoin="round"' if ol else ""
    if style == 4:
        furfill, swfill = f"url(#g{cid})", f"url(#s{cid})"
        g += (f'<defs><radialGradient id="g{cid}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="{shade(fur,1.25)}"/>'
              f'<stop offset="1" stop-color="{shade(fur,.85)}"/></radialGradient>'
              f'<radialGradient id="s{cid}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="{shade(sweater,1.3)}"/>'
              f'<stop offset="1" stop-color="{shade(sweater,.85)}"/></radialGradient></defs>')
    else:
        furfill, swfill = fur, sweater
    if style == 2:  # flat pastel
        furfill = shade(fur, 1.08)
        swfill = shade(sweater, 1.15)
    g += f'<defs><clipPath id="{cid}"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/></clipPath></defs>'
    # shadow
    g += f'<ellipse cx="100" cy="214" rx="62" ry="9" fill="#000" opacity=".12"/>'
    # tail
    bw, bh = P["body"]
    tail_d = f"M{100+bw-6} 200 C{100+bw+30} 200 {100+bw+34} 160 {100+bw+16} 146"
    g += f'<path d="{tail_d}" stroke="{ol or shade(fur,.8)}" stroke-width="{18+2*sw}" stroke-linecap="round" fill="none"/>' if ol else ""
    g += f'<path d="{tail_d}" stroke="{furfill if style!=4 else fur}" stroke-width="16" stroke-linecap="round" fill="none"/>'
    if style == 3:  # mochi: round blob body
        g += f'<ellipse cx="100" cy="{196-bh/2+8}" rx="{bw+8}" ry="{bh}"{stroke} fill="{swfill}"/>'
    else:
        g += f'<path d="M{100-bw} 210 C{100-bw} {210-bh*1.6} {100+bw} {210-bh*1.6} {100+bw} 210 Z"{stroke} fill="{swfill}"/>'
    # collar
    g += f'<path d="M{100-26} {cy+ry-8} Q100 {cy+ry+10} {100+26} {cy+ry-8}" stroke="{shade(sweater,.75)}" stroke-width="7" fill="none" stroke-linecap="round"/>'
    # paws
    pawc = white if pattern in ("blaze", "tuxedo") else furfill
    for side in (-1, 1):
        g += f'<ellipse cx="{100+side*18}" cy="206" rx="13" ry="9"{stroke} fill="{pawc}"/>'
    # ears
    for side in (-1, 1):
        bx = cx + side * rx * 0.62
        e = P["ear"]
        tip = (cx + side * rx * 0.86, cy - ry - e + 6)
        g += (f'<path d="M{bx - side*22} {cy-ry*0.62} Q{tip[0]-side*4} {tip[1]-4} {tip[0]} {tip[1]} '
              f'Q{bx+side*16} {cy-ry*0.7} {bx+side*24} {cy-ry*0.25} Z"{stroke} fill="{furfill}"/>')
        g += (f'<path d="M{bx - side*10} {cy-ry*0.6} Q{tip[0]-side*3} {tip[1]+8} {tip[0]-side*1} {tip[1]+12} '
              f'Q{bx+side*12} {cy-ry*0.6} {bx+side*14} {cy-ry*0.35} Z" fill="{PINK}" opacity=".85"/>')
    # head
    if style == 5:  # sketchy double line
        g += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{furfill}"/>'
    else:
        g += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"{stroke} fill="{furfill}"/>'
    g += markings(fur, stripe, white, pattern, cx, cy, rx, ry, cid)
    if style == 4:  # soft highlight
        g += f'<ellipse cx="{cx-18}" cy="{cy-22}" rx="26" ry="14" fill="#fff" opacity=".22"/>'
    if style == 5:
        g += (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="{ol}" stroke-width="1.6"/>'
              f'<ellipse cx="{cx+1.2}" cy="{cy-1}" rx="{rx-.8}" ry="{ry+.6}" fill="none" stroke="{ol}" stroke-width=".9" opacity=".6" transform="rotate(1.5 {cx} {cy})"/>')
        # light hatching on cheeks
        for side in (-1, 1):
            for k in range(4):
                x = cx + side * (rx - 14) + k * 4 * side * -1
                g += f'<line x1="{x}" y1="{cy+18}" x2="{x+6*side}" y2="{cy+10}" stroke="{ol}" stroke-width=".7" opacity=".35"/>'
    # face: eyes low and wide apart (cuter)
    ey = cy + 10
    ex = 26
    dark = "#2b2230"
    if style == 1:  # chibi: big glossy dark eyes, tiny highlight pair
        for side in (-1, 1):
            x = cx + side * ex
            g += f'<ellipse cx="{x}" cy="{ey}" rx="9" ry="11" fill="{dark}"/>'
            g += f'<circle cx="{x+3}" cy="{ey-4}" r="3.6" fill="#fff"/><circle cx="{x-3}" cy="{ey+4}" r="1.6" fill="#fff"/>'
    elif style == 2:  # flat: small dot eyes
        for side in (-1, 1):
            g += f'<circle cx="{cx+side*ex}" cy="{ey}" r="5" fill="{dark}"/><circle cx="{cx+side*ex+1.6}" cy="{ey-1.8}" r="1.5" fill="#fff"/>'
    elif style == 3:  # content closed eyes
        for side in (-1, 1):
            x = cx + side * ex
            g += f'<path d="M{x-9} {ey-2} Q{x} {ey+8} {x+9} {ey-2}" stroke="{dark}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    elif style == 4:  # soft round eyes looking slightly down
        for side in (-1, 1):
            x = cx + side * ex
            g += f'<ellipse cx="{x}" cy="{ey}" rx="8" ry="9" fill="#3a2c35"/>'
            g += f'<circle cx="{x+2.5}" cy="{ey-3}" r="3" fill="#fff" opacity=".95"/>'
            g += f'<path d="M{x-8} {ey+5} Q{x} {ey+11} {x+8} {ey+5}" stroke="#fff" stroke-width="1.2" fill="none" opacity=".35"/>'
    elif style == 5:  # bean eyes
        for side in (-1, 1):
            x = cx + side * ex
            g += f'<ellipse cx="{x}" cy="{ey}" rx="4.5" ry="6" fill="{dark}" transform="rotate({side*-8} {x} {ey})"/><circle cx="{x+1.2}" cy="{ey-2.4}" r="1.3" fill="#fff"/>'
    # blush
    for side in (-1, 1):
        op = ".75" if style in (1, 3) else ".5"
        g += f'<ellipse cx="{cx+side*(ex+14)}" cy="{ey+12}" rx="9" ry="5" fill="{PINK}" opacity="{op}"/>'
    # nose + mouth
    my = ey + 12
    g += f'<path d="M{cx-4} {my-4} L{cx+4} {my-4} L{cx} {my} Z" fill="#e98a9b"/>'
    mc = "#5a4636" if pattern != "tuxedo" or style == 5 else "#5a4636"
    g += f'<path d="M{cx-8} {my+3} Q{cx-4} {my+8} {cx} {my+2} Q{cx+4} {my+8} {cx+8} {my+3}" stroke="{mc}" stroke-width="2" fill="none" stroke-linecap="round"/>'
    if style in (1, 4):
        wc = "#ffffff" if fur.startswith("#3") else "#6b5446"
        for side in (-1, 1):
            for k in (-3, 3):
                g += f'<line x1="{cx+side*38}" y1="{my+k}" x2="{cx+side*58}" y2="{my+k*2.2}" stroke="{wc}" stroke-width="1.3" opacity=".7" stroke-linecap="round"/>'
    return g + "</g>"


TITLES = {
    1: "1 · Chibi kawaii (ojos brillantes, cara redonda)",
    2: "2 · Plano pastel (sin contorno, ojitos de punto)",
    3: "3 · Contentos (ojos cerraditos, cuerpo mochi)",
    4: "4 · Acuarela suave (degradados, sin contorno)",
    5: "5 · Cuento a lápiz (trazo fino, ojos de frijol)",
}
W, ROW = 900, 270
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{ROW*5+20}" viewBox="0 0 {W} {ROW*5+20}">',
       f'<rect width="100%" height="100%" fill="#4b8b74"/>']
for i, st in enumerate(range(1, 6)):
    y = 10 + i * ROW
    svg.append(f'<rect x="10" y="{y}" width="{W-20}" height="{ROW-10}" rx="14" fill="#5a9a82"/>')
    svg.append(f'<text x="28" y="{y+30}" font-family="Helvetica, Arial" font-weight="700" font-size="20" fill="#fff">{TITLES[st]}</text>')
    for j, f in enumerate(FURS):
        svg.append(cat(st, f, 30 + j * 215, y + 36, j))
svg.append("</svg>")
os.makedirs("out", exist_ok=True)
open("out/styles.svg", "w").write("\n".join(svg))
here = os.path.abspath("out/styles.svg")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu",
                "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={os.path.abspath('styles-preview.png')}",
                f"--window-size={W},{ROW*5+20}", "file://" + here], capture_output=True)
print("ok")
