#!/usr/bin/env python3
"""Builds the one-page landscape cheat sheet "Riichi Mahjong en 5 minutos" (HTML -> PDF with headless Chrome)."""
import pathlib, subprocess, sys
import segno

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_HTML = pathlib.Path(__file__).with_name("onepager-es.html")
OUT_PDF = ROOT / "assets" / "docs" / "riichi-mahjong-en-5-minutos-es.pdf"
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

qr = segno.make(SITE, error="m").svg_inline(scale=3, dark="#2b2540", light="#fffaf0", border=1)

arrow = '<span class="arr">➜</span>'
html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Riichi Mahjong en 5 minutos · Rincón Riichi</title><style>
@page {{ size: 11in 8.5in; margin: 0 }}
* {{ box-sizing: border-box }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact }}
body {{ margin: 0; font-family: Palatino, 'Palatino Linotype', Georgia, serif; color: #2b2540; font-size: 8.9pt; line-height: 1.34 }}
.sheet {{ position: relative; width: 11in; height: 8.5in; overflow: hidden; padding: .24in .38in .3in; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: .1in;
  background: radial-gradient(ellipse at 12% 8%, rgba(255,255,255,.6), transparent 55%), radial-gradient(ellipse at 92% 96%, rgba(170,130,60,.2), transparent 60%), #f1e4c6 }}
.sheet::before {{ content: ""; position: absolute; inset: 0; opacity: .2; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .15  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }}
.sheet > * {{ position: relative }}
header {{ display: flex; align-items: center; gap: .2in }}
header .mark {{ width: .6in }}
header h1 {{ margin: 0; font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; font-size: 30pt; line-height: .95; color: #4a3a8c; letter-spacing: -.4pt }}
header h1 em {{ font-style: italic; color: #a8322b }}
header p {{ margin: 3pt 0 0; font-style: italic; font-size: 10pt }}
.ribbon {{ margin-left: auto; text-align: right }}
.ribbon span {{ display: inline-block; padding: 3pt 14pt; background: #f2b42c; color: #2b2540; border: 1.5pt solid #2b2540; font: 700 9pt 'Avenir Next', Helvetica, sans-serif; letter-spacing: 1pt; text-transform: uppercase; box-shadow: 0 2pt 0 #2b2540 }}
.path {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: .26in; align-items: stretch }}
.card {{ position: relative; display: flex; flex-direction: column; min-height: 0; padding: .15in .12in .1in; border: 1.2pt solid #2b2540; border-radius: 10pt; background: rgba(255,255,255,.55); box-shadow: 0 2.5pt 0 rgba(43,37,64,.35) }}
.card .n {{ position: absolute; top: -.14in; left: .12in; width: .3in; height: .3in; display: grid; place-items: center; border-radius: 50%; background: #4a3a8c; color: #fff; font: 700 13pt Cochin, Georgia, serif; border: 1.5pt solid #fff; box-shadow: 0 1.5pt 0 rgba(43,37,64,.4) }}
.card h2 {{ margin: 0 0 2pt .3in; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 16pt; color: #4a3a8c; line-height: 1 }}
.card .lead {{ margin: 7pt 0 6pt; font-weight: 700; font-size: 9.8pt; line-height: 1.25 }} .hook {{ margin-top: auto; padding: 4pt 6pt; text-align: center; background: #f2b42c; border: 1.2pt solid #2b2540; border-radius: 7pt; font: italic 700 10.5pt Cochin, Georgia, serif; color: #2b2540; box-shadow: 0 1.5pt 0 #2b2540 }} .small .tl {{ height: .31in }} .small .row {{ flex-wrap: nowrap; gap: 3pt }}
.card p {{ margin: 0 0 4pt }}
.card + .card::before {{ content: "➜"; position: absolute; left: -.235in; top: 50%; color: #e8672c; font-size: 17pt; transform: translateY(-50%) }}
.box {{ margin: 3pt 0 5pt; padding: 5pt 4pt; border: .9pt dashed #8b7a5a; background: rgba(255,255,255,.5); text-align: center }}
.box .cap {{ display: block; font: italic 7.4pt Palatino, serif; color: #6b5b3a; margin-top: 2pt }}
.tiles {{ display: inline-flex; align-items: flex-end }} .tl {{ height: .37in; width: auto; display: block; filter: drop-shadow(0 1pt 0 rgba(43,37,64,.35)) }}
.tl.side {{ transform: rotate(90deg) translate(0, 2pt); margin: 0 .07in }} .tl.hi {{ outline: 1.8pt solid #e8672c; border-radius: 3pt }}
.row {{ display: flex; justify-content: center; align-items: flex-end; gap: 5pt; flex-wrap: wrap }}
.lbl {{ display: block; font-size: 6.8pt; text-transform: uppercase; letter-spacing: .4pt; color: #14683f; margin-top: 1pt }} .lbl.pl {{ color: #8a5a00 }}
.col {{ display: inline-flex; flex-direction: column; align-items: center }}
.steps3 {{ display: grid; gap: 4pt; margin: 2pt 0 4pt }} .st {{ display: flex; align-items: center; gap: 5pt; padding: 3pt 5pt; border: .9pt solid #4a3a8c; border-radius: 8pt; background: rgba(255,255,255,.65); font-size: 8.6pt }}
.st b {{ flex: none; width: 15pt; height: 15pt; display: grid; place-items: center; border-radius: 50%; background: #f2b42c; border: 1pt solid #2b2540; font-size: 8.5pt }} .st .tl {{ height: .28in; margin-left: auto }}
.chips {{ display: flex; flex-wrap: wrap; gap: 3pt; margin: 2pt 0 4pt }} .chip {{ padding: 1.5pt 7pt; border-radius: 99pt; background: #dbe6ff; border: 1pt solid #1f3f9a; color: #1f3f9a; font: 700 7.6pt 'Avenir Next', Helvetica, sans-serif; text-transform: uppercase; letter-spacing: .4pt }}
.chip.warm {{ background: #ffe9a8; border-color: #8a5a00; color: #6e4700 }}
.yk {{ display: grid; grid-template-columns: auto 1fr; gap: 1pt 6pt; align-items: center; margin: 3pt 0; font-size: 8.2pt }} .yk b {{ font-family: Cochin, Georgia, serif; font-size: 10.5pt; color: #4a3a8c; font-weight: 400 }}
.sticks {{ display: grid; gap: 3pt; margin: 3pt 0 5pt }} .srow {{ display: grid; grid-template-columns: .75in 1fr; align-items: center; gap: 5pt; font-size: 8.4pt }} .srow b {{ text-align: right }} .stick {{ display: block }}
.bottom {{ display: grid; grid-template-columns: 2.35in 1fr 1.65in; gap: .24in; align-items: stretch }}
.panel {{ padding: .09in .12in; border: 1.1pt solid #2b2540; border-radius: 9pt; background: rgba(255,255,255,.5) }}
.panel h3 {{ margin: 0 0 3pt; font-family: Cochin, Georgia, serif; font-weight: 400; font-size: 13pt; color: #4a3a8c }}
.table img {{ width: 72%; display: block; margin: 0 auto 2pt }}
.table p {{ margin: 0; font-size: 7.4pt; text-align: center; font-style: italic }}
.time {{ display: grid; grid-template-columns: repeat(6, 1fr); gap: 4pt; margin-top: 3pt }} .time div {{ text-align: center; padding: 3pt 2pt; border-radius: 7pt; background: #fff6c2; border: 1pt solid #8a5a00; font-size: 7.8pt; line-height: 1.2 }} .time b {{ display: block; font-family: Cochin, Georgia, serif; font-size: 13pt; color: #a8322b }}
.tips {{ margin: 5pt 0 0; padding: 0; list-style: none; font-size: 8pt }} .tips li {{ position: relative; padding-left: 10pt; margin-bottom: 2pt }} .tips li::before {{ content: "◆"; position: absolute; left: 0; color: #d9701c; font-size: 6pt; top: 2pt }}
.qr {{ text-align: center }} .qr svg {{ width: .95in; height: .95in; display: block; margin: 2pt auto; border: 1.2pt solid #2b2540; border-radius: 6pt }} .qr b {{ display: block; font: 700 8.5pt 'Avenir Next', Helvetica, sans-serif; color: #4a3a8c }} .qr small {{ display: block; font-size: 7.4pt; font-style: italic }}
.arr {{ color: #e8672c }}
</style></head><body><div class="sheet">
<header>
  <img class="mark" src="{A}/rincon-mark.svg" alt="">
  <div><h1>Riichi Mahjong <em>en 5 minutos</em></h1><p>Un juego de 4 personas, parecido al Carioca o al rummy: robas una ficha, botas otra y buscas completar tu mano.</p></div>
  <div class="ribbon"><span>Guía rápida · 1 página</span></div>
</header>

<div class="path">
  <div class="card"><span class="n">1</span><h2>La meta</h2>
    <p class="lead">Armar tu mano: 4 grupos + 1 pareja.</p>
    <div class="box"><div class="row">
      <span class="col">{tiles("4p 5p 6p")}<span class="lbl">Secuencia</span></span>
      <span class="col">{tiles("6z 6z 6z")}<span class="lbl">Trío</span></span>
      <span class="col">{tiles("1z 1z")}<span class="lbl pl">Pareja</span></span></div>
      <span class="cap">Secuencia: 3 números seguidos del mismo palo. Trío: 3 iguales. Pareja: 2 iguales.</span></div>
    <p>Empiezas con <b>13 fichas</b>; con la que robas son <b>14</b>: 4 × 3 + 2.</p>
    <div class="hook">4 grupos + 1 pareja</div>
  </div>
  <div class="card"><span class="n">2</span><h2>Tu turno</h2>
    <p class="lead">Roba una, bota una. Así de simple.</p>
    <div class="steps3">
      <div class="st"><b>1</b>Robas una ficha del muro.</div>
      <div class="st"><b>2</b>Decides cuál te sobra.</div>
      <div class="st"><b>3</b>La botas boca arriba frente a ti. {tiles("9p!")}</div>
    </div>
    <p>El turno sigue a tu derecha, <b>en sentido antihorario</b>. Mira lo que botan los demás: es información.</p>
    <div class="hook">Robo · decido · boto</div>
  </div>
  <div class="card"><span class="n">3</span><h2>Llamadas</h2>
    <p class="lead">Si alguien bota la ficha que te falta, ¡tómala!</p>
    <div class="box small"><div class="row">{tiles("6z 6z")}<span class="arr">➜</span>{tiles("6z~")}<b>=</b>{tiles("6z 6z~ 6z")}</div><span class="cap">Ejemplo: Pon (tienes 2 iguales y alguien bota la 3ª)</span></div>
    <div class="chips"><span class="chip">Chii · secuencia</span><span class="chip">Pon · trío</span><span class="chip">Kan · cuarteto</span></div>
    <p>Chii solo con la ficha del jugador de tu <b>izquierda</b>; Pon y Kan, de cualquiera. Lo dices en voz alta y pones el grupo boca arriba: tu mano queda «abierta».</p>
    <div class="hook">¡Chii! ¡Pon! ¡Kan!</div>
  </div>
  <div class="card"><span class="n">4</span><h2>Ganar</h2>
    <p class="lead">Mano completa + al menos 1 yaku.</p>
    <div class="chips"><span class="chip warm">Tsumo · la robas tú</span><span class="chip warm">Ron · la bota otro</span></div>
    <div class="yk"><b>Riichi</b><span>A una ficha de ganar, sin llamadas: bota una acostada y pon un palito de 1 000.</span></div>
    <div class="yk"><b>Tanyao</b><span>Solo del 2 al 8 {tiles("2m 3m 4m")}</span></div>
    <div class="yk"><b>Yakuhai</b><span>Trío de dragones o de tu viento. {tiles("6z 6z 6z")}</span></div>
    <p>Un yaku es lo que tu mano «necesita» para poder ganar.</p>
    <div class="hook">¡Tsumo! · ¡Ron!</div>
  </div>
  <div class="card"><span class="n">5</span><h2>Puntos</h2>
    <p class="lead">Los puntos son palitos de colores.</p>
    <div class="sticks">
      <div class="srow">{stick(10000)}<b>10 000</b></div><div class="srow">{stick(5000)}<b>5 000</b></div>
      <div class="srow">{stick(1000)}<b>1 000</b></div><div class="srow">{stick(500)}<b>500</b></div><div class="srow">{stick(100)}<b>100</b></div>
    </div>
    <p>Al ganar, quien paga deja palitos en la mesa y el ganador los toma. Todos parten con <b>25 000</b>.</p>
    <div class="hook">🏆 Gana quien tiene más</div>
  </div>
</div>

<div class="bottom">
  <div class="panel table"><h3>La mesa en 10 segundos</h3><img src="{A}/illustrations/mesa-light.svg" alt=""><p>4 asientos con viento: <b>Este</b> (dealer, juega primero), <b>Sur</b>, <b>Oeste</b>, <b>Norte</b>. Cada uno saca 13 fichas del muro.</p></div>
  <div class="panel"><h3>Guion para enseñarlo en 5 minutos</h3>
    <div class="time"><div><b>0:00</b>La meta</div><div><b>1:00</b>Tu turno</div><div><b>2:00</b>Llamadas</div><div><b>3:00</b>Ganar</div><div><b>4:00</b>Puntos</div><div><b>4:30</b>¡A jugar una mano!</div></div>
    <ul class="tips"><li>Reparte 13 fichas a cada persona y enseña <b>solo 1 y 2</b> primero: con eso ya se puede jugar.</li><li>Deja las llamadas y los yaku para cuando alguien pregunte «¿y si me falta una?».</li><li>No hace falta contar puntos la primera vez: cuenten <b>quién completó su mano primero</b>.</li><li>Pide que digan «Tsumo» o «Ron» en voz alta al ganar.</li></ul></div>
  <div class="panel qr"><h3>Aprende y practica</h3>{qr}<b>rincon-riichi.vercel.app</b><small>Tutorial, fichas, yakus y ejercicios</small></div>
</div>
</div></body></html>'''
OUT_HTML.write_text(html, encoding="utf8")
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT_PDF}", "--virtual-time-budget=15000", f"file://{OUT_HTML}"], check=True, capture_output=True)
import fitz
tmp = OUT_PDF.with_suffix(".tmp.pdf")
doc = fitz.open(OUT_PDF); doc.set_metadata({"title": "Riichi Mahjong en 5 minutos", "author": "Rincón Riichi"})
doc.save(tmp, garbage=4, deflate=True, clean=True); pages = doc.page_count; doc.close(); tmp.replace(OUT_PDF)
print("ok", OUT_PDF, OUT_PDF.stat().st_size, "pages:", pages)
