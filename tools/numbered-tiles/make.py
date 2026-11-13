#!/usr/bin/env python3
"""Tiles with a small label in the top-left corner of the face: the number for manzu, pinzu and souzu, the
wind's letter for winds. One set (the drawing is the same in every theme). Writes ./out/numbers (manzu, pinzu, souzu) and ./out/honors-<lang> (es, en, pt), plus a preview sheet."""
import pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2] / "assets"
SRC = ROOT / "tiles-fluffystuff-composite"
OUT = pathlib.Path(__file__).with_name("out") / "tiles-fluffystuff-composite"
LABEL = '<text x="16.2" y="19.6" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="800" font-size="10.5" fill="#171513">{t}</text>'
# a few pinzu and souzu drawings reach into that corner, so each of those suits is shrunk a little (same amount
# for the whole suit, centred), just enough to leave the corner free; manzu and honors fit as they are
SCALE = {"m": 1.0, "p": 0.95, "s": 0.93, "z": 1.0}
# honors carry the initial of their name, so there is one honor set per site language (files 1z..7z: East, South,
# West, North, then green, red and white dragon)
HONORS = {
    "es": {"1": "E", "2": "S", "3": "O", "4": "N", "5": "V", "6": "R", "7": "B"},
    "en": {"1": "E", "2": "S", "3": "W", "4": "N", "5": "G", "6": "R", "7": "Wh"},
    "pt": {"1": "L", "2": "S", "3": "O", "4": "N", "5": "Vd", "6": "Vm", "7": "B"},
}

def label_for(code, lang="es"):
    n, suit = code[0], code[1]
    if suit == "z":
        return HONORS[lang][n]
    return "5" if n == "0" else n

def build(code, lang, folder, src=None):
    svg = ((src or SRC) / f"{code}.svg").read_text(encoding="utf8")
    k = SCALE[code[1]]
    if k != 1.0:
        w, h = 66 * k, 88 * k
        svg = svg.replace('x="15" y="14" width="66" height="88"', f'x="{48 - w / 2:.2f}" y="{58 - h / 2:.2f}" width="{w:.2f}" height="{h:.2f}"')
    text = label_for(code, lang)
    label = LABEL.format(t=text)
    if code[1] == "z":
        # letters are wider than digits (W, Wh, Vm): start them just inside the border instead of centring them;
        # the honor drawings leave that whole strip free up to x=25
        label = label.replace('x="16.2" y="19.6" text-anchor="middle"', 'x="13.9" y="19.6" text-anchor="start"')
        if len(text) > 1:
            label = label.replace('font-size="10.5"', 'font-size="9"')
    svg = svg.replace("</svg>", "  " + label + "\n</svg>")
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{code}.svg").write_text(svg, encoding="utf8")

import sys
if len(sys.argv) > 1 and sys.argv[1] == "site":
    # the site version: every theme's tile set, numbers in assets/tiles-labeled/<set>/, honors in <set>/<lang>/
    THEME_SETS = ["tiles-fluffystuff-composite", "tiles-neon", "tiles-cute", "tiles-samurai", "tiles-cyberpunk", "tiles-vaquero", "tiles-frutiger", "tiles-fox"]
    for name in THEME_SETS:
        dest = ROOT / "tiles-labeled" / name
        for code in [f"{n}{s}" for s in "mps" for n in "0123456789"]:
            build(code, "es", dest, ROOT / name)
        for lang in HONORS:
            for n in "1234567":
                build(f"{n}z", lang, dest / lang, ROOT / name)
    print("site tiles written to", ROOT / "tiles-labeled")
    sys.exit(0)

BASE = pathlib.Path(__file__).with_name("out")
for code in [f"{n}{s}" for s in "mps" for n in "0123456789"]:
    build(code, "es", BASE / "numbers")
for lang in HONORS:
    for n in "1234567":
        build(f"{n}z", lang, BASE / f"honors-{lang}")
codes = list(range(37))

def row(name, items, folder="numbers"):
    return f'<div class="row"><b>{name}</b>' + "".join(f'<img src="out/{folder}/{c}.svg">' for c in items) + "</div>"
html = f"""<!doctype html><meta charset="utf-8"><style>
body {{ margin: 0; padding: 22px 26px; width: 1080px; background: #f1e4c6; font-family: Helvetica, sans-serif; color: #2b2540 }}
h1 {{ margin: 0 0 4px; font: 400 26px Cochin, Georgia, serif; color: #4a3a8c }} p {{ margin: 0 0 14px; font-style: italic }}
.row {{ display: flex; align-items: center; gap: 4px; margin: 6px 0 }} .row b {{ width: 120px; font-size: 12px; text-transform: uppercase }} .row img {{ width: 64px }}
.bigs {{ display: flex; gap: 12px; margin: 6px 0 16px }} .bigs img {{ width: 130px }}
</style><h1>Fichas con número · propuesta</h1><p>Arriba, los dragones y el oeste en inglés y portugués, en grande; abajo, todas a tamaño de uso (la última de cada palo es el 5 rojo).</p>
<div class="bigs">{"".join(f'<img src="out/honors-en/{c}.svg">' for c in ["3z", "7z", "5z", "6z"])}{"".join(f'<img src="out/honors-pt/{c}.svg">' for c in ["5z", "6z"])}</div>
{row("Manzu", "1m 2m 3m 4m 5m 6m 7m 8m 9m 0m".split())}{row("Pinzu", "1p 2p 3p 4p 5p 6p 7p 8p 9p 0p".split())}{row("Souzu", "1s 2s 3s 4s 5s 6s 7s 8s 9s 0s".split())}{row("Honores ES", "1z 2z 3z 4z 7z 5z 6z".split(), "honors-es")}{row("Honors EN", "1z 2z 3z 4z 7z 5z 6z".split(), "honors-en")}{row("Honras PT", "1z 2z 3z 4z 7z 5z 6z".split(), "honors-pt")}"""
sheet = pathlib.Path(__file__).with_name("preview.html")
sheet.write_text(html, encoding="utf8")
png = pathlib.Path(__file__).with_name("preview.png")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", f"--screenshot={png}", "--window-size=1130,1060", f"file://{sheet}"], check=True, capture_output=True)
print("ok", len(codes), "tiles")
