#!/usr/bin/env python3
"""Builds the one-page landscape quick guide "Cómo se juega Riichi Mahjong" (HTML -> PDF with headless Chrome)."""
import pathlib, subprocess, sys
import segno

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_HTML = pathlib.Path(__file__).with_name("onepager-es.html")
OUT_PDF = ROOT / "assets" / "docs" / "guia-rapida-riichi-mahjong-es.pdf"
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

STICK = {100: ("#fffdf6", "#23203f", 1, True), 500: ("#37a56e", "#fff", 3, False), 1000: ("#3a66d8", "#fff", 5, False), 5000: ("#f2b42c", "#d9701c", 3, False), 10000: ("#e04b45", "#fff", 5, False)}
LEN = {100: 64, 500: 84, 1000: 96, 5000: 104, 10000: 112}
def stick(value):
    top, dot, n, stripes = STICK[value]; w = LEN[value]
    dots = "".join(f'<ellipse cx="{(w*0.22 + (w*0.56*i/(n-1) if n>1 else w*0.28)):.1f}" cy="11" rx="2.6" ry="4.6" fill="{dot}"/>' for i in range(n))
    bars = f'<path d="M6 5H{w-6}M6 17H{w-6}" stroke="#23203f" stroke-width="2"/>' if stripes else ""
    return f'<svg class="stick" viewBox="0 0 {w} 22" width="{w*0.55:.0f}" height="12"><rect x="1.5" y="1.5" width="{w-3}" height="19" rx="5" fill="{top}" stroke="#23203f" stroke-width="2.6"/>{bars}{dots}</svg>'

qr = segno.make(SITE, error="q").svg_inline(scale=4, dark="#2b2540", light="#ffffff", border=2, svgclass="qrsvg", omitsize=True)


BACK = f"{A}/tile-back-rincon.svg"
def back(n=1):
    return '<span class="tiles">' + "".join(f'<img class="tl" src="{BACK}" alt="">' for _ in range(n)) + '</span>'
def arrow(cls=""):
    return f'<svg class="arrow {cls}" viewBox="0 0 30 18" width="22" height="13"><path d="M2 9h20M16 2l8 7-8 7" fill="none" stroke="#e8672c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def pill(x, y, text, color="#4a3a8c", lead=None):
    w = len(text) * 12.2 + 30
    line = f'<line x1="{lead[0]}" y1="{lead[1]}" x2="{x}" y2="{y}" stroke="#e8672c" stroke-width="4"/><circle cx="{lead[0]}" cy="{lead[1]}" r="9" fill="#e8672c" stroke="#fff" stroke-width="3"/>' if lead else ""
    return f'{line}<g transform="translate({x - w/2:.0f},{y - 20})"><rect width="{w:.0f}" height="40" rx="20" fill="{color}" stroke="#fff" stroke-width="3"/><text x="{w/2:.0f}" y="27" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="Avenir Next, Helvetica, sans-serif">{text}</text></g>'

table_pins = "".join([
    pill(545, 664, "TÚ · ESTE (DEALER)", "#a8322b", (545, 590)),
    pill(930, 400, "SUR · DERECHA", "#4a3a8c", (800, 440)),
    pill(545, 50, "OESTE · ENFRENTE", "#4a3a8c", (545, 130)),
    pill(170, 200, "NORTE · IZQUIERDA", "#4a3a8c", (300, 280)),
    pill(760, 150, "MURO", "#14683f", (690, 230)),
    pill(850, 300, "COMPASS", "#14683f", (590, 320)),
    pill(190, 640, "PALITOS", "#8a5a00", (230, 548)),
])

def named(items):
    return '<div class="named">' + "".join(f'<span>{tiles(c)}<em>{n}</em></span>' for c, n in items) + '</div>'
suit_rows = "".join(f'<div class="suit"><b>{name}</b>{tiles(" ".join(f"{n}{c}" for n in range(1, 10)), "mini")}</div>' for c, name in [("m", "Manzu · números"), ("p", "Pinzu · círculos"), ("s", "Souzu · bambúes")])

html = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cómo se juega Riichi Mahjong · Rincón Riichi</title><style>
@page {{ size: 11in 8.5in; margin: 0 }}
* {{ box-sizing: border-box }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact }}
body {{ margin: 0; font-family: Palatino, 'Palatino Linotype', Georgia, serif; color: #2b2540; font-size: 8.8pt; line-height: 1.32 }}
.sheet {{ position: relative; width: 11in; height: 8.5in; overflow: hidden; padding: .24in .36in .26in; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: .1in;
  background: radial-gradient(ellipse at 12% 8%, rgba(255,255,255,.6), transparent 55%), radial-gradient(ellipse at 92% 96%, rgba(170,130,60,.2), transparent 60%), #f1e4c6 }}
.sheet::before {{ content: ""; position: absolute; inset: 0; opacity: .2; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .15  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }}
.sheet > * {{ position: relative }}
header {{ display: flex; align-items: center; gap: .18in }}
header .mark {{ width: .55in }}
header h1 {{ margin: 0; font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; font-size: 30pt; line-height: .95; color: #4a3a8c; letter-spacing: -.4pt }}
header h1 em {{ font-style: italic; color: #a8322b }}
header p {{ margin: 3pt 0 0; font-style: italic; font-size: 9.6pt }}
.ribbon {{ margin-left: auto }} .ribbon span {{ display: inline-block; padding: 3pt 14pt; background: #f2b42c; color: #2b2540; border: 1.5pt solid #2b2540; font: 700 9pt 'Avenir Next', Helvetica, sans-serif; letter-spacing: 1pt; text-transform: uppercase; box-shadow: 0 2pt 0 #2b2540 }}
.path {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: .24in }}
.card {{ position: relative; display: flex; flex-direction: column; min-height: 0; padding: .15in .11in .1in; border: 1.2pt solid #2b2540; border-radius: 10pt; background: rgba(255,255,255,.55); box-shadow: 0 2.5pt 0 rgba(43,37,64,.35) }}
.card .n {{ position: absolute; top: -.14in; left: .12in; width: .3in; height: .3in; display: grid; place-items: center; border-radius: 50%; background: #4a3a8c; color: #fff; font: 700 13pt Cochin, Georgia, serif; border: 1.5pt solid #fff; box-shadow: 0 1.5pt 0 rgba(43,37,64,.4) }}
.card h2 {{ margin: 0 0 1pt .3in; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 15pt; color: #4a3a8c; line-height: 1 }}
.card .lead {{ margin: 6pt 0 4pt; font-weight: 700; font-size: 9.4pt; line-height: 1.22 }}
.card p {{ margin: 0 0 3pt; font-size: 8.5pt }}
.card + .card::before {{ content: ""; position: absolute; left: -.2in; top: 48%; width: .18in; height: .12in; background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 18'><path d='M2 9h20M16 2l8 7-8 7' fill='none' stroke='%23e8672c' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat }}
.hook {{ margin-top: auto; padding: 3.5pt 6pt; text-align: center; background: #f2b42c; border: 1.2pt solid #2b2540; border-radius: 7pt; font: italic 700 10pt Cochin, Georgia, serif; box-shadow: 0 1.5pt 0 #2b2540 }}
.tiles {{ display: inline-flex; align-items: flex-end }} .tl {{ height: .34in; width: auto; display: block; filter: drop-shadow(0 1pt 0 rgba(43,37,64,.35)) }}
.tl.side {{ transform: rotate(90deg) translate(0, 2pt); margin: 0 .06in }} .tl.hi {{ outline: 1.8pt solid #e8672c; border-radius: 3pt }}
.mini .tl {{ height: .27in }} .sm .tl {{ height: .26in }}
.row {{ display: flex; justify-content: center; align-items: flex-end; gap: 4pt; flex-wrap: nowrap }}
.lbl {{ display: block; font-size: 6.6pt; text-transform: uppercase; letter-spacing: .4pt; color: #14683f; margin-top: 1pt; text-align: center }} .lbl.pl {{ color: #8a5a00 }}
.col {{ display: inline-flex; flex-direction: column; align-items: center }}
.hand5 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 3pt; margin: 3pt 0 4pt }} .g {{ padding: 3pt 2pt 2pt; border: .8pt dashed #8b7a5a; background: rgba(255,255,255,.5); text-align: center; border-radius: 4pt }} .g .tl {{ height: .3in }} .g.pair {{ background: #fff3cf }}
.scenes {{ display: grid; gap: 4pt; margin: 2pt 0 4pt }} .scene {{ display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 5pt; padding: 3pt 5pt; border: .9pt solid #4a3a8c; border-radius: 8pt; background: rgba(255,255,255,.65) }}
.scene b {{ display: grid; place-items: center; width: 14pt; height: 14pt; border-radius: 50%; background: #f2b42c; border: 1pt solid #2b2540; font-size: 8pt }}
.scene .pic {{ display: flex; align-items: center; justify-content: center; gap: 3pt; min-width: .7in }} .scene .pic .tl {{ height: .29in }} .scene small {{ display: block; font-size: 8pt; line-height: 1.2 }}
.calls {{ display: grid; gap: 4pt; margin: 2pt 0 4pt }} .call {{ padding: 3pt 4pt; border: .9pt dashed #8b7a5a; border-radius: 6pt; background: rgba(255,255,255,.55); text-align: center }} .call .row {{ gap: 2pt }} .call .tl {{ height: .29in }} .call > span {{ display: block; font: 700 7.4pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .4pt; color: #1f3f9a; margin-top: 1pt }} .call > small {{ display: block; font-size: 7pt; font-style: italic; color: #6b5b3a }}
.duo {{ display: grid; grid-template-columns: 1fr 1fr; gap: 4pt; margin: 2pt 0 4pt }} .duo div {{ padding: 3pt 3pt 4pt; border: .9pt solid #8a5a00; border-radius: 7pt; background: #fff1c4; text-align: center; font-size: 7.6pt; line-height: 1.2 }} .duo b {{ display: block; font-family: Cochin, Georgia, serif; font-size: 11pt; color: #a8322b; font-weight: 400 }} .duo .row {{ margin-top: 2pt }} .duo .tl {{ height: .27in }}
.yk {{ display: grid; grid-template-columns: .5in 1fr; gap: 1pt 4pt; align-items: center; margin: 2pt 0; font-size: 7.8pt; line-height: 1.2 }} .yk b {{ font-family: Cochin, Georgia, serif; font-size: 10pt; color: #4a3a8c; font-weight: 400 }} .yk .tl {{ height: .26in }} .yk .stick {{ display: inline-block; vertical-align: middle }}
.sticks {{ display: grid; gap: 3pt; margin: 3pt 0 4pt }} .srow {{ display: grid; grid-template-columns: .78in 1fr; align-items: center; gap: 4pt; font-size: 9pt }} .sticks {{ gap: 5pt !important }} .srow b {{ text-align: right }} .srow span {{ font-style: italic; color: #6b5b3a; font-size: 7.4pt }} .stick {{ display: block }}
.bottom {{ display: grid; grid-template-columns: 3.45in 1fr 1.5in; gap: .22in; align-items: stretch; min-height: 0 }}
.panel {{ padding: .08in .12in .08in; border: 1.1pt solid #2b2540; border-radius: 9pt; background: rgba(255,255,255,.5); min-height: 0 }}
.panel h3 {{ margin: 0 0 2pt; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 12.5pt; color: #4a3a8c }}
.fig {{ position: relative; width: 94%; margin: 0 auto }} .fig img {{ width: 100%; display: block }} .fig svg {{ position: absolute; inset: 0; width: 100%; height: 100% }}
.suit {{ display: flex; align-items: center; gap: 6pt; margin: 2pt 0 }} .suit b {{ width: .95in; font: 700 7.4pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .3pt; color: #4a3a8c }}
.honors {{ display: grid; grid-template-columns: auto 1fr; gap: 3pt 8pt; align-items: end; margin-top: 3pt; padding: 3pt 5pt; border: .9pt dashed #8b7a5a; border-radius: 6pt }} .honors > b {{ font: 700 7.4pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .3pt; color: #a8322b; width: .62in; align-self: center }}
.named {{ display: flex; gap: 6pt }} .named span {{ display: inline-flex; flex-direction: column; align-items: center }} .named .tl {{ height: .3in }} .named em {{ font: 600 6.6pt 'Avenir Next', Helvetica, sans-serif; font-style: normal; text-transform: uppercase; letter-spacing: .2pt; margin-top: 1pt; text-align: center; line-height: 1.1 }}
.note {{ margin: 2pt 0 0; font-size: 7.2pt; line-height: 1.2; font-style: italic; text-align: center }}
.qr {{ display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 3pt }} .qr svg.qrsvg {{ width: 1.2in; height: 1.2in; display: block; shape-rendering: crispEdges; border: 1.4pt solid #2b2540; border-radius: 6pt }} .qr b {{ font: 700 8.6pt 'Avenir Next', Helvetica, sans-serif; color: #4a3a8c }} .qr small {{ font-size: 7.6pt; font-style: italic }}
</style></head><body><div class="sheet">
<header>
  <img class="mark" src="{A}/rincon-mark.svg" alt="">
  <div><h1>Cómo se juega <em>Riichi Mahjong</em></h1><p>Un juego de 4 personas, parecido al Carioca o al rummy: robas una ficha, botas otra y buscas completar tu mano. Gana quien suma más puntos.</p></div>
  <div class="ribbon"><span>Guía rápida · 1 página</span></div>
</header>

<div class="path">
  <div class="card"><span class="n">1</span><h2>La meta</h2>
    <p class="lead">Armar tu mano: 4 grupos y 1 pareja.</p>
    <div class="hand5">
      <div class="g">{tiles("1m 2m 3m")}<span class="lbl">Secuencia</span></div>
      <div class="g">{tiles("4p 5p 6p")}<span class="lbl">Secuencia</span></div>
      <div class="g">{tiles("3s 4s 5s")}<span class="lbl">Secuencia</span></div>
      <div class="g">{tiles("6z 6z 6z")}<span class="lbl">Trío</span></div>
      <div class="g pair">{tiles("1z 1z")}<span class="lbl pl">Pareja</span></div>
    </div>
    <p><b>Secuencia:</b> 3 números seguidos del mismo palo. <b>Trío:</b> 3 fichas iguales. <b>Pareja:</b> 2 iguales.</p>
    <div class="hook">4 × 3 + 2 = 14 fichas</div>
  </div>
  <div class="card"><span class="n">2</span><h2>Tu turno</h2>
    <p class="lead">Roba una, bota una.</p>
    <div class="scenes">
      <div class="scene"><div class="pic">{back(2)}{arrow()}{tiles("8s")}</div><div><b>1</b><small>Robas una ficha del muro.</small></div></div>
      <div class="scene"><div class="pic">{tiles("4p 5p 6p 9p")}</div><div><b>2</b><small>Decides cuál te sobra.</small></div></div>
      <div class="scene"><div class="pic">{tiles("9p!")}{arrow()}{tiles("2z 7p")}</div><div><b>3</b><small>La botas boca arriba en tu río.</small></div></div>
    </div>
    <p>Sigue el jugador de tu derecha, <b>en sentido antihorario</b>. Siempre tienes 13 fichas al terminar tu turno.</p>
    <div class="hook">Robo · decido · boto</div>
  </div>
  <div class="card"><span class="n">3</span><h2>Llamadas</h2>
    <p class="lead">Si alguien bota la ficha que te falta, tómala.</p>
    <div class="calls">
      <div class="call"><div class="row">{tiles("4p 6p")}{arrow()}{tiles("5p~")}</div><span>Chii · secuencia</span><small>solo de tu izquierda</small></div>
      <div class="call"><div class="row">{tiles("6z 6z")}{arrow()}{tiles("6z~")}</div><span>Pon · trío</span><small>de cualquier jugador</small></div>
      <div class="call"><div class="row">{tiles("3s 3s 3s")}{arrow()}{tiles("3s~")}</div><span>Kan · cuarteto</span><small>cuatro iguales</small></div>
    </div>
    <p>Lo dices en voz alta y pones el grupo boca arriba, con la ficha tomada de lado.</p>
    <div class="hook">¡Chii! ¡Pon! ¡Kan!</div>
  </div>
  <div class="card"><span class="n">4</span><h2>Ganar</h2>
    <p class="lead">Mano completa + al menos 1 yaku.</p>
    <div class="duo">
      <div><b>Tsumo</b>la robas tú{"<div class=row>"}{back(1)}{arrow()}{tiles("6z!")}{"</div>"}</div>
      <div><b>Ron</b>la bota otro{"<div class=row>"}{tiles("6z")}{arrow()}{tiles("6z!")}{"</div>"}</div>
    </div>
    <div class="yk"><b>Riichi</b><span>A una ficha de ganar, sin llamadas: bota una de lado y pon un palito {stick(1000)}</span></div>
    <div class="yk"><b>Tanyao</b><span>Solo del 2 al 8 {tiles("2m 3m 4m")}</span></div>
    <div class="yk"><b>Yakuhai</b><span>Trío de dragón o de tu viento {tiles("6z 6z 6z")}</span></div>
    <p>El <b>yaku</b> es lo que tu mano «necesita» para poder ganar.</p>
    <div class="hook">¡Tsumo! · ¡Ron!</div>
  </div>
  <div class="card"><span class="n">5</span><h2>Puntos</h2>
    <p class="lead">Los puntos son palitos de colores.</p>
    <div class="sticks">
      <div class="srow">{stick(10000)}<b>10 000</b></div><div class="srow">{stick(5000)}<b>5 000</b></div>
      <div class="srow">{stick(1000)}<b>1 000</b></div><div class="srow">{stick(500)}<b>500</b></div><div class="srow">{stick(100)}<b>100</b></div>
    </div>
    <p>Quien paga deja los palitos en la mesa y el ganador los toma. Todos empiezan con <b>25 000</b>.</p>
    <div class="hook">Gana quien suma más</div>
  </div>
</div>

<div class="bottom">
  <div class="panel"><h3>La mesa y sus jugadores</h3><div class="fig"><img src="{A}/illustrations/mesa-light.svg" alt=""><svg viewBox="0 0 1100 720">{table_pins}</svg></div>
    <p class="note">Cuatro asientos, cada uno con un viento; el turno va en sentido antihorario: Este → Sur → Oeste → Norte.</p></div>
  <div class="panel"><h3>Las 34 clases de ficha <small style="font:italic 8pt Palatino,serif;color:#6b5b3a">(4 copias de cada una)</small></h3>
    {suit_rows}
    <div class="honors"><b>Honores<br>Vientos</b>{named([("1z","Este"),("2z","Sur"),("3z","Oeste"),("4z","Norte")])}<b>Honores<br>Dragones</b>{named([("7z","Haku · blanco"),("5z","Hatsu · verde"),("6z","Chun · rojo")])}</div>
  </div>
  <div class="panel qr"><h3>Aprende y practica</h3>{qr}<b>rincon-riichi.vercel.app</b><small>Escanea: tutorial, fichas y ejercicios</small></div>
</div>
</div></body></html>"""
OUT_HTML.write_text(html, encoding="utf8")
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT_PDF}", "--virtual-time-budget=15000", f"file://{OUT_HTML}"], check=True, capture_output=True)
import fitz
tmp = OUT_PDF.with_suffix(".tmp.pdf")
doc = fitz.open(OUT_PDF); doc.set_metadata({"title": "Riichi Mahjong en 5 minutos", "author": "Rincón Riichi"})
doc.save(tmp, garbage=4, deflate=True, clean=True); pages = doc.page_count; doc.close(); tmp.replace(OUT_PDF)
print("ok", OUT_PDF, OUT_PDF.stat().st_size, "pages:", pages)
