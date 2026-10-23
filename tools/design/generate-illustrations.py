"""Isometric illustration generator for Rincón Riichi.
Draws flat-shaded, outlined boxes (table, walls, console, dice, point sticks)
and writes each scene in a light and a dark variant."""
import base64, math, os, re, subprocess, sys, tempfile

OUT = sys.argv[1]
GLYPHS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'tiles-fluffystuff-png')
_glyph_cache = {}


def glyph_data(code):
    """The site's own tile artwork (FluffyStuff glyphs), shrunk with macOS sips and inlined."""
    if code not in _glyph_cache:
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, f'{code}.png')
            subprocess.run(['sips', '-Z', '128', os.path.join(GLYPHS, f'{code}.png'), '--out', out], check=True, capture_output=True)
            _glyph_cache[code] = 'data:image/png;base64,' + base64.b64encode(open(out, 'rb').read()).decode()
    return _glyph_cache[code]
os.makedirs(OUT, exist_ok=True)
C30, S30 = math.cos(math.radians(30)), 0.5

THEMES = {
    'light': {
        'ink': '#23203f', 'shadow': 'rgba(60,45,20,0.16)', 'rim': None, 'cast': 'rgba(10,40,40,0.22)',
        'rail': '#b2713c', 'felt': '#22a08b', 'console': '#2e2a48',
        'cream': '#fbf2df', 'back': '#f3c63d', 'gold': '#f2b42c', 'pin': '#2f7fd6',
        'sou': '#22a565', 'tsumo': '#f07a3a', 'man': '#e0457f', 'white': '#fffdf6',
        'wood': '#e9a25a', 'screen': '#9ff0d8', 'cplate': '#55bdeb', 'cpurple': '#4d3eb8', 'cwell': '#0a0a0b', 'cinset': '#3b3020', 'cnum': '#fff6dc', 'cnumline': '#2f2984',
    },
    'dark': {
        'ink': '#0c0a14', 'shadow': 'rgba(0,0,0,0.45)', 'rim': '#4a4466', 'cast': 'rgba(0,0,0,0.38)',
        'rail': '#a8693a', 'felt': '#2bb39c', 'console': '#3a3558',
        'cream': '#f6ead3', 'back': '#f5cd55', 'gold': '#f5c451', 'pin': '#5aa2ee',
        'sou': '#3fc283', 'tsumo': '#f59560', 'man': '#f06d9e', 'white': '#fffaf0',
        'wood': '#eeac68', 'screen': '#b6f7e4', 'cplate': '#46a6d6', 'cpurple': '#6454d0', 'cwell': '#050506', 'cinset': '#33291a', 'cnum': '#fff6dc', 'cnumline': '#2f2984',
    },
    'cute': {
        'ink': '#6b3a5a', 'shadow': 'rgba(170,80,130,0.18)', 'rim': '#ffd1e6', 'cast': 'rgba(140,50,100,0.20)',
        'rail': '#f2a7c3', 'felt': '#ff9ec7', 'console': '#e58bb5',
        'cream': '#fff5fa', 'back': '#ffd1e6', 'gold': '#ffb3d1', 'pin': '#b18cff',
        'sou': '#ff7fae', 'tsumo': '#ff9f7a', 'man': '#e84f8f', 'white': '#fffafd',
        'wood': '#ffc2d9', 'screen': '#ffd9ea', 'cplate': '#ff9ec7', 'cpurple': '#b46bd6', 'cwell': '#6b3a5a', 'cinset': '#8f5b77', 'cnum': '#fff5fa', 'cnumline': '#b46bd6',
    },
}


def shade(hex_, k):
    h = hex_.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(v * k))) for v in (r, g, b))


def P(x, y, z):
    return ((x - y) * C30, (x + y) * S30 - z)


class Scene:
    def __init__(self, t):
        self.t, self.items, self.pts, self.glyphs = t, [], [], set()

    def poly(self, pts3, fill, stroke=True, sw=1.6, extra=''):
        pts = [P(*p) for p in pts3]
        self.pts += pts
        d = ' '.join('%.1f,%.1f' % p for p in pts)
        st = f' stroke="{self.t["ink"]}" stroke-width="{sw}" stroke-linejoin="round"' if stroke else ''
        return f'<polygon points="{d}" fill="{fill}"{st}{extra}/>'

    def circle(self, c, a1, a2, r, fill, stroke=True, sw=1.2, n=20):
        pts = [tuple(c[i] + r * (math.cos(2 * math.pi * k / n) * a1[i] + math.sin(2 * math.pi * k / n) * a2[i]) for i in range(3)) for k in range(n)]
        return self.poly(pts, fill, stroke, sw)

    def box(self, x, y, z, w, d, h, top, left=None, right=None, bands=None, deco=(), key=None, sw=1.6):
        """bands: list of (fraction_from_bottom, colour) splitting the side faces."""
        left = left or shade(top, 0.86)
        right = right or shade(top, 0.72)
        out = []
        sides = bands or [(1.0, None)]
        z0 = z
        for frac, col in sides:
            z1 = z + h * frac
            lc = shade(col, 0.9) if col else left
            rc = shade(col, 0.76) if col else right
            out.append(self.poly([(x, y + d, z0), (x + w, y + d, z0), (x + w, y + d, z1), (x, y + d, z1)], lc, sw=sw))
            out.append(self.poly([(x + w, y, z0), (x + w, y + d, z0), (x + w, y + d, z1), (x + w, y, z1)], rc, sw=sw))
            z0 = z1
        out.append(self.poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], top, sw=sw))
        for f in deco:
            out.append(f(self, x, y, z, w, d, h))
        self.items.append(((key if key is not None else (x + y + w / 2 + d / 2, z)), ''.join(out)))

    def ground(self, x, y, w, d, pad=10):
        pts = [P(x - pad, y + pad, 0), P(x + w - pad, y + pad, 0), P(x + w + pad * 1.2, y + d + pad * 1.6, 0), P(x + pad, y + d + pad * 1.6, 0)]
        d_ = ' '.join('%.1f,%.1f' % p for p in pts)
        self.items.append(((-1e9, 0), f'<polygon points="{d_}" fill="{self.t["shadow"]}"/>'))

    def cast(self, x, y, w, d, z, h):
        """Contact shadow on the surface at height z: light comes from the top-left, so it falls toward +x+y."""
        k = h * 0.55
        pts = [P(px + ox, py + oy, z) for px, py in ((x, y), (x + w, y), (x + w, y + d), (x, y + d)) for ox, oy in ((0, 0), (k, k))]
        pts = sorted(set(pts))
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        hull = []
        for seq in (pts, pts[::-1]):
            part = []
            for q in seq:
                while len(part) >= 2 and cross(part[-2], part[-1], q) <= 0:
                    part.pop()
                part.append(q)
            hull += part[:-1]
        d_ = ' '.join('%.1f,%.1f' % q for q in hull)
        self.items.append(((-1.55e8, 0), f'<polygon points="{d_}" fill="{self.t["cast"]}"/>'))

    def raw(self, key, s):
        self.items.append((key, s))

    def svg(self, label, pad=8, size=None):
        xs = [p[0] for p in self.pts]; ys = [p[1] for p in self.pts]
        x0, y0 = min(xs) - pad, min(ys) - pad
        w, h = max(xs) - min(xs) + 2 * pad, max(ys) - min(ys) + 2 * pad
        body = ''.join(s for _, s in sorted(self.items, key=lambda i: i[0]))
        rim = ''
        g_open = '<g>'
        if self.glyphs:
            rim += '<defs>' + ''.join(f'<image id="g-{c}" href="{glyph_data(c)}" width="1" height="1" preserveAspectRatio="none"/>' for c in sorted(self.glyphs)) + '</defs>'
        if self.t['rim']:
            rim += (f'<defs><filter id="rim" x="-10%" y="-10%" width="120%" height="120%">'
                   f'<feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d"/>'
                   f'<feFlood flood-color="{self.t["rim"]}"/><feComposite in2="d" operator="in" result="r"/>'
                   f'<feMerge><feMergeNode in="r"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>')
            g_open = '<g filter="url(#rim)">'
        dims = f' width="{size[0]}" height="{size[1]}"' if size else ''
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}"{dims} role="img" aria-label="{label}">'
                f'{rim}{g_open}{body}</g></svg>\n')


# ── decorations ──────────────────────────────────────────────
def top_dot(colour, r=2.2):
    def f(s, x, y, z, w, d, h):
        return s.circle((x + w / 2, y + d / 2, z + h), (1, 0, 0), (0, 1, 0), r, colour, sw=0.9)
    return f


def tile_back_top(s, x, y, z, w, d, h):
    t = s.t
    # tiny compass diamond + gold corner hints on the back of a lying tile
    cx, cy, zz = x + w / 2, y + d / 2, z + h
    k = min(w, d) * 0.22
    star = s.poly([(cx, cy - k, zz), (cx + k, cy, zz), (cx, cy + k, zz), (cx - k, cy, zz)], t['cream'], sw=0.9)
    return star


def pips(face, n):
    layouts = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)],
               4: [(-1, -1), (1, -1), (-1, 1), (1, 1)], 5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)],
               6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}

    def f(s, x, y, z, w, d, h):
        out = []
        for u, v in layouts[n]:
            col = s.t['man'] if n == 1 else s.t['ink']
            r = w * (0.14 if n == 1 else 0.09)
            q = w * 0.26
            if face == 'top':
                out.append(s.circle((x + w / 2 + u * q, y + d / 2 + v * q, z + h), (1, 0, 0), (0, 1, 0), r, col, stroke=False))
            elif face == 'left':
                out.append(s.circle((x + w / 2 + u * q, y + d, z + h / 2 - v * q), (1, 0, 0), (0, 0, 1), r, col, stroke=False))
            else:
                out.append(s.circle((x + w, y + d / 2 + u * q, z + h / 2 - v * q), (0, 1, 0), (0, 0, 1), r, col, stroke=False))
        return ''.join(out)
    return f


def stick_marks(kind):
    """Point-stick markings on the top face, along x."""
    def f(s, x, y, z, w, d, h):
        t = s.t; cy, zz = y + d / 2, z + h
        out = []
        def dot(px, r, col):
            out.append(s.circle((px, cy, zz), (1, 0, 0), (0, 1, 0), r, col, stroke=False))
        mid = x + w / 2
        if kind == 1000:
            dot(mid, 3.2, t['man'])
        elif kind == 10000:
            dot(mid, 3.2, t['man'])
            for o in (-18, -11, 11, 18):
                dot(mid + o, 1.9, t['ink'])
        elif kind == 5000:
            for o in (-16, -9, 9, 16):
                dot(mid + o, 1.9, t['ink'])
            dot(mid, 2.8, t['gold'])
        elif kind == 100:
            for side in (x + 10, x + w - 18):
                for i in range(4):
                    out.append(s.circle((side + (i % 2) * 6, cy + (-2 if i < 2 else 2), zz), (1, 0, 0), (0, 1, 0), 1.2, t['ink'], stroke=False))
        return ''.join(out)
    return f


# Coloured stick set, as on real automatic tables: body colour and dot colour per value.
STICK_COLOURS = {10000: ('#d83a3a', '#ffffff'), 5000: ('#f2c23a', '#d22f2f'), 1000: ('#2f6fd0', '#ffffff'),
                 500: ('#1f9e7a', '#ffffff'), 100: ('#fbf8f0', '#23203f')}


def stick_marks_y(kind):
    """Dot pattern for a stick lying along y (drawer or slot): matches the coloured set's markings."""
    def f(s, x, y, z, w, d, h):
        cx, zz, mid = x + w / 2, z + h, y + d / 2
        ink = STICK_COLOURS[kind][1]
        out = []
        def dot(px, py, r):
            out.append(s.circle((px, py, zz), (1, 0, 0), (0, 1, 0), r, ink, stroke=False, n=10))
        if kind == 10000:
            for o in (-9, -4.5, 4.5, 9):
                dot(cx, mid + o, 0.9)
            for o in (-1.8, 1.8):
                dot(cx + o, mid, 0.9)
            dot(cx, mid, 1.1)
            dot(cx, y + 7, 1.1)
            dot(cx, y + d - 7, 1.1)
        elif kind == 5000:
            dot(cx, mid, 1.1)
            for ox, oy in ((-1.8, -2.6), (1.8, -2.6), (-1.8, 2.6), (1.8, 2.6)):
                dot(cx + ox, mid + oy, 0.9)
        elif kind == 1000:
            dot(cx, mid, 1.4)
        elif kind == 500:
            for oy in (-3, 0, 3):
                for ox in (-1.6, 1.6):
                    dot(cx + ox, mid + oy, 0.75)
        elif kind == 100:
            for oy in (-4.5, -1.5, 1.5, 4.5):
                for ox in (-1.6, 1.6):
                    dot(cx + ox, mid + oy, 0.7)
        return ''.join(out)
    return f


def stick_y(s, x, y, z, kind, length, key):
    body = STICK_COLOURS[kind][0]
    s.box(x, y, z, 7, length, 4, body, left=shade(body, 0.86), right=shade(body, 0.74), deco=[stick_marks_y(kind)], sw=0.8, key=key)


def drawer_front(s, face, a, b, z0, z1, key):
    """A closed drawer front drawn on the table skirt: face 'S' (+y side) spans x a..b, face 'W' (+x side) spans y a..b."""
    t = s.t
    col = shade(t['rail'], 0.9)
    if face == 'S':
        y = 580.5
        pts = [(a, y, z0), (b, y, z0), (b, y, z1), (a, y, z1)]
        handle = [((a + b) / 2 - 12, y + 0.5, (z0 + z1) / 2 - 1.5), ((a + b) / 2 + 12, y + 0.5, (z0 + z1) / 2 - 1.5),
                  ((a + b) / 2 + 12, y + 0.5, (z0 + z1) / 2 + 1.5), ((a + b) / 2 - 12, y + 0.5, (z0 + z1) / 2 + 1.5)]
    else:
        x = 580.5
        pts = [(x, a, z0), (x, b, z0), (x, b, z1), (x, a, z1)]
        handle = [(x + 0.5, (a + b) / 2 - 12, (z0 + z1) / 2 - 1.5), (x + 0.5, (a + b) / 2 + 12, (z0 + z1) / 2 - 1.5),
                  (x + 0.5, (a + b) / 2 + 12, (z0 + z1) / 2 + 1.5), (x + 0.5, (a + b) / 2 - 12, (z0 + z1) / 2 + 1.5)]
    s.raw(key, s.poly(pts, col, sw=1.2) + s.poly(handle, t['gold'], sw=0.9))


# Starting points in the player's drawer, one compartment per stick value.
DRAWER_STICKS = ((10000, 1), (5000, 2), (1000, 9), (500, 1), (100, 4))


def open_drawer(s, x0=190, y0=598, width=220, depth=104):
    """South's drawer pulled out of the skirt: one compartment per value, each wide enough to show every stick."""
    t = s.t
    wood, inner = shade(t['rail'], 0.75), shade(t['wood'], 0.95)
    k = 1e6
    s.box(x0, y0, 71, width, depth, 6, inner, key=(k, 0))
    s.box(x0, y0, 71, 4, depth, 19, wood, key=(k + 1, 0))
    raw = [count * 8.5 + 9 for _, count in DRAWER_STICKS]
    widths = [w * (width - 8) / sum(raw) for w in raw]
    cx0 = x0 + 4
    for c, ((kind, count), cw) in enumerate(zip(DRAWER_STICKS, widths)):
        if c:
            s.box(cx0 - 1.5, y0, 77, 3, depth - 6, 9, shade(t['wood'], 0.8), key=(k + 2 + c * 20, 0), sw=0.9)
        start = cx0 + (cw - (count * 8.5 - 1.5)) / 2
        for n in range(count):
            stick_y(s, start + n * 8.5, y0 + 9, 77, kind, depth - 24, (k + 3 + c * 20, n))
        cx0 += cw
    s.box(x0 + width - 4, y0, 71, 4, depth, 19, wood, key=(k + 120, 0))
    s.box(x0, y0 + depth - 6, 69, width, 6, 23, t['rail'], key=(k + 130, 0))
    hx = x0 + width / 2
    s.raw((k + 131, 0), s.poly([(hx - 16, y0 + depth + 0.5, 78), (hx + 16, y0 + depth + 0.5, 78), (hx + 16, y0 + depth + 0.5, 83), (hx - 16, y0 + depth + 0.5, 83)], t['gold'], sw=0.9))


def text_top(char, colour, size):
    def f(s, x, y, z, w, d, h):
        cx, cy, zz = x + w / 2, y + d / 2, z + h
        e, f_ = P(cx, cy, zz)
        return (f'<text transform="matrix({C30:.4f} {S30} {-C30:.4f} {S30} {e:.1f} {f_:.1f})" '
                f'font-family="\'Noto Serif JP\',\'Hiragino Mincho ProN\',\'Yu Mincho\',serif" font-weight="700" '
                f'font-size="{size}" fill="{colour}" text-anchor="middle" dominant-baseline="central">{char}</text>')
    return f


# ── builders ─────────────────────────────────────────────────
def tile_lying(s, x, y, z, along_x=True):
    w, d = (20, 27) if along_x else (27, 20)
    t = s.t
    s.box(x, y, z, w, d, 15, t['back'], bands=[(0.5, t['cream']), (1.0, t['back'])], sw=1.2)


def wall(s, x, y, n, along_x, z, gaps=(), face_up=None, split=()):
    """face_up: {stack index: tile code} flips that stack's top tile, e.g. the dora indicator.
    split: stack indices where a small gap opens before that stack, e.g. around the dead wall."""
    face_up = face_up or {}
    for i in range(n):
        if i in gaps:
            continue
        off = i * 20 + 6 * sum(1 for b in split if i >= b)
        xx, yy = (x + off, y) if along_x else (x, y + off)
        tile_lying(s, xx, yy, z, along_x)
        if i in face_up:
            tile_face_up(s, xx, yy, z + 15, face_up[i], 'S' if along_x else 'E')
        else:
            tile_lying(s, xx, yy, z + 15, along_x)


def die(s, x, y, z, a=14, faces=(1, 3, 5)):
    s.box(x, y, z, a, a, a, s.t['white'], left=shade(s.t['white'], 0.9), right=shade(s.t['white'], 0.8),
          deco=[pips('top', faces[0]), pips('left', faces[1]), pips('right', faces[2])], sw=1.4)


def stick(s, x, y, z, kind, length=96, key=None):
    t = s.t
    s.box(x, y, z, length, 9, 5, t['white'], left=shade(t['white'], 0.88), right=shade(t['white'], 0.78),
          deco=[stick_marks(kind)], sw=1.2, key=key)


def parse_path(d, steps=10):
    """Flatten an absolute SVG path (M L H V C Z) into points; used to port the site's wind-indicator artwork."""
    toks = re.findall(r'[MCVHLZ]|-?\d+\.?\d*', d)
    pts, i, cmd, cur = [], 0, None, (0.0, 0.0)
    while i < len(toks):
        if toks[i] in ('M', 'C', 'V', 'H', 'L', 'Z'):
            cmd = toks[i]
            i += 1
            if cmd == 'Z':
                continue
        if cmd in ('M', 'L'):
            cur = (float(toks[i]), float(toks[i + 1]))
            i += 2
            pts.append(cur)
            cmd = 'L'
        elif cmd == 'H':
            cur = (float(toks[i]), cur[1])
            i += 1
            pts.append(cur)
        elif cmd == 'V':
            cur = (cur[0], float(toks[i]))
            i += 1
            pts.append(cur)
        elif cmd == 'C':
            x1, y1, x2, y2, x3, y3 = (float(v) for v in toks[i:i + 6])
            i += 6
            x0, y0 = cur
            for n in range(1, steps + 1):
                t_ = n / steps
                m = 1 - t_
                pts.append((m ** 3 * x0 + 3 * m * m * t_ * x1 + 3 * m * t_ * t_ * x2 + t_ ** 3 * x3,
                            m ** 3 * y0 + 3 * m * m * t_ * y1 + 3 * m * t_ * t_ * y2 + t_ ** 3 * y3))
            cur = (x3, y3)
    return pts


def rrect(x, y, w, h, r, n=5):
    pts = []
    for ccx, ccy, a0 in ((x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)):
        for k_ in range(n + 1):
            ang = math.radians(a0 + 90 * k_ / n)
            pts.append((ccx + r * math.cos(ang), ccy + r * math.sin(ang)))
    return pts


def rotate_pts(pts, cx, cy, deg):
    c, s_ = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return [(cx + (px - cx) * c - (py - cy) * s_, cy + (px - cx) * s_ + (py - cy) * c) for px, py in pts]


KANJI_FONT = "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif"
NUM_FONT = "'Barlow Semi Condensed','Barlow',system-ui,sans-serif"

# Orientation of a seat's text as (right, down) vectors, so every label faces the player who sits there.
SEAT_TEXT = {'E': ((1, 0), (0, 1)), 'W': ((-1, 0), (0, -1)), 'N': ((0, 1), (-1, 0)), 'S': ((0, -1), (1, 0))}


def console(s, x, y, z, a=120, riichi=('E',)):
    """The compass: the site's wind-indicator plate (assets/wind-indicator-rincon.svg) laid on the table, without its
    round-wind screen. Same orientation as the original: East at the bottom (the viewer's seat, the dealer),
    South right, West top, North left. Each side has a riichi slot with its dice numbers; the centre is a rose."""
    t = s.t
    sc = a / 604.0
    cx, cy = x + a / 2, y + a / 2
    top = z + 6.3
    k = (x + y + a + 1, z + 9)
    X = lambda u: cx + (u - 350) * sc
    Y = lambda v: cy + (v - 350) * sc

    def flat(uv, fill, sw=1.0, stroke=True, extra='', n=0):
        s.raw((k[0] + n, k[1]), s.poly([(X(u), Y(v), top) for u, v in uv], fill, stroke=stroke, sw=sw, extra=extra))

    def label(txt, u, v, size, fill, seat, font, line=None, line_w=0, n=3):
        (rx, ry), (dx, dy) = SEAT_TEXT[seat]
        p = lambda ax, ay: ((ax - ay) * C30, (ax + ay) * 0.5)
        a_, b_ = p(rx, ry)
        c_, d_ = p(dx, dy)
        e, f_ = P(X(u), Y(v), top + 0.1)
        stroke = f' stroke="{line}" stroke-width="{line_w:.2f}" paint-order="stroke" stroke-linejoin="round"' if line else ''
        s.raw((k[0] + n, k[1]), f'<text transform="matrix({a_:.4f} {b_:.4f} {c_:.4f} {d_:.4f} {e:.2f} {f_:.2f})" '
                                f'font-family="{font}" font-weight="800" font-size="{size * sc:.2f}" fill="{fill}"{stroke} '
                                f'text-anchor="middle" dominant-baseline="central">{txt}</text>')

    s.box(x, y, z, a, a, 6, t['cplate'], key=(x + y + a, z))
    # slot housings open to the plate edge, then the slot inserts
    for d in ('M205 48H495V106C495 124.2 480.2 139 462 139H238C219.8 139 205 124.2 205 106V48Z',
              'M205 652H495V594C495 575.8 480.2 561 462 561H238C219.8 561 205 575.8 205 594V652Z',
              'M48 205H106C124.2 205 139 219.8 139 238V462C139 480.2 124.2 495 106 495H48V205Z',
              'M652 205H594C575.8 205 561 219.8 561 238V462C561 480.2 575.8 495 594 495H652V205Z'):
        flat(parse_path(d), t['cwell'], sw=0.5)
    for rx_, ry_, rw, rh in ((236, 70, 228, 40), (236, 590, 228, 40), (70, 236, 40, 228), (590, 236, 40, 228)):
        flat(rrect(rx_, ry_, rw, rh, 10), t['cinset'], sw=0.7)
    # dice rests at two corners
    for px_, py_ in ((160, 92), (482, 476)):
        flat(rotate_pts(rrect(px_, py_, 58, 132, 13), px_ + 29, py_ + 66, -45), t['cwell'], sw=0.5)
    # purple cross with a tab beside each slot
    cross = ('M350 153C404 153 428 195 428 243V273H458C506 273 542 298 542 350C542 402 506 427 458 427H428V457'
             'C428 505 404 547 350 547C296 547 272 505 272 457V427H242C194 427 158 402 158 350C158 298 194 273 242 273'
             'H272V243C272 195 296 153 350 153Z')
    flat(parse_path(cross), t['cpurple'], sw=1.0, n=1)
    for rx_, ry_, rw, rh in ((235, 116, 230, 48), (235, 536, 230, 48), (116, 235, 48, 230), (536, 235, 48, 230)):
        flat(rrect(rx_, ry_, rw, rh, 10), t['cpurple'], sw=0.9, n=1)
    # the riichi stick lies in its seat's slot (only East's, the viewer's, is filled)
    slot = {'E': (236, 590, 228, 40), 'S': (590, 236, 40, 228), 'W': (236, 70, 228, 40), 'N': (70, 236, 40, 228)}
    for seat in riichi:
        sx, sy, sw_, sh = slot[seat]
        body, ink = STICK_COLOURS[1000]
        x0, x1, y0, y1 = X(sx), X(sx + sw_), Y(sy), Y(sy + sh)
        dot = lambda s_, bx, by, bz, bw, bd, bh: s_.circle((bx + bw / 2, by + bd / 2, bz + bh), (1, 0, 0), (0, 1, 0), 1.5, ink, stroke=False)
        s.box(x0 + 1.5, y0 + 1.5, z + 4, (x1 - x0) - 3, (y1 - y0) - 3, 4, body, left=shade(body, 0.86), right=shade(body, 0.74),
              deco=[dot], sw=0.9, key=(k[0] + 2, k[1]))
    # compass rose in the middle (the original's screen is left out on purpose)
    ring = lambda r: [(350 + r * math.cos(math.pi * n / 12), 350 + r * math.sin(math.pi * n / 12)) for n in range(24)]
    for r_, w_ in ((82, 1.0), (62, 0.7)):
        flat(ring(r_), 'none', stroke=False, extra=f' stroke="#eee9ff" stroke-width="{w_}"', n=2)
    rose = 'M350 263L368 330L437 312L387 360L437 408L368 390L350 457L332 390L263 408L313 360L263 312L332 330L350 263Z'
    flat(parse_path(rose), '#f7f2ff', sw=0.6, n=2)
    # seat labels, each upright for the player in that seat
    labels = (('E', 350, 565, '5 · 9', 31, 350, 492, '東'), ('W', 350, 140, '3 · 7 · 11', 31, 350, 225, '西'),
              ('N', 140, 350, '4 · 8 · 12', 29, 230, 350, '北'), ('S', 560, 350, '2 · 6 · 10', 29, 470, 350, '南'))
    for seat, nu, nv, nums, nsize, ku, kv, ch in labels:
        label(nums, nu, nv, nsize, t['cnum'], seat, NUM_FONT, line=t['cnumline'], line_w=6 * sc)
        label(ch, ku, kv, 56 if seat == 'E' else 50, t['man'] if seat == 'E' else '#111111', seat, KANJI_FONT,
              line='#fff8ed', line_w=7 * sc)


def round_marker(s, x, y, z, wind='東'):
    """The round-wind marker: an orange plaque laid flush against the table edge, to the dealer's right."""
    t = s.t
    s.cast(x, y, 34, 18, z, 6)
    s.box(x, y, z, 34, 18, 6, t['tsumo'], left=shade(t['tsumo'], 0.86), right=shade(t['tsumo'], 0.72),
          deco=[text_top(wind, t['console'], 14)], sw=1.2)


def face_glyph(s, code, origin, u, v):
    """Map the tile's glyph (unit square) onto a face: origin = image top-left, u = image right, v = image down."""
    s.glyphs.add(code)
    ox, oy = P(*origin)
    ux, uy = P(*u)
    vx, vy = P(*v)
    return f'<use href="#g-{code}" transform="matrix({ux:.3f} {uy:.3f} {vx:.3f} {vy:.3f} {ox:.2f} {oy:.2f})"/>'


# A seat is where the player sits; 'up' on their tiles points away from them.
def tile_face_up(s, x, y, z, code, seat):
    t = s.t
    w, d = (20, 27) if seat in ('S', 'N') else (27, 20)
    top = z + 15
    if seat == 'S':
        g = (code, (x + 1, y + 1.5, top), (18, 0, 0), (0, 24, 0))
    elif seat == 'N':
        g = (code, (x + 19, y + 25.5, top), (-18, 0, 0), (0, -24, 0))
    elif seat == 'E':
        g = (code, (x + 1.5, y + 19, top), (0, -18, 0), (24, 0, 0))
    else:
        g = (code, (x + 25.5, y + 1, top), (0, 18, 0), (-24, 0, 0))
    s.box(x, y, z, w, d, 15, t['white'], left=shade(t['cream'], 0.9), right=shade(t['cream'], 0.78),
          bands=[(0.4, t['back']), (1.0, t['cream'])], deco=[lambda s_, *a: face_glyph(s_, *g)], sw=1.1)


def tile_standing(s, x, y, z, code, seat):
    """Hand tile on its edge. S and E faces point at the viewer; N and W show their backs."""
    t = s.t
    back, face, side = t['back'], t['white'], shade(t['cream'], 0.8)
    if seat == 'S':
        s.box(x, y, z, 20, 15, 27, t['cream'], left=face, right=side, sw=1.1,
              deco=[lambda s_, *a: face_glyph(s_, code, (x + 1, y + 15, z + 25.5), (18, 0, 0), (0, 0, -24))])
    elif seat == 'E':
        s.box(x, y, z, 15, 20, 27, t['cream'], left=side, right=face, sw=1.1,
              deco=[lambda s_, *a: face_glyph(s_, code, (x + 15, y + 19, z + 25.5), (0, -18, 0), (0, 0, -24))])
    elif seat == 'N':
        s.box(x, y, z, 20, 15, 27, t['cream'], left=back, right=side, sw=1.1)
    else:
        s.box(x, y, z, 15, 20, 27, t['cream'], left=side, right=back, sw=1.1)


def hand(s, seat, codes, z):
    n = len(codes)
    start = 300 - n * 10
    for i, c in enumerate(codes):
        if seat == 'S':
            tile_standing(s, start + i * 20, 534, z, c, 'S')
        elif seat == 'N':
            tile_standing(s, 600 - start - (i + 1) * 20, 51, z, c, 'N')
        elif seat == 'E':
            tile_standing(s, 534, 600 - start - (i + 1) * 20, z, c, 'E')
        else:
            tile_standing(s, 51, start + i * 20, z, c, 'W')


def pond(s, seat, codes, z):
    """Discards in rows of six, starting near the centre and growing toward the player."""
    for i, c in enumerate(codes):
        row, col = divmod(i, 6)
        if seat == 'S':
            tile_face_up(s, 240 + col * 20, 366 + row * 27, z, c, 'S')
        elif seat == 'N':
            tile_face_up(s, 340 - col * 20, 207 - row * 27, z, c, 'N')
        elif seat == 'E':
            tile_face_up(s, 366 + row * 27, 340 - col * 20, z, c, 'E')
        else:
            tile_face_up(s, 207 - row * 27, 240 + col * 20, z, c, 'W')


def wood_grain(s):
    """Thin darker strokes along the table's rail and skirt, so the brown reads as planks."""
    t = s.t
    col = shade(t['rail'], 0.72)

    def path(pts, w=1.2, o=0.55):
        d = ' '.join(('M' if i == 0 else 'L') + '%.1f,%.1f' % P(*p) for i, p in enumerate(pts))
        s.pts += [P(*p) for p in pts]
        return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" opacity="{o}"/>'

    out = []
    z = 118.2
    for inset, w in ((6, 1.3), (14, 1.0), (22, 1.2)):
        a, b = inset, 600 - inset
        out.append(path([(a, a, z), (b, a, z), (b, b, z), (a, b, z), (a, a, z)], w))
    # grain on the two visible side faces of the rail and the skirt
    for zz in (101, 108):
        out.append(path([(0, 600, zz), (600, 600, zz), (600, 0, zz)], 1.0, 0.45))
    out.append(path([(20, 580, 81), (580, 580, 81), (580, 20, 81)], 1.0, 0.45))
    s.raw((-1.795e8, 0), ''.join(out))


# ── scenes ───────────────────────────────────────────────────
def scene_table(t):
    s = Scene(t)
    s.ground(0, 0, 600, 600, pad=24)
    # legs, then a darker skirt, then the rail top
    for lx, ly in ((40, 40), (520, 40), (40, 520), (520, 520)):
        s.box(lx, ly, 0, 40, 40, 70, shade(t['rail'], 0.6), key=(-2e8 + lx + ly, 0), sw=2)
    s.box(20, 20, 70, 560, 560, 22, shade(t['rail'], 0.75), key=(-1.9e8, 0), sw=2)
    s.box(0, 0, 92, 600, 600, 26, t['rail'], key=(-1.8e8, 0), sw=2)
    wood_grain(s)
    # one drawer per seat in the skirt; only South's (yours) is open
    drawer_front(s, 'W', 200, 400, 73, 89, (-1.79e8, 0))
    s.box(30, 30, 118, 540, 540, 3, t['felt'], key=(-1.7e8, 0), sw=1.6)
    s.raw((-1.6e8, 0), s.poly([(48, 48, 121.3), (552, 48, 121.3), (552, 552, 121.3), (48, 552, 121.3)], 'none', sw=1.2, extra=f' stroke-opacity=".35" stroke-dasharray="6 6"'))
    z = 121
    wall(s, 130, 103, 17, True, z)
    wall(s, 103, 130, 17, False, z)
    wall(s, 470, 130, 17, False, z, gaps=(12, 13), face_up={9: '4p'}, split=(5, 12))
    wall(s, 130, 470, 17, True, z)
    for wx, wy, ww, wd in ((130, 103, 340, 27), (103, 130, 27, 340), (470, 130, 27, 340), (130, 470, 340, 27)):
        s.cast(wx, wy, ww, wd, z, 30)
    for hx, hy, hw, hd in ((170, 534, 260, 15), (170, 51, 260, 15), (534, 170, 15, 260), (51, 170, 15, 260)):
        s.cast(hx, hy, hw, hd, z, 27)
    for px, py, pw, pd in ((240, 366, 120, 54), (240, 180, 120, 54), (366, 240, 54, 120), (180, 240, 54, 120)):
        s.cast(px, py, pw, pd, z, 15)
    s.cast(240, 240, 120, 120, z, 6)
    console(s, 240, 240, z)
    open_drawer(s)
    die(s, 327, 330, z + 6, a=9, faces=(6, 2, 3))
    die(s, 334, 338, z + 6, a=9, faces=(1, 4, 2))
    round_marker(s, 534, 551, z)  # East (the viewer) is the first dealer: marker flush on the front edge, to East's right
    hand(s, 'N', ['1m'] * 13, z)
    hand(s, 'W', ['1m'] * 13, z)
    hand(s, 'E', ['1m', '1m', '5m', '6m', '7m', '2p', '2p', '9p', '3s', '4s', '5s', '6z', '6z'], z)
    hand(s, 'S', ['2m', '3m', '4m', '3p', '4p', '0p', '6s', '7s', '8s', '1z', '1z', '5z', '5z'], z)
    tile_standing(s, 438, 534, z, '7p', 'S')  # the tile just drawn, set apart
    pond(s, 'S', ['9m', '1p', '7z', '4z', '2s', '8p'], z)
    tile_face_up(s, 240, 400, z, '3z', 'E')  # turned sideways: riichi was declared with this discard
    tile_face_up(s, 267, 393, z, '9s', 'S')
    pond(s, 'E', ['1s', '9p', '2z', '7z', '5m', '3p', '8m'], z)
    pond(s, 'N', ['4z', '9s', '1m', '6p', '2z', '7p', '3s'], z)
    pond(s, 'W', ['3z', '1p', '9m', '5s', '8s', '2m'], z)
    return s.svg('Mesa de mahjong riichi con muros, manos, descartes, consola y dados')


def scene_dice(t):
    s = Scene(t)
    s.ground(0, 0, 60, 40, pad=4)
    die(s, 0, 0, 0, a=28, faces=(1, 3, 5))
    die(s, 32, 10, 0, a=28, faces=(6, 2, 4))
    return s.svg('Dos dados')


def scene_sticks(t):
    s = Scene(t)
    s.ground(0, 0, 110, 50, pad=3)
    for i, k in enumerate((10000, 5000, 1000, 100)):
        stick(s, i * 4, i * 12, 0, k, length=110)
    return s.svg('Palitos de puntos: 10000, 5000, 1000 y 100')


def scene_wall(t):
    s = Scene(t)
    s.ground(0, 0, 100, 27, pad=4)
    wall(s, 0, 0, 5, True, 0)
    tile_lying(s, 18, 40, 0)
    return s.svg('Segmento de muro de fichas')


def scene_dealer(t):
    s = Scene(t)
    s.ground(0, 0, 70, 40, pad=4)
    s.box(0, 0, 0, 70, 40, 18, t['wood'], deco=[text_top('東', t['man'], 26)])
    s.box(14, 8, 18, 42, 24, 3, t['cream'], key=(1e5, 1), deco=[text_top('東', t['man'], 20)])
    return s.svg('Marcador de dealer, viento Este')


def scene_console(t):
    s = Scene(t)
    s.ground(0, 0, 90, 90, pad=6)
    s.box(-6, -6, -6, 102, 102, 6, t['felt'], key=(-1e5, 0))
    console(s, 0, 0, 0)
    die(s, 100, 10, -6, a=16, faces=(3, 6, 1))
    return s.svg('Consola central con luces de los cuatro vientos')


def scene_riichi(t):
    s = Scene(t)
    s.ground(-8, -10, 130, 52, pad=4)
    s.box(-8, -10, 0, 130, 52, 5, t['felt'], key=(-1e5, 0))
    tile_lying(s, 6, 4, 5)
    tile_lying(s, 26, 4, 5)
    tile_lying(s, 46, 4, 5)
    stick(s, 0, 20, 26, 1000, length=110, key=(1e5, 0))
    for (cx, cy, cz), col, r in (((-4, 10, 58), t['gold'], 11), ((128, 40, 30), t['man'], 9), ((70, -6, 60), t['pin'], 6)):
        pts = []
        for k in range(8):
            rr = r if k % 2 == 0 else r * 0.36
            ang = math.pi / 4 * k
            pts.append((cx + rr * math.cos(ang) * 0.9, cy - rr * math.cos(ang) * 0.9, cz + rr * math.sin(ang) * 1.6))
        s.raw((1e6, 0), s.poly(pts, col, sw=1.2))
    return s.svg('Declaración de riichi: palito de 1000 sobre el muro')


SCENES = {'mesa': scene_table, 'dados': scene_dice, 'palitos': scene_sticks, 'muro': scene_wall,
          'dealer': scene_dealer, 'consola': scene_console, 'riichi': scene_riichi}

for name, fn in SCENES.items():
    for th, pal in THEMES.items():
        open(os.path.join(OUT, f'{name}-{th}.svg'), 'w').write(fn(pal))
print(sorted(os.listdir(OUT)))
