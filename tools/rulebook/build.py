#!/usr/bin/env python3
"""Builds the downloadable "Aprende a jugar Riichi Mahjong" guide (HTML -> PDF with headless Chrome)."""
import re, subprocess, sys, pathlib

if len(sys.argv) < 2:
    for _lang in ("es", "en", "pt"):
        subprocess.run([sys.executable, __file__, _lang], check=True)
    sys.exit(0)
LANG = sys.argv[1]
_IDX = {"es": 0, "en": 1, "pt": 2}[LANG]
def tr(es, en, pt):
    return (es, en, pt)[_IDX]
FILES = {"es": "aprende-riichi-mahjong-es", "en": "learn-riichi-mahjong-en", "pt": "aprenda-riichi-mahjong-pt"}
TITLES = {"es": "Aprende a jugar Riichi Mahjong", "en": "Learn to play Riichi Mahjong", "pt": "Aprenda a jogar Riichi Mahjong"}

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
OUT_HTML = pathlib.Path(__file__).with_name(f"rulebook-{LANG}.html")
OUT_PDF = ASSETS / "docs" / (FILES[LANG] + ".pdf")
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

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from stick_svg import stick

def sticks(counts):
    return "".join(stick(v) for v, n in counts for _ in range(n))

# ---------- glossary from the site's own data ----------
gl = (ROOT / "src/features/learn/domain/glossary.ts").read_text(encoding="utf8")
entries = []
def _unq(text):
    return text.replace("\\'", "'")
for line in gl.splitlines():
    m = re.search(r"id: '([^']*)', term: L\('((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\)(?:, also: \[([^\]]*)\])?, meaning: L\('((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\)", line)
    if m:
        terms = [_unq(m.group(2)), _unq(m.group(3)), _unq(m.group(4))]
        also = re.findall(r"'([^']*)'", m.group(5) or "")
        meanings = [_unq(m.group(6)), _unq(m.group(7)), _unq(m.group(8))]
        entries.append((m.group(1), terms[_IDX], meanings[_IDX], terms + also))
EXTRA = {
    "tile": (["tile", "tiles"], ["peça", "peças"]), "suit": (["suit", "suits"], ["naipe", "naipes"]), "honor": (["honors", "honor"], ["honras", "honra"]),
    "wall": (["walls"], ["muros"]), "round": (["round", "rounds", "hand"], ["rodada", "rodadas", "mão"]),
    "set": (["sets", "sequence", "triplet"], ["grupos", "sequência", "trio"]), "pair": (["pair", "pairs"], ["par", "pares"]),
    "pond": (["pond", "ponds"], ["rio", "rios"]), "call": (["call", "calls"], ["chamada", "chamadas"]), "open-hand": (["open hand", "closed hand"], ["mão aberta", "mão fechada"]),
    "stick": (["stick", "sticks"], ["palito", "palitos"]), "seat-wind": (["seat wind"], ["vento do assento"]), "round-wind": (["round wind"], ["vento da rodada"]),
    "dead-wall": (["dead wall"], ["muro morto"]),
}
# every word that can open a definition, in this guide's language first
ALIASES = []
for eid, term, meaning, also in entries:
    extra = EXTRA.get(eid, ([], []))
    words = [term] + [w for w in also if w] + (extra[0] if LANG == "en" else extra[1] if LANG == "pt" else [])
    for word in dict.fromkeys(words):
        ALIASES.append((word, eid))
ALIASES.sort(key=lambda x: -len(x[0]))
SKIP_CLASSES = ("ex-title", "lbl", "leaf", "ord", "sn", "cap", "ribbon", "brand", "plate", "hands", "gcol")
LETTER = "A-Za-zÁÉÍÓÚÜÑÀÂÃÇÊÕáéíóúüñàâãçêõ0-9"

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
toc = [(tr("Introducción", "Introduction", "Introdução"), 2), (tr("La mesa", "The table", "A mesa"), 3), (tr("Glosario de piezas", "Piece glossary", "Glossário de peças"), 4), (tr("Las fichas", "The tiles", "As peças"), 5),
       (tr("Preparación", "Setup", "Preparação"), 6), (tr("Tu turno", "Your turn", "A sua vez"), 7), (tr("Grupos y mano completa", "Sets and a complete hand", "Grupos e mão completa"), 8),
       (tr("Llamadas: chii, pon y kan", "Calls: chii, pon and kan", "Chamadas: chii, pon e kan"), 9), (tr("Ganar: ron, tsumo y yaku", "Winning: ron, tsumo and yaku", "Ganhar: ron, tsumo e yaku"), 10),
       (tr("Puntos y palitos", "Points and sticks", "Pontos e palitos"), 11), (tr("Rondas y fin de partida", "Rounds and the end of the game", "Rodadas e fim da partida"), 12), (tr("Diccionario", "Dictionary", "Dicionário"), 13)]
toc_html = "".join(f'<li><a href="#p{n}"><span>{t}</span><i></i><b>{n}</b></a></li>' for t, n in toc)
page(f'''
<div class="cover-art"><img src="{A}/illustrations/mesa-light.svg" alt=""></div>
<div class="cover-title"><img class="mark" src="{A}/rincon-mark.svg" alt=""><p class="brand">RINCÓN RIICHI</p>
<h1><em>{tr("Aprende", "Learn", "Aprenda")}</em><span>{tr("a jugar", "to play", "a jogar")}</span></h1><p class="ribbon">{tr("Riichi Mahjong · guía paso a paso", "Riichi Mahjong · step-by-step guide", "Riichi Mahjong · guia passo a passo")}</p></div>
<div class="toc"><h3>{tr("Índice", "Contents", "Índice")}</h3><ul>{toc_html}</ul></div>''', cls="cover")

# ---------- 2 Introduction ----------
S, G, PR = tr("Grupo", "Set", "Grupo"), tr("Grupo", "Set", "Grupo"), tr("Pareja", "Pair", "Par")
page(f'''
<h2>{tr("Introducción", "Introduction", "Introdução")}</h2>
<p>{tr("Riichi mahjong es un juego de <b>cuatro jugadores</b> que se juega con <b>fichas</b>, parecido al Carioca o al rummy: los jugadores se turnan para <b>sacar una ficha y botar otra</b>, buscando completar su mano. Cada mano da <b>puntos</b> y, al final de varias rondas, <b>gana quien tiene más puntos</b>.",
 "Riichi mahjong is a game for <b>four players</b> played with <b>tiles</b>, a bit like rummy: players take turns to <b>draw a tile and discard another</b>, trying to complete their hand. Each hand scores <b>points</b> and, after several rounds, <b>whoever has the most points wins</b>.",
 "Riichi mahjong é um jogo para <b>quatro jogadores</b> jogado com <b>peças</b>, parecido com o rummy: os jogadores se revezam para <b>comprar uma peça e descartar outra</b>, buscando completar a mão. Cada mão dá <b>pontos</b> e, ao fim de várias rodadas, <b>ganha quem tem mais pontos</b>.")}</p>
{callout(tr("Si prefieres aprender jugando, revisa «La mesa», «Preparación» y «Tu turno» y empieza: el resto lo puedes consultar sobre la marcha. Las palabras con <u class='dotted'>subrayado punteado</u> se pueden pulsar: llevan a su definición en el Diccionario (páginas 13 y 14).",
 "If you would rather learn by playing, read “The table”, “Setup” and “Your turn” and start: you can look up the rest as you go. Words with a <u class='dotted'>dotted underline</u> can be clicked: they jump to their definition in the Dictionary (pages 13 and 14).",
 "Se preferir aprender jogando, leia «A mesa», «Preparação» e «A sua vez» e comece: o resto você consulta pelo caminho. As palavras com <u class='dotted'>sublinhado pontilhado</u> podem ser clicadas: levam à definição no Dicionário (páginas 13 e 14)."))}
<h3>{tr("Qué necesitas", "What you need", "O que você precisa")}</h3>
<ul class="plain"><li>{tr("<b>136 fichas</b>: 34 clases distintas, 4 copias de cada una.", "<b>136 tiles</b>: 34 different kinds, 4 copies of each.", "<b>136 peças</b>: 34 tipos diferentes, 4 cópias de cada.")}</li><li>{tr("Un <b>compass</b> (la pieza del centro) y una <b>placa</b> de viento de ronda.", "A <b>compass</b> (the piece in the centre) and a round-wind <b>plate</b>.", "Um <b>compass</b> (a peça do centro) e uma <b>placa</b> de vento da rodada.")}</li><li>{tr("Dos <b>dados</b> y <b>palitos</b> de puntos de colores.", "Two <b>dice</b> and colour-coded point <b>sticks</b>.", "Dois <b>dados</b> e <b>palitos</b> de pontos coloridos.")}</li><li>{tr("Cuatro jugadores sentados alrededor de una mesa.", "Four players sitting around a table.", "Quatro jogadores sentados ao redor de uma mesa.")}</li></ul>
<h3>{tr("El objetivo", "The goal", "O objetivo")}</h3>
<p>{tr("Con tus 13 fichas, y la que robas, quieres armar <b>4 grupos y 1 pareja</b>: 14 fichas en total. Al lograrlo, <b>ganas la mano</b>.", "With your 13 tiles, plus the one you draw, you want to build <b>4 sets and 1 pair</b>: 14 tiles in all. When you do, <b>you win the hand</b>.", "Com as suas 13 peças, mais a que você compra, você quer formar <b>4 grupos e 1 par</b>: 14 peças no total. Ao conseguir, <b>você ganha a mão</b>.")}</p>
{example(tr("Una mano completa", "A complete hand", "Uma mão completa"), groups([("1m 2m 3m", G, "gr"), ("4p 5p 6p", G, "gr"), ("3s 4s 5s", G, "gr"), ("6z 6z 6z", G, "gr"), ("1z 1z", PR, "pl")]))}
<h3>{tr("Cómo avanza una partida", "How a game goes", "Como avança uma partida")}</h3>
<div class="flow"><span>{tr("Cada jugador roba y bota", "Each player draws and discards", "Cada jogador compra e descarta")}</span>{arrow()}<span>{tr("Alguien completa su mano", "Someone completes their hand", "Alguém completa a mão")}</span>{arrow()}<span>{tr("Se pagan puntos con palitos", "Points are paid with sticks", "Pagam-se pontos com palitos")}</span>{arrow()}<span>{tr("Sigue la siguiente mano", "The next hand begins", "Começa a próxima mão")}</span></div>
''', 2)

# ---------- 3 The table ----------
def pin(n, x, y, tx, ty):
    return (f'<line x1="{x}" y1="{y}" x2="{tx}" y2="{ty}" class="lead"/><circle cx="{x}" cy="{y}" r="7" class="dot"/>'
            f'<g transform="translate({tx},{ty})"><circle r="15" class="pinbg"/><text y="6" text-anchor="middle" class="pinnum">{n}</text></g>')
page(f'''
<h2>{tr("La mesa", "The table", "A mesa")}</h2>
<p>{tr("Casi todo ocurre en una mesa compartida. Esto es lo que verás:", "Almost everything happens on a shared table. This is what you will see:", "Quase tudo acontece em uma mesa compartilhada. Isto é o que você verá:")}</p>
<div class="figure"><img src="{A}/illustrations/mesa-light.svg" alt="">
<svg viewBox="0 0 1100 720">
{pin(1, 300, 205, 120, 120)}{pin(2, 545, 320, 545, 40)}{pin(3, 335, 430, 90, 430)}{pin(4, 470, 355, 330, 640)}{pin(5, 230, 545, 90, 640)}{pin(6, 540, 580, 700, 650)}{pin(7, 545, 345, 760, 120)}
</svg></div>
<ol class="legend">
<li>{tr("<b>Los muros.</b> Las fichas boca abajo, en cuatro lados de 17 pilas de dos fichas. De aquí se roba.", "<b>The walls.</b> The face-down tiles, in four sides of 17 stacks of two tiles. You draw from here.", "<b>Os muros.</b> As peças viradas para baixo, em quatro lados de 17 pilhas de duas peças. Daqui se compra.")}</li>
<li>{tr("<b>El compass.</b> La pieza del centro: muestra el viento de cada asiento y los numeritos que se usan con los dados.", "<b>The compass.</b> The piece in the centre: it shows each seat’s wind and the small numbers used with the dice.", "<b>O compass.</b> A peça do centro: mostra o vento de cada assento e os números usados com os dados.")}</li>
<li>{tr("<b>Tu mano.</b> Tus 13 fichas, de pie frente a ti. Solo tú ves sus caras.", "<b>Your hand.</b> Your 13 tiles, standing in front of you. Only you see their faces.", "<b>A sua mão.</b> Suas 13 peças, em pé à sua frente. Só você vê as faces.")}</li>
<li>{tr("<b>Los ríos.</b> Frente a cada jugador quedan sus descartes, boca arriba.", "<b>The ponds.</b> In front of each player lie their discards, face up.", "<b>Os rios.</b> À frente de cada jogador ficam seus descartes, virados para cima.")}</li>
<li>{tr("<b>El cajón.</b> Cada jugador guarda ahí sus palitos de puntos.", "<b>The drawer.</b> Each player keeps their point sticks there.", "<b>A gaveta.</b> Cada jogador guarda ali seus palitos de pontos.")}</li>
<li>{tr("<b>La placa.</b> Marca el viento de la ronda, a la derecha del dealer.", "<b>The plate.</b> It shows the round wind, to the dealer’s right.", "<b>A placa.</b> Marca o vento da rodada, à direita do dealer.")}</li>
<li>{tr("<b>Los dados.</b> Se tiran al empezar para decidir por dónde se abre el muro.", "<b>The dice.</b> Rolled at the start to decide where the wall is opened.", "<b>Os dados.</b> Lançados no início para decidir por onde se abre o muro.")}</li>
</ol>
{callout(tr("<b>Asientos y vientos.</b> Cada asiento tiene un viento: Este (tú, el dealer), Sur (a tu derecha), Oeste (enfrente) y Norte (a tu izquierda). Los turnos van en este orden, en sentido antihorario.", "<b>Seats and winds.</b> Each seat has a wind: East (you, the dealer), South (on your right), West (across) and North (on your left). Turns go in this order, counter-clockwise.", "<b>Assentos e ventos.</b> Cada assento tem um vento: Leste (você, o dealer), Sul (à sua direita), Oeste (em frente) e Norte (à sua esquerda). Os turnos seguem nesta ordem, no sentido anti-horário."))}
''', 3)

# ---------- 4 Piece glossary ----------
def piece(pic, term, text):
    return f'<div class="pcell"><div class="ppic">{pic}</div><p><b>{term}</b>{text}</p></div>'
BACKT = f"{A}/tile-back-default.svg"
page(f'''
<h2 class="center">{tr("Glosario de piezas", "Piece glossary", "Glossário de peças")}</h2>
<div class="pgrid">
{piece(tiles("1m 5p 9s 1z"), tr("Fichas", "Tiles", "Peças"), tr(": son las piezas del juego, como las cartas de una baraja. Cada una tiene un dibujo: números del 1 al 9 en tres familias (caracteres, círculos y bambúes) y unas especiales con letras (vientos y dragones). Hay 4 copias de cada dibujo.", ": are the pieces of the game, like the cards in a deck. Each has a picture: numbers 1 to 9 in three families (characters, circles and bamboo) and some special ones with letters (winds and dragons). There are 4 copies of each picture.", ": são as peças do jogo, como as cartas de um baralho. Cada uma tem um desenho: números de 1 a 9 em três famílias (caracteres, círculos e bambus) e algumas especiais com letras (ventos e dragões). Há 4 cópias de cada desenho."))}
{piece('<span class="tiles">' + "".join(f'<img class="tl" src="{BACKT}" alt="">' for _ in range(3)) + '</span>', tr("El muro", "The wall", "O muro"), tr(": son las fichas que todavía nadie tiene, puestas boca abajo formando un cuadrado en la mesa. Cuando te toca, robas una de ahí, como sacar una carta del mazo.", ": are the tiles nobody holds yet, laid face down in a square on the table. On your turn you take one from there, like drawing a card from the deck.", ": são as peças que ninguém tem ainda, viradas para baixo formando um quadrado na mesa. Na sua vez você pega uma de lá, como tirar uma carta do baralho."))}
{piece(f'<img class="pwide" src="{A}/illustrations/consola-top-light.svg" alt="">', tr("El compass", "The compass", "O compass"), tr(": es una pieza que se pone en el centro de la mesa. Indica quién está sentado en cada lado (Este, Sur, Oeste y Norte) y se usa para empezar la partida.", ": is a piece placed in the middle of the table. It shows who sits on each side (East, South, West and North) and is used to start the game.", ": é uma peça colocada no meio da mesa. Indica quem senta em cada lado (Leste, Sul, Oeste e Norte) e serve para começar a partida."))}
{piece('<span class="plate big">東</span>', tr("La placa", "The plate", "A placa"), tr(": es una chapita con una letra japonesa que dice en qué parte de la partida estamos (Este al principio, Sur después). Por ahora solo ubícala: más adelante veremos para qué sirve.", ": is a small plate with a Japanese character saying which part of the game we are in (East at the start, South later). For now just locate it: we will see what it is for later.", ": é uma plaquinha com uma letra japonesa que diz em que parte da partida estamos (Leste no início, Sul depois). Por ora só localize: mais adiante veremos para que serve."))}
{piece('<span class="pst">' + stick(10000) + stick(1000) + stick(100) + '</span>', tr("Los palitos", "The sticks", "Os palitos"), tr(": son el «dinero» del juego. Cada palito vale una cantidad distinta según su color y sus puntitos, y sirven para llevar la cuenta de los puntos de cada jugador.", ": are the game’s “money”. Each stick is worth a different amount depending on its colour and its dots, and they keep track of each player’s points.", ": são o «dinheiro» do jogo. Cada palito vale uma quantia diferente conforme a cor e os pontinhos, e servem para contar os pontos de cada jogador."))}
{piece(f'<img class="pwide" src="{A}/illustrations/dados-light.svg" alt="">', tr("Los dados", "The dice", "Os dados"), tr(": son dos dados normales. Se tiran al empezar para decidir por qué lado de la mesa se empiezan a repartir las fichas.", ": are two ordinary dice. They are rolled at the start to decide which side of the table tiles begin to be dealt from.", ": são dois dados comuns. São lançados no início para decidir por qual lado da mesa começam a ser distribuídas as peças."))}
</div>
<div class="example"><span class="ex-title">{tr("Los cuatro asientos", "The four seats", "Os quatro assentos")}</span>
<div class="seats4">
<div>{tiles("1z")}<span><b>{tr("Este", "East", "Leste")}</b> {tr("tú, quien empieza", "you, who starts", "você, quem começa")}</span></div>
<div>{tiles("2z")}<span><b>{tr("Sur", "South", "Sul")}</b> {tr("a tu derecha", "on your right", "à sua direita")}</span></div>
<div>{tiles("3z")}<span><b>{tr("Oeste", "West", "Oeste")}</b> {tr("enfrente", "across", "em frente")}</span></div>
<div>{tiles("4z")}<span><b>{tr("Norte", "North", "Norte")}</b> {tr("a tu izquierda", "on your left", "à sua esquerda")}</span></div>
</div></div>
''', 4)

# ---------- 4 Tiles ----------
suit = lambda c: tiles(" ".join(f"{n}{c}" for n in range(1, 10)))
page(f'''
<h2>{tr("Las fichas", "The tiles", "As peças")}</h2>
<p>{tr("Hay <b>34 clases</b> de ficha y <b>4 copias</b> de cada una: <b>136</b> en total. Tienen una cara con su dibujo y un dorso de color.", "There are <b>34 kinds</b> of tile and <b>4 copies</b> of each: <b>136</b> in all. Each has a face with its picture and a coloured back.", "Há <b>34 tipos</b> de peça e <b>4 cópias</b> de cada: <b>136</b> no total. Cada uma tem uma face com o desenho e um verso colorido.")}</p>
<h3>{tr("Tres palos numerados", "Three numbered suits", "Três naipes numerados")}</h3>
<div class="suitrow"><span class="sn">Manzu <small>{tr("números", "numbers", "números")}</small></span>{suit("m")}</div>
<div class="suitrow"><span class="sn">Pinzu <small>{tr("círculos", "circles", "círculos")}</small></span>{suit("p")}</div>
<div class="suitrow"><span class="sn">Souzu <small>{tr("bambúes", "bamboo", "bambus")}</small></span>{suit("s")}</div>
<h3>{tr("Honores: sin número", "Honors: no number", "Honras: sem número")}</h3>
<div class="suitrow"><span class="sn">{tr("Vientos", "Winds", "Ventos")}</span>{tiles("1z 2z 3z 4z")}<span class="cap">{tr("Este · Sur · Oeste · Norte", "East · South · West · North", "Leste · Sul · Oeste · Norte")}</span></div>
<div class="suitrow"><span class="sn">{tr("Dragones", "Dragons", "Dragões")}</span>{tiles("7z 5z 6z")}<span class="cap">{tr("Haku (blanco) · Hatsu (verde) · Chun (rojo)", "Haku (white) · Hatsu (green) · Chun (red)", "Haku (branco) · Hatsu (verde) · Chun (vermelho)")}</span></div>
<h3>{tr("Cincos rojos", "Red fives", "Cincos vermelhos")}</h3>
<div class="suitrow"><span class="sn">Aka</span>{tiles("0m 0p 0s")}<span class="cap">{tr("Cada uno vale un bonus", "Each one is worth a bonus", "Cada um vale um bônus")}</span></div>
{callout(tr("Los cinco rojos (<i>aka</i>) cuentan como un 5 normal, pero cada uno que tengas en tu mano suma <b>1 han</b> (punto de valor) al ganar. Aparecen junto a los demás cincos, no en lugar de ellos.", "The red fives (<i>aka</i>) count as a normal 5, but each one in your hand adds <b>1 han</b> (a value point) when you win. They come along with the other fives, not instead of them.", "Os cincos vermelhos (<i>aka</i>) contam como um 5 normal, mas cada um na sua mão soma <b>1 han</b> (ponto de valor) ao ganhar. Aparecem junto com os outros cincos, não no lugar deles."))}
{example(tr("Cuatro copias", "Four copies", "Quatro cópias"), f'<div class="hand">{tiles("5p 5p 5p 5p")}</div><p class="ex-note">{tr("Hay cuatro 5 de círculos idénticos: así puedes ir contando cuántos quedan.", "There are four identical 5 of circles: that is how you can keep track of how many are left.", "Há quatro 5 de círculos idênticos: assim você pode contar quantos restam.")}</p>')}
''', 5)

# ---------- 5 Setup ----------
ORD = [tr("1<sup>ª</sup>", "1<sup>st</sup>", "1<sup>º</sup>"), tr("2<sup>ª</sup>", "2<sup>nd</sup>", "2<sup>º</sup>"), tr("3<sup>ª</sup>", "3<sup>rd</sup>", "3<sup>º</sup>"), tr("4<sup>ª</sup>", "4<sup>th</sup>", "4<sup>º</sup>"), tr("5<sup>ª</sup>", "5<sup>th</sup>", "5<sup>º</sup>"), tr("6<sup>ª</sup>", "6<sup>th</sup>", "6<sup>º</sup>")]
page(f'''
<h2>{tr("Preparación", "Setup", "Preparação")}</h2>
<ol class="steps">
<li><span class="ord">{ORD[0]}</span><div>{tr("<b>Mezclar.</b> Pon las 136 fichas boca abajo y que los cuatro jugadores las mezclen con las manos, hasta que nadie sepa dónde está cada una.", "<b>Shuffle.</b> Put all 136 tiles face down and have the four players mix them by hand, until nobody knows where each one is.", "<b>Misturar.</b> Ponha as 136 peças viradas para baixo e os quatro jogadores as misturam com as mãos, até ninguém saber onde está cada uma.")}</div></li>
<li><span class="ord">{ORD[1]}</span><div>{tr("<b>Armar los muros.</b> Cada jugador arma frente a sí un muro de <b>17 pilas de dos fichas</b> (34 fichas). Juntos forman un cuadrado.", "<b>Build the walls.</b> Each player builds in front of them a wall of <b>17 stacks of two tiles</b> (34 tiles). Together they form a square.", "<b>Montar os muros.</b> Cada jogador monta à sua frente um muro de <b>17 pilhas de duas peças</b> (34 peças). Juntos formam um quadrado.")}</div></li>
<li><span class="ord">{ORD[2]}</span><div>{tr("<b>Elegir al dealer.</b> Cada jugador lanza un dado: el número más alto es el <b>dealer</b>, quien juega primero y se sienta en el asiento Este.", "<b>Choose the dealer.</b> Each player rolls a die: the highest number is the <b>dealer</b>, who plays first and sits in the East seat.", "<b>Escolher o dealer.</b> Cada jogador lança um dado: o número mais alto é o <b>dealer</b>, quem joga primeiro e senta no assento Leste.")}</div></li>
<li><span class="ord">{ORD[3]}</span><div>{tr("<b>Poner el compass.</b> En el centro, con cada viento hacia su asiento, y la <b>placa del viento de ronda</b> (Este) en el borde, a la derecha del dealer.", "<b>Place the compass.</b> In the centre, with each wind facing its seat, and the <b>round-wind plate</b> (East) at the edge, to the dealer’s right.", "<b>Colocar o compass.</b> No centro, com cada vento voltado para o seu assento, e a <b>placa do vento da rodada</b> (Leste) na borda, à direita do dealer.")}</div></li>
<li><span class="ord">{ORD[4]}</span><div>{tr("<b>Abrir el muro.</b> El dealer lanza dos dados. La suma se busca en los numeritos del compass: te dice <b>qué lado</b> abrir. En ese muro cuenta tantas pilas como la suma y ahí se corta.", "<b>Open the wall.</b> The dealer rolls two dice. Find the total among the small numbers on the compass: it tells you <b>which side</b> to open. On that wall count as many stacks as the total and cut there.", "<b>Abrir o muro.</b> O dealer lança dois dados. A soma se procura nos números do compass: ela diz <b>qual lado</b> abrir. Nesse muro conte tantas pilhas quanto a soma e corte ali.")}</div></li>
<li><span class="ord">{ORD[5]}</span><div>{tr("<b>Repartir.</b> Desde el corte, empezando por el dealer: <b>4 fichas</b> cada uno, tres veces; luego <b>1</b> más cada uno. Todos quedan con 13; el dealer roba una última y tiene 14.", "<b>Deal.</b> From the cut, starting with the dealer: <b>4 tiles</b> each, three times; then <b>1</b> more each. Everyone ends with 13; the dealer draws one last tile and has 14.", "<b>Distribuir.</b> A partir do corte, começando pelo dealer: <b>4 peças</b> cada um, três vezes; depois <b>1</b> a mais cada um. Todos ficam com 13; o dealer compra uma última e tem 14.")}</div></li>
</ol>
<div class="side">
<img class="compassimg" src="{A}/illustrations/consola-top-light.svg" alt="">
<div class="side-text">{callout(tr("<b>El muro muerto.</b> Desde el corte se apartan <b>siempre 7 pilas (14 fichas)</b>: son el muro muerto, fuera de juego salvo en ocasiones especiales. Si el corte cae cerca del final de un muro, se sigue contando en el muro de al lado.", "<b>The dead wall.</b> From the cut, <b>always 7 stacks (14 tiles)</b> are put aside: that is the dead wall, out of play except on special occasions. If the cut falls near the end of a wall, the count carries on into the next wall.", "<b>O muro morto.</b> A partir do corte separam-se <b>sempre 7 pilhas (14 peças)</b>: é o muro morto, fora de jogo exceto em ocasiões especiais. Se o corte cai perto do fim de um muro, a contagem continua no muro ao lado."))}
{callout(tr("<b>La dora.</b> En la 3ª pila del muro muerto se voltea la ficha de arriba: es el <b>indicador de dora</b>. La ficha siguiente a esa vale un bonus para quien la tenga en su mano.", "<b>The dora.</b> On the 3rd stack of the dead wall the top tile is turned face up: that is the <b>dora indicator</b>. The tile that follows it is worth a bonus to whoever holds it.", "<b>A dora.</b> Na 3ª pilha do muro morto vira-se a peça de cima: é o <b>indicador de dora</b>. A peça seguinte a essa vale um bônus para quem a tiver na mão."))}</div></div>
''', 6)

# ---------- 6 Turn ----------
page(f'''
<h2>{tr("Tu turno", "Your turn", "A sua vez")}</h2>
<p>{tr("Empieza el dealer y sigue el turno a su derecha, en sentido antihorario. En tu turno haces <b>tres cosas</b>:", "The dealer starts and the turn passes to their right, counter-clockwise. On your turn you do <b>three things</b>:", "O dealer começa e a vez segue para a direita, no sentido anti-horário. Na sua vez você faz <b>três coisas</b>:")}</p>
<div class="turnflow">
<div class="tcard"><b>{tr("1 · Robas", "1 · You draw", "1 · Você compra")}</b><p>{tr("Tomas la siguiente ficha del muro. Ahora tienes <b>14</b> fichas.", "You take the next tile from the wall. Now you have <b>14</b> tiles.", "Você pega a próxima peça do muro. Agora tem <b>14</b> peças.")}</p>{tiles("8s")}</div>{arrow()}
<div class="tcard"><b>{tr("2 · Decides", "2 · You decide", "2 · Você decide")}</b><p>{tr("¿Te acerca a 4 grupos y 1 pareja? Si no sirve, será la que botes.", "Does it bring you closer to 4 sets and 1 pair? If not, it will be the one you discard.", "Ela aproxima você de 4 grupos e 1 par? Se não serve, será a que você descarta.")}</p></div>{arrow()}
<div class="tcard"><b>{tr("3 · Botas", "3 · You discard", "3 · Você descarta")}</b><p>{tr("Dejas una ficha boca arriba en tu río. Vuelves a tener <b>13</b>.", "You leave one tile face up in your pond. You are back to <b>13</b>.", "Você deixa uma peça virada para cima no seu rio. Volta a ter <b>13</b>.")}</p>{tiles("9p")}</div>
</div>
<h3>{tr("Ordena tu mano", "Sort your hand", "Ordene a sua mão")}</h3>
<p>{tr("Ordenar sirve para ver tus grupos de un vistazo: junta cada palo (manzu, pinzu, souzu) y deja los honores juntos, con los iguales pegados. Puedes reordenarla como quieras mientras sea fácil ver lo que tienes.", "Sorting lets you see your sets at a glance: keep each suit (manzu, pinzu, souzu) together and the honors together, with identical tiles side by side. You can arrange it however you like as long as it is easy to see what you have.", "Ordenar serve para ver seus grupos de relance: junte cada naipe (manzu, pinzu, souzu) e deixe as honras juntas, com as iguais coladas. Você pode reordenar como quiser, desde que seja fácil ver o que tem.")}</p>
{example(tr("Ejemplo de turno", "Example turn", "Exemplo de vez"), f'<p class="ex-text">{tr("Tu mano tiene tres grupos, dos parejas… y una ficha suelta, el 9 de círculos. Es la que botas.", "Your hand has three sets, two pairs… and one loose tile, the 9 of circles. That is the one you discard.", "Sua mão tem três grupos, dois pares… e uma peça solta, o 9 de círculos. É a que você descarta.")}</p>' + groups([("1m 2m 3m", G, "gr"), ("4p 5p 6p", G, "gr"), ("3s 4s 5s", G, "gr"), ("6z 6z", PR, "pl"), ("1z 1z", PR, "pl"), ("9p!", tr("Sobra", "Spare", "Sobra"), "sp")]) + f'<p class="ex-text">{tr("Ahora robas un Chun (中): con tus dos Chun forma un trío y la mano se completa.", "Now you draw a Chun (中): with your two Chun it makes a triplet and the hand is complete.", "Agora você compra um Chun (中): com os seus dois Chun forma um trio e a mão se completa.")}</p>')}
{callout(tr("Los descartes son <b>información</b>: miras lo que botan los demás para saber qué fichas ya no quedan y qué están buscando.", "Discards are <b>information</b>: watch what the others throw to know which tiles are gone and what they are looking for.", "Os descartes são <b>informação</b>: observe o que os outros descartam para saber quais peças já não restam e o que estão buscando."))}
''', 7)

# ---------- 7 Sets ----------
page(f'''
<h2>{tr("Grupos y mano completa", "Sets and a complete hand", "Grupos e mão completa")}</h2>
<p>{tr("Una mano completa son <b>4 grupos y 1 pareja</b>. Hay dos clases de grupo.", "A complete hand is <b>4 sets and 1 pair</b>. There are two kinds of set.", "Uma mão completa são <b>4 grupos e 1 par</b>. Há dois tipos de grupo.")}</p>
<h3>{tr("Secuencia", "Sequence", "Sequência")}</h3>
<p>{tr("Tres números <b>seguidos del mismo palo</b>. Los vientos y dragones no forman secuencias.", "Three numbers <b>in a row from the same suit</b>. Winds and dragons cannot form sequences.", "Três números <b>seguidos do mesmo naipe</b>. Ventos e dragões não formam sequências.")}</p>
<div class="hand">{tiles("4p 5p 6p")}<span class="gap"></span>{tiles("2s 3s 4s")}<span class="gap"></span>{tiles("7m 8m 9m")}</div>
<h3>{tr("Trío", "Triplet", "Trio")}</h3>
<p>{tr("Tres fichas <b>idénticas</b>. Aquí sí sirven los vientos y los dragones.", "Three <b>identical</b> tiles. Winds and dragons do work here.", "Três peças <b>idênticas</b>. Aqui ventos e dragões servem.")}</p>
<div class="hand">{tiles("6z 6z 6z")}<span class="gap"></span>{tiles("7s 7s 7s")}<span class="gap"></span>{tiles("2m 2m 2m")}</div>
<h3>{tr("Pareja", "Pair", "Par")}</h3>
<p>{tr("Dos fichas idénticas. Toda mano completa lleva exactamente una.", "Two identical tiles. Every complete hand has exactly one.", "Duas peças idênticas. Toda mão completa tem exatamente um.")}</p>
<div class="hand">{tiles("1z 1z")}<span class="gap"></span>{tiles("5m 5m")}</div>
{example(tr("Las cuentas", "The count", "A conta"), f'<p class="sum">4 × 3 + 2 = <b>14</b></p><p class="ex-note">{tr("13 fichas en la mano más la que robas: 14. Los grupos y la pareja usan las 14.", "13 tiles in hand plus the one you draw: 14. The sets and the pair use all 14.", "13 peças na mão mais a que você compra: 14. Os grupos e o par usam as 14.")}</p>')}
{callout(tr("<b>Tenpai</b> es estar a <b>una sola ficha</b> de ganar. <b>Noten</b> es lo contrario. Ambos importan cuando el muro se agota sin ganador: quienes están en tenpai cobran de los noten (3 000 puntos en total).", "<b>Tenpai</b> means being <b>one tile</b> away from winning. <b>Noten</b> is the opposite. Both matter when the wall runs out with no winner: those in tenpai collect from the noten ones (3,000 points in total).", "<b>Tenpai</b> é estar a <b>uma só peça</b> de ganhar. <b>Noten</b> é o contrário. Ambos importam quando o muro acaba sem vencedor: quem está em tenpai recebe dos noten (3.000 pontos no total)."))}
''', 8)

# ---------- 8 Calls ----------
page(f'''
<h2>{tr("Llamadas: chii, pon y kan", "Calls: chii, pon and kan", "Chamadas: chii, pon e kan")}</h2>
<p>{tr("Además de robar del muro, puedes tomar la ficha que acaba de botar otro jugador: eso se llama <b>llamada</b>. Dices el nombre en voz alta, tomas la ficha y colocas el grupo <b>boca arriba</b>, con la ficha tomada <b>girada hacia quien la botó</b>.", "Besides drawing from the wall, you may take the tile another player has just thrown: that is called a <b>call</b>. You say the name out loud, take the tile and lay the set <b>face up</b>, with the taken tile <b>turned toward whoever threw it</b>.", "Além de comprar do muro, você pode pegar a peça que outro jogador acabou de descartar: isso se chama <b>chamada</b>. Você diz o nome em voz alta, pega a peça e coloca o grupo <b>virado para cima</b>, com a peça pega <b>girada para quem a descartou</b>.")}</p>
{example(tr("Chii · una secuencia", "Chii · a sequence", "Chii · uma sequência"), f'<div class="hand">{tiles("4p 6p")}{arrow("small")}{tiles("5p~")}<span class="eq">=</span>{tiles("4p 5p~ 6p")}</div><p class="ex-note">{tr("Solo puedes tomar la ficha del jugador que juega justo antes que tú (tu izquierda), y solo para formar una secuencia con dos fichas tuyas.", "You can only take the tile from the player who plays right before you (your left), and only to make a sequence with two of your tiles.", "Você só pode pegar a peça do jogador que joga logo antes de você (sua esquerda), e só para formar uma sequência com duas das suas peças.")}</p>')}
{example(tr("Pon · un trío", "Pon · a triplet", "Pon · um trio"), f'<div class="hand">{tiles("6z 6z")}{arrow("small")}{tiles("6z~")}<span class="eq">=</span>{tiles("6z 6z~ 6z")}</div><p class="ex-note">{tr("Con dos fichas iguales puedes tomar la tercera que bote <b>cualquier</b> jugador. El turno salta a ti.", "With two identical tiles you can take the third one that <b>any</b> player throws. The turn jumps to you.", "Com duas peças iguais você pode pegar a terceira que <b>qualquer</b> jogador descartar. A vez pula para você.")}</p>')}
{example(tr("Kan · un cuarteto", "Kan · a quad", "Kan · uma quadra"), f'<div class="hand">{tiles("3s 3s 3s")}{arrow("small")}{tiles("3s~")}<span class="eq">=</span>{tiles("3s 3s 3s 3s~")}</div><p class="ex-note">{tr("Con tres iguales tomas la cuarta. Un kan agrega una ficha extra: robas una de reposición del muro muerto y se revela otro indicador de dora.", "With three identical tiles you take the fourth. A kan adds an extra tile: you draw a replacement from the dead wall and another dora indicator is revealed.", "Com três iguais você pega a quarta. Um kan acrescenta uma peça extra: você compra uma de reposição do muro morto e outro indicador de dora é revelado.")}</p>')}
{callout(tr("Al hacer una llamada tu mano pasa de <b>cerrada</b> a <b>abierta</b>: ya no puedes declarar riichi y algunos yaku valen menos o no cuentan. A cambio, avanzas más rápido.", "Making a call turns your hand from <b>closed</b> to <b>open</b>: you can no longer declare riichi and some yaku are worth less or do not count. In return, you move faster.", "Ao fazer uma chamada sua mão passa de <b>fechada</b> a <b>aberta</b>: você não pode mais declarar riichi e alguns yaku valem menos ou não contam. Em troca, avança mais rápido."))}
''', 9)

# ---------- 9 Winning ----------
page(f'''
<h2>{tr("Ganar: ron, tsumo y yaku", "Winning: ron, tsumo and yaku", "Ganhar: ron, tsumo e yaku")}</h2>
<p>{tr("Ganas cuando completas tu mano <b>y</b> cumples al menos un <b>yaku</b>, una condición que la mano debe cumplir. Hay dos formas de ganar:", "You win when you complete your hand <b>and</b> meet at least one <b>yaku</b>, a condition the hand must satisfy. There are two ways to win:", "Você ganha quando completa a mão <b>e</b> cumpre ao menos um <b>yaku</b>, uma condição que a mão deve cumprir. Há duas formas de ganhar:")}</p>
<div class="two">
<div class="tcard wide"><b>Tsumo</b><p>{tr("Ganas con una ficha que <b>tú mismo robaste</b>. Pagan los tres rivales.", "You win with a tile <b>you drew yourself</b>. All three rivals pay.", "Você ganha com uma peça que <b>você mesmo comprou</b>. Os três rivais pagam.")}</p></div>
<div class="tcard wide"><b>Ron</b><p>{tr("Ganas con la ficha que <b>botó otro jugador</b>. Paga solo quien la botó.", "You win on the tile <b>another player threw</b>. Only the one who threw it pays.", "Você ganha com a peça que <b>outro jogador descartou</b>. Só quem a descartou paga.")}</p></div>
</div>
<p>{tr("Al ganar dices «Tsumo» o «Ron» y muestras tu mano boca arriba.", "When you win you say “Tsumo” or “Ron” and show your hand face up.", "Ao ganhar você diz «Tsumo» ou «Ron» e mostra a mão virada para cima.")}</p>
<h3>{tr("Tres yaku para empezar", "Three yaku to start with", "Três yaku para começar")}</h3>
{example("Tanyao", f'<div class="hand">{tiles("2m 3m 4m")}{tiles("5p 6p 7p")}{tiles("3s 4s 5s")}{tiles("6s 6s 6s")}{tiles("8p 8p")}</div><p class="ex-note">{tr("Solo fichas del 2 al 8: sin honores ni extremos (1 o 9).", "Only tiles from 2 to 8: no honors and no ends (1 or 9).", "Só peças de 2 a 8: sem honras nem pontas (1 ou 9).")}</p>')}
{example("Yakuhai", f'<div class="hand">{tiles("6z 6z 6z")}<span class="gap"></span>{tiles("1z 1z 1z")}</div><p class="ex-note">{tr("Un trío de dragones, del viento de la ronda o de tu viento de asiento.", "A triplet of dragons, of the round wind or of your seat wind.", "Um trio de dragões, do vento da rodada ou do seu vento do assento.")}</p>')}
<p>{tr("<b>Riichi.</b> Con la mano cerrada y a una ficha de ganar (tenpai), puedes declarar «Riichi»: botas la ficha <b>acostada de lado</b> y pones un <b>palito de 1 000</b> en la ranura del compass. Desde entonces no cambias tu mano: solo robas y botas lo que robas.", "<b>Riichi.</b> With a closed hand one tile from winning (tenpai), you may declare “Riichi”: you throw the tile <b>lying on its side</b> and put a <b>1,000-point stick</b> in the compass slot. From then on you do not change your hand: you only draw and throw what you draw.", "<b>Riichi.</b> Com a mão fechada e a uma peça de ganhar (tenpai), você pode declarar «Riichi»: descarta a peça <b>deitada de lado</b> e põe um <b>palito de 1.000</b> no encaixe do compass. Daí em diante você não muda a mão: só compra e descarta o que comprou.")}</p>
{callout(tr("<b>Furiten.</b> Si ya botaste alguna de las fichas con las que ganarías, no puedes ganar por ron, solo por tsumo. Nadie te avisa: tienes que darte cuenta tú.", "<b>Furiten.</b> If you have already thrown any of the tiles you would win on, you cannot win by ron, only by tsumo. Nobody warns you: you have to notice it yourself.", "<b>Furiten.</b> Se você já descartou alguma das peças com que ganharia, não pode ganhar por ron, só por tsumo. Ninguém avisa: você tem que perceber."))}
''', 10)

# ---------- 10 Points ----------
page(f'''
<h2>{tr("Puntos y palitos", "Points and sticks", "Pontos e palitos")}</h2>
<p>{tr("Los puntos se llevan en <b>palitos de colores</b>. Cada palito <b>equivale</b> a una cantidad fija. Cada jugador empieza con 25 000 puntos y los guarda en su cajón.", "Points are kept as <b>colour-coded sticks</b>. Each stick is <b>worth</b> a fixed amount. Each player starts with 25,000 points and keeps them in their drawer.", "Os pontos são guardados em <b>palitos coloridos</b>. Cada palito <b>equivale</b> a uma quantia fixa. Cada jogador começa com 25.000 pontos e os guarda na gaveta.")}</p>
<div class="sticks">
<div class="srow">{stick(10000)}<b>10 000</b><span>{tr("rojo", "red", "vermelho")}</span></div>
<div class="srow">{stick(5000)}<b>5 000</b><span>{tr("amarillo", "yellow", "amarelo")}</span></div>
<div class="srow">{stick(1000)}<b>1 000</b><span>{tr("azul", "blue", "azul")}</span></div>
<div class="srow">{stick(500)}<b>500</b><span>{tr("verde", "green", "verde")}</span></div>
<div class="srow">{stick(100)}<b>100</b><span>{tr("blanco", "white", "branco")}</span></div>
</div>
<h3>{tr("Contar la mano", "Counting the hand", "Contar a mão")}</h3>
<p>{tr("Al ganar se cuenta el valor de la mano con <b>han</b> (yaku y dora) y <b>fu</b> (minipuntos). Juntos dan los puntos; en la sección de puntajes del sitio hay tablas completas.", "When you win, the hand’s value is counted with <b>han</b> (yaku and dora) and <b>fu</b> (mini points). Together they give the points; the site’s scoring section has full tables.", "Ao ganhar, conta-se o valor da mão com <b>han</b> (yaku e dora) e <b>fu</b> (minipontos). Juntos dão os pontos; na seção de pontuação do site há tabelas completas.")}</p>
{example(tr("Pagar 3 900 puntos", "Paying 3,900 points", "Pagar 3.900 pontos"), f'<div class="pay"><div class="pg"><div>{sticks([(1000,3)])}</div><span>3 × 1 000</span></div><b>+</b><div class="pg"><div>{sticks([(500,1)])}</div><span>1 × 500</span></div><b>+</b><div class="pg"><div>{sticks([(100,4)])}</div><span>4 × 100</span></div><b class="tot">= 3 900</b></div><p class="ex-note">{tr("Quien paga deja los palitos <b>sobre la mesa</b> y el ganador los <b>toma</b>.", "The payer leaves the sticks <b>on the table</b> and the winner <b>takes</b> them.", "Quem paga deixa os palitos <b>sobre a mesa</b> e o vencedor os <b>pega</b>.")}</p>')}
<ul class="plain"><li>{tr("<b>Ron:</b> paga quien botó la ficha ganadora.", "<b>Ron:</b> the one who threw the winning tile pays.", "<b>Ron:</b> paga quem descartou a peça vencedora.")}</li><li>{tr("<b>Tsumo:</b> pagan los tres rivales.", "<b>Tsumo:</b> all three rivals pay.", "<b>Tsumo:</b> os três rivais pagam.")}</li><li>{tr("El <b>dealer</b> cobra y paga más que los demás.", "The <b>dealer</b> collects and pays more than the others.", "O <b>dealer</b> recebe e paga mais que os demais.")}</li></ul>
{callout(tr("Los puntos son lo que decide la partida: cuando termina, se comparan y <b>gana quien tiene más</b>.", "Points decide the game: when it ends they are compared and <b>whoever has the most wins</b>.", "Os pontos decidem a partida: quando termina, são comparados e <b>ganha quem tem mais</b>."))}
''', 11)

# ---------- 11 Rounds ----------
page(f'''
<h2>{tr("Rondas y fin de partida", "Rounds and the end of the game", "Rodadas e fim da partida")}</h2>
<p>{tr("La partida se juega <b>mano tras mano</b>. Cada mano termina cuando alguien gana o cuando el muro se agota sin ganador.", "The game is played <b>hand after hand</b>. Each hand ends when someone wins or when the wall runs out with no winner.", "A partida é jogada <b>mão após mão</b>. Cada mão termina quando alguém ganha ou quando o muro acaba sem vencedor.")}</p>
<div class="rounds">
<div class="rcard"><span class="plate">東</span><b>{tr("Ronda Este", "East round", "Rodada Leste")}</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
<div class="rcard"><span class="plate">南</span><b>{tr("Ronda Sur", "South round", "Rodada Sul")}</b><span class="hands"><i>1</i><i>2</i><i>3</i><i>4</i></span></div>
</div>
<p>{tr("Una <b>ronda</b> son cuatro manos, una por cada dealer. La placa del borde marca el <b>viento de la ronda</b>: Este primero, Sur después.", "A <b>round</b> is four hands, one for each dealer. The plate on the edge shows the <b>round wind</b>: East first, South after.", "Uma <b>rodada</b> são quatro mãos, uma para cada dealer. A placa da borda marca o <b>vento da rodada</b>: Leste primeiro, Sul depois.")}</p>
<h3>{tr("Al terminar cada mano", "When each hand ends", "Ao terminar cada mão")}</h3>
<ul class="plain">
<li>{tr("<b>El dealer gana:</b> sigue de dealer y los vientos <b>no cambian</b>.", "<b>The dealer wins:</b> they stay dealer and the winds <b>do not change</b>.", "<b>O dealer ganha:</b> continua dealer e os ventos <b>não mudam</b>.")}</li>
<li>{tr("<b>Gana otro (o nadie gana y el dealer no está en tenpai):</b> el <b>compass gira</b>: cada jugador toma el siguiente viento de asiento y el dealer pasa a quien está a su derecha.", "<b>Someone else wins (or nobody wins and the dealer is not in tenpai):</b> the <b>compass turns</b>: each player takes the next seat wind and the dealer passes to the player on their right.", "<b>Outro ganha (ou ninguém ganha e o dealer não está em tenpai):</b> o <b>compass gira</b>: cada jogador toma o próximo vento de assento e o dealer passa a quem está à sua direita.")}</li>
<li>{tr("<b>Vuelta completa:</b> la ronda pasa a Sur y se voltea la placa.", "<b>A full turn:</b> the round moves to South and the plate is flipped.", "<b>Volta completa:</b> a rodada passa a Sul e a placa é virada.")}</li>
</ul>
<h3>{tr("Largo de la partida", "Length of the game", "Duração da partida")}</h3>
{example("Tonpuusen / Hanchan", f'<div class="two"><div class="tcard wide"><b>Tonpuusen</b><p>{tr("Partida corta: solo la ronda Este.", "Short game: East round only.", "Partida curta: só a rodada Leste.")}</p></div><div class="tcard wide"><b>Hanchan</b><p>{tr("Partida normal: rondas Este y Sur.", "Standard game: East and South rounds.", "Partida normal: rodadas Leste e Sul.")}</p></div></div>')}
<div class="podium"><img class="mark" src="{A}/rincon-mark.svg" alt=""><p>{tr("Al final se cuentan los palitos de cada jugador. <b>Gana quien tiene más puntos.</b>", "At the end each player’s sticks are counted. <b>Whoever has the most points wins.</b>", "No fim contam-se os palitos de cada jogador. <b>Ganha quem tem mais pontos.</b>")}</p></div>
''', 12)

# ---------- 12-13 Glossary ----------
half = (len(entries) + 1) // 2
def gl_page(items, head, num):
    gl_html = "".join(f'<dt id="g-{eid}">{t}</dt><dd>{m}</dd>' for eid, t, m, _ in items)
    page(f'''{head}<dl class="gloss">{gl_html}</dl>''', num, cls="gl")
gl_page(entries[:half], f'<h2>{tr("Diccionario", "Dictionary", "Dicionário")}</h2><p class="small">{tr("Las palabras de esta guía, en lenguaje simple.", "The words of this guide, in plain language.", "As palavras deste guia, em linguagem simples.")}</p>', 13)
gl_page(entries[half:], f'<h2>{tr("Diccionario", "Dictionary", "Dicionário")}</h2><p class="small">{tr("Continuación.", "Continued.", "Continuação.")}</p>', 14)

# ---------- 14 Back ----------
page(f'''
<div class="back">
<img class="mark" src="{A}/rincon-mark.svg" alt="">
<h2>{tr("Sigue aprendiendo", "Keep learning", "Continue aprendendo")}</h2>
<p>{tr("Esta guía acompaña al sitio <b>Rincón Riichi</b>. Allí puedes ver las mismas ideas en animaciones, probar cada paso y practicar con ejercicios cortos.", "This guide goes with the <b>Rincón Riichi</b> site. There you can see the same ideas in animations, try each step and practise with short drills.", "Este guia acompanha o site <b>Rincón Riichi</b>. Lá você pode ver as mesmas ideias em animações, experimentar cada passo e praticar com exercícios curtos.")}</p>
<ul class="plain big">
<li>{tr("<b>Tutorial</b> — la mesa y una mano completa, paso a paso.", "<b>Tutorial</b> — the table and a complete hand, step by step.", "<b>Tutorial</b> — a mesa e uma mão completa, passo a passo.")}</li>
<li>{tr("<b>Fichas, tipos de espera y yakus</b> — referencias con ejemplos.", "<b>Tiles, wait types and yaku</b> — references with examples.", "<b>Peças, tipos de espera e yakus</b> — referências com exemplos.")}</li>
<li>{tr("<b>Practicar</b> — reconocer fichas, contar puntos y más, con modo rápido.", "<b>Practise</b> — recognise tiles, count points and more, with a quick mode.", "<b>Praticar</b> — reconhecer peças, contar pontos e mais, com modo rápido.")}</li>
</ul>
<p class="url">rincon-riichi.vercel.app</p>
</div>''', 15, cls="backpage")

CSS = r"""
@page { size: 6.77in 8.03in; margin: 0 }
* { box-sizing: border-box }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact }
.gloss { column-fill: balance }
.center { text-align: center; font-size: 34pt }
.pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt 18pt; margin-top: 4pt }
.pcell { text-align: center } .ppic { height: .5in; display: flex; align-items: center; justify-content: center; gap: 2pt; margin-bottom: 4pt }
.pcell p { margin: 0; font-size: 9pt; line-height: 1.28 } .pwide { height: .55in; width: auto } .plate.big { width: 40pt; height: 27pt; font-size: 20pt }
.pst { display: flex; flex-direction: column; gap: 2.5pt; align-items: center } .pst .stick { width: .85in; height: auto }
.seats4 { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt 14pt } .seats4 > div { display: flex; align-items: center; gap: 6pt; font-size: 9pt } .seats4 .tl { height: .42in }
#p5 h3 { margin: 7pt 0 3pt } #p5 .callout { margin: 5pt auto } #p5 .example { margin: 11pt 0 4pt; padding: 10pt 12pt 5pt } #p5 .suitrow .tl { height: .38in } #p5 > p { margin-bottom: 4pt }
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
.sticks { display: grid; gap: 3pt; margin: 4pt 0 } .srow { display: grid; grid-template-columns: 1.6in 0.8in 1fr; align-items: center; gap: 8pt; font-size: 9.6pt } .srow b { text-align: right; font-size: 11pt } .srow span { font-style: italic; color: #6b5b3a } .stick { display: block } .sticks .stick { width: 1.5in; height: auto } .pay .stick { width: .9in; height: auto }
.pay { display: flex; align-items: center; justify-content: center; gap: 8pt; font-size: 8.8pt } .pg { display: flex; flex-direction: column; align-items: center; gap: 2pt } .pg > div { display: flex; flex-direction: column; gap: 2.5pt; align-items: flex-start } .pay > b { white-space: nowrap; font-family: Cochin, Georgia, serif; font-size: 16pt; color: #4a3a8c } .pay .tot { color: #a8322b }
/* rounds */
.rounds { display: flex; gap: 10pt; justify-content: center; margin: 6pt 0 } .rcard { display: flex; align-items: center; gap: 7pt; padding: 6pt 10pt; border: 1pt solid #4a3a8c; border-radius: 12pt; background: rgba(255,255,255,.55) } .plate { display: grid; place-items: center; width: 24pt; height: 17pt; border: 1.4pt solid #2b2540; border-radius: 4pt; background: #f08a30; color: #fff6e5; font: 700 13pt 'Hiragino Mincho ProN', serif } .hands { display: flex; gap: 2pt } .hands i { display: grid; place-items: center; width: 13pt; height: 13pt; border-radius: 3pt; background: #f2b42c; font-style: normal; font-size: 8pt; font-weight: 700 }
.podium { display: flex; gap: 8pt; align-items: center; margin-top: 8pt; padding: 7pt 10pt; border: 1.4pt solid #2b2540; border-radius: 10pt; background: #f9d77a } .podium .mark { width: .5in; flex: none } .podium span { font-size: 22pt } .podium p { margin: 0 }
/* glossary */
.gl h2 { margin-bottom: 4pt } .gloss { columns: 2; column-gap: 16pt; margin: 6pt 0 0; font-size: 8.1pt; line-height: 1.3 } .gloss dt { font-family: Cochin, Georgia, serif; font-size: 10.6pt; color: #4a3a8c; margin-top: 4pt; break-after: avoid } .gloss dd { margin: 0 0 2pt; break-inside: avoid }
/* back */
.backpage { display: grid; place-items: center } .back { text-align: center; max-width: 4.8in } .back .mark { width: .9in } .back h2 { font-size: 34pt } .back .plain { text-align: left; display: inline-block } .big li { font-size: 11pt }
.url { margin-top: 12pt; padding: 6pt 16pt; display: inline-block; background: #4a3a8c; color: #fff; font: 700 12pt 'Avenir Next', Helvetica, sans-serif; border-radius: 99pt }
"""
html = f'<!doctype html><html lang="{LANG}"><head><meta charset="utf-8"><title>{TITLES[LANG]} · Rincón Riichi</title><style>{CSS}</style></head><body>{"".join(pages)}<script>document.title=[...document.querySelectorAll(".page")].map((p,i)=>p.scrollHeight>p.clientHeight+2?("P"+(i+1)):"").filter(Boolean).join(",")||"ok"</script></body></html>'
OUT_HTML.write_text(html, encoding="utf8")
OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
_dom = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--virtual-time-budget=8000", "--dump-dom", f"file://{OUT_HTML}"], capture_output=True, text=True).stdout
_m = re.search(r"<title>(.*?)</title>", _dom, re.S)
print(LANG, "overflowing pages:", _m.group(1).split(" · ")[-1] if _m else "?")
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT_PDF}", "--virtual-time-budget=20000", f"file://{OUT_HTML}"], check=True, capture_output=True)
import fitz
tmp1 = OUT_PDF.with_suffix(".a.pdf"); tmp2 = OUT_PDF.with_suffix(".b.pdf")
doc = fitz.open(OUT_PDF); doc.set_metadata({"title": TITLES[LANG], "author": "Rincón Riichi", "subject": "Riichi Mahjong"})
doc.save(tmp1, garbage=4, deflate=True, clean=True); doc.close()
# shrink the big embedded pictures in a child process (MuPDF can abort on some Chrome resources); keep the plain version if it fails
child = subprocess.run([sys.executable, "-c", f"import fitz; d=fitz.open(r'{tmp1}'); d.rewrite_images(dpi_threshold=170, dpi_target=140, quality=82); d.save(r'{tmp2}', garbage=4, deflate=True, clean=True)"], capture_output=True)
if child.returncode == 0 and tmp2.exists() and tmp2.stat().st_size < tmp1.stat().st_size:
    tmp2.replace(OUT_PDF); tmp1.unlink()
else:
    tmp1.replace(OUT_PDF)
    if tmp2.exists(): tmp2.unlink()
print("ok", OUT_PDF, OUT_PDF.stat().st_size)
