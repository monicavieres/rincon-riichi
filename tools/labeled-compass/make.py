#!/usr/bin/env python3
"""The compass with a small letter beside each wind's kanji, in each site language. `python3 make.py` writes a
preview into ./out; `python3 make.py site` writes assets/illustrations/labeled/<lang>/consola-top-<theme>.svg."""
import pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2] / "assets" / "illustrations"
THEMES = ["light", "dark", "cute", "samurai", "cyberpunk", "vaquero", "frutiger", "fox"]
LETTERS = {"es": {"東": "E", "南": "S", "西": "O", "北": "N"}, "en": {"東": "E", "南": "S", "西": "W", "北": "N"}, "pt": {"東": "L", "南": "S", "西": "O", "北": "N"}}
KANJI = re.compile(r'<text transform="rotate\(([-\d]+) (\d+) (\d+)\)"[^>]*>([東南西北])</text>')

def labelled(svg, lang):
    """Adds the letter to the right of each kanji, in the kanji's own (rotated) frame, so it reads the same way."""
    extra = []
    for rot, x, y, kanji in KANJI.findall(svg):
        x, y = int(x), int(y)
        extra.append(f'<text transform="rotate({rot} {x} {y})" x="{x + 40}" y="{y + 2}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="800" font-size="24" fill="#171513" stroke="#fff8ed" stroke-width="5" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" dominant-baseline="central">{LETTERS[lang][kanji]}</text>')
    return svg.replace("</svg>", "\n".join(extra) + "\n</svg>")

site = len(sys.argv) > 1 and sys.argv[1] == "site"
out = ROOT / "labeled" if site else pathlib.Path(__file__).with_name("out")
for lang in LETTERS:
    (out / lang).mkdir(parents=True, exist_ok=True)
    for theme in THEMES:
        svg = (ROOT / f"consola-top-{theme}.svg").read_text(encoding="utf8")
        (out / lang / f"consola-top-{theme}.svg").write_text(labelled(svg, lang), encoding="utf8")
if site:
    print("written", out); sys.exit(0)

cells = "".join(f'<figure><img src="out/{lang}/consola-top-{theme}.svg"><figcaption>{lang.upper()} · {theme}</figcaption></figure>' for lang in LETTERS for theme in ["light", "dark", "fox"])
html = f"""<!doctype html><meta charset="utf-8"><style>body {{ margin: 0; padding: 20px; width: 1040px; background: #f1e4c6; font-family: Helvetica, sans-serif }}
.g {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px }} figure {{ margin: 0; text-align: center }} img {{ width: 300px }} figcaption {{ font: 700 12px Helvetica; text-transform: uppercase; color: #4a3a8c }}</style><div class="g">{cells}</div>"""
sheet = pathlib.Path(__file__).with_name("preview.html"); sheet.write_text(html, encoding="utf8")
png = pathlib.Path(__file__).with_name("preview.png")
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.5", f"--screenshot={png}", "--window-size=1080,1060", f"file://{sheet}"], check=True, capture_output=True)
print("ok", png)
