#!/usr/bin/env python3
"""Builds the printable landscape quick guide (front: how to sit down and play; back: the rules to add next) in es / en / pt."""
import pathlib, subprocess, sys
import segno

if len(sys.argv) < 2:
    for _lang in ("es", "en", "pt"):
        subprocess.run([sys.executable, __file__, _lang], check=True)
    sys.exit(0)
LANG = sys.argv[1]
_IDX = {"es": 0, "en": 1, "pt": 2}[LANG]
def tr(es, en, pt):
    return (es, en, pt)[_IDX]

ROOT = pathlib.Path(__file__).resolve().parents[2]
FILES = {"es": "guia-rapida-riichi-mahjong-es", "en": "quick-guide-riichi-mahjong-en", "pt": "guia-rapido-riichi-mahjong-pt"}
OUT_HTML = pathlib.Path(__file__).with_name(f"onepager-{LANG}.html")
OUT_PDF = ROOT / "assets" / "docs" / (FILES[LANG] + ".pdf")
A = "../../assets"
TILES = f"{A}/tiles-fluffystuff-composite"
SITE = "https://rincon-riichi.vercel.app"

def tiles(spec, cls=""):
    out = []
    for token in spec.split():
        rot = token.endswith("~"); hi = token.endswith("!")
        code = token.rstrip("~!")
        out.append(f'<img class="tl{" side" if rot else ""}{" hi" if hi else ""}" src="{TILES}/{code}.svg" alt="{code}">')
    return f'<span class="tiles {cls}">' + "".join(out) + "</span>"

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from stick_svg import stick

def sticks(counts):
    return "".join(stick(v) for v, n in counts for _ in range(n))

qr = segno.make(SITE, error="q").svg_inline(scale=4, dark="#2b2540", light="#ffffff", border=2, svgclass="qrsvg", omitsize=True)
BACK = f"{A}/tile-back-default.svg"
def back(n=1):
    return '<span class="tiles">' + "".join(f'<img class="tl" src="{BACK}" alt="">' for _ in range(n)) + '</span>'
def arrow(cls=""):
    return f'<svg class="arrow {cls}" viewBox="0 0 30 18" width="22" height="13"><path d="M2 9h20M16 2l8 7-8 7" fill="none" stroke="#e8672c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def pill(x, y, text, color="#4a3a8c", lead=None):
    w = len(text) * 12.2 + 30
    line = f'<line x1="{lead[0]}" y1="{lead[1]}" x2="{x}" y2="{y}" stroke="#e8672c" stroke-width="4"/><circle cx="{lead[0]}" cy="{lead[1]}" r="9" fill="#e8672c" stroke="#fff" stroke-width="3"/>' if lead else ""
    return f'{line}<g transform="translate({x - w/2:.0f},{y - 20})"><rect width="{w:.0f}" height="40" rx="20" fill="{color}" stroke="#fff" stroke-width="3"/><text x="{w/2:.0f}" y="27" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Avenir Next, Helvetica, sans-serif">{text}</text></g>'

table_pins = "".join([
    pill(545, 664, tr("TÚ · ESTE (DEALER)", "YOU · EAST (DEALER)", "VOCÊ · LESTE (DEALER)"), "#a8322b", (545, 590)),
    pill(930, 400, tr("SUR · DERECHA", "SOUTH · RIGHT", "SUL · DIREITA"), "#4a3a8c", (800, 440)),
    pill(545, 50, tr("OESTE · ENFRENTE", "WEST · ACROSS", "OESTE · EM FRENTE"), "#4a3a8c", (545, 130)),
    pill(170, 200, tr("NORTE · IZQUIERDA", "NORTH · LEFT", "NORTE · ESQUERDA"), "#4a3a8c", (300, 280)),
    pill(760, 150, tr("MURO", "WALL", "MURO"), "#14683f", (690, 230)),
    pill(850, 300, "COMPASS", "#14683f", (590, 320)),
    pill(190, 640, tr("PALITOS", "STICKS", "PALITOS"), "#8a5a00", (230, 548)),
])
def named(items):
    return '<div class="named">' + "".join(f'<span>{tiles(c)}<em>{n}</em></span>' for c, n in items) + '</div>'
suit_rows = "".join(f'<div class="suit"><b>{name}</b>{tiles(" ".join(f"{n}{c}" for n in range(1, 10)), "mini")}</div>' for c, name in [("m", tr("Manzu · números", "Manzu · numbers", "Manzu · números")), ("p", tr("Pinzu · círculos", "Pinzu · circles", "Pinzu · círculos")), ("s", tr("Souzu · bambúes", "Souzu · bamboo", "Souzu · bambus"))])
GRP, SEQ, TRI, PAIR = tr("Grupo", "Set", "Grupo"), tr("Secuencia", "Sequence", "Sequência"), tr("Trío", "Triplet", "Trio"), tr("Pareja", "Pair", "Par")
tiles_panel = f"""<div class="panel"><h3>{tr("Las 34 clases de ficha", "The 34 kinds of tile", "Os 34 tipos de peça")} <small style="font:italic 8pt Palatino,serif;color:#6b5b3a">{tr("(4 copias de cada una)", "(4 copies of each)", "(4 cópias de cada)")}</small></h3>
    {suit_rows}
    <div class="honors"><b>{tr("Honores<br>Vientos", "Honors<br>Winds", "Honras<br>Ventos")}</b>{named([("1z", tr("Este", "East", "Leste")), ("2z", tr("Sur", "South", "Sul")), ("3z", tr("Oeste", "West", "Oeste")), ("4z", tr("Norte", "North", "Norte"))])}<b>{tr("Honores<br>Dragones", "Honors<br>Dragons", "Honras<br>Dragões")}</b>{named([("7z", tr("Haku · blanco", "Haku · white", "Haku · branco")), ("5z", tr("Hatsu · verde", "Hatsu · green", "Hatsu · verde")), ("6z", tr("Chun · rojo", "Chun · red", "Chun · vermelho"))])}</div>
  </div>"""

CSS = f"""
@page {{ size: 11in 8.5in; margin: 0 }}
* {{ box-sizing: border-box }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact }}
body {{ margin: 0; font-family: Palatino, 'Palatino Linotype', Georgia, serif; color: #2b2540; font-size: 8.8pt; line-height: 1.32 }}
.sheet {{ position: relative; width: 11in; height: 8.5in; overflow: hidden; page-break-after: always; padding: .24in .36in .26in; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: .1in;
  background: radial-gradient(ellipse at 12% 8%, rgba(255,255,255,.6), transparent 55%), radial-gradient(ellipse at 92% 96%, rgba(170,130,60,.2), transparent 60%), #f1e4c6 }}
.sheet::before {{ content: ""; position: absolute; inset: 0; opacity: .2; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .15  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }}
.sheet > * {{ position: relative }}
header {{ display: flex; align-items: center; gap: .18in }}
header .mark {{ width: .55in }}
header h1 {{ margin: 0; font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; font-size: 30pt; line-height: .95; color: #4a3a8c; letter-spacing: -.4pt }}
header h1 em {{ font-style: italic; color: #a8322b }}
header p {{ margin: 3pt 0 0; font-style: italic; font-size: 9.6pt }}
.ribbon {{ margin-left: auto }} .ribbon span {{ display: inline-block; padding: 3pt 14pt; background: #f2b42c; color: #2b2540; border: 1.5pt solid #2b2540; font: 700 9pt 'Avenir Next', Helvetica, sans-serif; letter-spacing: 1pt; text-transform: uppercase; box-shadow: 0 2pt 0 #2b2540; white-space: nowrap }}
.path {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: .26in; min-height: 0 }}
.grid6 {{ display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1.32fr 1fr; gap: .2in .22in; min-height: 0 }}
.card {{ position: relative; display: flex; flex-direction: column; min-height: 0; padding: .16in .13in .11in; border: 1.2pt solid #2b2540; border-radius: 10pt; background: rgba(255,255,255,.55); box-shadow: 0 2.5pt 0 rgba(43,37,64,.35) }}
.card .n {{ position: absolute; top: -.14in; left: .12in; width: .3in; height: .3in; display: grid; place-items: center; border-radius: 50%; background: #4a3a8c; color: #fff; font: 700 13pt Cochin, Georgia, serif; border: 1.5pt solid #fff; box-shadow: 0 1.5pt 0 rgba(43,37,64,.4) }}
.card h2 {{ margin: 0 0 1pt .3in; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 15pt; color: #4a3a8c; line-height: 1 }}
.grid6 .card h2 {{ margin-left: 0; font-size: 14pt }}
.card .lead {{ margin: 6pt 0 4pt; font-weight: 700; font-size: 9.6pt; line-height: 1.22 }}
.card p {{ margin: 0 0 3pt; font-size: 8.7pt }}
.path .card + .card::before {{ content: ""; position: absolute; left: -.22in; top: 48%; width: .19in; height: .13in; background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 18'><path d='M2 9h20M16 2l8 7-8 7' fill='none' stroke='%23e8672c' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat }}
.hook {{ margin-top: auto; padding: 3.5pt 6pt; text-align: center; background: #f2b42c; border: 1.2pt solid #2b2540; border-radius: 7pt; font: italic 700 10pt Cochin, Georgia, serif; box-shadow: 0 1.5pt 0 #2b2540 }}
.tiles {{ display: inline-flex; align-items: flex-end }} .tl {{ height: .34in; width: auto; display: block; filter: drop-shadow(0 1pt 0 rgba(43,37,64,.35)) }}
.tl.side {{ transform: rotate(90deg) translate(0, 2pt); margin: 0 .06in }} .tl.hi {{ outline: 1.8pt solid #e8672c; border-radius: 3pt }}
.mini .tl {{ height: .25in }}
.row {{ display: flex; justify-content: center; align-items: flex-end; gap: 4pt; flex-wrap: nowrap }}
.lbl {{ display: block; font-size: 6.6pt; text-transform: uppercase; letter-spacing: .4pt; color: #14683f; margin-top: 1pt; text-align: center }} .lbl.pl {{ color: #8a5a00 }}
.hand5 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 3pt; margin: 3pt 0 4pt }} .g {{ padding: 3pt 2pt 2pt; border: .8pt dashed #8b7a5a; background: rgba(255,255,255,.5); text-align: center; border-radius: 4pt }} .g .tl {{ height: .3in }} .g.pair {{ background: #fff3cf }}
.scenes {{ display: grid; gap: 4pt; margin: 2pt 0 4pt }} .scene {{ display: grid; grid-template-columns: .8in 1fr; align-items: center; gap: 5pt; padding: 3pt 5pt; border: .9pt solid #4a3a8c; border-radius: 8pt; background: rgba(255,255,255,.65) }}
.scene > div:last-child {{ display: flex; gap: 4pt; align-items: flex-start }} .scene .num {{ font-style: normal; font-weight: 700; flex: none; display: grid; place-items: center; width: 13pt; height: 13pt; border-radius: 50%; background: #f2b42c; border: 1pt solid #2b2540; font-size: 7.6pt }}
.scene .pic {{ display: flex; align-items: center; justify-content: center; gap: 2pt }} .scene .pic .tl {{ height: .25in }} .scene .pic img.dice {{ height: .34in; width: auto }} .scene small {{ display: block; font-size: 8.1pt; line-height: 1.2 }}
.final {{ text-align: center; margin: 3pt 0 5pt; padding: 4pt 3pt; border: .9pt dashed #8b7a5a; background: rgba(255,255,255,.5); border-radius: 5pt }} .final .row {{ gap: 2pt; margin: 1pt 0 }} .final .tl {{ height: .29in }} .final .cap {{ display: block; font: italic 7.2pt Palatino, serif; color: #6b5b3a; margin-top: 2pt }}
.calls {{ display: grid; gap: 4pt; margin: 2pt 0 }} .call {{ display: grid; grid-template-columns: auto 1fr; gap: 6pt; align-items: center; padding: 3pt 5pt; border: .9pt dashed #8b7a5a; border-radius: 6pt; background: rgba(255,255,255,.55) }} .call .row {{ gap: 2pt }} .call .tl {{ height: .27in }} .call > div:last-child {{ font-size: 7.8pt; line-height: 1.2 }} .call > div:last-child b {{ display: block; font: 700 7.8pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .4pt; color: #1f3f9a }}
.duo {{ display: grid; grid-template-columns: 1fr 1fr; gap: 4pt; margin: 2pt 0 4pt }} .duo div {{ padding: 3pt 3pt 4pt; border: .9pt solid #8a5a00; border-radius: 7pt; background: #fff1c4; text-align: center; font-size: 7.8pt; line-height: 1.2 }} .duo b {{ display: block; font-family: Cochin, Georgia, serif; font-size: 11pt; color: #a8322b; font-weight: 400 }} .duo .row {{ margin-top: 2pt }} .duo .tl {{ height: .25in }}
.yk {{ display: grid; grid-template-columns: .5in 1fr; gap: 1pt 4pt; align-items: center; margin: 2pt 0; font-size: 7.8pt; line-height: 1.2 }} .yk b {{ font-family: Cochin, Georgia, serif; font-size: 10pt; color: #4a3a8c; font-weight: 400 }} .yk .tl {{ height: .24in }} .yk .stick {{ display: inline-block; vertical-align: middle; width: .7in; height: auto }}
.sticks {{ display: grid; gap: 4pt; margin: 3pt 0 4pt }} .srow {{ display: grid; grid-template-columns: .78in 1fr; align-items: center; gap: 4pt; font-size: 8.6pt }} .srow b {{ text-align: right }} .srow span {{ font-style: italic; color: #6b5b3a; font-size: 7.4pt }} .stick {{ display: block }}
.pay {{ display: flex; align-items: center; justify-content: center; gap: 5pt; font-size: 7.4pt; margin: 3pt 0 }} .pg {{ display: flex; flex-direction: column; align-items: center; gap: 1pt }} .pg > div {{ display: flex; flex-direction: column; gap: 2pt }} .pay > b {{ font-family: Cochin, Georgia, serif; font-size: 13pt; color: #4a3a8c }} .pay .tot {{ color: #a8322b }}
.rounds {{ display: grid; gap: 4pt; margin: 2pt 0 4pt }} .rc {{ display: flex; align-items: center; gap: 6pt; padding: 3pt 6pt; border: .9pt solid #4a3a8c; border-radius: 9pt; background: rgba(255,255,255,.6); font-size: 8.4pt }} .plate {{ display: grid; place-items: center; width: 22pt; height: 15pt; border: 1.2pt solid #2b2540; border-radius: 4pt; background: #f08a30; color: #fff6e5; font: 700 11pt 'Hiragino Mincho ProN', serif }} .hands {{ display: flex; gap: 2pt; margin-left: auto }} .hands i {{ display: grid; place-items: center; width: 12pt; height: 12pt; border-radius: 3pt; background: #f2b42c; font-style: normal; font-size: 7.4pt; font-weight: 700 }}
.words {{ display: grid; gap: 3pt; margin: 2pt 0 }} .words div {{ font-size: 8pt; line-height: 1.22 }} .words b {{ font-family: Cochin, Georgia, serif; font-size: 10pt; color: #4a3a8c; font-weight: 400 }}
.dora {{ display: flex; align-items: center; justify-content: center; gap: 4pt; margin: 2pt 0 4pt; padding: 3pt; border: .9pt dashed #8b7a5a; border-radius: 5pt; background: rgba(255,255,255,.5); font-size: 7.4pt }} .dora .tl {{ height: .27in }} .dora i {{ font-style: normal; font-weight: 700; color: #a8322b }}
.bottom {{ display: grid; grid-template-columns: 3.45in 1fr 1.5in; gap: .22in; align-items: stretch; min-height: 0 }}
.panel {{ padding: .08in .12in .08in; border: 1.1pt solid #2b2540; border-radius: 9pt; background: rgba(255,255,255,.5); min-height: 0 }}
.panel h3 {{ margin: 0 0 2pt; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 12.5pt; color: #4a3a8c }}
.fig {{ position: relative; width: 86%; margin: 0 auto }} .fig img {{ width: 100%; display: block }} .fig svg {{ position: absolute; inset: 0; width: 100%; height: 100% }}
.suit {{ display: flex; align-items: center; gap: 6pt; margin: 2pt 0 }} .suit b {{ width: .95in; font: 700 7.4pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .3pt; color: #4a3a8c }}
.honors {{ display: grid; grid-template-columns: auto 1fr; gap: 3pt 8pt; align-items: end; margin-top: 3pt; padding: 3pt 5pt; border: .9pt dashed #8b7a5a; border-radius: 6pt }} .honors > b {{ font: 700 7.4pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .3pt; color: #a8322b; width: .62in; align-self: center }}
.named {{ display: flex; gap: 6pt }} .named span {{ display: inline-flex; flex-direction: column; align-items: center }} .named .tl {{ height: .3in }} .named em {{ font: 600 6.6pt 'Avenir Next', Helvetica, sans-serif; font-style: normal; text-transform: uppercase; letter-spacing: .2pt; margin-top: 1pt; text-align: center; line-height: 1.1 }}
.note {{ margin: 2pt 0 0; font-size: 7.2pt; line-height: 1.2; font-style: italic; text-align: center }}
.qr {{ display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 3pt }} .qr svg.qrsvg {{ width: 1.1in; height: 1.1in; display: block; shape-rendering: crispEdges; border: 1.4pt solid #2b2540; border-radius: 6pt }} .qr b {{ font: 700 8.6pt 'Avenir Next', Helvetica, sans-serif; color: #4a3a8c }} .qr small {{ font-size: 7.6pt; font-style: italic }} .flip {{ margin-top: 2pt; padding: 2pt 8pt; border-radius: 99pt; background: #4a3a8c; color: #fff; font: 700 7.6pt 'Avenir Next', Helvetica, sans-serif; letter-spacing: .4pt; text-transform: uppercase }}
.grid6 .card p {{ font-size: 9pt }} .grid6 .lead {{ font-size: 9.8pt }} .grid6 .call .tl {{ height: .32in }} .grid6 .call > div:last-child {{ font-size: 8.6pt }} .grid6 .duo div {{ font-size: 8.6pt }} .grid6 .duo .tl {{ height: .3in }} .grid6 .yk {{ font-size: 8.3pt }} .grid6 .yk .tl {{ height: .26in }} .grid6 .duo .tl {{ height: .26in }} .grid6 .words div {{ font-size: 9.2pt }} .grid6 .dora {{ font-size: 8.4pt }} .grid6 .dora .tl {{ height: .34in }} .grid6 .rc {{ font-size: 9.4pt }} .grid6 .pay {{ font-size: 8.2pt }} .grid6 .srow {{ font-size: 9.6pt }} .grid6 .sticks {{ gap: 2pt; margin: 2pt 0 }} .grid6 .sticks .stick {{ width: 1.3in; height: auto }} .grid6 .pay .stick {{ width: .85in; height: auto }} .grid6 .pay {{ margin: 1pt 0 }} .pay > b {{ white-space: nowrap }} .grid6 .mini .tl {{ height: .3in }}
.footline {{ text-align: center; font: italic 8.4pt Palatino, serif; color: #6b5b3a }}
"""

FRONT = f"""<div class="sheet">
<header>
  <img class="mark" src="{A}/rincon-mark.svg" alt="">
  <div><h1>{tr("Cómo se juega", "How to play", "Como se joga")} <em>Riichi Mahjong</em></h1><p>{tr("Un juego de 4 personas, parecido al Carioca o al rummy. Para tu primera partida solo necesitas esta cara.", "A game for 4 people, a bit like rummy. For your first game you only need this side.", "Um jogo para 4 pessoas, parecido com o rummy. Para a sua primeira partida você só precisa deste lado.")}</p></div>
  <div class="ribbon"><span>{tr("Guía rápida · cara 1 de 2", "Quick guide · side 1 of 2", "Guia rápido · lado 1 de 2")}</span></div>
</header>
<div class="path">
  <div class="card"><span class="n">1</span><h2>{tr("La meta", "The goal", "A meta")}</h2>
    <p class="lead">{tr("Armar tu mano: 4 grupos y 1 pareja.", "Build your hand: 4 sets and 1 pair.", "Montar a mão: 4 grupos e 1 par.")}</p>
    <div class="hand5">
      <div class="g">{tiles("1m 2m 3m")}<span class="lbl">{SEQ}</span></div>
      <div class="g">{tiles("4p 5p 6p")}<span class="lbl">{SEQ}</span></div>
      <div class="g">{tiles("3s 4s 5s")}<span class="lbl">{SEQ}</span></div>
      <div class="g">{tiles("6z 6z 6z")}<span class="lbl">{TRI}</span></div>
      <div class="g pair">{tiles("1z 1z")}<span class="lbl pl">{PAIR}</span></div>
    </div>
    <p>{tr("<b>Secuencia:</b> 3 números seguidos del mismo palo. <b>Trío:</b> 3 fichas iguales. <b>Pareja:</b> 2 iguales.", "<b>Sequence:</b> 3 numbers in a row from one suit. <b>Triplet:</b> 3 identical tiles. <b>Pair:</b> 2 identical.", "<b>Sequência:</b> 3 números seguidos do mesmo naipe. <b>Trio:</b> 3 peças iguais. <b>Par:</b> 2 iguais.")}</p>
    <div class="hook">{tr("4 × 3 + 2 = 14 fichas", "4 × 3 + 2 = 14 tiles", "4 × 3 + 2 = 14 peças")}</div>
  </div>
  <div class="card"><span class="n">2</span><h2>{tr("Para empezar", "Getting started", "Para começar")}</h2>
    <p class="lead">{tr("Cuatro personas alrededor de la mesa.", "Four people around the table.", "Quatro pessoas ao redor da mesa.")}</p>
    <div class="scenes">
      <div class="scene"><div class="pic">{back(3)}</div><div><i class="num">1</i><small>{tr("Mezclen las fichas boca abajo y armen un muro cuadrado entre todos.", "Mix the tiles face down and build a square wall together.", "Misturem as peças viradas para baixo e montem um muro quadrado entre todos.")}</small></div></div>
      <div class="scene"><div class="pic">{tiles("4p 5p 6p 9p")}</div><div><i class="num">2</i><small>{tr("Cada uno toma <b>13 fichas</b> y las ordena de pie frente a sí.", "Everyone takes <b>13 tiles</b> and stands them in front of them.", "Cada um pega <b>13 peças</b> e as ordena em pé à sua frente.")}</small></div></div>
      <div class="scene"><div class="pic"><img class="dice" src="{A}/illustrations/dados-light.svg" alt=""></div><div><i class="num">3</i><small>{tr("Un dado decide quién empieza (el <b>dealer</b>). Se juega en sentido antihorario.", "A die decides who starts (the <b>dealer</b>). Play goes counter-clockwise.", "Um dado decide quem começa (o <b>dealer</b>). Joga-se no sentido anti-horário.")}</small></div></div>
    </div>
    <div class="hook">{tr("Mezclar · repartir · jugar", "Mix · deal · play", "Misturar · distribuir · jogar")}</div>
  </div>
  <div class="card"><span class="n">3</span><h2>{tr("Tu turno", "Your turn", "A sua vez")}</h2>
    <p class="lead">{tr("Roba una, bota una.", "Draw one, discard one.", "Compre uma, descarte uma.")}</p>
    <div class="scenes">
      <div class="scene"><div class="pic">{back(1)}{arrow()}{tiles("8s")}</div><div><i class="num">1</i><small>{tr("Robas una ficha del muro.", "You draw a tile from the wall.", "Você compra uma peça do muro.")}</small></div></div>
      <div class="scene"><div class="pic">{tiles("4p 5p 6p 9p")}</div><div><i class="num">2</i><small>{tr("Decides cuál te sobra.", "You decide which one you do not need.", "Você decide qual sobra.")}</small></div></div>
      <div class="scene"><div class="pic">{tiles("9p!")}{arrow()}{tiles("2z 7p")}</div><div><i class="num">3</i><small>{tr("La botas boca arriba frente a ti.", "You discard it face up in front of you.", "Você a descarta virada para cima à sua frente.")}</small></div></div>
    </div>
    <p>{tr("Sigue el jugador de tu derecha. Al terminar tu turno siempre tienes 13 fichas.", "Then the player on your right goes. At the end of your turn you always hold 13 tiles.", "Segue o jogador à sua direita. Ao fim da sua vez você sempre tem 13 peças.")}</p>
    <div class="hook">{tr("Robo · decido · boto", "Draw · decide · discard", "Compro · decido · descarto")}</div>
  </div>
  <div class="card"><span class="n">4</span><h2>{tr("Ganar", "Winning", "Ganhar")}</h2>
    <p class="lead">{tr("Gana quien completa su mano primero.", "The first to complete their hand wins.", "Ganha quem completa a mão primeiro.")}</p>
    <div class="final"><div class="row">{tiles("1m 2m 3m")}{tiles("4p 5p 6p")}{tiles("3s 4s 5s")}</div><div class="row">{tiles("6z 6z 6z")}{tiles("1z 1z!")}</div><span class="cap">{tr("4 grupos + 1 pareja, con la ficha que robaste o la que acaba de botar otro.", "4 sets + 1 pair, using the tile you drew or the one another player just threw.", "4 grupos + 1 par, com a peça que você comprou ou a que outro acabou de descartar.")}</span></div>
    <p>{tr("Dilo en voz alta —<b>«¡Tsumo!»</b> si la robaste tú, <b>«¡Ron!»</b> si la botó otro— y muestra tu mano.", "Say it out loud —<b>“Tsumo!”</b> if you drew it, <b>“Ron!”</b> if another player threw it— and show your hand.", "Diga em voz alta —<b>«Tsumo!»</b> se você comprou, <b>«Ron!»</b> se outro descartou— e mostre a mão.")}</p>
    <p>{tr("<b>En la primera partida</b> no hace falta nada más: ni llamadas ni puntos. Cuando quieran más, den vuelta la hoja.", "<b>In your first game</b> nothing else is needed: no calls, no points. When you want more, turn the sheet over.", "<b>Na primeira partida</b> não é preciso mais nada: nem chamadas nem pontos. Quando quiserem mais, virem a folha.")}</p>
    <div class="hook">{tr("¡Tsumo! · ¡Ron!", "Tsumo! · Ron!", "Tsumo! · Ron!")}</div>
  </div>
</div>
<div class="bottom">
  <div class="panel"><h3>{tr("La mesa y sus jugadores", "The table and its players", "A mesa e seus jogadores")}</h3><div class="fig"><img src="{A}/illustrations/mesa-light.svg" alt=""><svg viewBox="0 0 1100 720">{table_pins}</svg></div>
    <p class="note">{tr("Cuatro asientos, cada uno con un viento; el turno va en sentido antihorario: Este → Sur → Oeste → Norte.", "Four seats, each with a wind; the turn goes counter-clockwise: East → South → West → North.", "Quatro assentos, cada um com um vento; a vez segue no sentido anti-horário: Leste → Sul → Oeste → Norte.")}</p></div>
  {tiles_panel}
  <div class="panel qr"><h3>{tr("Aprende y practica", "Learn and practise", "Aprenda e pratique")}</h3>{qr}<b>rincon-riichi.vercel.app</b><small>{tr("Escanea: tutorial, fichas y ejercicios", "Scan: tutorial, tiles and drills", "Escaneie: tutorial, peças e exercícios")}</small><span class="flip">{tr("Reverso: más reglas ➜", "Back: more rules ➜", "Verso: mais regras ➜")}</span></div>
</div>
</div>"""

BACKSIDE = f"""<div class="sheet">
<header>
  <img class="mark" src="{A}/rincon-mark.svg" alt="">
  <div><h1>{tr("Cuando ya jugaron una mano", "Once you have played a hand", "Quando já jogaram uma mão")}</h1><p>{tr("Estas reglas se suman de a poco. Agréguenlas una a una, cuando alguien pregunte «¿y si…?».", "These rules come in little by little. Add them one at a time, when someone asks “what if…?”.", "Estas regras entram aos poucos. Acrescentem uma de cada vez, quando alguém perguntar «e se…?».")}</p></div>
  <div class="ribbon"><span>{tr("Guía rápida · cara 2 de 2", "Quick guide · side 2 of 2", "Guia rápido · lado 2 de 2")}</span></div>
</header>
<div class="grid6">
  <div class="card"><h2>{tr("Llamadas", "Calls", "Chamadas")}</h2>
    <p class="lead">{tr("Si alguien bota la ficha que te falta, puedes tomarla.", "If someone throws the tile you need, you may take it.", "Se alguém descarta a peça que falta, você pode pegá-la.")}</p>
    <div class="calls">
      <div class="call"><div class="row">{tiles("4p 6p")}{arrow()}{tiles("5p~")}</div><div><b>Chii</b>{tr("secuencia, solo con la ficha de tu izquierda", "sequence, only from your left", "sequência, só com a peça da sua esquerda")}</div></div>
      <div class="call"><div class="row">{tiles("6z 6z")}{arrow()}{tiles("6z~")}</div><div><b>Pon</b>{tr("trío, de cualquier jugador", "triplet, from any player", "trio, de qualquer jogador")}</div></div>
      <div class="call"><div class="row">{tiles("3s 3s 3s")}{arrow()}{tiles("3s~")}</div><div><b>Kan</b>{tr("cuarteto: roba una ficha extra", "quad: draw an extra tile", "quadra: compra uma peça extra")}</div></div>
    </div>
    <p>{tr("Lo dices en voz alta y pones el grupo boca arriba, con la ficha tomada de lado. Tu mano queda «abierta».", "Say it out loud and lay the set face up, with the taken tile sideways. Your hand becomes “open”.", "Diga em voz alta e ponha o grupo virado para cima, com a peça pega de lado. Sua mão fica «aberta».")}</p>
  </div>
  <div class="card"><h2>{tr("Ganar de verdad: el yaku", "Winning properly: the yaku", "Ganhar de verdade: o yaku")}</h2>
    <p class="lead">{tr("Además de la mano completa, necesitas al menos 1 yaku.", "Besides a complete hand you need at least 1 yaku.", "Além da mão completa, você precisa de ao menos 1 yaku.")}</p>
    <div class="duo">
      <div><b>Tsumo</b>{tr("la robas tú: pagan los 3", "you draw it: all 3 pay", "você compra: os 3 pagam")}<div class="row">{back(1)}{arrow()}{tiles("6z!")}</div></div>
      <div><b>Ron</b>{tr("la bota otro: paga él", "another throws it: they pay", "outro descarta: ele paga")}<div class="row">{tiles("6z")}{arrow()}{tiles("6z!")}</div></div>
    </div>
    <div class="yk"><b>Riichi</b><span>{tr("A una ficha de ganar y sin llamadas: bota una de lado y pon un palito de 1 000.", "One tile from winning and no calls: discard one sideways and add a 1,000 stick.", "A uma peça de ganhar e sem chamadas: descarte uma de lado e ponha um palito de 1.000.")} {stick(1000)}</span></div>
    <div class="yk"><b>Tanyao</b><span>{tr("Solo fichas del 2 al 8", "Only tiles from 2 to 8", "Só peças de 2 a 8")} {tiles("2m 3m 4m")}</span></div>
    <div class="yk"><b>Yakuhai</b><span>{tr("Trío de dragones o de tu viento", "Triplet of dragons or of your wind", "Trio de dragões ou do seu vento")} {tiles("6z 6z 6z")}</span></div>
    <p>{tr("<b>Furiten:</b> si ya botaste una ficha con la que ganarías, no puedes ganar por ron.", "<b>Furiten:</b> if you already threw a tile you would win on, you cannot win by ron.", "<b>Furiten:</b> se você já descartou uma peça com que ganharia, não pode ganhar por ron.")}</p>
  </div>
  <div class="card"><h2>{tr("Puntos y palitos", "Points and sticks", "Pontos e palitos")}</h2>
    <p class="lead">{tr("Cada color vale una cantidad. Todos empiezan con 25 000.", "Each colour is worth an amount. Everyone starts with 25,000.", "Cada cor vale uma quantia. Todos começam com 25.000.")}</p>
    <div class="sticks">
      <div class="srow">{stick(10000)}<b>10 000</b></div><div class="srow">{stick(5000)}<b>5 000</b></div>
      <div class="srow">{stick(1000)}<b>1 000</b></div><div class="srow">{stick(500)}<b>500</b></div><div class="srow">{stick(100)}<b>100</b></div>
    </div>
    <div class="pay"><div class="pg"><div>{sticks([(1000,3)])}</div><span>3 × 1 000</span></div><b>+</b><div class="pg"><div>{sticks([(500,1)])}</div><span>500</span></div><b>+</b><div class="pg"><div>{sticks([(100,4)])}</div><span>4 × 100</span></div><b class="tot">= 3 900</b></div>
    <p>{tr("Al ganar, quien paga deja los palitos en la mesa y el ganador los toma. El valor sale de <b>han</b> (yaku y dora) y <b>fu</b> (minipuntos).", "When someone wins, the payer leaves the sticks on the table and the winner takes them. The value comes from <b>han</b> (yaku and dora) and <b>fu</b> (mini points).", "Ao ganhar, quem paga deixa os palitos na mesa e o vencedor os pega. O valor vem de <b>han</b> (yaku e dora) e <b>fu</b> (minipontos).")}</p>
  </div>
  <div class="card"><h2>{tr("Rondas y fin de partida", "Rounds and the end of the game", "Rodadas e fim da partida")}</h2>
    <p class="lead">{tr("Se juega mano tras mano, y gana quien termina con más puntos.", "You play hand after hand, and whoever ends with the most points wins.", "Joga-se mão após mão, e ganha quem termina com mais pontos.")}</p>
    <div class="rounds">
      <div class="rc"><span class="plate">東</span><b>{tr("Ronda Este", "East round", "Rodada Leste")}</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
      <div class="rc"><span class="plate">南</span><b>{tr("Ronda Sur", "South round", "Rodada Sul")}</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
    </div>
    <p>{tr("<b>Si el dealer gana</b>, sigue de dealer. <b>Si no</b>, el compass gira: cada uno toma el siguiente viento y el dealer pasa a su derecha.", "<b>If the dealer wins</b> they stay dealer. <b>If not</b>, the compass turns: everyone takes the next wind and the dealer passes to the right.", "<b>Se o dealer ganha</b>, continua dealer. <b>Se não</b>, o compass gira: cada um toma o próximo vento e o dealer passa para a direita.")}</p>
    <p>{tr("<b>Tonpuusen:</b> solo la ronda Este (corta). <b>Hanchan:</b> Este y Sur (normal).", "<b>Tonpuusen:</b> East round only (short). <b>Hanchan:</b> East and South (standard).", "<b>Tonpuusen:</b> só a rodada Leste (curta). <b>Hanchan:</b> Leste e Sul (normal).")}</p>
  </div>
  <div class="card"><h2>{tr("Dora y muro muerto", "Dora and the dead wall", "Dora e muro morto")}</h2>
    <p class="lead">{tr("Fichas con bonus y fichas apartadas.", "Bonus tiles and tiles set aside.", "Peças com bônus e peças separadas.")}</p>
    <div class="dora">{tiles("4p!")}{arrow()}{tiles("5p")}<span><i>DORA</i> {tr("+1 han", "+1 han", "+1 han")}</span></div>
    <p>{tr("Al abrir el muro se voltea un <b>indicador</b>: la ficha siguiente a esa es la <b>dora</b>, y cada una en tu mano suma 1 han. Los cincos rojos {0} también.".format(""), "When the wall is opened an <b>indicator</b> is turned face up: the next tile after it is the <b>dora</b>, and each one in your hand adds 1 han. Red fives do too.", "Ao abrir o muro vira-se um <b>indicador</b>: a peça seguinte é a <b>dora</b>, e cada uma na sua mão soma 1 han. Os cincos vermelhos também.")} {tiles("0m 0p 0s", "mini")}</p>
    <p>{tr("<b>Muro muerto:</b> 14 fichas apartadas (7 pilas), fuera de juego salvo cuando alguien hace un kan.", "<b>Dead wall:</b> 14 tiles set aside (7 stacks), out of play unless someone makes a kan.", "<b>Muro morto:</b> 14 peças separadas (7 pilhas), fora de jogo exceto quando alguém faz um kan.")}</p>
  </div>
  <div class="card"><h2>{tr("Palabras útiles", "Handy words", "Palavras úteis")}</h2>
    <p class="lead">{tr("Para entender lo que dicen en la mesa.", "To follow what people say at the table.", "Para entender o que dizem na mesa.")}</p>
    <div class="words">
      <div><b>Tenpai</b> — {tr("estás a una ficha de ganar. <b>Noten:</b> no lo estás.", "you are one tile from winning. <b>Noten:</b> you are not.", "você está a uma peça de ganhar. <b>Noten:</b> não está.")}</div>
      <div><b>Dealer</b> — {tr("el que juega primero (asiento Este).", "the one who plays first (East seat).", "quem joga primeiro (assento Leste).")}</div>
      <div><b>{tr("Viento de asiento / de ronda", "Seat wind / round wind", "Vento do assento / da rodada")}</b> — {tr("el tuyo / el de la mano en curso. El del tuyo cambia cuando pasa la mano.", "yours / the current round’s. Yours changes as hands pass.", "o seu / o da rodada em curso. O seu muda quando a mão passa.")}</div>
      <div><b>{tr("Río", "Pond", "Rio")}</b> — {tr("tus descartes, boca arriba frente a ti.", "your discards, face up in front of you.", "seus descartes, virados para cima à sua frente.")}</div>
      <div><b>Han · fu</b> — {tr("las dos medidas con que se cuenta una mano.", "the two measures used to count a hand.", "as duas medidas para contar uma mão.")}</div>
    </div>
  </div>
</div>
<p class="footline">{tr("Todas las reglas, con animaciones y ejercicios:", "All the rules, with animations and drills:", "Todas as regras, com animações e exercícios:")} <b>rincon-riichi.vercel.app</b></p>
</div>"""

CHECK = """<script>
const issues = [];
document.querySelectorAll('.sheet').forEach((sheet, s) => {
  const box = sheet.getBoundingClientRect();
  sheet.querySelectorAll('.card, .panel').forEach((el, i) => {
    if (el.scrollHeight > el.clientHeight + 1) issues.push('S' + (s + 1) + ' overflow ' + (el.querySelector('h2,h3')?.textContent.trim() || i));
    const r = el.getBoundingClientRect();
    if (r.bottom > box.bottom - 2 || r.right > box.right - 2) issues.push('S' + (s + 1) + ' outside ' + (el.querySelector('h2,h3')?.textContent.trim() || i));
  });
  const kids = [...sheet.children].map((c) => c.getBoundingClientRect());
  for (let a = 0; a < kids.length; a++) for (let b = a + 1; b < kids.length; b++) if (kids[a].bottom > kids[b].top + 1 && kids[a].top < kids[b].bottom - 1 && kids[a].left < kids[b].right && kids[a].right > kids[b].left) issues.push('S' + (s + 1) + ' blocks overlap ' + a + '/' + b);
});
document.title = issues.join(' | ') || 'ok';
</script>"""
html = f'<!doctype html><html lang="{LANG}"><head><meta charset="utf-8"><title>{tr("Cómo se juega Riichi Mahjong", "How to play Riichi Mahjong", "Como se joga Riichi Mahjong")} · Rincón Riichi</title><style>{CSS}</style></head><body>{FRONT}{BACKSIDE}{CHECK}</body></html>'
OUT_HTML.write_text(html, encoding="utf8")
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
dom = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--virtual-time-budget=8000", "--dump-dom", f"file://{OUT_HTML}"], capture_output=True, text=True).stdout
import re as _re
m = _re.search(r"<title>(.*?)</title>", dom, _re.S)
print(LANG, "layout check:", m.group(1) if m else "?")
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT_PDF}", "--virtual-time-budget=15000", f"file://{OUT_HTML}"], check=True, capture_output=True)
import fitz
tmp = OUT_PDF.with_suffix(".tmp.pdf")
doc = fitz.open(OUT_PDF); doc.set_metadata({"title": tr("Cómo se juega Riichi Mahjong", "How to play Riichi Mahjong", "Como se joga Riichi Mahjong"), "author": "Rincón Riichi"})
doc.save(tmp, garbage=4, deflate=True, clean=True); pages = doc.page_count; doc.close(); tmp.replace(OUT_PDF)
print("ok", OUT_PDF.name, OUT_PDF.stat().st_size, "pages:", pages)
