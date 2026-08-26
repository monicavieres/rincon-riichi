const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const families = [
    { id: "manzu", tiles: ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m"] },
    { id: "pinzu", tiles: ["1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p"] },
    { id: "souzu", tiles: ["1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s"] },
    { id: "honors", tiles: ["1z", "2z", "3z", "4z", "5z", "6z", "7z"] },
    { id: "aka", tiles: ["0m", "0p", "0s"] }
];

const copy = {
    es: {
        pageTitle: "Conoce las Fichas",
        back: "← Volver",
        language: "Idioma",
        eyebrow: "Primer módulo",
        title: "Conoce las fichas por familia",
        subtitle: "Mahjong usa tres palos numerados y un grupo pequeño de honores. Aprende primero las familias; luego los patrones se vuelven mucho más fáciles de ver.",
        prev: "Anterior",
        next: "Siguiente",
        moniqueAlt: "Monique presentando fichas de mahjong",
        tileModal: {
            label: "Ficha",
            tipLabel: "Para memorizarla"
        },
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "Este",
            south: "Sur",
            west: "Oeste",
            north: "Norte",
            green: "Dragón verde",
            red: "Dragón rojo",
            white: "Dragón blanco",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        tileFacts: {
            m1: { fact: "Un carácter con la barra de arriba. Es el 1 de su palo: la más simple.", mnemonic: "Recuerda: 一 (ichi) parece una línea horizontal. Un solo trazo = el uno." },
            m2: { fact: "Dos caracteres con una barra de base. Cinco es la única con un círculo.", mnemonic: "Dos palitos cortos arriba. El 2 acaba en 'tsu', como 'dōs' (dos)." },
            m3: { fact: "Tres caracteres apilados con una barra de base.", mnemonic: "Tres trazos como un triángulo. El 3 es 'san', casi 'sun'." },
            m4: { fact: "Cuatro caracteres dentro de un recuadro. A la izquierda se ve el 4.", mnemonic: "Parece una ventana con cuatro cuadros. Cuatro esquinas = 4." },
            m5: { fact: "El único con un círculo (ro) en el centro — así lo distingues del 9.", mnemonic: "El 'ro' rojo del centro. Cinco dedos = un puño con el 'ro' en medio." },
            m6: { fact: "Seis pinceladas que forman un cuerpo con dos barritas arriba.", mnemonic: "El 6 tiene una 'cabeza' y dos patas que se separan. Como un 6 que se estira." },
            m7: { fact: "Dos trazos curvos que caen, con una base larga.", mnemonic: "Parece una banderita o un '7'. Doble caída = siete." },
            m8: { fact: "Dos trazos que se abren en 'V' sobre una base.", mnemonic: "La 'V' invertida de arriba. Ocho = 'hachi', como 'hat' que se abre." },
            m9: { fact: "El número con el círculo en el centro, justo como el 5 — se confunden.", mnemonic: "Nueve tiene el 'ro' igual que el 5: si no sabes si es 5 o 9, cuenta las barritas." },
            p1: { fact: "Un solo círculo rojo grande.", mnemonic: "Uno = un punto. Fácil: un solo círculo." },
            p2: { fact: "Dos círculos apilados.", mnemonic: "Como dos ojos o dos ruedas. Dos puntos = pareja." },
            p3: { fact: "Tres círculos en diagonal ascendente.", mnemonic: "Tres puntos subiendo la escalera. Como el 'pips' de un 3 en las cartas." },
            p4: { fact: "Cuatro círculos en cuadrado.", mnemonic: "Cuatro puntos formando un cuadro. Cada esquina es un punto." },
            p5: { fact: "Cinco círculos: cuatro en esquinas y uno al centro.", mnemonic: "El patrón de las cartas: cuatro esquinas + centro = 5." },
            p6: { fact: "Dos columnas de tres círculos.", mnemonic: "Seis puntos como los lados de un dado: dos colchones de tres." },
            p7: { fact: "Tres arriba y cuatro abajo.", mnemonic: "Siete = 3 + 4. Cuenta la fila de abajo (4) y arriba (3)." },
            p8: { fact: "Dos columnas de cuatro.", mnemonic: "Ocho = dos torres de cuatro. Como los 'huesos' de un dominó doble-4." },
            p9: { fact: "Los 9 puntos en una cuadrícula de 3x3.", mnemonic: "Nueve = el mayor. Llena todo el cuadrado: 3 filas de 3." },
            s1: { fact: "Un ave (pavo real) en lugar de bambú. Nunca se parece al resto.", mnemonic: "El 'pájaro suelto': el 1 de bambú es el único con animal. Si ves un bicho, es el 1." },
            s2: { fact: "Dos columnas de bambú con un sombrerito.", mnemonic: "Dos palitos verdes = 2. Como dos cañas." },
            s3: { fact: "Tres columnas de bambú.", mnemonic: "Tres cañas en fila = 3." },
            s4: { fact: "Cuatro columnas de bambú.", mnemonic: "Cuatro cañas = 4. Cuenta los tronquitos." },
            s5: { fact: "Cinco columnas de bambú con cabecitas.", mnemonic: "Cinco cañas = 5. Es el más 'frondoso' porque tiene más palitos." },
            s6: { fact: "Seis columnas de bambú.", mnemonic: "Seis cañas = 6. Suele tener un brillo rosa arriba." },
            s7: { fact: "Siete columnas de bambú con una cabeza en el medio.", mnemonic: "Siete cañas = 7. La 'cabeza' del centro marca el 7." },
            s8: { fact: "Ocho columnas de bambú, con brillo azul en la base.", mnemonic: "Ocho cañas = 8. Busca el brillo azul para acordarte del 8." },
            s9: { fact: "Nueve columnas de bambú, el más alto del palo en barritas.", mnemonic: "Nueve cañas = 9. Cuenta en orden ascendente: 9 es el que más palitos tiene." },
            z1: { fact: "Viento Este. En japonés 'Ton'. Se asocia al color y al inicio.", mnemonic: "Este = 'east' en inglés y 'ton'. Un sol nace por el este: es el primer viento." },
            z2: { fact: "Viento Sur. 'Nan'. Se asocia al rojo/calor.", mnemonic: "Sur = 'south'. Piensa en calor: el sur es la parte cálida, por eso tonos rojos." },
            z3: { fact: "Viento Oeste. 'Shaa'. Se asocia a la derecha.", mnemonic: "Oeste = 'west'. La 'sha' suena a 'sure' (seguro); el oeste es donde se pone el sol." },
            z4: { fact: "Viento Norte. 'Pei'. Se asocia al frío.", mnemonic: "Norte = 'north'. Frío: el norte suele asociarse a lo frío y gris." },
            z5: { fact: "Dragón verde. 'Hatsu'. El único dragón que puede parecer 'de la suerte'.", mnemonic: "Verde = 'hatsu' (hatasu, hacer). Color esmeralda: fácil de reconocer por el verde." },
            z6: { fact: "Dragón rojo. 'Chun'. El más 'poderoso' y vistoso.", mnemonic: "Rojo = 'chun'. Rojo intenso = el dragón más llamativo. Piensa: 'chu' como 'chip' rojo." },
            z7: { fact: "Dragón blanco. Se dibuja como un marco azul vacío.", mnemonic: "Blanco = vacío. El marco azul sin nada dentro: 'no hay nada', es el blanco." },
            a0m: { fact: "Aka 5 de Manzu: el cinco rojo que da dora extra.", mnemonic: "El 5 manzu pero rojo = un 5 normal con premio." },
            a0p: { fact: "Aka 5 de Pinzu: el cinco rojo de círculos.", mnemonic: "Cínco de pinzu rojo: círculos con bonus." },
            a0s: { fact: "Aka 5 de Souzu: el cinco rojo de bambú.", mnemonic: "Cinco de souzu rojo: cañas con premio." }
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Caracteres",
                desc: "Son fichas numeradas del 1 al 9. Tienen kanjis y suelen verse más difíciles al principio, pero funcionan igual que los otros palos.",
                tip: "Tip: mira el numerito pequeño de la esquina hasta que reconozcas los kanjis."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Círculos",
                desc: "También van del 1 al 9. Los círculos son muy visuales, así que suelen ser los más fáciles para empezar.",
                tip: "Tip: cuenta los círculos como si fueran puntos de una carta."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bambúes",
                desc: "Van del 1 al 9. El 1 suele ser un ave o diseño especial; del 2 al 9 se reconocen por columnas de bambú.",
                tip: "Tip: busca grupos verticales y recuerda que el 1 no se parece a los demás."
            },
            honors: {
                tab: "Honores",
                title: "Vientos y dragones",
                desc: "No tienen número. Los vientos son Este, Sur, Oeste y Norte. Los dragones son verde, rojo y blanco.",
                tip: "Tip: no forman secuencias; normalmente sirven como pares o tríos."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Cincos rojos",
                desc: "Son versiones rojas de los cincos. Se usan en muchas reglas modernas y dan valor extra si están en tu mano ganadora.",
                tip: "Tip: son cincos normales para formar grupos, pero con premio."
            }
        }
    },
    en: {
        pageTitle: "Learn the Tiles",
        back: "← Back",
        language: "Language",
        eyebrow: "First module",
        title: "Learn the tiles by family",
        subtitle: "Mahjong uses three numbered suits and a small group of honor tiles. Learn the families first; patterns become much easier to see.",
        prev: "Previous",
        next: "Next",
        moniqueAlt: "Monique presenting mahjong tiles",
        tileModal: {
            label: "Tile",
            tipLabel: "To remember it"
        },
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "East",
            south: "South",
            west: "West",
            north: "North",
            green: "Green dragon",
            red: "Red dragon",
            white: "White dragon",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        tileFacts: {
            m1: { fact: "A single character with a top bar. The simplest 1 of its suit.", mnemonic: "一 (ichi) looks like one horizontal line. One stroke = the one." },
            m2: { fact: "Two characters with a base bar. Five is the only one with a circle.", mnemonic: "Two small marks on top. 'Ni' sounds like 'knee' — two knees." },
            m3: { fact: "Three stacked characters with a base bar.", mnemonic: "Three strokes like a triangle. 'San' is one away from 'sun'." },
            m4: { fact: "Four characters inside a frame. The 4 shape sits on the left.", mnemonic: "It looks like a window with four panes. Four corners = 4." },
            m5: { fact: "The only one with a circle (ro) in the center — how you tell it from the 9.", mnemonic: "The central 'ro'. Five fingers = a fist with 'ro' in the middle." },
            m6: { fact: "Six brushstrokes forming a body with two small bars on top.", mnemonic: "The 6 has a 'head' and two legs fanning out. Like a 6 stretching." },
            m7: { fact: "Two curved strokes falling down, with a long base.", mnemonic: "Looks like a little flag or a '7'. Double drop = seven." },
            m8: { fact: "Two strokes opening into a 'V' over a base.", mnemonic: "The upside-down 'V' on top. Eight = 'hachi', the base fans open." },
            m9: { fact: "The number with a center circle, just like the 5 — they get confused.", mnemonic: "Nine has the same 'ro' as 5: if unsure, count the small bars." },
            p1: { fact: "A single large red circle.", mnemonic: "One = one dot. Simple: one circle." },
            p2: { fact: "Two circles stacked.", mnemonic: "Like two eyes or two wheels. Two dots = a pair." },
            p3: { fact: "Three circles rising diagonally.", mnemonic: "Three dots climbing the stairs. Like the 3-pip on a card." },
            p4: { fact: "Four circles in a square.", mnemonic: "Four dots forming a box. One dot in each corner." },
            p5: { fact: "Five circles: four corners and one center.", mnemonic: "The card pattern: four corners + center = 5." },
            p6: { fact: "Two columns of three circles.", mnemonic: "Six dots like die faces: two stacks of three." },
            p7: { fact: "Three on top and four below.", mnemonic: "Seven = 3 + 4. Count the bottom row (4) and the top (3)." },
            p8: { fact: "Two columns of four.", mnemonic: "Eight = two towers of four. Like a double-4 domino." },
            p9: { fact: "Nine dots in a 3x3 grid.", mnemonic: "Nine = the biggest. It fills the whole square: 3 rows of 3." },
            s1: { fact: "A bird (peacock) instead of bamboo. Never looks like the rest.", mnemonic: "The 'lone bird': the 1 bamboo is the only one with an animal. Spot it = it's the 1." },
            s2: { fact: "Two bamboo columns with a little cap.", mnemonic: "Two green sticks = 2. Like two reeds." },
            s3: { fact: "Three columns of bamboo.", mnemonic: "Three reeds in a row = 3." },
            s4: { fact: "Four columns of bamboo.", mnemonic: "Four reeds = 4. Count the little shoots." },
            s5: { fact: "Five columns of bamboo with little heads.", mnemonic: "Five reeds = 5. The leafiest one because it has the most sticks." },
            s6: { fact: "Six columns of bamboo.", mnemonic: "Six reeds = 6. Often has a pink shimmer on top." },
            s7: { fact: "Seven columns of bamboo with a head in the middle.", mnemonic: "Seven reeds = 7. The center 'head' marks the 7." },
            s8: { fact: "Eight columns of bamboo, with a blue shimmer at the base.", mnemonic: "Eight reeds = 8. Look for the blue shimmer to remember 8." },
            s9: { fact: "Nine columns of bamboo, the tallest in stick count.", mnemonic: "Nine reeds = 9. Count up: 9 is the one with the most sticks." },
            z1: { fact: "East wind. 'Ton'. Associated with color and the start.", mnemonic: "East = the rising sun. It's the first wind." },
            z2: { fact: "South wind. 'Nan'. Associated with red/heat.", mnemonic: "South = warm. Reddish tones: think heat." },
            z3: { fact: "West wind. 'Shaa'. Associated with the right side.", mnemonic: "West = where the sun sets. 'Shaa' rhymes with 'sure'." },
            z4: { fact: "North wind. 'Pei'. Associated with cold.", mnemonic: "North = cold. Grey and cold tones." },
            z5: { fact: "Green dragon. 'Hatsu'. The lucky-feeling one.", mnemonic: "Green = 'hatsu'. Emerald green: easy to spot." },
            z6: { fact: "Red dragon. 'Chun'. The most powerful and flashy.", mnemonic: "Red = 'chun'. Bright red = the flashiest dragon." },
            z7: { fact: "White dragon. Drawn as an empty blue frame.", mnemonic: "White = empty. The blue frame with nothing inside: 'no thing', it's white." },
            a0m: { fact: "Aka 5 Manzu: the red five that gives extra dora.", mnemonic: "The 5 manzu but red = a normal 5 with a bonus." },
            a0p: { fact: "Aka 5 Pinzu: the red five of circles.", mnemonic: "Red pinzu five: circles with bonus." },
            a0s: { fact: "Aka 5 Souzu: the red five of bamboo.", mnemonic: "Red souzu five: reeds with a prize." }
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Characters",
                desc: "Numbered 1 to 9. They use kanji, so they can look scary at first, but they behave just like the other suits.",
                tip: "Tip: use the small corner number until the kanji starts feeling familiar."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Circles",
                desc: "Numbered 1 to 9. Circles are very visual, so they are usually the friendliest suit for beginners.",
                tip: "Tip: count the circles like pips on a card."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bamboos",
                desc: "Numbered 1 to 9. The 1 is usually a bird or special design; 2 through 9 use bamboo columns.",
                tip: "Tip: look for vertical groups, and remember that the 1 is the odd one."
            },
            honors: {
                tab: "Honors",
                title: "Winds and dragons",
                desc: "These are not numbered. Winds are East, South, West, and North. Dragons are green, red, and white.",
                tip: "Tip: honors do not make sequences; they usually matter as pairs or triplets."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Red fives",
                desc: "Red versions of the five tiles. Many modern rules use them, and they add extra value in a winning hand.",
                tip: "Tip: they are still normal fives for making groups, just with a bonus."
            }
        }
    },
    pt: {
        pageTitle: "Conheça as Peças",
        back: "← Voltar",
        language: "Idioma",
        eyebrow: "Primeiro módulo",
        title: "Conheça as peças por família",
        subtitle: "Mahjong usa três naipes numerados e um pequeno grupo de honras. Aprenda as famílias primeiro; os padrões ficam muito mais fáceis de enxergar.",
        prev: "Anterior",
        next: "Próximo",
        moniqueAlt: "Monique apresentando peças de mahjong",
        tileModal: {
            label: "Peça",
            tipLabel: "Para memorizar"
        },
        tileNames: {
            manzu: "Manzu",
            pinzu: "Pinzu",
            souzu: "Souzu",
            east: "Leste",
            south: "Sul",
            west: "Oeste",
            north: "Norte",
            green: "Dragão verde",
            red: "Dragão vermelho",
            white: "Dragão branco",
            redFiveManzu: "Aka 5 Manzu",
            redFivePinzu: "Aka 5 Pinzu",
            redFiveSouzu: "Aka 5 Souzu"
        },
        tileFacts: {
            m1: { fact: "Um só caractere com uma barra no topo. O 1 mais simples do naipe.", mnemonic: "一 (ichi) parece uma linha horizontal. Um traço = o um." },
            m2: { fact: "Dois caracteres com uma barra na base. O 5 é o único com círculo.", mnemonic: "Dois palitos em cima. 'Ni' soa como 'nói' com dois joelhos." },
            m3: { fact: "Três caracteres empilhados com barra na base.", mnemonic: "Três traços como um triângulo. 'San' quase 'sol'." },
            m4: { fact: "Quatro caracteres dentro de um quadro. O 4 fica à esquerda.", mnemonic: "Parece uma janela com quatro vidros. Quatro cantos = 4." },
            m5: { fact: "O único com um círculo (ro) no centro — assim você distingue do 9.", mnemonic: "O 'ro' central. Cinco dedos = um punho com 'ro' no meio." },
            m6: { fact: "Seis pinceladas formando um corpo com duas barrinhas em cima.", mnemonic: "O 6 tem 'cabeça' e duas pernas se abrindo. Como um 6 se espreguiçando." },
            m7: { fact: "Dois traços curvos caindo, com base longa.", mnemonic: "Parece uma bandeirinha ou um '7'. Queda dupla = sete." },
            m8: { fact: "Dois traços se abrindo em 'V' sobre uma base.", mnemonic: "O 'V' invertido em cima. Oito = 'hachi', a base se abre." },
            m9: { fact: "O número com círculo no centro, igual ao 5 — eles se confundem.", mnemonic: "O nove tem o mesmo 'ro' do 5: se duvidar, conte as barrinhas." },
            p1: { fact: "Um único círculo vermelho grande.", mnemonic: "Um = um ponto. Simples: um círculo." },
            p2: { fact: "Dois círculos empilhados.", mnemonic: "Como dois olhos ou duas rodas. Dois pontos = par." },
            p3: { fact: "Três círculos subindo na diagonal.", mnemonic: "Três pontos subindo a escada. Como o 'pips' de um 3 num dado." },
            p4: { fact: "Quatro círculos em quadrado.", mnemonic: "Quatro pontos formando uma caixa. Um ponto em cada canto." },
            p5: { fact: "Cinco círculos: quatro nos cantos e um no centro.", mnemonic: "O padrão das cartas: quatro cantos + centro = 5." },
            p6: { fact: "Duas colunas de três círculos.", mnemonic: "Seis pontos como as faces de um dado: duas pilhas de três." },
            p7: { fact: "Três em cima e quatro embaixo.", mnemonic: "Sete = 3 + 4. Conte a fileira de baixo (4) e a de cima (3)." },
            p8: { fact: "Duas colunas de quatro.", mnemonic: "Oito = duas torres de quatro. Como uma peça de dominó 4-4." },
            p9: { fact: "Os nove pontos numa grade 3x3.", mnemonic: "Nove = o maior. Preenche todo o quadrado: 3 fileiras de 3." },
            s1: { fact: "Uma ave (pavão) em vez de bambu. Nunca se parece com o resto.", mnemonic: "O 'pássaro solto': o 1 de bambu é o único com bicho. Viu bicho = é o 1." },
            s2: { fact: "Duas colunas de bambu com um chapéuzinho.", mnemonic: "Dois paus verdes = 2. Como duas canas." },
            s3: { fact: "Três colunas de bambu.", mnemonic: "Três canas em fila = 3." },
            s4: { fact: "Quatro colunas de bambu.", mnemonic: "Quatro canas = 4. Conte os brotinhos." },
            s5: { fact: "Cinco colunas de bambu com cabecinhas.", mnemonic: "Cinco canas = 5. A mais 'frondosa' por ter mais palitos." },
            s6: { fact: "Seis colunas de bambu.", mnemonic: "Seis canas = 6. Costuma ter um brilho rosa em cima." },
            s7: { fact: "Sete colunas de bambu com uma cabeça no meio.", mnemonic: "Sete canas = 7. A 'cabeça' do centro marca o 7." },
            s8: { fact: "Oito colunas de bambu, com brilho azul na base.", mnemonic: "Oito canas = 8. Procure o brilho azul para lembrar do 8." },
            s9: { fact: "Nove colunas de bambu, o mais alto em palitos.", mnemonic: "Nove canas = 9. Conte em ordem: 9 é o que tem mais palitos." },
            z1: { fact: "Vento Leste. 'Ton'. Associado à cor e ao começo.", mnemonic: "Leste = onde o sol nasce. É o primeiro vento." },
            z2: { fact: "Vento Sul. 'Nan'. Associado ao vermelho/calor.", mnemonic: "Sul = calor. Tons avermelhados: pense em calor." },
            z3: { fact: "Vento Oeste. 'Shaa'. Associado ao lado direito.", mnemonic: "Oeste = onde o sol se põe. 'Shaa' quase 'chá'." },
            z4: { fact: "Vento Norte. 'Pei'. Associado ao frio.", mnemonic: "Norte = frio. Tons cinza e frios." },
            z5: { fact: "Dragão verde. 'Hatsu'. O que parece 'da sorte'.", mnemonic: "Verde = 'hatsu'. Verde-esmeralda: fácil de reconhecer." },
            z6: { fact: "Dragão vermelho. 'Chun'. O mais poderoso e chamativo.", mnemonic: "Vermelho = 'chun'. Vermelho vivo = o dragão mais chamativo." },
            z7: { fact: "Dragão branco. Desenhado como uma moldura azul vazia.", mnemonic: "Branco = vazio. A moldura azul sem nada: 'nada', é o branco." },
            a0m: { fact: "Aka 5 Manzu: o cinco vermelho que dá dora extra.", mnemonic: "O 5 manzu mas vermelho = um 5 normal com prêmio." },
            a0p: { fact: "Aka 5 Pinzu: o cinco vermelho de círculos.", mnemonic: "Cinco de pinzu vermelho: círculos com bônus." },
            a0s: { fact: "Aka 5 Souzu: o cinco vermelho de bambu.", mnemonic: "Cinco de souzu vermelho: canas com prêmio." }
        },
        families: {
            manzu: {
                tab: "Manzu",
                title: "Manzu / Caracteres",
                desc: "São peças numeradas de 1 a 9. Usam kanji e podem parecer difíceis no começo, mas funcionam como os outros naipes.",
                tip: "Dica: use o número pequeno no canto até os kanjis ficarem familiares."
            },
            pinzu: {
                tab: "Pinzu",
                title: "Pinzu / Círculos",
                desc: "Também vão de 1 a 9. Os círculos são bem visuais, então costumam ser os mais fáceis para começar.",
                tip: "Dica: conte os círculos como pontos de uma carta."
            },
            souzu: {
                tab: "Souzu",
                title: "Souzu / Bambus",
                desc: "Vão de 1 a 9. O 1 costuma ser uma ave ou desenho especial; do 2 ao 9 aparecem colunas de bambu.",
                tip: "Dica: procure grupos verticais e lembre que o 1 é diferente."
            },
            honors: {
                tab: "Honras",
                title: "Ventos e dragões",
                desc: "Não têm número. Os ventos são Leste, Sul, Oeste e Norte. Os dragões são verde, vermelho e branco.",
                tip: "Dica: honras não formam sequências; normalmente importam como pares ou trios."
            },
            aka: {
                tab: "Aka",
                title: "Aka dora / Cincos vermelhos",
                desc: "São versões vermelhas dos cincos. Muitas regras modernas usam essas peças, que dão valor extra numa mão vencedora.",
                tip: "Dica: ainda são cincos normais para formar grupos, só que com bônus."
            }
        }
    }
};

const state = {
    language: getInitialLanguage(),
    index: 0
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
    Object.assign(els, {
        languageSelect: document.querySelector("#languageSelect"),
        familyTabs: document.querySelector("#familyTabs"),
        slideCount: document.querySelector("#slideCount"),
        familyTitle: document.querySelector("#familyTitle"),
        familyDescription: document.querySelector("#familyDescription"),
        familyTip: document.querySelector("#familyTip"),
        tileStrip: document.querySelector("#tileStrip"),
        prevButton: document.querySelector("#prevButton"),
        nextButton: document.querySelector("#nextButton"),
        themeToggle: document.querySelector("#themeToggle"),
        tileModal: document.querySelector("#tileModal"),
        tileModalBackdrop: document.querySelector("#tileModalBackdrop"),
        tileModalClose: document.querySelector("#tileModalClose"),
        tileModalImage: document.querySelector("#tileModalImage"),
        tileModalTitle: document.querySelector("#tileModalTitle"),
        tileModalFact: document.querySelector("#tileModalFact"),
        tileModalMnemonic: document.querySelector("#tileModalMnemonic")
    });

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (els.themeToggle) {
        els.themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    els.languageSelect.value = state.language;
    els.languageSelect.addEventListener("change", (event) => {
        state.language = event.target.value;
        localStorage.setItem(languageStorageKey, state.language);
        applyLanguage();
        render();
    });

    els.prevButton.addEventListener("click", () => move(-1));
    els.nextButton.addEventListener("click", () => move(1));
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
        if (event.key === "Escape") closeTileModal();
    });

    if (els.tileModalClose) els.tileModalClose.addEventListener("click", closeTileModal);
    if (els.tileModalBackdrop) els.tileModalBackdrop.addEventListener("click", closeTileModal);

    applyLanguage();
    renderTabs();
    render();
});

function move(direction) {
    state.index = (state.index + direction + families.length) % families.length;
    render();
}

function renderTabs() {
    els.familyTabs.replaceChildren(...families.map((family, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "family-tab";
        button.dataset.index = String(index);
        button.addEventListener("click", () => {
            state.index = index;
            render();
        });
        return button;
    }));
}

function render() {
    const family = families[state.index];
    const familyCopy = copy[state.language].families[family.id];

    els.slideCount.textContent = `${state.index + 1} / ${families.length}`;
    els.familyTitle.textContent = familyCopy.title;
    els.familyDescription.textContent = familyCopy.desc;
    if (els.familyTip) els.familyTip.textContent = familyCopy.tip;
    els.tileStrip.replaceChildren(...family.tiles.map((tileId) => tileItem(tileId, family.id)));

    [...els.familyTabs.children].forEach((button, index) => {
        const tabFamily = families[index];
        button.textContent = copy[state.language].families[tabFamily.id].tab;
        button.classList.toggle("is-active", index === state.index);
    });
}

function tileItem(tileId, familyId) {
    const item = document.createElement("figure");
    item.className = "tile-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-haspopup", "dialog");
    const label = document.createElement("figcaption");
    label.className = "tile-name";
    label.textContent = tileLabel(tileId, familyId);
    item.append(tileImage(tileId, label.textContent), label);
    item.addEventListener("click", () => openTileModal(tileId, familyId));
    item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTileModal(tileId, familyId);
        }
    });
    return item;
}

function tileHelp(tileId, familyId) {
    const facts = copy[state.language].tileFacts || {};
    const key = tileFactKey(tileId, familyId);
    return facts[key] || { fact: "", mnemonic: "" };
}

function tileFactKey(tileId, familyId) {
    if (tileId[0] === "0") return `a0${tileId[1]}`;
    return `${familyId === "pinzu" ? "p" : familyId === "souzu" ? "s" : familyId === "honors" ? "z" : "m"}${tileId[0]}`;
}

function openTileModal(tileId, familyId) {
    if (!els.tileModal) return;
    const help = tileHelp(tileId, familyId);
    const name = tileLabel(tileId, familyId);
    els.tileModalImage.src = `${tileBasePath}${tileId}.svg`;
    els.tileModalImage.alt = name;
    els.tileModalTitle.textContent = name;
    els.tileModalFact.textContent = help.fact;
    els.tileModalMnemonic.textContent = help.mnemonic;
    els.tileModal.hidden = false;
    document.body.style.overflow = "hidden";
    if (els.tileModalClose) els.tileModalClose.focus();
}

function closeTileModal() {
    if (!els.tileModal) return;
    els.tileModal.hidden = true;
    document.body.style.overflow = "";
}

function tileImage(tileId, label = tileId) {
    const img = document.createElement("img");
    img.src = `${tileBasePath}${tileId}.svg`;
    img.alt = label;
    return img;
}

function tileLabel(tileId, familyId) {
    const dictionary = copy[state.language].tileNames;
    const number = tileId[0] === "0" ? "5" : tileId[0];
    if (familyId === "manzu") return `${number} ${dictionary.manzu}`;
    if (familyId === "pinzu") return `${number} ${dictionary.pinzu}`;
    if (familyId === "souzu") return `${number} ${dictionary.souzu}`;
    if (familyId === "aka" && tileId === "0m") return dictionary.redFiveManzu;
    if (familyId === "aka" && tileId === "0p") return dictionary.redFivePinzu;
    if (familyId === "aka" && tileId === "0s") return dictionary.redFiveSouzu;

    const honors = {
        "1z": dictionary.east,
        "2z": dictionary.south,
        "3z": dictionary.west,
        "4z": dictionary.north,
        "5z": dictionary.green,
        "6z": dictionary.red,
        "7z": dictionary.white
    };
    return honors[tileId] || tileId;
}

function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
}

function applyLanguage() {
    const dictionary = copy[state.language] || copy[defaultLanguage];
    document.documentElement.lang = state.language;
    document.title = dictionary.pageTitle;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = dictionary[element.dataset.i18n];
        if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const value = dictionary[element.dataset.i18nAlt];
        if (typeof value === "string") element.alt = value;
    });
}
