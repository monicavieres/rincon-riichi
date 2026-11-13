"""Hand-drawn kitten style (ink line + soft wash), in colour.
python3 styles3.py -> out/styles3.svg + styles3-preview.png"""
import os, subprocess

FURS = [  # name, fur, stripe, white, pattern, scarf, eye
    ("you", "#c9ad8e", "#8a6d55", "#fbf3e8", "tabby", "#f2c14e", "#7a9a4a"),
    ("grey", "#b3b8c3", "#8b919e", "#ffffff", "blaze", "#6fb3e6", "#5b8fc2"),
    ("black", "#45444f", "#2c2b34", "#ffffff", "tuxedo", "#8a6fd6", "#c79a2c"),
    ("orange", "#f3b072", "#d98440", "#fff6ea", "tabby", "#e8628f", "#6aa0cf"),
]
INK = "#3b2b27"
PINK = "#f2a3b3"


def sh(hexc, k):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    f = (lambda c: c * k) if k < 1 else (lambda c: c + (255 - c) * (k - 1))
    return "#%02x%02x%02x" % tuple(int(max(0, min(255, f(c)))) for c in (r, g, b))


def mirror(d):
    """mirror an absolute path (M/C/L/Q/Z with numbers) across x=120."""
    import re
    out, i = [], 0
    for t in re.findall(r"[A-Za-z]|-?[\d.]+", d):
        if t.isalpha():
            out.append(t); i = 0
            continue
        v = float(t)
        out.append(f"{240 - v:g}" if i % 2 == 0 else f"{v:g}")
        i += 1
    return " ".join(out)


HEAD = ("M54 104 C46 64 82 36 120 36 C158 36 194 64 186 104 L197 111 L187 116 L195 126 L180 127 "
        "C170 145 146 153 120 153 C94 153 70 145 60 127 L45 126 L53 116 L43 111 Z")
EAR_L = "M60 82 C54 58 52 34 57 15 C76 25 92 37 103 49 Z"
EAR_L_IN = "M67 72 C63 54 62 40 64 28 C75 36 84 44 92 52 Z"
BODY = "M78 140 C58 172 54 216 62 252 L178 252 C186 216 182 172 162 140 Z"
LEG_L = "M95 176 C89 208 86 236 88 252 Q103 262 119 253 C119 232 119 206 119 186 Z"
TAIL = "M170 248 C224 254 232 196 212 158"


def cat(fur_t, ox, oy, idx, expr, texture, uid=None, extra=""):
    name, fur, stripe, white, pat, scarf, eye = fur_t
    u = uid or f"k{idx}{expr}{texture}"
    dark = pat == "tuxedo"
    ink = INK
    lw = 2.4
    st = f' stroke="{ink}" stroke-width="{lw}" stroke-linejoin="round" stroke-linecap="round"'
    thin = f' stroke="{ink}" stroke-width="1.4" fill="none" stroke-linecap="round"'
    D = [f'<clipPath id="h{u}"><path d="{HEAD}"/></clipPath>',
         f'<clipPath id="b{u}"><path d="{BODY}"/><ellipse cx="64" cy="232" rx="27" ry="23"/><ellipse cx="176" cy="232" rx="27" ry="23"/></clipPath>',
         f'']
    G = []
    shade = sh(fur, .78) if not dark else sh(fur, .7)
    light = sh(fur, 1.25) if not dark else sh(fur, 1.35)
    # ground shadow
    G.append('<ellipse cx="120" cy="256" rx="84" ry="9" fill="#000" opacity=".14" filter="url(#blur3)"/>')
    # tail
    G.append(f'<path d="{TAIL}" stroke="{ink}" stroke-width="21" fill="none" stroke-linecap="round"/>')
    G.append(f'<path d="{TAIL}" stroke="{fur}" stroke-width="16.5" fill="none" stroke-linecap="round"/>')
    if pat == "tabby":
        G.append(f'<path d="{TAIL}" stroke="{stripe}" stroke-width="16.5" fill="none" stroke-dasharray="4 10" opacity=".75"/>')
    if pat in ("blaze", "tuxedo"):
        G.append(f'<circle cx="212" cy="160" r="7.5" fill="{white}"/>')
    # haunches + body
    for x in (64, 176):
        G.append(f'<ellipse cx="{x}" cy="232" rx="27" ry="23"{st} fill="{fur}"/>')
    G.append(f'<path d="{BODY}"{st} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#b{u})">')
    if pat in ("blaze", "tuxedo"):
        G.append(f'<path d="M86 140 C92 180 98 210 120 230 C142 210 148 180 154 140 Z" fill="{white}"/>')
    else:
        G.append(f'<ellipse cx="120" cy="190" rx="30" ry="44" fill="{white}" opacity=".55" filter="url(#blur3)"/>')
    if pat == "tabby":
        for x, s in ((60, 1), (180, -1)):
            for k in range(3):
                G.append(f'<path d="M{x - s*14} {214 + k*10} q{s*12} -6 {s*24} 0" stroke="{stripe}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>')
    G.append(f'<ellipse cx="120" cy="150" rx="50" ry="16" fill="{shade}" opacity=".7" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="64" cy="246" rx="24" ry="8" fill="{shade}" opacity=".6" filter="url(#blur3)"/><ellipse cx="176" cy="246" rx="24" ry="8" fill="{shade}" opacity=".6" filter="url(#blur3)"/>')
    G.append('</g>')
    # chest fluff tufts
    # arms reaching forward to the table: grow out of the shoulders, no cut line
    for sd in (1, -1):
        X = (lambda v: v) if sd == 1 else (lambda v: 240 - v)
        armfill = f"M{X(84)} 156 C{X(70)} 188 {X(72)} 222 {X(84)} 238 L{X(112)} 236 C{X(115)} 214 {X(112)} 186 {X(102)} 158 Z"
        G.append(f'<path d="{armfill}" fill="{fur}"/>')
        G.append(f'<clipPath id="a{u}{sd}"><path d="{armfill}"/></clipPath><g clip-path="url(#a{u}{sd})">')
        if pat == "tabby":
            for y in (196, 214):
                G.append(f'<path d="M{X(74)} {y} q{sd*12} 4 {sd*22} 1" stroke="{stripe}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>')
        if pat in ("blaze", "tuxedo"):
            G.append(f'<ellipse cx="{X(96)}" cy="236" rx="20" ry="14" fill="{white}"/>')
        G.append(f'<path d="M{X(108)} 160 C{X(114)} 190 {X(114)} 214 {X(110)} 236 L{X(120)} 236 L{X(120)} 160Z" fill="{shade}" opacity=".45" filter="url(#blur2)"/>')
        G.append('</g>')
        # contour: outer edge from the shoulder down, inner edge only near the paw
        G.append(f'<path d="M{X(84)} 158 C{X(70)} 188 {X(72)} 222 {X(84)} 238" fill="none"{st}/>')
        G.append(f'<path d="M{X(113)} 234 C{X(115)} 220 {X(114)} 206 {X(110)} 194" fill="none"{st}/>')
        # round paw resting on the table, ready to pick a tile
        pc = white if pat in ("blaze", "tuxedo") else fur
        G.append(f'<path d="M{X(80)} 240 C{X(78)} 228 {X(114)} 226 {X(114)} 240 C{X(114)} 252 {X(80)} 252 {X(80)} 240Z"{st} fill="{pc}"/>')
        for k in (89, 97, 105):
            G.append(f'<path d="M{X(k)} 247 v4" {thin[1:]}/>')
        G.append(f'<ellipse cx="{X(97)}" cy="235" rx="9" ry="4" fill="#fff" opacity=".35" filter="url(#blur1)"/>')
    # scarf (theme colour)
    G.append(f'<path d="M84 145 Q120 160 156 145 L150 154 Q120 166 90 154 Z"{st} fill="{scarf}"/>')
    G.append(f'<path d="M126 158 L144 186 L124 178 Z"{st} fill="{sh(scarf, .88)}"/>')
    G.append(f'<circle cx="124" cy="159" r="5"{st} fill="{sh(scarf, .82)}"/>')
    # ears
    for d, di in ((EAR_L, EAR_L_IN), (mirror(EAR_L), mirror(EAR_L_IN))):
        G.append(f'<path d="{d}"{st} fill="{fur}"/>')
        G.append(f'<path d="{di}" fill="{PINK}" opacity=".9"/>')
    for s in (1, -1):  # ear tufts
        bx = 120 - s * 46
        G.append(f'<path d="M{bx} 56 q{-s*3} -10 {-s*1} -16 M{bx + s*5} 58 q{-s*2} -9 {s*1} -14 M{bx - s*5} 58 q{-s*4} -8 {-s*4} -12" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>')
    # head
    G.append(f'<path d="{HEAD}"{st} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#h{u})">')
    if pat == "tabby":
        G.append(f'<path d="M104 40 q-2 10 2 22 M120 38 v24 M136 40 q2 10 -2 22" stroke="{stripe}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".75"/>')
        for s in (1, -1):
            x = 120 - s * 66
            G.append(f'<path d="M{x} 100 q{s*10} 1 {s*18} 5 M{x - s*2} 112 q{s*10} 0 {s*16} 4" stroke="{stripe}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>')
        G.append(f'<ellipse cx="120" cy="128" rx="30" ry="20" fill="{white}" opacity=".85" filter="url(#blur3)"/>')
    else:
        G.append(f'<path d="M120 62 C128 86 168 98 172 160 L68 160 C72 98 112 86 120 62 Z" fill="{white}"/>')
    G.append(f'<ellipse cx="104" cy="58" rx="34" ry="14" fill="{light}" opacity=".55" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="120" cy="150" rx="70" ry="14" fill="{shade}" opacity=".5" filter="url(#blur4)"/>')
    G.append('</g>')
    # head-top fluff
    G.append(f'<path d="M110 40 l4 -8 l2 7 l5 -7 l1 8" {thin[1:]}/>')
    # face
    ey = 102
    W2 = f' stroke="{ink}" fill="none" stroke-linecap="round" stroke-linejoin="round"'
    def dot(x, y, r=7.6, look=(0, 0)):
        return (f'<ellipse cx="{x+look[0]}" cy="{y+look[1]}" rx="{r}" ry="{r*1.15}" fill="#2a2026"/>'
                f'<circle cx="{x+look[0]+r*.35}" cy="{y+look[1]-r*.4}" r="{r*.38}" fill="#fff"/><circle cx="{x+look[0]-r*.4}" cy="{y+look[1]+r*.45}" r="{r*.16}" fill="#fff"/>')
    def arc_up(x, y):  # ^ closed happy eye
        return f'<path d="M{x-14} {y+4} Q{x} {y-11} {x+14} {y+4}"{W2} stroke-width="3.2"/>'
    def arc_down(x, y):  # sleepy / content
        return f'<path d="M{x-13} {y-1} Q{x} {y+8} {x+13} {y-1}"{W2} stroke-width="3"/>'
    for s in (-1, 1):
        x = 120 + s * 27
        if expr in ("happy", "smile"):
            G.append(arc_up(x, ey))
        elif expr in ("calm", "nervous"):
            G.append(dot(x, ey + 3))
        elif expr == "wink":
            G.append(arc_up(x, ey) if s == 1 else dot(x, ey + 3))
        elif expr == "surprised":
            G.append(dot(x, ey + 2, 9))
        elif expr == "sleepy":
            G.append(arc_down(x, ey + 2))
        elif expr == "thinking":
            G.append(dot(x, ey + 2, 7.6, (3, -3)))
        elif expr == "excited":
            G.append(f'<path d="M{x + s*10} {ey-6} L{x - s*9} {ey+2} L{x + s*10} {ey+10}"{W2} stroke-width="3.2"/>')
        elif expr == "sad":
            G.append(dot(x, ey + 4, 7.6, (0, 1)))
            G.append(f'<path d="M{x-8} {ey-9} Q{x} {ey-11 + s*0} {x+8} {ey-6 if s==-1 else ey-12}"{W2} stroke-width="2"/>' if False else
                     f'<path d="M{x - s*8} {ey-7} L{x + s*7} {ey-11}"{W2} stroke-width="2.2"/>')
        # blush with pencil hatching
        G.append(f'<ellipse cx="{120 + s*44}" cy="{ey+18}" rx="11" ry="6" fill="{PINK}" opacity="{.95 if expr in ("excited","wink","happy") else .7}" filter="url(#blur2)"/>')
        for k in (-5, 0, 5):
            bx = 120 + s * 44 + k
            G.append(f'<path d="M{bx-2} {ey+21} l4 -6" stroke="#d9768c" stroke-width="1.1" stroke-linecap="round"/>')
        for k in (-3, 4):
            G.append(f'<path d="M{120 + s*60} {ey+16 + k} q{s*14} {-2 + k*.4} {s*26} {k*1.2 - 4}" stroke="{ink}" stroke-width="1.1" fill="none" stroke-linecap="round"/>')
    G.append(f'<path d="M116 113 Q120 111 124 113 L120 117.5 Z" fill="#e2879a" stroke="{ink}" stroke-width="1.2" stroke-linejoin="round"/>')
    OPEN = (f'<path d="M108 121 Q114 125 120 120 Q126 125 132 121 Q128 138 120 138 Q112 138 108 121 Z" fill="#a8434f" stroke="{ink}" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M112 131 Q120 125 128 131 Q124 138 120 138 Q116 138 112 131 Z" fill="#f08a9a"/>')
    W3 = f'<path d="M120 117.5 v3 M113 122 Q117 126 120 121 Q123 126 127 122"{W2} stroke-width="1.7"/>'
    if expr in ("happy", "excited"):
        G.append(OPEN)
    elif expr == "wink":
        G.append(W3 + f'<path d="M117 124 Q120 133 124 124 Z" fill="#f08a9a" stroke="{ink}" stroke-width="1.4"/>')
    elif expr == "surprised":
        G.append(f'<path d="M120 117.5 v2"{W2} stroke-width="1.5"/><ellipse cx="120" cy="126" rx="4.5" ry="5.5" fill="#a8434f" stroke="{ink}" stroke-width="1.6"/>')
    elif expr == "sleepy":
        G.append(f'<path d="M120 117.5 v3 M115 123 Q120 126 125 123"{W2} stroke-width="1.6"/>')
        G.append(f'<text x="198" y="78" font-family="Georgia" font-style="italic" font-weight="700" font-size="18" fill="{ink}" opacity=".7">z</text><text x="212" y="62" font-family="Georgia" font-style="italic" font-weight="700" font-size="13" fill="{ink}" opacity=".55">z</text>')
    elif expr == "thinking":
        G.append(f'<path d="M120 117.5 v3 M114 124 q3 -2 6 0 q3 2 6 0"{W2} stroke-width="1.6"/>')
        G.append(f'<circle cx="196" cy="80" r="3" fill="#fff" stroke="{ink}" stroke-width="1.3"/><circle cx="206" cy="68" r="5" fill="#fff" stroke="{ink}" stroke-width="1.3"/><text x="212" y="58" font-family="Helvetica" font-weight="700" font-size="20" fill="{ink}">?</text>')
    elif expr == "nervous":
        G.append(f'<path d="M120 117.5 v3 M111 125 q2.5 -3 5 0 q2.5 3 5 0 q2.5 -3 5 0 q2.5 3 3 0"{W2} stroke-width="1.6"/>')
        G.append(f'<path d="M176 66 q-7 10 0 14 q7 -4 0 -14Z" fill="#9fd3f2" stroke="{ink}" stroke-width="1.3"/>')
    elif expr == "sad":
        G.append(f'<path d="M120 117.5 v3 M113 127 Q120 121 127 127"{W2} stroke-width="1.7"/>')
        G.append(f'<path d="M95 112 q-4 8 0 11 q4 -3 0 -11Z" fill="#9fd3f2" stroke="{ink}" stroke-width="1.1"/>')
    else:
        G.append(W3)
    if expr == "excited":
        for (sx, sy, r) in ((40, 60, 9), (200, 70, 7), (210, 140, 5)):
            G.append(f'<path d="M{sx} {sy-r} Q{sx} {sy} {sx+r} {sy} Q{sx} {sy} {sx} {sy+r} Q{sx} {sy} {sx-r} {sy} Q{sx} {sy} {sx} {sy-r}Z" fill="#ffd34d" stroke="{ink}" stroke-width="1.2"/>')
    G.append(extra)
    if name == "grey":  # glasses
        for s in (-1, 1):
            G.append(f'<circle cx="{120 + s*27}" cy="{ey+2}" r="17" fill="#fff" fill-opacity=".14" stroke="{ink}" stroke-width="2"/>')
        G.append(f'<path d="M110 {ey-1} Q120 {ey-6} 130 {ey-1}" stroke="{ink}" stroke-width="2" fill="none"/>')
    body = "".join(G)
    tex = ""
    if texture:
        tex = (f'<g filter="url(#pencil)" opacity=".9"><path d="{HEAD}"/><path d="{BODY}"/>'
               f'<ellipse cx="64" cy="232" rx="27" ry="23"/><ellipse cx="176" cy="232" rx="27" ry="23"/></g>')
    return (f'<g transform="translate({ox},{oy})"><defs>{"".join(D)}</defs>'
            f'<g filter="url(#ink)">{body}</g>{tex}</g>')


DEFS = """
<filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>
<filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="1.1 .35" numOctaves="2" seed="5"/>
  <feColorMatrix values="0 0 0 0 .25  0 0 0 0 .2  0 0 0 0 .18  0 0 0 .22 -.02"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="blur1"><feGaussianBlur stdDeviation="1"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="blur3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="blur4" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
"""
if __name__ == "__main__":
    EXPRS = [("happy", "Feliz"), ("smile", "Contento"), ("calm", "Tranquilo"), ("wink", "Guiño"), ("excited", "¡Ganó!"),
             ("surprised", "Sorpresa"), ("thinking", "Pensando"), ("nervous", "Nervioso"), ("sleepy", "Esperando turno"), ("sad", "Perdió")]
    W, CW, CH = 1000, 196, 300
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{CH*2+70}" viewBox="0 0 {W} {CH*2+70}">',
           f'<defs>{DEFS}</defs><rect width="100%" height="100%" fill="#f4eee2"/>',
           '<text x="20" y="36" font-family="Helvetica, Arial" font-weight="700" font-size="20" fill="#3b2b27">Estilo A · expresiones</text>']
    for i, (expr, label) in enumerate(EXPRS):
        r, c = divmod(i, 5)
        x, y = 8 + c * CW, 56 + r * CH
        out.append(f'<g transform="translate({x},{y}) scale(.8)">{cat(FURS[i % 4], 0, 0, i, expr, False)}</g>')
        out.append(f'<text x="{x + 96}" y="{y + 238}" text-anchor="middle" font-family="Helvetica, Arial" font-weight="700" font-size="16" fill="#3b2b27">{label}</text>')
    out.append("</svg>")
    os.makedirs("out", exist_ok=True)
    open("out/styles3.svg", "w").write("\n".join(out))
    subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu",
                    "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={os.path.abspath('styles3-preview.png')}",
                    f"--window-size={W},{CH*2+70}", "file://" + os.path.abspath("out/styles3.svg")], capture_output=True)
    print("ok")
