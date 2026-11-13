"""Hand-drawn kitten sprites (style A from styles3.py) for the table illustration and the tutorial avatars.

Kitten frame: head centred near (120, 94), feet at y≈252. `sprite()` maps it onto the old sprite frame
(head at (0, -150), seat at y≈0) so cats2.py can place it exactly where the previous cats sat."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from styles3 import cat, sh, mirror, DEFS, INK, PINK, HEAD, BODY, EAR_L, EAR_L_IN, TAIL  # noqa: E402

FURS = {  # key used by the site -> (name, fur, stripe, white, pattern, eye)
    "white": ("you", "#c9ad8e", "#8a6d55", "#fbf3e8", "tabby", "#7a9a4a"),   # you: brown tabby
    "grey": ("grey", "#b3b8c3", "#8b919e", "#ffffff", "blaze", "#5b8fc2"),
    "black": ("black", "#45444f", "#2c2b34", "#ffffff", "tuxedo", "#c79a2c"),
    "orange": ("orange", "#f3b072", "#d98440", "#fff6ea", "tabby", "#6aa0cf"),
}
EXPRS = ["happy", "smile", "calm", "wink", "excited", "surprised", "thinking", "nervous", "sleepy", "sad"]
ST = f' stroke="{INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'


def scarf_colour(theme, outfit):
    return {"vaquero": "#c0392b", "fox": "#c0392b"}.get(theme, outfit)


def accessory(theme, outfit, back):
    """Theme extras in the kitten frame, drawn over the head."""
    if theme == "samurai":  # hachimaki headband
        s = f'<path d="M60 72 Q120 46 180 72 L182 84 Q120 58 58 84 Z"{ST} fill="#fff6e5"/>'
        if back:
            s += (f'<path d="M120 62 l-14 34 l8 2 Z M120 62 l12 32 l-8 3 Z"{ST} fill="#fff6e5"/>'
                  f'<circle cx="120" cy="62" r="6"{ST} fill="#fff6e5"/>')
        else:
            s += f'<circle cx="120" cy="64" r="6.5" fill="#c0392b" stroke="{INK}" stroke-width="1.6"/>'
        return s
    if theme == "vaquero":  # cowboy hat
        return (f'<ellipse cx="120" cy="50" rx="98" ry="17"{ST} fill="#8b5a2b"/>'
                f'<path d="M74 50 Q66 -4 120 4 Q174 -4 166 50 Q120 60 74 50Z"{ST} fill="#a8703a"/>'
                f'<path d="M73 40 Q120 52 167 40" stroke="{outfit}" stroke-width="7" fill="none"/>'
                f'<path d="M104 12 Q120 22 136 12" stroke="{INK}" stroke-width="1.6" fill="none" opacity=".5"/>')
    if theme == "cyberpunk":  # visor pushed up on the forehead
        if back:
            return f'<path d="M58 70 Q120 50 182 70" stroke="{outfit}" stroke-width="7" fill="none" stroke-linecap="round"/>'
        return (f'<rect x="70" y="44" width="100" height="22" rx="11"{ST} fill="{outfit}" fill-opacity=".92"/>'
                f'<path d="M80 52 H108" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>')
    if theme == "dark":  # neon headphones
        return (f'<path d="M50 104 Q46 22 120 20 Q194 22 190 104" stroke="{INK}" stroke-width="9" fill="none"/>'
                f'<path d="M50 104 Q46 22 120 20 Q194 22 190 104" stroke="{outfit}" stroke-width="4" fill="none"/>'
                f'<rect x="38" y="84" width="22" height="42" rx="10"{ST} fill="{outfit}"/>'
                f'<rect x="180" y="84" width="22" height="42" rx="10"{ST} fill="{outfit}"/>')
    if theme == "cute":  # bow
        x, y = (88, 46) if back else (152, 46)
        return (f'<path d="M{x} {y} L{x-20} {y-14} L{x-20} {y+14}Z M{x} {y} L{x+20} {y-14} L{x+20} {y+14}Z"{ST} fill="{outfit}"/>'
                f'<circle cx="{x}" cy="{y}" r="6"{ST} fill="{sh(outfit, .85)}"/>')
    if theme == "frutiger":  # swim goggles on the forehead
        if back:
            return f'<path d="M58 66 Q120 46 182 66" stroke="{outfit}" stroke-width="6" fill="none" stroke-linecap="round"/>'
        return (f'<path d="M58 66 Q120 46 182 66" stroke="{outfit}" stroke-width="5" fill="none"/>'
                f'<circle cx="101" cy="56" r="14"{ST} fill="#d8f6ff" fill-opacity=".85"/>'
                f'<circle cx="139" cy="56" r="14"{ST} fill="#d8f6ff" fill-opacity=".85"/>'
                f'<path d="M95 50 q4 -4 9 -2 M133 50 q4 -4 9 -2" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>')
    if theme == "fox":  # gold coin on the bandana knot
        return "" if back else f'<circle cx="124" cy="160" r="6.5"{ST} fill="#f0b347"/>'
    return ""


def kitten_back(fur_key, scarf, uid, extra=""):
    name, fur, stripe, white, pat, eye = FURS[fur_key]
    shade = sh(fur, .72)
    light = sh(fur, 1.3)
    G = ['<ellipse cx="120" cy="256" rx="84" ry="9" fill="#000" opacity=".14" filter="url(#blur3)"/>']
    D = [f'<clipPath id="h{uid}"><path d="{HEAD}"/></clipPath>',
         f'<clipPath id="b{uid}"><path d="{BODY}"/><ellipse cx="64" cy="232" rx="27" ry="23"/><ellipse cx="176" cy="232" rx="27" ry="23"/></clipPath>']
    for x in (64, 176):
        G.append(f'<ellipse cx="{x}" cy="232" rx="27" ry="23"{ST} fill="{fur}"/>')
    G.append(f'<path d="{BODY}"{ST} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#b{uid})">')
    if pat == "tabby":  # a few soft stripes on the flanks, not a full cage of bands
        for sd in (1, -1):
            X = (lambda v: v) if sd == 1 else (lambda v: 240 - v)
            for k, y in enumerate((178, 198, 218)):
                G.append(f'<path d="M{X(64 + k*2)} {y} q{sd*14} -3 {sd*24} 4" stroke="{stripe}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>')
            for k in range(3):
                G.append(f'<path d="M{X(50)} {216 + k*10} q{sd*12} -6 {sd*24} 0" stroke="{stripe}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>')
    G.append(f'<ellipse cx="120" cy="150" rx="52" ry="16" fill="{shade}" opacity=".6" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="96" cy="190" rx="18" ry="30" fill="{light}" opacity=".35" filter="url(#blur4)"/>')
    G.append('</g>')
    # elbows peeking out at the sides (paws are on the table, out of sight)
    for sd in (1, -1):
        X = (lambda v: v) if sd == 1 else (lambda v: 240 - v)
        G.append(f'<path d="M{X(66)} 176 C{X(54)} 196 {X(58)} 214 {X(70)} 222" fill="none"{ST}/>')
    # tail curling out from the base, drawn over the body from behind
    t = "M150 250 C206 258 222 206 198 170"
    G.append(f'<path d="{t}" stroke="{INK}" stroke-width="21" fill="none" stroke-linecap="round"/>')
    G.append(f'<path d="{t}" stroke="{fur}" stroke-width="16.5" fill="none" stroke-linecap="round"/>')
    if pat == "tabby":
        G.append(f'<path d="{t}" stroke="{stripe}" stroke-width="16.5" fill="none" stroke-dasharray="4 10" opacity=".75"/>')
    if pat in ("blaze", "tuxedo"):
        G.append(f'<circle cx="198" cy="172" r="7.5" fill="{white}"/>')
    # scarf band and knot seen from behind
    G.append(f'<path d="M84 145 Q120 160 156 145 L150 156 Q120 168 90 156 Z"{ST} fill="{scarf}"/>')
    # ears: back of the ear is fur, with a thin pink rim
    for d in (EAR_L, mirror(EAR_L)):
        G.append(f'<path d="{d}"{ST} fill="{fur}"/>')
    for sd in (1, -1):
        X = (lambda v: v) if sd == 1 else (lambda v: 240 - v)
        G.append(f'<path d="M{X(62)} 70 C{X(58)} 52 {X(58)} 34 {X(60)} 22" stroke="{PINK}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>')
    G.append(f'<path d="{HEAD}"{ST} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#h{uid})">')
    if pat == "tabby":
        G.append(f'<path d="M100 40 q-4 30 0 60 M120 38 v70 M140 40 q4 30 0 60 M80 56 q-6 24 -2 44 M160 56 q6 24 2 44" stroke="{stripe}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>')
    G.append(f'<ellipse cx="104" cy="62" rx="40" ry="18" fill="{light}" opacity=".45" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="120" cy="150" rx="70" ry="16" fill="{shade}" opacity=".5" filter="url(#blur4)"/>')
    G.append('</g>')
    G.append(f'<path d="M110 40 l4 -8 l2 7 l5 -7 l1 8" stroke="{INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>')
    for sd in (1, -1):  # whisker tips poking out past the cheeks
        G.append(f'<path d="M{120 + sd*64} 118 q{sd*12} -2 {sd*22} -6 M{120 + sd*64} 124 q{sd*12} 0 {sd*20} 0" stroke="{INK}" stroke-width="1.1" fill="none" stroke-linecap="round"/>')
    G.append(extra)
    return f'<defs>{"".join(D)}</defs><g filter="url(#ink)">{"".join(G)}</g>'


def kitten(theme, fur_key, outfit, expr="calm", back=False, uid=None):
    """Kitten group in its own frame (no outer transform)."""
    uid = uid or f"{theme}{fur_key}{expr}{int(back)}"
    scarf = scarf_colour(theme, outfit)
    extra = accessory(theme, outfit, back)
    if back:
        return kitten_back(fur_key, scarf, uid, extra)
    name, fur, stripe, white, pat, eye = FURS[fur_key]
    return cat((name, fur, stripe, white, pat, scarf, eye), 0, 0, 0, expr, False, uid=uid, extra=extra)


def sprite(theme, fur_key, outfit, expr="calm", back=False, uid=None):
    """Same kitten in the old sprite frame: head at (0, -150), seat line at y≈0."""
    return (f'<defs>{DEFS}</defs><g transform="translate(0 -150) scale(.85) translate(-120 -94)">'
            f'{kitten(theme, fur_key, outfit, expr, back, uid)}</g>')


def kitten_side(theme, fur_key, outfit, expr="calm", uid=None):
    """Three-quarter view, sitting sideways and facing right (towards the table), one paw reaching forward.
    Mirror it with scaleX(-1) for a cat on the other side."""
    uid = uid or f"{theme}{fur_key}{expr}side"
    name, fur, stripe, white, pat, eye = FURS[fur_key]
    scarf = scarf_colour(theme, outfit)
    shade, light = sh(fur, .74), sh(fur, 1.28)
    thin = f'stroke="{INK}" stroke-width="1.4" fill="none" stroke-linecap="round"'
    W2 = f' stroke="{INK}" fill="none" stroke-linecap="round" stroke-linejoin="round"'
    body = "M100 138 C68 150 52 194 56 228 C58 250 80 256 112 254 L158 254 C164 232 160 196 150 158 Z"
    # head turned ~32° towards the table: features sit on a sphere, so they bunch up towards the right contour
    head = ("M60 98 C58 60 90 38 124 38 C160 38 188 60 188 96 C190 104 196 112 196 120 C196 128 192 134 186 138 L192 144 L180 144 L184 150 L170 148 "
            "C164 150 144 156 124 156 C102 156 82 150 72 142 L62 140 L68 134 L54 128 L64 123 L52 115 L62 111 C59 106 59 102 60 98 Z")
    D = [f'<clipPath id="h{uid}"><path d="{head}"/></clipPath>', f'<clipPath id="b{uid}"><path d="{body}"/></clipPath>']
    G = ['<ellipse cx="112" cy="256" rx="76" ry="9" fill="#000" opacity=".14" filter="url(#blur3)"/>']
    tail = "M70 248 C22 252 14 204 36 178"
    G.append(f'<path d="{tail}" stroke="{INK}" stroke-width="21" fill="none" stroke-linecap="round"/>')
    G.append(f'<path d="{tail}" stroke="{fur}" stroke-width="16.5" fill="none" stroke-linecap="round"/>')
    if pat == "tabby":
        G.append(f'<path d="{tail}" stroke="{stripe}" stroke-width="16.5" fill="none" stroke-dasharray="4 10" opacity=".75"/>')
    if pat in ("blaze", "tuxedo"):
        G.append(f'<circle cx="36" cy="180" r="7.5" fill="{white}"/>')
    # far arm (behind), then body, then haunch outline
    G.append(f'<path d="M150 170 C168 184 186 200 198 214 L186 226 C174 214 158 200 146 192 Z"{ST} fill="{shade}"/>')
    G.append(f'<path d="{body}"{ST} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#b{uid})">')
    if pat == "tabby":
        for k in range(4):
            G.append(f'<path d="M{66 + k*4} {176 + k*16} q18 -8 36 -2" stroke="{stripe}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".65"/>')
    G.append(f'<ellipse cx="110" cy="150" rx="44" ry="14" fill="{shade}" opacity=".6" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="80" cy="200" rx="18" ry="26" fill="{light}" opacity=".35" filter="url(#blur4)"/>')
    G.append('</g>')
    G.append(f'<path d="M66 214 C64 182 92 176 112 196 C126 212 124 240 112 252" fill="none"{ST}/>')  # haunch
    G.append(f'<path d="M112 252 C116 248 128 248 134 254" fill="none"{ST}/>')
    # near arm reaching forward to the tiles
    arm = "M128 166 C152 176 176 196 192 220 L176 236 C164 218 148 204 132 196 Z"
    G.append(f'<path d="{arm}" fill="{fur}"/>')
    G.append(f'<path d="M128 166 C152 176 176 196 192 220" fill="none"{ST}/><path d="M176 236 C164 218 150 206 138 200" fill="none"{ST}/>')
    if pat == "tabby":
        G.append(f'<path d="M150 182 l-8 12 M164 194 l-8 12" stroke="{stripe}" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>')
    pc = white if pat in ("blaze", "tuxedo") else fur
    G.append(f'<ellipse cx="190" cy="232" rx="16" ry="11"{ST} fill="{pc}" transform="rotate(-30 190 232)"/>')
    G.append(f'<path d="M194 240 l3 4 M200 235 l4 3" {thin}/>')
    # fluffy chest ruff under the chin (no hard edges)
    import math as _m
    pts = [(138 + 24 * _m.cos(_m.radians(t)), 168 + 22 * _m.sin(_m.radians(t))) for t in range(0, 361, 30)]
    ruff = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}" + "".join(
        f" Q{138 + 31 * _m.cos(_m.radians(t + 15)):.1f} {168 + 29 * _m.sin(_m.radians(t + 15)):.1f} {x:.1f} {y:.1f}"
        for t, (x, y) in zip(range(0, 361, 30), pts[1:])) + "Z"
    rc = white if pat != "tabby" else sh(white, .98)
    G.append(f'<path d="{ruff}" fill="{rc}" opacity="{1 if pat != "tabby" else .85}" filter="url(#blur1)"/>')
    G.append(f'<path d="M130 182 q2 6 0 10 M140 186 q1 6 -1 10 M149 182 q0 6 -2 9" stroke="{sh(rc, .8)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>')
    # scarf around the neck, knot at the front
    G.append(f'<path d="M92 144 Q122 160 150 148 L148 158 Q120 170 94 156 Z"{ST} fill="{scarf}"/>')
    G.append(f'<path d="M146 154 L156 182 L140 174 Z"{ST} fill="{sh(scarf, .88)}"/><circle cx="146" cy="154" r="5"{ST} fill="{sh(scarf, .82)}"/>')
    import math
    TH, CX, RX = math.radians(24), 124, 64
    px = lambda phi: CX + RX * math.sin(TH + math.radians(phi))
    fx = px(0)                      # face centre line (~158)
    exl, exr = px(-27), px(27)      # near eye (full) and far eye (foreshortened, close to the contour)
    kr = math.cos(TH + math.radians(27))
    # ears: near ear seen from the front with its pink inside; far ear seen edge-on at the contour
    G.append(f'<path d="M144 48 C156 32 170 18 184 8 C189 26 188 46 182 64 Z"{ST} fill="{shade}"/>')
    G.append(f'<path d="M160 42 C168 32 176 24 182 18 C184 32 183 44 180 54 Z" fill="{PINK}" opacity=".6"/>')
    G.append(f'<path d="M72 78 C66 54 68 28 78 4 C98 14 116 30 128 48 Z"{ST} fill="{fur}"/>')
    G.append(f'<path d="M80 66 C77 48 78 30 83 16 C97 26 109 36 118 48 Z" fill="{PINK}" opacity=".9"/>')
    G.append(f'<path d="M90 56 q-1 -12 2 -18 M97 58 q0 -10 4 -15 M84 58 q-2 -9 -1 -14" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>')
    G.append(f'<path d="{head}"{ST} fill="{fur}"/>')
    G.append(f'<g clip-path="url(#h{uid})">')
    if pat == "tabby":
        G.append(f'<path d="M122 42 q-2 10 2 22 M136 40 v24 M150 42 q2 10 -2 21" stroke="{stripe}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".75"/>')
        G.append(f'<path d="M60 100 q10 1 18 5 M62 112 q10 0 16 4" stroke="{stripe}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>')
        G.append(f'<ellipse cx="{fx+4}" cy="128" rx="28" ry="19" fill="{white}" opacity=".85" filter="url(#blur3)"/>')
    else:
        G.append(f'<path d="M{fx-2} 62 C{fx+2} 80 {fx+8} 90 {fx+18} 98 C{fx+30} 106 198 112 198 128 C194 146 160 158 128 158 C106 158 94 150 96 136 C98 122 {fx-30} 106 {fx-17} 97 C{fx-8} 90 {fx-4} 80 {fx-2} 62 Z" fill="{white}" filter="url(#blur1)"/>')
    G.append(f'<ellipse cx="104" cy="60" rx="36" ry="15" fill="{light}" opacity=".55" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="96" cy="120" rx="30" ry="30" fill="{shade}" opacity=".25" filter="url(#blur4)"/>')
    G.append(f'<ellipse cx="124" cy="152" rx="70" ry="14" fill="{shade}" opacity=".5" filter="url(#blur4)"/>')
    G.append('</g>')
    G.append(f'<path d="M110 42 l4 -8 l2 7 l5 -7 l1 8" {thin}/>')
    ey = 102
    for x, k, i in ((exl, 1.0, 0), (exr, kr * 1.15, 1)):
        if expr in ("happy", "smile"):
            G.append(f'<path d="M{x-13*k} {ey+4} Q{x} {ey-10} {x+13*k} {ey+4}"{W2} stroke-width="3.2"/>')
        elif expr == "excited":
            sgn = 1 if i == 0 else -1
            G.append(f'<path d="M{x - sgn*9*k} {ey-6} L{x + sgn*9*k} {ey+2} L{x - sgn*9*k} {ey+10}"{W2} stroke-width="3.2"/>')
        else:
            r = 7.6
            G.append(f'<ellipse cx="{x}" cy="{ey+3}" rx="{r*k}" ry="{r*1.15}" fill="#2a2026"/>'
                     f'<circle cx="{x+r*.3*k}" cy="{ey+3-r*.4}" r="{r*.38*max(k, .7)}" fill="#fff"/><circle cx="{x-r*.35*k}" cy="{ey+3+r*.45}" r="{r*.16}" fill="#fff"/>')
    G.append(f'<ellipse cx="{px(-52)}" cy="{ey+18}" rx="11" ry="6" fill="{PINK}" opacity=".75" filter="url(#blur2)"/>')
    G.append(f'<ellipse cx="{px(48)-2}" cy="{ey+18}" rx="4" ry="5" fill="{PINK}" opacity=".6" filter="url(#blur2)"/>')
    nx = fx + 2
    G.append(f'<ellipse cx="{nx-8}" cy="124" rx="9" ry="6.5" fill="{white}" opacity=".9"/><ellipse cx="{nx+6}" cy="124" rx="6" ry="6" fill="{white}" opacity=".9"/>')
    G.append(f'<path d="M{nx-4} 113 Q{nx} 111 {nx+3} 113 L{nx-0.5} 117.5 Z" fill="#e2879a" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>')
    if expr in ("happy", "excited"):
        G.append(f'<path d="M{nx-11} 121 Q{nx-5} 125 {nx} 120 Q{nx+4} 124 {nx+7} 121 Q{nx+6} 137 {nx-1} 137 Q{nx-8} 137 {nx-11} 121 Z" fill="#a8434f" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>'
                 f'<path d="M{nx-7} 130 Q{nx-1} 125 {nx+5} 130 Q{nx+3} 137 {nx-1} 137 Q{nx-5} 137 {nx-7} 130 Z" fill="#f08a9a"/>')
    else:
        G.append(f'<path d="M{nx} 117.5 v3 M{nx-7} 122 Q{nx-3} 126 {nx} 121 Q{nx+2} 125 {nx+5} 122"{W2} stroke-width="1.7"/>')
    for k in (-3, 4):
        G.append(f'<path d="M{188} {ey+16+k} q14 {-2+k*.4} 28 {k*1.2-4}" stroke="{INK}" stroke-width="1.1" fill="none" stroke-linecap="round"/>')
    shift = {"cyberpunk": 26, "frutiger": 26, "samurai": 14, "cute": 10}.get(theme, 6)
    G.append(f'<g transform="translate({shift} 0)">{accessory(theme, outfit, False)}</g>')
    if name == "grey":
        G.append(f'<circle cx="{exl}" cy="{ey+2}" r="16" fill="#fff" fill-opacity=".14" stroke="{INK}" stroke-width="2"/>')
        G.append(f'<ellipse cx="{exr}" cy="{ey+2}" rx="{16*kr*1.1}" ry="16" fill="#fff" fill-opacity=".14" stroke="{INK}" stroke-width="2"/>')
        G.append(f'<path d="M{exl+16} {ey} Q{(exl+exr)/2} {ey-5} {exr-16*kr*1.1} {ey}" stroke="{INK}" stroke-width="2" fill="none"/>')
        G.append(f'<path d="M{exl-16} {ey} L{exl-36} {ey-6}" stroke="{INK}" stroke-width="2" fill="none" stroke-linecap="round"/>')
    return f'<defs>{"".join(D)}</defs><g filter="url(#ink)">{"".join(G)}</g>'


def sprite_side(theme, fur_key, outfit, expr="calm", uid=None):
    return (f'<defs>{DEFS}</defs><g transform="translate(0 -150) scale(.85) translate(-120 -94)">'
            f'{kitten_side(theme, fur_key, outfit, expr, uid)}</g>')
