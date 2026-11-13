"""Five richer candidate drawing styles for the tutorial cats.
python3 styles2.py -> out/styles2.svg + styles2-preview.png"""
import math, os, random, subprocess

FURS = [  # name, fur, stripe, white, pattern, sweater
    ("you", "#b39a80", "#7a6250", "#f6eadb", "tabby", "#f2c14e"),
    ("grey", "#a9afbb", "#7f8693", "#ffffff", "blaze", "#6fb3e6"),
    ("black", "#3a3a46", "#22222b", "#ffffff", "tuxedo", "#8a6fd6"),
    ("orange", "#f2a560", "#d4772f", "#fff4e6", "tabby", "#e8628f"),
]
PINK = "#f4a7b5"


def sh(hexc, k):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    f = (lambda c: c * k) if k < 1 else (lambda c: c + (255 - c) * (k - 1))
    return "#%02x%02x%02x" % tuple(int(max(0, min(255, f(c)))) for c in (r, g, b))


def fluffy(cx, cy, rx, ry, n=22, amp=5, a0=0, a1=360, jitter=0.0, rnd=None):
    """closed path around an ellipse with soft bumps (fur tufts)."""
    pts = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(n):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        nx, ny = mx - cx, my - cy
        L = math.hypot(nx, ny) or 1
        k = amp * (1 + (rnd.uniform(-jitter, jitter) if rnd else 0))
        d += f" Q{mx + nx / L * k * 2:.1f} {my + ny / L * k * 2:.1f} {x1:.1f} {y1:.1f}"
    return d + "Z"


def fur_strokes(rnd, cx, cy, rx, ry, col, n, w=1.4, op=0.5, length=7):
    s = ""
    for _ in range(n):
        a = rnd.uniform(0, 2 * math.pi)
        r = math.sqrt(rnd.uniform(0.05, 1))
        x, y = cx + rx * r * math.cos(a), cy + ry * r * math.sin(a)
        ang = math.atan2(y - cy + ry * .6, x - cx) + rnd.uniform(-.4, .4)
        x2, y2 = x + math.cos(ang) * length, y + math.sin(ang) * length
        s += f'<path d="M{x:.1f} {y:.1f} Q{(x+x2)/2+1.5:.1f} {(y+y2)/2:.1f} {x2:.1f} {y2:.1f}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" fill="none" opacity="{op}"/>'
    return s


def defs_common():
    return """
<filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="5"/>
</filter>
<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/>
  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="felt"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="turbulence" baseFrequency=".06" numOctaves="2" seed="9" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
</filter>
<filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
"""


def cat(style, fur_t, ox, oy, idx):
    name, fur, stripe, white, pat, sw = fur_t
    rnd = random.Random(idx * 31 + style)
    uid = f"s{style}c{idx}"
    dark = fur.startswith("#3")
    cx, hy, rx, ry = 100, 108, 64, 54          # head
    ol = {1: "#5b4438", 2: None, 3: "#6e5848", 4: None, 5: "#4b3a33"}[style]
    olw = {1: 2.2, 3: 1.4, 5: 2.6}.get(style, 0)
    S = lambda: f' stroke="{ol}" stroke-width="{olw}" stroke-linejoin="round"' if ol else ""
    G = []
    defs = []
    # fills
    if style in (4, 1):
        for key, base in (("f", fur), ("w", sw), ("wh", white)):
            defs.append(f'<radialGradient id="{key}{uid}" cx=".38" cy=".3" r=".85">'
                        f'<stop offset="0" stop-color="{sh(base, 1.22)}"/><stop offset=".65" stop-color="{base}"/>'
                        f'<stop offset="1" stop-color="{sh(base, .78)}"/></radialGradient>')
        F, SW, WH = f"url(#f{uid})", f"url(#w{uid})", f"url(#wh{uid})"
    elif style == 3:
        F, SW, WH = sh(fur, 1.12), sh(sw, 1.18), white
    else:
        F, SW, WH = fur, sw, white
    defs.append(f'<clipPath id="hc{uid}"><path d="{fluffy(cx, hy, rx, ry, 26, 2.2)}"/></clipPath>')
    defs.append(f'<clipPath id="bc{uid}"><path id="bp{uid}" d="M42 262 C36 200 58 160 100 158 C142 160 164 200 158 262 Z"/></clipPath>')
    flt = {3: ' filter="url(#wc)"', 5: ' filter="url(#brush)"'}.get(style, "")
    G.append(f'<g{flt}>')
    # shadow
    G.append('<ellipse cx="100" cy="262" rx="72" ry="10" fill="#000" opacity=".13"/>')
    # tail (fluffy, curled)
    td = "M150 248 C196 250 204 200 178 182"
    if ol: G.append(f'<path d="{td}" stroke="{ol}" stroke-width="{22+2*olw}" stroke-linecap="round" fill="none"/>')
    G.append(f'<path d="{td}" stroke="{fur}" stroke-width="22" stroke-linecap="round" fill="none"/>')
    if pat == "tabby":
        for t in (.3, .55, .8):
            x = 150 + (178 - 150) * t + 28 * math.sin(t * 3)
            y = 248 - (248 - 182) * t
        G.append(f'<path d="{td}" stroke="{stripe}" stroke-width="22" stroke-dasharray="5 9" fill="none" opacity=".7"/>')
    if pat in ("blaze", "tuxedo"):
        G.append(f'<circle cx="178" cy="184" r="9" fill="{white}"/>')
    # body / sweater
    bd = "M42 262 C36 200 58 160 100 158 C142 160 164 200 158 262 Z"
    G.append(f'<path d="{bd}"{S()} fill="{SW}"/>')
    G.append(f'<g clip-path="url(#bc{uid})">')
    # knit texture: ribs + cable
    if style in (1, 2, 4, 5):
        for x in range(46, 160, 9):
            G.append(f'<path d="M{x} 166 q2 48 0 96" stroke="{sh(sw, .82)}" stroke-width="1.4" fill="none" opacity=".55"/>')
        G.append(f'<path d="M92 175 q8 8 0 16 q-8 8 0 16 q8 8 0 16 q-8 8 0 16 M108 175 q-8 8 0 16 q8 8 0 16 q-8 8 0 16 q8 8 0 16" stroke="{sh(sw, .72)}" stroke-width="2.4" fill="none" opacity=".6"/>')
    if style == 3:
        G.append(f'<path d="M40 230 Q100 214 160 236 L160 262 L40 262Z" fill="{sh(sw, .85)}" opacity=".5"/>')
    G.append(f'<rect x="30" y="246" width="140" height="18" fill="{sh(sw, .8)}" opacity=".7"/>')  # hem rib
    for x in range(32, 170, 5):
        G.append(f'<line x1="{x}" y1="247" x2="{x}" y2="262" stroke="{sh(sw, .68)}" stroke-width="1" opacity=".6"/>')
    G.append('</g>')
    # sleeves + paws resting on table edge
    for side in (-1, 1):
        x = 100 + side * 30
        G.append(f'<ellipse cx="{x}" cy="216" rx="17" ry="34"{S()} fill="{SW}" transform="rotate({side*-12} {x} 216)"/>')
        G.append(f'<path d="M{x - 13 - side*4} 238 q13 7 26 0" stroke="{sh(sw, .7)}" stroke-width="2.2" fill="none" transform="rotate({side*-12} {x} 216)"/>')
        pc = WH if pat in ("blaze", "tuxedo") else F
        G.append(f'<ellipse cx="{x - side*2}" cy="248" rx="14" ry="10"{S()} fill="{pc}"/>')
        for k in (-5, 0, 5):
            G.append(f'<line x1="{x - side*2 + k}" y1="252" x2="{x - side*2 + k}" y2="257" stroke="{ol or sh(fur, .6)}" stroke-width="1.2" opacity=".6"/>')
    # chest fluff at neckline
    G.append(f'<path d="{fluffy(100, 160, 30, 14, 12, 2.5, 0, 180)}" fill="{WH if pat != "tabby" else sh(white, .97)}"{S() if style != 3 else ""}/>')
    # ears
    for side in (-1, 1):
        bx = cx + side * 38
        tip = (cx + side * 56, hy - 92)
        ed = f"M{bx - side*26} {hy-40} C{bx - side*10} {hy-70} {tip[0]-side*6} {tip[1]} {tip[0]} {tip[1]} C{tip[0]+side*6} {tip[1]+20} {bx + side*26} {hy-40} {bx + side*24} {hy-14}Z"
        G.append(f'<path d="{ed}"{S()} fill="{F}"/>')
        G.append(f'<path d="M{bx - side*14} {hy-42} C{bx - side*4} {hy-62} {tip[0]-side*4} {tip[1]+12} {tip[0]-side*1} {tip[1]+14} C{tip[0]+side*4} {tip[1]+28} {bx + side*16} {hy-40} {bx + side*14} {hy-24}Z" fill="{PINK}"/>')
        for k in range(3):  # ear tufts
            G.append(f'<path d="M{bx + side*(2+k*5)} {hy-30} q{side*-4} {-14 - k*3} {side*-1} {-22 - k*2}" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>')
    # head (fluffy outline, cheek tufts)
    hd = fluffy(cx, hy, rx, ry, 26, 2.2)
    G.append(f'<path d="{hd}"{S()} fill="{F}"/>')
    for side in (-1, 1):  # cheek fluff
        G.append(f'<path d="M{cx + side*(rx-6)} {hy+4} l{side*12} 6 l{-side*8} 2 l{side*10} 8 l{-side*12} 0 z"{S()} fill="{F}"/>')
    G.append(f'<g clip-path="url(#hc{uid})">')
    if pat == "tabby":
        G.append(f'<path d="M{cx-16} {hy-ry+4} q-2 10 2 20 M{cx} {hy-ry+2} v22 M{cx+16} {hy-ry+4} q2 10 -2 20" stroke="{stripe}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>')
        for side in (-1, 1):
            G.append(f'<path d="M{cx+side*rx} {hy-4} q{-side*10} 2 {-side*18} 6 M{cx+side*rx} {hy+8} q{-side*10} 0 {-side*16} 4" stroke="{stripe}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>')
        G.append(f'<ellipse cx="{cx}" cy="{hy+30}" rx="30" ry="18" fill="{WH}" opacity=".95"/>')
    else:
        G.append(f'<path d="M{cx} {hy-34} C{cx+8} {hy-8} {cx+50} {hy+4} {cx+56} {hy+60} L{cx-56} {hy+60} C{cx-50} {hy+4} {cx-8} {hy-8} {cx} {hy-34}Z" fill="{WH}"/>')
    if style in (1, 4, 5):
        G.append(fur_strokes(rnd, cx, hy - 8, rx - 10, ry - 16, sh(fur, .7) if not dark else sh(fur, 1.6), 26, 1.2, .45, 6))
    if style == 4:  # rim light + soft top shine
        G.append(f'<ellipse cx="{cx-16}" cy="{hy-30}" rx="30" ry="14" fill="#fff" opacity=".2" filter="url(#soft)"/>')
        G.append(f'<path d="M{cx-rx+4} {hy+6} A{rx} {ry} 0 0 0 {cx+rx-4} {hy+6}" stroke="#000" stroke-width="10" opacity=".08" fill="none"/>')
    G.append('</g>')
    # face
    ey, ex = hy + 8, 27
    eyec = {"you": "#5d8f3a", "grey": "#4f8fc7", "black": "#d2a52a", "orange": "#6aa7d8"}[name]
    for side in (-1, 1):
        x = cx + side * ex
        if style == 1:   # anime, round soft eyes, gaze down at the tiles
            G.append(f'<ellipse cx="{x}" cy="{ey}" rx="11" ry="12.5" fill="#fff"/>')
            G.append(f'<ellipse cx="{x}" cy="{ey+2.5}" rx="9.5" ry="10.5" fill="{eyec}"/>')
            G.append(f'<ellipse cx="{x}" cy="{ey+5}" rx="5.5" ry="6.5" fill="#1d1820"/>')
            G.append(f'<path d="M{x-11.5} {ey-2} Q{x} {ey-16} {x+11.5} {ey-2}" stroke="#2a2026" stroke-width="2.6" fill="none" stroke-linecap="round"/>')
            G.append(f'<circle cx="{x+3.5}" cy="{ey+1}" r="3.4" fill="#fff"/><circle cx="{x-3.5}" cy="{ey+8}" r="1.6" fill="#fff"/>')
        elif style == 2:  # plush: embroidered happy eyes
            G.append(f'<path d="M{x-10} {ey+2} Q{x} {ey-9} {x+10} {ey+2}" stroke="#2a2026" stroke-width="3.4" fill="none" stroke-linecap="round"/>')
            for k in (-6, 0, 6):
                G.append(f'<line x1="{x+k}" y1="{ey-4+abs(k)/2}" x2="{x+k*1.4}" y2="{ey-9+abs(k)/2}" stroke="#2a2026" stroke-width="1.6" stroke-linecap="round"/>')
        elif style == 3:  # watercolor: small oval eyes looking down
            G.append(f'<ellipse cx="{x}" cy="{ey+2}" rx="5.5" ry="7" fill="#2e2630"/>')
            G.append(f'<circle cx="{x+1.5}" cy="{ey-1}" r="1.8" fill="#fff"/>')
        elif style == 4:  # 3D: happy smiling crescent eyes
            G.append(f'<path d="M{x-10} {ey+4} Q{x} {ey-10} {x+10} {ey+4}" stroke="#2b2230" stroke-width="4.2" fill="none" stroke-linecap="round"/>')
            G.append(f'<path d="M{x-5} {ey-1} Q{x} {ey-5} {x+5} {ey-1}" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6" stroke-linecap="round"/>')
        elif style == 5:  # gouache: soft round eyes, glancing aside
            G.append(f'<ellipse cx="{x}" cy="{ey}" rx="9" ry="10" fill="{sh(eyec, 1.1)}"/>')
            G.append(f'<ellipse cx="{x-2}" cy="{ey+2}" rx="4.5" ry="6" fill="#1d1820"/>')
            G.append(f'<path d="M{x-10} {ey-3} Q{x} {ey-14} {x+10} {ey-3}" stroke="#2a2026" stroke-width="2.4" fill="none" stroke-linecap="round"/>')
            G.append(f'<circle cx="{x+2}" cy="{ey-2}" r="2.6" fill="#fff"/>')
    # blush
    for side in (-1, 1):
        if style == 3:
            G.append(f'<ellipse cx="{cx+side*44}" cy="{ey+18}" rx="11" ry="7" fill="{PINK}" opacity=".6" filter="url(#soft)"/>')
        elif style == 2:
            G.append(f'<circle cx="{cx+side*42}" cy="{ey+16}" r="7" fill="{PINK}" opacity=".9"/>')
        else:
            G.append(f'<ellipse cx="{cx+side*42}" cy="{ey+17}" rx="9" ry="5" fill="{PINK}" opacity=".6"/>')
            if style in (1, 4):
                for k in (-4, 0, 4):
                    G.append(f'<line x1="{cx+side*42+k-1}" y1="{ey+20}" x2="{cx+side*42+k+2}" y2="{ey+14}" stroke="#e57d93" stroke-width="1" opacity=".7"/>')
    # muzzle puffs, nose, mouth
    my = ey + 20
    G.append(f'<ellipse cx="{cx-7}" cy="{my+4}" rx="8" ry="6" fill="{WH}" opacity=".9"/><ellipse cx="{cx+7}" cy="{my+4}" rx="8" ry="6" fill="{WH}" opacity=".9"/>')
    G.append(f'<path d="M{cx-5} {my-4} Q{cx} {my-6} {cx+5} {my-4} Q{cx+2} {my+1} {cx} {my+1} Q{cx-2} {my+1} {cx-5} {my-4}Z" fill="#e98a9b"/>')
    G.append(f'<path d="M{cx} {my+1} v3 M{cx-7} {my+5} Q{cx-3} {my+9} {cx} {my+4} Q{cx+3} {my+9} {cx+7} {my+5}" stroke="#6b4d45" stroke-width="1.7" fill="none" stroke-linecap="round"/>')
    if style == 2:  # stitched seams
        G.append(f'<path d="{hd}" fill="none" stroke="{sh(fur, .6) if not dark else "#777"}" stroke-width="1.4" stroke-dasharray="4 4" transform="translate(100 108) scale(.92) translate(-100 -108)"/>')
        G.append(f'<path d="M{cx} {hy-ry+6} v20" stroke="{sh(fur, .6) if not dark else "#777"}" stroke-width="1.4" stroke-dasharray="3 3"/>')
        G.append(f'<path d="{bd}" fill="none" stroke="{sh(sw, .6)}" stroke-width="1.4" stroke-dasharray="4 4" transform="translate(100 210) scale(.9) translate(-100 -210)"/>')
    # whiskers
    wc = "#ffffff" if dark else "#6b5446"
    for side in (-1, 1):
        for k in (-3, 3):
            G.append(f'<path d="M{cx+side*16} {my+2+k} q{side*22} {k*1.2-2} {side*44} {k*2.6}" stroke="{wc}" stroke-width="1.1" fill="none" opacity=".7" stroke-linecap="round"/>')
    if name == "grey":  # glasses
        for side in (-1, 1):
            G.append(f'<circle cx="{cx+side*ex}" cy="{ey+1}" r="15" fill="#fff" fill-opacity=".12" stroke="#4a3b37" stroke-width="2"/>')
        G.append(f'<path d="M{cx-12} {ey-1} Q{cx} {ey-6} {cx+12} {ey-1}" stroke="#4a3b37" stroke-width="2" fill="none"/>')
    G.append('</g>')
    # texture overlays
    if style == 3:
        G.append(f'<path d="{hd}" filter="url(#paper)" fill="#000"/>')
        G.append(f'<path d="{bd}" filter="url(#paper)" fill="#000"/>')
    if style == 2:
        G.append(f'<path d="{hd}" filter="url(#felt)" fill="#fff"/><path d="{bd}" filter="url(#felt)" fill="#fff"/>')
    return f'<g transform="translate({ox},{oy})"><defs>{"".join(defs)}</defs>{"".join(G)}</g>'


TITLES = {
    1: "1 · Anime tierno (pelaje, ojos redondos que miran las fichas)",
    2: "2 · Peluche (fieltro cosido, ojitos bordados felices)",
    3: "3 · Acuarela de cuento (bordes pintados, papel)",
    4: "4 · Esponjoso 3D (volumen, ojitos sonrientes)",
    5: "5 · Pincel / gouache (trazo orgánico, mirada suave)",
}
W, ROW = 900, 330
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{ROW*5+20}" viewBox="0 0 {W} {ROW*5+20}">',
       f'<defs>{defs_common()}</defs><rect width="100%" height="100%" fill="#4b8b74"/>']
for i, st in enumerate(range(1, 6)):
    y = 10 + i * ROW
    out.append(f'<rect x="10" y="{y}" width="{W-20}" height="{ROW-10}" rx="14" fill="#5a9a82"/>')
    out.append(f'<text x="28" y="{y+30}" font-family="Helvetica, Arial" font-weight="700" font-size="19" fill="#fff">{TITLES[st]}</text>')
    for j, f in enumerate(FURS):
        out.append(cat(st, f, 22 + j * 216, y + 40, j))
out.append("</svg>")
os.makedirs("out", exist_ok=True)
open("out/styles2.svg", "w").write("\n".join(out))
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu",
                "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={os.path.abspath('styles2-preview.png')}",
                f"--window-size={W},{ROW*5+20}", "file://" + os.path.abspath("out/styles2.svg")], capture_output=True)
print("ok")
