"""Hand-drawn kitten sprites (style A from styles3.py) for the table illustration and the tutorial avatars.

Kitten frame: head centred near (120, 94), feet at y≈252. `sprite()` maps it onto the old sprite frame
(head at (0, -150), seat at y≈0) so cats2.py can place it exactly where the previous cats sat."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from styles3 import cat, sh, mirror, DEFS, INK, PINK, HEAD, BODY, EAR_L, TAIL  # noqa: E402

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
