"""
Top-down compass for the tutorial table: the same plate as the home page's console (assets/illustrations/consola-*.svg)
drawn flat, one per style, in the same 700-unit plate coordinates as generate-illustrations.py.

    python3 tools/design/generate-compass-top.py
"""
import ast
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
source = open(os.path.join(HERE, 'generate-illustrations.py')).read()
start = source.index('THEMES = {') + len('THEMES = ')
THEMES = ast.literal_eval(source[start:source.index('\n}\n', start) + 2])

KANJI = "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif"
NUM = "'Barlow Semi Condensed','Barlow',system-ui,sans-serif"


def emblem(name):
    svg = open(os.path.join(ROOT, 'assets', 'emblems', f'{name}.svg')).read()
    return re.sub(r'<svg[^>]*>', '', svg, count=1).replace('</svg>', '')


def build(name, t):
    seats = {  # seat: (rotation, number text, number position, kanji position)
        'E': (0, '1 · 5 · 9', (350, 565), (350, 492), '東'),
        'W': (180, '3 · 7 · 11', (350, 140), (350, 225), '西'),
        'N': (90, '4 · 8 · 12', (140, 350), (230, 350), '北'),
        'S': (-90, '2 · 6 · 10', (560, 350), (470, 350), '南'),
    }
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" role="img" aria-label="Compass">']
    out.append('<defs><filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".25"/></filter></defs>')
    ink = t['ink']
    out.append(f'<rect x="48" y="48" width="604" height="604" rx="46" fill="{t["cplate"]}" stroke="{ink}" stroke-width="10" filter="url(#soft)"/>')
    out.append(f'<rect x="64" y="64" width="572" height="572" rx="34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>')
    for d in ('M205 48H495V106C495 124.2 480.2 139 462 139H238C219.8 139 205 124.2 205 106V48Z',
              'M205 652H495V594C495 575.8 480.2 561 462 561H238C219.8 561 205 575.8 205 594V652Z',
              'M48 205H106C124.2 205 139 219.8 139 238V462C139 480.2 124.2 495 106 495H48V205Z',
              'M652 205H594C575.8 205 561 219.8 561 238V462C561 480.2 575.8 495 594 495H652V205Z'):
        out.append(f'<path d="{d}" fill="{t["cwell"]}" stroke="{ink}" stroke-width="5"/>')
    for x, y, w, h in ((236, 70, 228, 40), (236, 590, 228, 40), (70, 236, 40, 228), (590, 236, 40, 228)):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{t["cinset"]}" stroke="{ink}" stroke-width="4"/>')
    for px, py in ((160, 92), (482, 476)):
        out.append(f'<rect x="{px}" y="{py}" width="58" height="132" rx="13" fill="{t["cwell"]}" stroke="{ink}" stroke-width="4" transform="rotate(-45 {px + 29} {py + 66})"/>')
    cross = ('M350 153C404 153 428 195 428 243V273H458C506 273 542 298 542 350C542 402 506 427 458 427H428V457'
             'C428 505 404 547 350 547C296 547 272 505 272 457V427H242C194 427 158 402 158 350C158 298 194 273 242 273'
             'H272V243C272 195 296 153 350 153Z')
    out.append(f'<path d="{cross}" fill="{t["cpurple"]}" stroke="{ink}" stroke-width="7" stroke-linejoin="round"/>')
    for x, y, w, h in ((235, 116, 230, 48), (235, 536, 230, 48), (116, 235, 48, 230), (536, 235, 48, 230)):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{t["cpurple"]}" stroke="{ink}" stroke-width="5"/>')
    # the riichi stick lies in East's slot (the player's)
    out.append(f'<rect x="240" y="594" width="220" height="32" rx="9" fill="#2f6fd0" stroke="{ink}" stroke-width="4"/>')
    for i in range(5):
        out.append(f'<circle cx="{280 + i * 35}" cy="610" r="5" fill="#fff"/>')
    # centre: the style's emblem, or the rose on the paper style
    if t.get('back_emblem'):
        out.append(f'<g transform="translate(274 274) scale(2.375)">{emblem(t["back_emblem"])}</g>')
    else:
        for r, w in ((82, 4), (62, 3)):
            out.append(f'<circle cx="350" cy="350" r="{r}" fill="none" stroke="#eee9ff" stroke-width="{w}"/>')
        out.append('<path d="M350 263L368 330L437 312L387 360L437 408L368 390L350 457L332 390L263 408L313 360L263 312L332 330L350 263Z" fill="#f7f2ff" stroke="%s" stroke-width="3"/>' % ink)
    for seat, (rot, nums, (nu, nv), (ku, kv), ch) in seats.items():
        size = 31 if seat in 'EW' else 29
        out.append(f'<text transform="rotate({rot} {nu} {nv})" x="{nu}" y="{nv}" font-family="{NUM}" font-weight="800" font-size="{size}" fill="{t["cnum"]}" stroke="{t["cnumline"]}" stroke-width="6" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" dominant-baseline="central">{nums}</text>')
        fill = t['man'] if seat == 'E' else '#111111'
        out.append(f'<text transform="rotate({rot} {ku} {kv})" x="{ku}" y="{kv}" font-family="{KANJI}" font-weight="800" font-size="{56 if seat == "E" else 50}" fill="{fill}" stroke="#fff8ed" stroke-width="7" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" dominant-baseline="central">{ch}</text>')
    out.append('</svg>')
    return '\n'.join(out)


for name, theme in THEMES.items():
    path = os.path.join(ROOT, 'assets', 'illustrations', f'consola-top-{name}.svg')
    open(path, 'w').write(build(name, theme))
    print('wrote', os.path.relpath(path, ROOT))
