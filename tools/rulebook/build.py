#!/usr/bin/env python3
"""Builds the downloadable "Aprende a jugar Riichi Mahjong" guide (HTML -> PDF with headless Chrome)."""
import re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
OUT_HTML = pathlib.Path(__file__).with_name("rulebook-es.html")
OUT_PDF = ASSETS / "docs" / "aprende-riichi-mahjong-es.pdf"
A = "../../assets"
TILES = f"{A}/tiles-fluffystuff-composite"

def tiles(spec, cls=""):
    """'1m 2m 3m' -> tile images. A trailing ~ turns the tile sideways (a called tile); a trailing ! circles it."""
    out = []
    for token in spec.split():
        rot = token.endswith("~"); hi = token.endswith("!")
        code = token.rstrip("~!")
        c = "tl" + (" side" if rot else "") + (" hi" if hi else "")
        out.append(f'<img class="{c}" src="{TILES}/{code}.svg" alt="{code}">')
    return f'<span class="tiles {cls}">' + "".join(out) + "</span>"

STICK = {
    100: ("#fffdf6", "#23203f", 1, True),
    500: ("#37a56e", "#ffffff", 3, False),
    1000: ("#3a66d8", "#ffffff", 5, False),
    5000: ("#f2b42c", "#d9701c", 3, False),
    10000: ("#e04b45", "#ffffff", 5, False),
}
LEN = {100: 64, 500: 84, 1000: 96, 5000: 104, 10000: 112}
def stick(value):
    top, dot, n, stripes = STICK[value]
    w = LEN[value]
    dots = "".join(f'<ellipse cx="{(w*0.22 + (w*0.56*i/(n-1) if n>1 else w*0.28)):.1f}" cy="11" rx="2.6" ry="4.6" fill="{dot}"/>' for i in range(n))
    bars = f'<path d="M6 5H{w-6}M6 17H{w-6}" stroke="#23203f" stroke-width="2"/>' if stripes else ""
    return (f'<svg class="stick" viewBox="0 0 {w} 22" width="{w*0.62:.0f}" height="14"><rect x="1.5" y="1.5" width="{w-3}" height="19" rx="5" fill="{top}" stroke="#23203f" stroke-width="2.6"/>{bars}{dots}</svg>')

def sticks(counts):
    return "".join(stick(v) for v, n in counts for _ in range(n))

# ---------- glossary from the site's own data ----------
gl = (ROOT / "src/features/learn/domain/glossary.ts").read_text(encoding="utf8")
entries = []
for line in gl.splitlines():
    m = re.search(r"id: '([^']*)', term: L\('([^']*)',[^)]*\)(?:, also: \[([^\]]*)\])?, meaning: L\('((?:[^'\\]|\\.)*)'", line)
    if m:
        also = re.findall(r"'([^']*)'", m.group(3) or "")
        entries.append((m.group(1), m.group(2), m.group(4).replace("\\'", "'"), also))
# the Spanish words that open a definition: every alias of every entry, longest first
ALIASES = sorted(((alias, eid) for eid, term, meaning, also in entries for alias in [term] + also), key=lambda x: -len(x[0]))
SKIP_CLASSES = ("ex-title", "lbl", "leaf", "ord", "sn", "cap", "ribbon", "brand", "plate", "hands", "gcol")
LETTER = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9"

def autolink(html):
    """Wraps the first mention of each dictionary word on a page in a link to its entry."""
    parts = re.split(r"(<[^>]+>)", html)
    done, out, stack = set(), [], []
    for part in parts:
        if part.startswith("<"):
            name = re.match(r"</?([a-zA-Z0-9]+)", part)
            tag = name.group(1).lower() if name else ""
            closing = part.startswith("</")
            selfclose = part.endswith("/>") or tag in ("img", "br", "line", "circle", "path", "rect", "input")
            if closing:
                if stack and stack[-1][0] == tag:
                    stack.pop()
            elif not selfclose:
                skip = tag in ("h2", "h3", "dt", "a", "svg", "style", "script", "figcaption") or any(c in part for c in SKIP_CLASSES)
                stack.append((tag, skip))
            out.append(part)
            continue
        if any(skip for _, skip in stack) or not part.strip():
            out.append(part)
            continue
        text = part
        for alias, eid in ALIASES:
            if eid in done:
                continue
            m = re.search(rf"(?<![{LETTER}])({re.escape(alias)})(?![{LETTER}])", text, re.I)
            if m:
                text = text[:m.start()] + f'<a class="gl-link" href="#g-{eid}">{m.group(1)}</a>' + text[m.end():]
                done.add(eid)
        out.append(text)
    return "".join(out)

pages = []
NOLINK = ("cover", "gl", "backpage")
def page(body, num=None, cls=""):
    badge = f'<span class="leaf">{num}</span>' if num else ""
    if not any(c in cls for c in NOLINK):
        body = autolink(body)
    pages.append(f'<section class="page {cls}" id="p{num or len(pages) + 1}">{body}{badge}</section>')

def groups(items):
    """items: (tiles, label, kind) -> a hand with each group labelled right under its own tiles."""
    cols = "".join(f'<div class="gcol {k}">{tiles(t, "pairhl" if k == "pl" else "")}<span>{l}</span></div>' for t, l, k in items)
    return f'<div class="hand groups">{cols}</div>'

def callout(text):
    return f'<p class="callout">{text}</p>'
def example(title, inner):
    return f'<div class="example"><span class="ex-title">{title}</span>{inner}</div>'
def arrow(cls=""):
    return f'<span class="arr {cls}">➜</span>'

# ---------- cover ----------
toc = [("Introducción", 2), ("La mesa", 3), ("Las fichas", 4), ("Preparación", 5), ("Tu turno", 6), ("Grupos y mano completa", 7),
       ("Llamadas: chii, pon y kan", 8), ("Ganar: ron, tsumo y yaku", 9), ("Puntos y palitos", 10), ("Rondas y fin de partida", 11), ("Diccionario", 12)]
toc_html = "".join(f'<li><a href="#p{n}"><span>{t}</span><i></i><b>{n}</b></a></li>' for t, n in toc)
page(f'''
<div class="cover-art"><img src="{A}/illustrations/mesa-light.svg" alt=""></div>
<div class="cover-title"><img class="mark" src="{A}/rincon-mark.svg" alt=""><p class="brand">RINCÓN RIICHI</p>
<h1><em>Aprende</em><span>a jugar</span></h1><p class="ribbon">Riichi Mahjong · guía paso a paso</p></div>
<div class="toc"><h3>Índice</h3><ul>{toc_html}</ul></div>''', cls="cover")

# ---------- 2 Introduction ----------
page(f'''
<h2>Introducción</h2>
<p>Riichi mahjong es un juego de <b>cuatro jugadores</b> que se juega con <b>fichas</b>, parecido al Carioca o al rummy: los jugadores se turnan para <b>sacar una ficha y botar otra</b>, buscando completar su mano. Cada mano da <b>puntos</b> y, al final de varias rondas, <b>gana quien tiene más puntos</b>.</p>
{callout("Si prefieres aprender jugando, revisa «La mesa», «Preparación» y «Tu turno» y empieza: el resto lo puedes consultar sobre la marcha. Las palabras con <u class='dotted'>subrayado punteado</u> se pueden pulsar: llevan a su definición en el Diccionario (páginas 12 y 13).")}
<h3>Qué necesitas</h3>
<ul class="plain"><li><b>136 fichas</b>: 34 clases distintas, 4 copias de cada una.</li><li>Un <b>compass</b> (la pieza del centro) y una <b>placa</b> de viento de ronda.</li><li>Dos <b>dados</b> y <b>palitos</b> de puntos de colores.</li><li>Cuatro jugadores sentados alrededor de una mesa.</li></ul>
<h3>El objetivo</h3>
<p>Con tus 13 fichas, y la que robas, quieres armar <b>4 grupos y 1 pareja</b>: 14 fichas en total. Al lograrlo, <b>ganas la mano</b>.</p>
{example("Una mano completa", f'{groups([("1m 2m 3m","Grupo","gr"),("4p 5p 6p","Grupo","gr"),("3s 4s 5s","Grupo","gr"),("6z 6z 6z","Grupo","gr"),("1z 1z","Pareja","pl")])}')}
<h3>Cómo avanza una partida</h3>
<div class="flow"><span>Cada jugador roba y bota</span>{arrow()}<span>Alguien completa su mano</span>{arrow()}<span>Se pagan puntos con palitos</span>{arrow()}<span>Sigue la siguiente mano</span></div>
''', 2)

# ---------- 3 The table ----------
def pin(n, x, y, tx, ty, label):
    return (f'<line x1="{x}" y1="{y}" x2="{tx}" y2="{ty}" class="lead"/><circle cx="{x}" cy="{y}" r="7" class="dot"/>'
            f'<g transform="translate({tx},{ty})"><circle r="15" class="pinbg"/><text y="6" text-anchor="middle" class="pinnum">{n}</text></g>')
page(f'''
<h2>La mesa</h2>
<p>Casi todo ocurre en una mesa compartida. Esto es lo que verás:</p>
<div class="figure"><img src="{A}/illustrations/mesa-light.svg" alt="">
<svg viewBox="0 0 1100 720">
{pin(1, 300, 205, 120, 120, "")}
{pin(2, 545, 320, 545, 40, "")}
{pin(3, 335, 430, 90, 430, "")}
{pin(4, 470, 355, 330, 640, "")}
{pin(5, 230, 545, 90, 640, "")}
{pin(6, 540, 580, 700, 650, "")}
{pin(7, 545, 345, 760, 120, "")}
</svg></div>
<ol class="legend">
<li><b>Los muros.</b> Las fichas boca abajo, en cuatro lados de 17 pilas de dos fichas. De aquí se roba.</li>
<li><b>El compass.</b> La pieza del centro: muestra el viento de cada asiento y los numeritos que se usan con los dados.</li>
<li><b>Tu mano.</b> Tus 13 fichas, de pie frente a ti. Solo tú ves sus caras.</li>
<li><b>Los ríos.</b> Frente a cada jugador quedan sus descartes, boca arriba.</li>
<li><b>El cajón.</b> Cada jugador guarda ahí sus palitos de puntos.</li>
<li><b>La placa.</b> Marca el viento de la ronda, a la derecha del dealer.</li>
<li><b>Los dados.</b> Se tiran al empezar para decidir por dónde se abre el muro.</li>
</ol>
{callout("<b>Asientos y vientos.</b> Cada asiento tiene un viento: Este (tú, el dealer), Sur (a tu derecha), Oeste (enfrente) y Norte (a tu izquierda). Los turnos van en este orden, en sentido antihorario.")}
''', 3)

# ---------- 4 Tiles ----------
suit = lambda c: tiles(" ".join(f"{n}{c}" for n in range(1, 10)))
page(f'''
<h2>Las fichas</h2>
<p>Hay <b>34 clases</b> de ficha y <b>4 copias</b> de cada una: <b>136</b> en total. Tienen una cara con su dibujo y un dorso de color.</p>
<h3>Tres palos numerados</h3>
<div class="suitrow"><span class="sn">Manzu <small>números</small></span>{suit("m")}</div>
<div class="suitrow"><span class="sn">Pinzu <small>círculos</small></span>{suit("p")}</div>
<div class="suitrow"><span class="sn">Souzu <small>bambúes</small></span>{suit("s")}</div>
<h3>Honores: sin número</h3>
<div class="suitrow"><span class="sn">Vientos</span>{tiles("1z 2z 3z 4z")}<span class="cap">Este · Sur · Oeste · Norte</span></div>
<div class="suitrow"><span class="sn">Dragones</span>{tiles("7z 5z 6z")}<span class="cap">Haku (blanco) · Hatsu (verde) · Chun (rojo)</span></div>
<h3>Cincos rojos</h3>
<div class="suitrow"><span class="sn">Aka</span>{tiles("0m 0p 0s")}<span class="cap">Cada uno vale un bonus</span></div>
{callout("Los cinco rojos (<i>aka</i>) cuentan como un 5 normal, pero cada uno que tengas en tu mano suma <b>1 han</b> (punto de valor) al ganar. Aparecen junto a los demás cincos, no en lugar de ellos.")}
{example("Cuatro copias", f'<div class="hand">{tiles("5p 5p 5p 5p")}</div><p class="ex-note">Hay cuatro 5 de círculos idénticos: así puedes ir contando cuántos quedan.</p>')}
''', 4)

# ---------- 5 Setup ----------
page(f'''
<h2>Preparación</h2>
<ol class="steps">
<li><span class="ord">1<sup>ª</sup></span><div><b>Mezclar.</b> Pon las 136 fichas boca abajo y que los cuatro jugadores las mezclen con las manos, hasta que nadie sepa dónde está cada una.</div></li>
<li><span class="ord">2<sup>ª</sup></span><div><b>Armar los muros.</b> Cada jugador arma frente a sí un muro de <b>17 pilas de dos fichas</b> (34 fichas). Juntos forman un cuadrado.</div></li>
<li><span class="ord">3<sup>ª</sup></span><div><b>Elegir al dealer.</b> Cada jugador lanza un dado: el número más alto es el <b>dealer</b>, quien juega primero y se sienta en el asiento Este.</div></li>
<li><span class="ord">4<sup>ª</sup></span><div><b>Poner el compass.</b> En el centro, con cada viento hacia su asiento, y la <b>placa del viento de ronda</b> (Este) en el borde, a la derecha del dealer.</div></li>
<li><span class="ord">5<sup>ª</sup></span><div><b>Abrir el muro.</b> El dealer lanza dos dados. La suma se busca en los numeritos del compass: te dice <b>qué lado</b> abrir. En ese muro cuenta tantas pilas como la suma y ahí se corta.</div></li>
<li><span class="ord">6<sup>ª</sup></span><div><b>Repartir.</b> Desde el corte, empezando por el dealer: <b>4 fichas</b> cada uno, tres veces; luego <b>1</b> más cada uno. Todos quedan con 13; el dealer roba una última y tiene 14.</div></li>
</ol>
<div class="side">
<img class="compassimg" src="{A}/illustrations/consola-top-light.svg" alt="">
<div class="side-text">{callout("<b>El muro muerto.</b> Desde el corte se apartan <b>siempre 7 pilas (14 fichas)</b>: son el muro muerto, fuera de juego salvo en ocasiones especiales. Si el corte cae cerca del final de un muro, se sigue contando en el muro de al lado.")}
{callout("<b>La dora.</b> En la 3ª pila del muro muerto se voltea la ficha de arriba: es el <b>indicador de dora</b>. La ficha siguiente a esa vale un bonus para quien la tenga en su mano.")}</div></div>
''', 5)

# ---------- 6 Turn ----------
page(f'''
<h2>Tu turno</h2>
<p>Empieza el dealer y sigue el turno a su derecha, en sentido antihorario. En tu turno haces <b>tres cosas</b>:</p>
<div class="turnflow">
<div class="tcard"><b>1 · Robas</b><p>Tomas la siguiente ficha del muro. Ahora tienes <b>14</b> fichas.</p>{tiles("8s")}</div>{arrow()}
<div class="tcard"><b>2 · Decides</b><p>¿Te acerca a 4 grupos y 1 pareja? Si no sirve, será la que botes.</p></div>{arrow()}
<div class="tcard"><b>3 · Botas</b><p>Dejas una ficha boca arriba en tu río. Vuelves a tener <b>13</b>.</p>{tiles("9p")}</div>
</div>
<h3>Ordena tu mano</h3>
<p>Ordenar sirve para ver tus grupos de un vistazo: junta cada palo (manzu, pinzu, souzu) y deja los honores juntos, con los iguales pegados. Puedes reordenarla como quieras mientras sea fácil ver lo que tienes.</p>
{example("Ejemplo de turno", f'<p class="ex-text">Tu mano tiene tres grupos, dos parejas… y una ficha suelta, el 9 de círculos. Es la que botas.</p>{groups([("1m 2m 3m","Grupo","gr"),("4p 5p 6p","Grupo","gr"),("3s 4s 5s","Grupo","gr"),("6z 6z","Pareja","pl"),("1z 1z","Pareja","pl"),("9p!","Sobra","sp")])}<p class="ex-text">Ahora robas un Chun (中): con tus dos Chun forma un trío y la mano se completa.</p>')}
{callout("Los descartes son <b>información</b>: miras lo que botan los demás para saber qué fichas ya no quedan y qué están buscando.")}
''', 6)

# ---------- 7 Sets ----------
page(f'''
<h2>Grupos y mano completa</h2>
<p>Una mano completa son <b>4 grupos y 1 pareja</b>. Hay dos clases de grupo.</p>
<h3>Secuencia</h3>
<p>Tres números <b>seguidos del mismo palo</b>. Los vientos y dragones no forman secuencias.</p>
<div class="hand">{tiles("4p 5p 6p")}<span class="gap"></span>{tiles("2s 3s 4s")}<span class="gap"></span>{tiles("7m 8m 9m")}</div>
<h3>Trío</h3>
<p>Tres fichas <b>idénticas</b>. Aquí sí sirven los vientos y los dragones.</p>
<div class="hand">{tiles("6z 6z 6z")}<span class="gap"></span>{tiles("7s 7s 7s")}<span class="gap"></span>{tiles("2m 2m 2m")}</div>
<h3>Pareja</h3>
<p>Dos fichas idénticas. Toda mano completa lleva exactamente una.</p>
<div class="hand">{tiles("1z 1z")}<span class="gap"></span>{tiles("5m 5m")}</div>
{example("Las cuentas", f'<p class="sum">4 × 3 + 2 = <b>14</b></p><p class="ex-note">13 fichas en la mano más la que robas: 14. Los grupos y la pareja usan las 14.</p>')}
{callout("<b>Tenpai</b> es estar a <b>una sola ficha</b> de ganar. <b>Noten</b> es lo contrario. Ambos importan cuando el muro se agota sin ganador: quienes están en tenpai cobran de los noten (3 000 puntos en total).")}
''', 7)

# ---------- 8 Calls ----------
page(f'''
<h2>Llamadas: chii, pon y kan</h2>
<p>Además de robar del muro, puedes tomar la ficha que acaba de botar otro jugador: eso se llama <b>llamada</b>. Dices el nombre en voz alta, tomas la ficha y colocas el grupo <b>boca arriba</b>, con la ficha tomada <b>girada hacia quien la botó</b>.</p>
{example("Chii · una secuencia", f'<div class="hand">{tiles("4p 6p")}{arrow("small")}{tiles("5p~")}<span class="eq">=</span>{tiles("4p 5p~ 6p")}</div><p class="ex-note">Solo puedes tomar la ficha del jugador que juega justo antes que tú (tu izquierda), y solo para formar una secuencia con dos fichas tuyas.</p>')}
{example("Pon · un trío", f'<div class="hand">{tiles("6z 6z")}{arrow("small")}{tiles("6z~")}<span class="eq">=</span>{tiles("6z 6z~ 6z")}</div><p class="ex-note">Con dos fichas iguales puedes tomar la tercera que bote <b>cualquier</b> jugador. El turno salta a ti.</p>')}
{example("Kan · un cuarteto", f'<div class="hand">{tiles("3s 3s 3s")}{arrow("small")}{tiles("3s~")}<span class="eq">=</span>{tiles("3s 3s 3s 3s~")}</div><p class="ex-note">Con tres iguales tomas la cuarta. Un kan agrega una ficha extra: robas una de reposición del muro muerto y se revela otro indicador de dora.</p>')}
{callout("Al hacer una llamada tu mano pasa de <b>cerrada</b> a <b>abierta</b>: ya no puedes declarar riichi y algunos yaku valen menos o no cuentan. A cambio, avanzas más rápido.")}
''', 8)

# ---------- 9 Winning ----------
page(f'''
<h2>Ganar: ron, tsumo y yaku</h2>
<p>Ganas cuando completas tu mano <b>y</b> cumples al menos un <b>yaku</b>, una condición que la mano debe cumplir. Hay dos formas de ganar:</p>
<div class="two">
<div class="tcard wide"><b>Tsumo</b><p>Ganas con una ficha que <b>tú mismo robaste</b>. Pagan los tres rivales.</p></div>
<div class="tcard wide"><b>Ron</b><p>Ganas con la ficha que <b>botó otro jugador</b>. Paga solo quien la botó.</p></div>
</div>
<p>Al ganar dices «Tsumo» o «Ron» y muestras tu mano boca arriba.</p>
<h3>Tres yaku para empezar</h3>
{example("Tanyao", f'<div class="hand">{tiles("2m 3m 4m")}{tiles("5p 6p 7p")}{tiles("3s 4s 5s")}{tiles("6s 6s 6s")}{tiles("8p 8p")}</div><p class="ex-note">Solo fichas del 2 al 8: sin honores ni extremos (1 o 9).</p>')}
{example("Yakuhai", f'<div class="hand">{tiles("6z 6z 6z")}<span class="gap"></span>{tiles("1z 1z 1z")}</div><p class="ex-note">Un trío de dragones, del viento de la ronda o de tu viento de asiento.</p>')}
<p><b>Riichi.</b> Con la mano cerrada y a una ficha de ganar (tenpai), puedes declarar «Riichi»: botas la ficha <b>acostada de lado</b> y pones un <b>palito de 1 000</b> en la ranura del compass. Desde entonces no cambias tu mano: solo robas y botas lo que robas.</p>
{callout("<b>Furiten.</b> Si ya botaste alguna de las fichas con las que ganarías, no puedes ganar por ron, solo por tsumo. Nadie te avisa: tienes que darte cuenta tú.")}
''', 9)

# ---------- 10 Points ----------
page(f'''
<h2>Puntos y palitos</h2>
<p>Los puntos se llevan en <b>palitos de colores</b>. Cada palito <b>equivale</b> a una cantidad fija. Cada jugador empieza con 25 000 puntos y los guarda en su cajón.</p>
<div class="sticks">
<div class="srow">{stick(10000)}<b>10 000</b><span>rojo</span></div>
<div class="srow">{stick(5000)}<b>5 000</b><span>amarillo</span></div>
<div class="srow">{stick(1000)}<b>1 000</b><span>azul</span></div>
<div class="srow">{stick(500)}<b>500</b><span>verde</span></div>
<div class="srow">{stick(100)}<b>100</b><span>blanco con rayas</span></div>
</div>
<h3>Contar la mano</h3>
<p>Al ganar se cuenta el valor de la mano con <b>han</b> (yaku y dora) y <b>fu</b> (minipuntos). Juntos dan los puntos; en la sección de puntajes del sitio hay tablas completas.</p>
{example("Pagar 3 900 puntos", f'<div class="pay"><div class="pg"><div>{sticks([(1000,3)])}</div><span>3 × 1 000</span></div><b>+</b><div class="pg"><div>{sticks([(500,1)])}</div><span>1 × 500</span></div><b>+</b><div class="pg"><div>{sticks([(100,4)])}</div><span>4 × 100</span></div><b class="tot">= 3 900</b></div><p class="ex-note">Quien paga deja los palitos <b>sobre la mesa</b> y el ganador los <b>toma</b>.</p>')}
<ul class="plain"><li><b>Ron:</b> paga quien botó la ficha ganadora.</li><li><b>Tsumo:</b> pagan los tres rivales.</li><li>El <b>dealer</b> cobra y paga más que los demás.</li></ul>
{callout("Los puntos son lo que decide la partida: cuando termina, se comparan y <b>gana quien tiene más</b>.")}
''', 10)

# ---------- 11 Rounds ----------
page(f'''
<h2>Rondas y fin de partida</h2>
<p>La partida se juega <b>mano tras mano</b>. Cada mano termina cuando alguien gana o cuando el muro se agota sin ganador.</p>
<div class="rounds">
<div class="rcard"><span class="plate">東</span><b>Ronda Este</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
<div class="rcard"><span class="plate">南</span><b>Ronda Sur</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
</div>
<p>Una <b>ronda</b> son cuatro manos, una por cada dealer. La placa del borde marca el <b>viento de la ronda</b>: Este primero, Sur después.</p>
<h3>Al terminar cada mano</h3>
<ul class="plain">
<li><b>El dealer gana:</b> sigue de dealer y los vientos <b>no cambian</b>.</li>
<li><b>Gana otro (o nadie gana y el dealer no está en tenpai):</b> el <b>compass gira</b>: cada jugador toma el siguiente viento de asiento y el dealer pasa a quien está a su derecha.</li>
<li><b>Vuelta completa:</b> la ronda pasa a Sur y se voltea la placa.</li>
</ul>
<h3>Largo de la partida</h3>
{example("Tonpuusen y hanchan", f'<div class="two"><div class="tcard wide"><b>Tonpuusen</b><p>Partida corta: solo la ronda Este.</p></div><div class="tcard wide"><b>Hanchan</b><p>Partida normal: rondas Este y Sur.</p></div></div>')}
<div class="podium"><span>🏆</span><p>Al final se cuentan los palitos de cada jugador. <b>Gana quien tiene más puntos.</b></p></div>
''', 11)

# ---------- 12-13 Glossary ----------
half = (len(entries) + 1) // 2
def gl_page(items, head, num):
    gl_html = "".join(f'<dt id="g-{eid}">{t}</dt><dd>{m}<a class="gl-back" href="javascript:history.back()"></a></dd>' for eid, t, m, _ in items)
    page(f'''{head}<dl class="gloss">{gl_html}</dl>''', num, cls="gl")
gl_page(entries[:half], '<h2>Diccionario</h2><p class="small">Las palabras de esta guía, en lenguaje simple.</p>', 12)
gl_page(entries[half:], '<h2>Diccionario</h2><p class="small">Continuación.</p>', 13)

# ---------- 13 Back ----------
page(f'''
<div class="back">
<img class="mark" src="{A}/rincon-mark.svg" alt="">
<h2>Sigue aprendiendo</h2>
<p>Esta guía acompaña al sitio <b>Rincón Riichi</b>. Allí puedes ver las mismas ideas en animaciones, probar cada paso y practicar con ejercicios cortos.</p>
<ul class="plain big">
<li><b>Tutorial</b> — la mesa y una mano completa, paso a paso.</li>
<li><b>Fichas, tipos de espera y yakus</b> — referencias con ejemplos.</li>
<li><b>Practicar</b> — reconocer fichas, contar puntos y más, con modo rápido.</li>
</ul>
<p class="url">rincon-riichi.vercel.app</p>
</div>''', 14, cls="backpage")

CSS = r"""
@page { size: 6.77in 8.03in; margin: 0 }
* { box-sizing: border-box }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact }
.gloss { column-fill: balance }
a { color: inherit; text-decoration: none }
a.gl-link { border-bottom: 1pt dotted #6a4aa8; color: #3a2a7c }
u.dotted { text-decoration: none; border-bottom: 1pt dotted #6a4aa8 }
.toc a { display: flex; align-items: baseline; gap: 3pt; width: 100% }
.gl-back { display: none }
body { margin: 0; font-family: Palatino, 'Palatino Linotype', Georgia, serif; color: #2b2540; font-size: 10.2pt; line-height: 1.42 }
.page { position: relative; width: 6.77in; height: 8.03in; overflow: hidden; page-break-after: always; padding: .5in .52in .5in;
  background:
    radial-gradient(ellipse at 15% 10%, rgba(255,255,255,.55), transparent 55%),
    radial-gradient(ellipse at 90% 95%, rgba(170,130,60,.18), transparent 60%),
    #f1e4c6; }
.page::before { content: ""; position: absolute; inset: 0; opacity: .22; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .15  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
h2 { font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; font-size: 30pt; line-height: 1; margin: 0 0 10pt; color: #4a3a8c; letter-spacing: -.3pt }
h3 { font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; font-size: 17pt; margin: 11pt 0 4pt; color: #6a4aa8 }
p { margin: 0 0 7pt } ul, ol { margin: 0 0 7pt }
.plain { list-style: none; padding: 0 } .plain li { padding-left: 13pt; position: relative; margin-bottom: 3pt } .plain li::before { content: "◆"; position: absolute; left: 0; top: 0; color: #d9701c; font-size: 7pt; line-height: 1.9 }
.small { font-style: italic; margin-top: -6pt }
.callout { margin: 8pt auto; padding: 5pt 12pt; max-width: 94%; border: .75pt solid #8b7a5a; background: rgba(255,255,255,.5); text-align: center; font-style: italic; font-size: 9.2pt; line-height: 1.35 }
.example { position: relative; margin: 14pt 0 8pt; padding: 12pt 12pt 8pt; border: 1pt solid #2b2540; background: rgba(255,255,255,.35) }
.ex-title { position: absolute; top: -8pt; left: 50%; transform: translateX(-50%); padding: 0 8pt; background: #f1e4c6; font-family: Cochin, Georgia, serif; font-size: 12.5pt; color: #2b2540; white-space: nowrap }
.ex-note, .ex-text { font-style: italic; font-size: 9.2pt; margin: 6pt 0 0; text-align: center }
.tiles { display: inline-flex; align-items: flex-end; gap: 0 } .tl { height: .5in; width: auto; display: block; filter: drop-shadow(0 1.2pt 0 rgba(43,37,64,.35)) }
.tl.side { transform: rotate(90deg) translate(0, 3pt); margin: 0 .09in; transform-origin: center }
.tl.hi { outline: 2pt solid #e8672c; border-radius: 3pt }
.hand { display: flex; justify-content: center; align-items: flex-end; gap: 6pt; flex-wrap: nowrap; margin: 4pt 0 }
.gap { width: 8pt } .eq { font-size: 16pt; padding: 0 4pt; color: #4a3a8c; align-self: center }
.groups { gap: 9pt; align-items: flex-start } .gcol { display: flex; flex-direction: column; align-items: center; gap: 2pt } .gcol span { font-size: 7.4pt; text-transform: uppercase; letter-spacing: .5pt; color: #14683f } .gcol.pl span { color: #8a5a00 } .gcol.sp span { color: #8a1f2a }
.hand-labels { display: flex; justify-content: center; gap: 6pt; font-size: 7.6pt; text-transform: uppercase; letter-spacing: .5pt; color: #14683f }
.hand-labels span { flex: none; min-width: 3 * .333in; text-align: center }
.hand-labels .pl { color: #8a5a00 } .hand-labels .sp { color: #8a1f2a }
.flow { display: flex; align-items: center; justify-content: center; gap: 4pt; margin-top: 6pt } .flow span:not(.arr) { padding: 4pt 7pt; border: 1pt solid #4a3a8c; border-radius: 9pt; font-size: 8.6pt; text-align: center; background: rgba(255,255,255,.55); width: 1.25in }
.arr { color: #e8672c; font-size: 16pt; line-height: 1 } .arr.small { font-size: 14pt; align-self: center }
.leaf { position: absolute; right: .34in; bottom: .3in; width: .38in; height: .38in; display: grid; place-items: center; background: #a8322b; color: #fff; font: 700 11pt Cochin, Georgia, serif; border-radius: 0 100% 0 100%; transform: rotate(0deg); box-shadow: 0 1pt 0 rgba(0,0,0,.25) }
/* cover */
.cover { padding: 0; background: radial-gradient(ellipse at 50% 30%, #3ea58a, #1f6f5e 70%, #174f43) }
.cover::before { display: none }
.cover-art { position: absolute; left: -.5in; right: -.5in; top: 1.9in; opacity: .96; transform: rotate(-3deg) }
.cover-art img { width: 100%; display: block; filter: drop-shadow(0 12pt 10pt rgba(0,0,0,.35)) }
.cover-title { position: relative; text-align: center; padding-top: .38in; color: #fff }
.cover-title .mark { width: .62in; display: block; margin: 0 auto 2pt }
.brand { margin: 0; letter-spacing: 4pt; font: 700 9pt 'Avenir Next', Helvetica, sans-serif; color: #ffe9a6 }
.cover-title h1 { margin: 2pt 0 0; font-family: Cochin, 'Hoefler Text', Georgia, serif; font-weight: 400; line-height: .82; text-shadow: 0 3pt 0 rgba(23,79,67,.9), 0 6pt 14pt rgba(0,0,0,.35) }
.cover-title h1 em { display: block; font-size: 56pt; font-style: italic; margin-bottom: 0 } .cover-title h1 span { display: block; font-size: 78pt }
.ribbon { display: inline-block; margin-top: 8pt; padding: 3pt 16pt; background: #f2b42c; color: #2b2540; border: 1.5pt solid #2b2540; font: 700 9.5pt 'Avenir Next', Helvetica, sans-serif; letter-spacing: 1pt; text-transform: uppercase; box-shadow: 0 2pt 0 #2b2540 }
.toc { position: absolute; left: 50%; bottom: .32in; transform: translateX(-50%); width: 3.1in; padding: 8pt 14pt 10pt; background: #f4e8cc; border: 2pt solid #2b2540; border-radius: 8pt; box-shadow: 0 3pt 0 rgba(0,0,0,.3) }
.toc h3 { text-align: center; margin: 0 0 4pt; font-size: 16pt; color: #4a3a8c }
.toc ul { list-style: none; padding: 0; margin: 0; font-size: 8.8pt } .toc li { display: flex; align-items: baseline; gap: 3pt; line-height: 1.5 } .toc i { flex: 1; border-bottom: .8pt dotted #6b5b3a; transform: translateY(-2pt) } .toc b { font-weight: 400 }
/* table page */
.figure { position: relative; margin: 4pt -.1in 6pt } .figure img { width: 100%; display: block } .figure svg { position: absolute; inset: 0; width: 100%; height: 100% }
.lead { stroke: #e8672c; stroke-width: 2.4 } .dot { fill: #e8672c; stroke: #fff; stroke-width: 2 } .pinbg { fill: #4a3a8c; stroke: #fff; stroke-width: 2.5 } .pinnum { fill: #fff; font: 700 17px Cochin, Georgia, serif }
.legend { padding-left: 15pt; font-size: 9.2pt; columns: 2; column-gap: 16pt; margin-bottom: 4pt } .legend li { margin-bottom: 3pt; break-inside: avoid } .legend li::marker { color: #4a3a8c; font-weight: 700 }
/* tiles page */
.suitrow { display: flex; align-items: center; gap: 8pt; margin: 3pt 0 } .sn { width: .85in; font-family: Cochin, Georgia, serif; font-size: 12pt; color: #4a3a8c; line-height: 1.05 } .sn small { display: block; font: italic 8pt Palatino, serif; color: #6b5b3a } .suitrow .tl { height: .42in } .cap { font-style: italic; font-size: 8.4pt }
/* setup */
.steps { list-style: none; padding: 0; margin: 0 } .steps li { display: flex; gap: 8pt; margin-bottom: 6pt; align-items: baseline } .ord { flex: none; width: 22pt; font-family: Cochin, Georgia, serif; font-size: 17pt; color: #4a3a8c; line-height: 1 } .ord sup { font-size: 9pt }
.side { display: flex; gap: 10pt; align-items: center; margin-top: 4pt } .compassimg { width: 1.7in; flex: none; filter: drop-shadow(0 2pt 0 rgba(43,37,64,.3)) } .side-text { flex: 1 } .side .callout { margin: 4pt 0; max-width: 100%; text-align: left }
/* turn */
.turnflow { display: flex; align-items: stretch; gap: 3pt; margin: 6pt 0 } .tcard { flex: 1; padding: 6pt 8pt; border: 1pt solid #4a3a8c; border-radius: 9pt; background: rgba(255,255,255,.55); text-align: center; font-size: 9pt } .tcard b { font-family: Cochin, Georgia, serif; font-size: 12.5pt; color: #4a3a8c; font-weight: 400; display: block } .tcard p { margin: 2pt 0 4pt } .tcard p b { display: inline; font: inherit; color: inherit; font-weight: 700 } .tcard .tl { height: .4in }
.tcard.wide { text-align: left } .two { display: flex; gap: 8pt; margin: 6pt 0 }
.sum { text-align: center; font-size: 17pt; font-family: Cochin, Georgia, serif; margin: 2pt 0 } .sum b { color: #a8322b }
/* sticks */
.sticks { display: grid; gap: 3pt; margin: 4pt 0 } .srow { display: grid; grid-template-columns: 1.6in 0.8in 1fr; align-items: center; gap: 8pt; font-size: 9.6pt } .srow b { text-align: right; font-size: 11pt } .srow span { font-style: italic; color: #6b5b3a } .stick { display: block }
.pay { display: flex; align-items: center; justify-content: center; gap: 8pt; font-size: 8.8pt } .pg { display: flex; flex-direction: column; align-items: center; gap: 2pt } .pg > div { display: flex; flex-direction: column; gap: 2.5pt; align-items: flex-start } .pay > b { font-family: Cochin, Georgia, serif; font-size: 16pt; color: #4a3a8c } .pay .tot { color: #a8322b }
/* rounds */
.rounds { display: flex; gap: 10pt; justify-content: center; margin: 6pt 0 } .rcard { display: flex; align-items: center; gap: 7pt; padding: 6pt 10pt; border: 1pt solid #4a3a8c; border-radius: 12pt; background: rgba(255,255,255,.55) } .plate { display: grid; place-items: center; width: 24pt; height: 17pt; border: 1.4pt solid #2b2540; border-radius: 4pt; background: #f08a30; color: #fff6e5; font: 700 13pt 'Hiragino Mincho ProN', serif } .hands { display: flex; gap: 2pt } .hands i { display: grid; place-items: center; width: 13pt; height: 13pt; border-radius: 3pt; background: #f2b42c; font-style: normal; font-size: 8pt; font-weight: 700 }
.podium { display: flex; gap: 8pt; align-items: center; margin-top: 8pt; padding: 7pt 10pt; border: 1.4pt solid #2b2540; border-radius: 10pt; background: #f9d77a } .podium span { font-size: 22pt } .podium p { margin: 0 }
/* glossary */
.gl h2 { margin-bottom: 4pt } .gloss { columns: 2; column-gap: 16pt; margin: 6pt 0 0; font-size: 8.1pt; line-height: 1.3 } .gloss dt { font-family: Cochin, Georgia, serif; font-size: 10.6pt; color: #4a3a8c; margin-top: 4pt; break-after: avoid } .gloss dd { margin: 0 0 2pt; break-inside: avoid }
/* back */
.backpage { display: grid; place-items: center } .back { text-align: center; max-width: 4.8in } .back .mark { width: .9in } .back h2 { font-size: 34pt } .back .plain { text-align: left; display: inline-block } .big li { font-size: 11pt }
.url { margin-top: 12pt; padding: 6pt 16pt; display: inline-block; background: #4a3a8c; color: #fff; font: 700 12pt 'Avenir Next', Helvetica, sans-serif; border-radius: 99pt }
"""
html = f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Aprende a jugar Riichi Mahjong · Rincón Riichi</title><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
OUT_HTML.write_text(html, encoding="utf8")
OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT_PDF}", "--virtual-time-budget=20000", f"file://{OUT_HTML}"], check=True, capture_output=True)
import fitz
tmp1 = OUT_PDF.with_suffix(".a.pdf"); tmp2 = OUT_PDF.with_suffix(".b.pdf")
doc = fitz.open(OUT_PDF); doc.set_metadata({"title": "Aprende a jugar Riichi Mahjong", "author": "Rincón Riichi", "subject": "Guía paso a paso de Riichi Mahjong"})
doc.save(tmp1, garbage=4, deflate=True, clean=True); doc.close()
# shrink the big embedded pictures in a child process (MuPDF can abort on some Chrome resources); keep the plain version if it fails
child = subprocess.run([sys.executable, "-c", f"import fitz; d=fitz.open(r'{tmp1}'); d.rewrite_images(dpi_threshold=170, dpi_target=140, quality=82); d.save(r'{tmp2}', garbage=4, deflate=True, clean=True)"], capture_output=True)
if child.returncode == 0 and tmp2.exists() and tmp2.stat().st_size < tmp1.stat().st_size:
    tmp2.replace(OUT_PDF); tmp1.unlink()
else:
    tmp1.replace(OUT_PDF)
    if tmp2.exists(): tmp2.unlink()
print("ok", OUT_PDF, OUT_PDF.stat().st_size)
