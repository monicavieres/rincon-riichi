const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const languageStorageKey = "rincon-riichi-language";
const tileBasePath = "../assets/tiles-fluffystuff-composite/";

const ui = {
    es: { back: "← Volver", language: "Idioma", handLabel: "Mano", tileLabel: "Ficha", eyebrow: "Práctica", submit: "Enviar", next: "Siguiente", restart: "Otra vez", score: "Puntaje", correct: "Correcto", incorrect: "Revisemos", choose: "Elige una opción antes de enviar.", done: "Resultado final", roundWind: "Ronda", seatWind: "Tu viento", dora: "Dora", win: "Victoria", calls: "Llamadas", closed: "Cerrada", none: "Sin llamadas", wait: "Espera", situation: "Condiciones", position: "Posición", honba: "Honba", tileStart: { eyebrow: "Módulo jugable", title: "¿Qué ficha es?", subtitle: "Elige un grupo de fichas y nómbralas. Cada grupo saca 10 fichas al azar.", chipOne: "10 fichas al azar", chipTwo: "Opciones del mismo palo", chipThree: "Feedback al instante", coach: "¡A ver qué tan bien conoces las fichas! Elige un grupo para empezar." }, results: { eyebrow: "Sesión completa", title: "Resultado final", score: "Puntaje", replay: "Jugar otra vez", menu: "Cambiar de modo" } },
    en: { back: "← Back", language: "Language", handLabel: "Hand", tileLabel: "Tile", eyebrow: "Practice", submit: "Submit", next: "Next", restart: "Again", score: "Score", correct: "Correct", incorrect: "Review", choose: "Choose one option before submitting.", done: "Final result", roundWind: "Round", seatWind: "Your wind", dora: "Dora", win: "Win", calls: "Calls", closed: "Closed", none: "No calls", wait: "Wait", situation: "Conditions", position: "Position", honba: "Honba", tileStart: { eyebrow: "Playable module", title: "Which Tile Is It?", subtitle: "Pick a tile group and name the tiles. Each group draws 10 random tiles.", chipOne: "10 random tiles", chipTwo: "Same-suit options", chipThree: "Instant feedback", coach: "Let\u2019s see how well you know the tiles! Pick a group to start." }, results: { eyebrow: "Session complete", title: "Final result", score: "Score", replay: "Play again", menu: "Change mode" } },
    pt: { back: "← Voltar", language: "Idioma", handLabel: "Mão", tileLabel: "Peça", eyebrow: "Prática", submit: "Enviar", next: "Próximo", restart: "De novo", score: "Pontuação", correct: "Correto", incorrect: "Vamos revisar", choose: "Escolha uma opção antes de enviar.", done: "Resultado final", roundWind: "Rodada", seatWind: "Seu vento", dora: "Dora", win: "Vitória", calls: "Chamadas", closed: "Fechada", none: "Sem chamadas", wait: "Espera", situation: "Condições", position: "Posição", honba: "Honba", tileStart: { eyebrow: "Módulo jogável", title: "Que peça é?", subtitle: "Escolha um grupo de peças e nomeie-as. Cada grupo sorteia 10 peças aleatórias.", chipOne: "10 peças aleatórias", chipTwo: "Opções do mesmo naipe", chipThree: "Feedback instantâneo", coach: "Vamos ver o quanto você conhece as peças! Escolha um grupo para começar." }, results: { eyebrow: "Sessão completa", title: "Resultado final", score: "Pontuação", replay: "Jogar de novo", menu: "Trocar de modo" } }
};

const defaultContext = { roundWind: "East", seatWind: "South", dora: "4p", win: "Ron", calls: [] };

const modules = {
    waits: {
        title: { es: "Encuentra la Espera", en: "Find the Wait", pt: "Encontre a Espera" },
        help: { es: "Elige qué ficha completa la mano.", en: "Choose the tile that completes the hand.", pt: "Escolha a peça que completa a mão." },
        questions: [
            {
                hand: ["2m", "3m", "4m", "5p", "6p", "7p", "3s", "4s", "5s", "7m", "8m", "5z", "5z"],
                context: { roundWind: "East", seatWind: "South", dora: "4p", win: "Ron", calls: [] },
                waits: ["6m", "9m"],
                waitName: "Ryanmen",
                choices: ["6m", "9m", "5z", "1p", "2s", "7z"],
                answer: "9m",
                explain: { es: "7-8 manzu espera el 6 o 9 (ryanmen); aquí la opción correcta disponible es 9 manzu.", en: "7-8 manzu waits on 6 or 9 (ryanmen); here the available correct tile is 9 manzu.", pt: "7-8 manzu espera 6 ou 9 (ryanmen); aqui a opção correta disponível é 9 manzu." }
            },
            {
                hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "2m", "2m"],
                context: { roundWind: "South", seatWind: "East", dora: "2m", win: "Tsumo", calls: [{ type: "Pon", tiles: ["5z", "5z", "5z"] }] },
                waits: ["5z"],
                waitName: "Tanki",
                choices: ["2m", "3p", "5z", "1s", "9m", "6z"],
                answer: "5z",
                explain: { es: "La mano ya tiene grupos completos; falta completar el par de dragón verde (tanki).", en: "The groups are complete; you need to finish the green dragon pair (tanki).", pt: "Os grupos já estão completos; falta completar o par de dragão verde (tanki)." }
            },
            {
                hand: ["3m", "4m", "5m", "6m", "7m", "8m", "2p", "3p", "4p", "6s", "7s", "8s", "9p"],
                context: { roundWind: "East", seatWind: "West", dora: "8p", win: "Ron", calls: [] },
                waits: ["9p"],
                waitName: "Tanki",
                choices: ["9p", "8p", "5z", "1m", "4s", "7z"],
                answer: "9p",
                explain: { es: "Es tanki: solo falta emparejar el 9 pinzu.", en: "This is a tanki wait: only the 9 pinzu pair is missing.", pt: "É espera tanki: falta apenas formar o par de 9 pinzu." }
            }
        ]
    },
    han: {
        title: { es: "Cuenta los Han", en: "Count Han", pt: "Conte os Han" },
        help: { es: "Identifica los yaku y cuenta el total de han de la mano ganadora.", en: "Identify the yaku and count the total han of the winning hand.", pt: "Identifique os yaku e conte o total de han da mão vencedora." },
        questions: [
            {
                hand: ["2m", "3m", "4m", "3p", "4p", "5p", "4s", "5s", "6s", "6m", "7m", "8m", "5p"],
                winningTile: "5p",
                context: { roundWind: "East", seatWind: "South", dora: "4s", win: "Ron", riichi: true, calls: [] },
                choices: ["1", "2", "3", "4"],
                answer: "3",
                explain: { es: "Riichi (1) + Tanyao (1) + 1 dora (un 4s en la mano) = 3 han.", en: "Riichi (1) + Tanyao (1) + 1 dora (one 4s in hand) = 3 han.", pt: "Riichi (1) + Tanyao (1) + 1 dora (um 4s na mão) = 3 han." }
            },
            {
                hand: ["2m", "3m", "4m", "3p", "4p", "5p", "4s", "5s", "6s", "6m", "7m", "8m", "5p"],
                winningTile: "5p",
                context: { roundWind: "East", seatWind: "South", dora: "4s", win: "Ron", riichi: false, calls: [] },
                choices: ["1", "2", "3", "4"],
                answer: "2",
                explain: { es: "Sin riichi: Tanyao (1) + 1 dora (un 4s en la mano) = 2 han.", en: "No riichi: Tanyao (1) + 1 dora (one 4s in hand) = 2 han.", pt: "Sem riichi: Tanyao (1) + 1 dora (um 4s na mão) = 2 han." }
            },
            {
                hand: ["2m", "3m", "4m", "2p", "3p", "4p", "2s", "3s", "4s", "5z", "5z", "5z", "7p"],
                winningTile: "7p",
                context: { roundWind: "East", seatWind: "South", dora: "8p", win: "Ron", riichi: false, calls: [] },
                choices: ["1", "2", "3", "4"],
                answer: "1",
                explain: { es: "Solo yakuhai (trío de dragón verde) = 1 han. La dora (8p) no está en la mano.", en: "Only yakuhai (green dragon triplet) = 1 han. The dora (8p) is not in the hand.", pt: "Apenas yakuhai (trio de dragão verde) = 1 han. A dora (8p) não está na mão." }
            }
        ]
    },
    calc: {
        title: { es: "Cuenta el Puntaje", en: "Count Points", pt: "Conte a Pontuação" },
        help: { es: "Con la información de han y fu, elige los puntos que paga la mano.", en: "Using the han and fu info, choose the points the hand pays.", pt: "Com a informação de han e fu, escolha os pontos que a mão paga." },
        questions: [
            {
                hand: ["2m", "3m", "4m", "3p", "4p", "5p", "4s", "5s", "6s", "6m", "7m", "8m", "5p"],
                winningTile: "5p",
                context: { roundWind: "East", seatWind: "South", dora: "4m", win: "Ron", han: 1, fu: 30, dealer: false, calls: [] },
                choices: ["1000", "2000", "3900", "5200"],
                answer: "1000",
                explain: { es: "1 han 30 fu, no-dealer por Ron: paga 1000.", en: "1 han 30 fu, non-dealer Ron: pays 1000.", pt: "1 han 30 fu, não-dealer por Ron: paga 1000." }
            },
            {
                hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "1m", "1m", "1m", "5z"],
                winningTile: "5z",
                context: { roundWind: "East", seatWind: "South", dora: "9s", win: "Ron", han: 4, fu: 40, dealer: false, calls: [] },
                choices: ["7700", "8000", "12000", "16000"],
                answer: "8000",
                explain: { es: "4 han 40 fu = mangan de no-dealer por Ron: 8000.", en: "4 han 40 fu = non-dealer mangan by Ron: 8000.", pt: "4 han 40 fu = mangan de não-dealer por Ron: 8000." }
            },
            {
                hand: ["2m", "3m", "4m", "2p", "3p", "4p", "2s", "3s", "4s", "5z", "5z", "5z", "9s"],
                winningTile: "9s",
                context: { roundWind: "East", seatWind: "East", dora: "8p", win: "Ron", han: 3, fu: 30, dealer: true, calls: [] },
                choices: ["3900", "5800", "7700", "11600"],
                answer: "5800",
                explain: { es: "3 han 30 fu, dealer por Ron: paga 5800.", en: "3 han 30 fu, dealer Ron: pays 5800.", pt: "3 han 30 fu, dealer por Ron: paga 5800." }
            }
        ]
    },
    valores: {
        title: { es: "Tabla de Valores", en: "Value Table", pt: "Tabela de Valores" },
        help: { es: "Dados han + fu + dealer/no-dealer + honba, elige los puntos correctos según ganes por Ron o Tsumo.", en: "Given han + fu + dealer/non-dealer + honba, pick the correct points for Ron or Tsumo.", pt: "Dados han + fu + dealer/não-dealer + honba, escolha os pontos corretos por Ron ou Tsumo." },
        questions: []
    },
    fu: {
        title: { es: "Cuenta los Fu", en: "Count Fu", pt: "Conte os Fu" },
        help: { es: "Elige el total de fu correcto para la situación simplificada.", en: "Choose the correct fu total for the simplified situation.", pt: "Escolha o total correto de fu para a situação simplificada." },
        questions: [
            {
                hand: ["2m", "3m", "4m", "4p", "5p", "6p", "6s", "7s", "8s", "2p"],
                winningTile: "2p",
                context: { roundWind: "East", seatWind: "East", dora: "3s", win: "Ron", calls: [{ type: "Pon", tiles: ["5z", "5z", "5z"] }] },
                choices: ["30 fu", "40 fu", "50 fu", "25 fu"],
                answer: "30 fu",
                explain: { es: "Base 20 + trío abierto de dragón (4 fu) + espera tanki del par (2 fu) = 26, se redondea a 30 fu.", en: "Base 20 + open dragon triplet (4 fu) + tanki pair wait (2 fu) = 26, rounds up to 30 fu.", pt: "Base 20 + trio aberto de dragão (4 fu) + espera tanki do par (2 fu) = 26, arredonda para 30 fu." }
            },
            {
                hand: ["2m", "2m", "4m", "4m", "6p", "6p", "8p", "8p", "3s", "3s", "5s", "5s", "7s"],
                winningTile: "7s",
                context: { roundWind: "South", seatWind: "North", dora: "4m", win: "Ron", calls: [] },
                choices: ["25 fu", "30 fu", "40 fu", "50 fu"],
                answer: "25 fu",
                explain: { es: "Chiitoitsu es especial: vale 25 fu fijos.", en: "Chiitoitsu is special: it is fixed at 25 fu.", pt: "Chiitoitsu é especial: vale 25 fu fixos." }
            },
            {
                hand: ["2m", "3m", "4m", "3p", "4p", "5p", "6s", "7s", "8s", "2p", "3p", "4p", "5m"],
                winningTile: "5m",
                context: { roundWind: "East", seatWind: "South", dora: "9s", win: "Tsumo", calls: [] },
                choices: ["20 fu", "30 fu", "40 fu", "70 fu"],
                answer: "20 fu",
                explain: { es: "Pinfu tsumo es el caso limpio: cuatro secuencias, par sin valor y espera de dos lados.", en: "Pinfu tsumo is the clean case: four sequences, valueless pair, and two-sided wait.", pt: "Pinfu tsumo é o caso limpo: quatro sequências, par sem valor e espera dos dois lados." }
            }
        ]
    },
    score: {
        title: { es: "Calcula el Puntaje", en: "Calculate Score", pt: "Calcule a Pontuação" },
        help: { es: "Elige el pago correcto para dealer/no dealer en ejemplos básicos.", en: "Choose the correct payment for basic dealer/non-dealer examples.", pt: "Escolha o pagamento correto em exemplos básicos." },
        questions: [
            {
                hand: ["2m", "3m", "4m", "3p", "4p", "5p", "4s", "5s", "6s", "6m", "7m", "8m", "5p", "5p"],
                choices: ["1000", "2000", "3900", "8000"],
                answer: "1000",
                explain: { es: "1 han 30 fu por Ron de no-dealer paga 1000.", en: "1 han 30 fu by non-dealer Ron pays 1000.", pt: "1 han 30 fu por Ron de não-dealer paga 1000." }
            },
            {
                hand: ["5z", "5z", "5z", "6z", "6z", "6z", "1m", "1m", "1m", "9p", "9p", "9p", "2s", "2s"],
                choices: ["3900", "7700", "8000", "12000"],
                answer: "8000",
                explain: { es: "Mangan de no-dealer por Ron paga 8000.", en: "Non-dealer mangan by Ron pays 8000.", pt: "Mangan de não-dealer por Ron paga 8000." }
            },
            {
                hand: ["2m", "3m", "4m", "2p", "3p", "4p", "2s", "3s", "4s", "5z", "5z", "5z", "7p", "7p"],
                choices: ["2600 all", "4000 all", "12000", "16000"],
                answer: "4000 all",
                explain: { es: "Mangan de dealer por Tsumo cobra 4000 a cada jugador.", en: "Dealer mangan by Tsumo collects 4000 from each player.", pt: "Mangan de dealer por Tsumo recebe 4000 de cada jogador." }
            }
        ]
    },
    furiten: {
        title: { es: "¿Estoy en Furiten?", en: "Am I in Furiten?", pt: "Estou em Furiten?" },
        help: { es: "Tu mano está en tenpai. Mira los descartes: ¿la ficha que necesitas para ganar está en TUS descartes?", en: "Your hand is tenpai. Check the discards: is the tile you need to win in YOUR discards?", pt: "Sua mão está em tenpai. Veja os descartes: a peça que você precisa está nos SEUS descartes?" },
        questions: []
    },
    esperaTipo: {
        title: { es: "¿Qué espera es?", en: "Which Wait Is It?", pt: "Qual Espera É?" },
        help: { es: "Mira la mano tenpai y elige el nombre de la espera.", en: "Look at the tenpai hand and choose the name of the wait.", pt: "Veja a mão em tenpai e escolha o nome da espera." },
        questions: []
    },
    esperaFichas: {
        title: { es: "¿Qué fichas esperas?", en: "Which Tiles Do You Wait On?", pt: "Quais Peças Você Espera?" },
        help: { es: "Selecciona TODAS las fichas que completan tu mano.", en: "Select ALL the tiles that complete your hand.", pt: "Selecione TODAS as peças que completam sua mão." },
        multi: true,
        questions: []
    },
    tileName: {
        title: { es: "¿Qué ficha es?", en: "Which Tile Is It?", pt: "Que peça é?" },
        help: { es: "Mira la ficha y elige su nombre. Aka significa cinco rojo.", en: "Look at the tile and choose its name. Aka means red five.", pt: "Veja a peça e escolha seu nome. Aka significa cinco vermelho." },
        questions: []
    },
    chinitsu: {
        title: { es: "¿Chinitsu?", en: "Is It Chinitsu?", pt: "É Chinitsu?" },
        help: { es: "Selecciona TODAS las fichas que completan la mano. Toda la mano es de un solo palo. Si ninguna la completa, deja la selección vacía.", en: "Select ALL the tiles that complete the hand. The whole hand is one suit. If no tile completes it, leave the selection empty.", pt: "Selecione TODAS as peças que completam a mão. Toda a mão é de um só naipe. Se nenhuma completar, deixe a seleção vazia." },
        multi: true,
        questions: []
    }
};

const furitenHands = [
    { hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "4s", "5s", "9z", "9z"], wait: "3s" },
    { hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "1m", "1m", "1m", "5z"], wait: "5z" },
    { hand: ["2m", "3m", "4m", "5p", "6p", "7p", "3s", "4s", "5s", "7m", "8m", "5z", "5z"], wait: "9m" },
    { hand: ["3m", "4m", "5m", "6m", "7m", "8m", "2p", "3p", "4p", "6s", "7s", "8s", "9p"], wait: "9p" },
    { hand: ["1p", "2p", "3p", "5s", "6s", "7s", "9m", "9m", "9m", "2m", "3m", "4z", "4z"], wait: "1m" },
    { hand: ["2m", "3m", "4m", "2p", "3p", "4p", "2s", "3s", "4s", "5z", "5z", "5z", "9s"], wait: "9s" },
    { hand: ["1m", "2m", "3m", "4p", "5p", "6p", "7s", "8s", "9z", "9z", "2m", "2m", "2m"], wait: "9s" },
    { hand: ["2m", "3m", "4m", "2p", "3p", "4p", "2s", "3s", "4s", "1z", "1z", "7z", "7z"], wait: "1z" },
    { hand: ["1m", "1m", "1m", "2p", "3p", "4p", "5s", "6s", "7s", "2z", "2z", "2z", "8m"], wait: "8m" },
    { hand: ["3m", "3m", "3m", "4p", "5p", "6p", "7s", "8s", "9s", "6z", "6z", "1m", "2m"], wait: "3m" }
];

function buildFuritenQuestions() {
    const winds = ["East", "South", "West", "North"];
    return furitenHands.map(({ hand, wait }) => {
        const seatWind = winds[Math.floor(Math.random() * winds.length)];
        const isFuriten = Math.random() < 0.5;
        const discards = {};
        winds.forEach((wind) => {
            const rows = 1 + Math.floor(Math.random() * 2);
            const tiles = [];
            for (let r = 0; r < rows; r++) {
                for (let i = 0; i < 6; i++) tiles.push(randomTile());
            }
            discards[wind] = tiles;
        });
        const ownDiscards = discards[seatWind];
        if (isFuriten) ownDiscards[ownDiscards.length - 1] = wait;
        else removeTiles(ownDiscards, [wait]);
        return {
            hand,
            wait,
            roundWind: "East",
            seatWind,
            discards,
            furiten: isFuriten,
            choices: ["Furiten", "No furiten"],
            answer: isFuriten ? "Furiten" : "No furiten",
            explain: {
                es: isFuriten
                    ? `Estás en furiten: la ficha que necesitas (${wait}) está en TUS descartes, así que no puedes ganar por Ron.`
                    : `No estás en furiten: la ficha que necesitas (${wait}) NO está en tus descartes. Puedes declarar Ron si alguien la descarta.`,
                en: isFuriten
                    ? `You are in furiten: the tile you need (${wait}) is in YOUR discards, so you cannot win by Ron.`
                    : `You are not in furiten: the tile you need (${wait}) is NOT in your discards. You can call Ron if someone discards it.`,
                pt: isFuriten
                    ? `Você está em furiten: a peça que precisa (${wait}) está nos SEUS descartes, então não pode vencer por Ron.`
                    : `Você não está em furiten: a peça que precisa (${wait}) NÃO está nos seus descartes. Pode declarar Ron se alguém descartar.`
            }
        };
    });
}

function randomTile() {
    const suits = ["m", "p", "s"];
    const suit = suits[Math.floor(Math.random() * 3)];
    const num = 1 + Math.floor(Math.random() * 9);
    return `${num}${suit}`;
}

function removeTiles(array, values) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (values.includes(array[i])) array.splice(i, 1);
    }
}

const WAIT_TYPE_NAMES = {
    ryanmen: "Ryanmen", shanpon: "Shanpon", kanchan: "Kanchan", penchan: "Penchan", tanki: "Tanki",
    nobetan: "Nobetan", sanmenchan: "Sanmenchan", sanmentan: "Sanmentan", entotsu: "Entotsu",
    ryantan: "Ryantan", kantan: "Kantan", aryanmen: "Aryanmen", pentan: "Pentan"
};

function rint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function tile(n, s) {
    return `${n}${s}`;
}

function canWin(tiles) {
    if (tiles.length % 3 !== 2) return false;
    const cnt = {};
    tiles.forEach((t) => { cnt[t] = (cnt[t] || 0) + 1; });

    function removeGroup(set) {
        const keys = Object.keys(set).filter((k) => set[k] > 0);
        for (const k of keys) {
            const n = Number(k[0]);
            const s = k[k.length - 1];
            if (set[k] >= 3) {
                set[k] -= 3;
                const ok = helper(set);
                set[k] += 3;
                if (ok) return true;
            }
            if (s !== "z") {
                const k2 = `${n + 1}${s}`;
                const k3 = `${n + 2}${s}`;
                if (set[k2] > 0 && set[k3] > 0) {
                    set[k] -= 1; set[k2] -= 1; set[k3] -= 1;
                    const ok = helper(set);
                    set[k] += 1; set[k2] += 1; set[k3] += 1;
                    if (ok) return true;
                }
            }
        }
        return false;
    }

    function helper(set) {
        const keys = Object.keys(set).filter((k) => set[k] > 0);
        if (keys.length === 0) return true;
        return removeGroup(set);
    }

    const keys = Object.keys(cnt);
    for (const k of keys) {
        if (cnt[k] >= 2) {
            cnt[k] -= 2;
            const ok = helper(cnt);
            cnt[k] += 2;
            if (ok) return true;
        }
    }
    return false;
}

function getWinWaits(hand) {
    const waits = [];
    for (let n = 1; n <= 9; n++) {
        for (const s of "mpsz") {
            const t = `${n}${s}`;
            if (hand.filter((x) => x === t).length >= 4) continue;
            if (canWin([...hand, t])) waits.push(t);
        }
    }
    return waits;
}

function fillHonor(rem) {
    const honors = shuffled(["1z", "2z", "3z", "4z", "5z", "6z", "7z"]);
    const fill = [];
    let idx = 0;
    const isPair = rem % 3 === 2;
    const triplets = (rem - (isPair ? 2 : 0)) / 3;
    for (let i = 0; i < triplets; i++) {
        const h = honors[idx++];
        fill.push(h, h, h);
    }
    if (isPair) {
        const p = honors[idx++];
        fill.push(p, p);
    }
    return fill;
}

/* each wait type: value is a function (s, helper) returning {hand, waits}.
   The hand = shape tiles + isolated honor fill, so the ONLY real waits are the ones declared. */
function buildWaitByKey(key, s) {
    switch (key) {
        case "ryanmen": {
            const a = rint(2, 7);
            const shape = [tile(a, s), tile(a + 1, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a - 1, s), tile(a + 2, s)] };
        }
        case "kanchan": {
            const a = rint(1, 7);
            const shape = [tile(a, s), tile(a + 2, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a + 1, s)] };
        }
        case "penchan": {
            const side = Math.random() < 0.5 ? "low" : "high";
            const shape = side === "low" ? [tile(1, s), tile(2, s)] : [tile(8, s), tile(9, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [side === "low" ? tile(3, s) : tile(7, s)] };
        }
        case "tanki": {
            const a = rint(1, 9);
            const shape = [tile(a, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a, s)] };
        }
        case "shanpon": {
            const p = rint(1, 9); let q = rint(1, 9); while (q === p) q = rint(1, 9);
            const shape = [tile(p, s), tile(p, s), tile(q, s), tile(q, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(p, s), tile(q, s)] };
        }
        case "nobetan": {
            const a = rint(1, 6);
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 2, s), tile(a + 3, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a, s), tile(a + 3, s)] };
        }
        case "sanmenchan": {
            const a = rint(2, 4);
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 2, s), tile(a + 3, s), tile(a + 4, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a - 1, s), tile(a + 2, s), tile(a + 5, s)] };
        }
        case "sanmentan": {
            const a = rint(1, 3);
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 2, s), tile(a + 3, s), tile(a + 4, s), tile(a + 5, s), tile(a + 6, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a, s), tile(a + 3, s), tile(a + 6, s)] };
        }
        case "entotsu": {
            const a = rint(2, 7);
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 2, s), tile(a + 2, s), tile(a + 2, s)];
            const hand = shape.concat(fillHonor(13 - shape.length));
            return { hand, waits: getWinWaits(hand) };
        }
        case "ryantan": {
            const a = 4;
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 1, s), tile(a + 1, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(3, s), tile(a, s), tile(6, s)] };
        }
        case "kantan": {
            const a = 3;
            const shape = [tile(a, s), tile(a + 2, s), tile(a + 2, s), tile(a + 2, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a, s), tile(a + 1, s)] };
        }
        case "aryanmen": {
            const a = 4;
            const shape = [tile(a, s), tile(a + 1, s), tile(a + 2, s), tile(a + 2, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(3, s), tile(a + 2, s)] };
        }
        case "pentan": {
            const a = 2;
            const shape = [tile(a - 1, s), tile(a, s), tile(a, s), tile(a, s)];
            return { hand: shape.concat(fillHonor(13 - shape.length)), waits: [tile(a - 1, s), tile(a + 1, s)] };
        }
    }
}

function sortHand(tiles) {
    const order = { m: 0, p: 1, s: 2, z: 3 };
    return [...tiles].sort((a, b) => {
        const sa = order[a[a.length - 1]] ?? 0;
        const sb = order[b[b.length - 1]] ?? 0;
        if (sa !== sb) return sa - sb;
        return Number(a.slice(0, -1)) - Number(b.slice(0, -1));
    });
}

function buildWaitQuestion() {
    const keys = Object.keys(WAIT_TYPE_NAMES);
    const key = keys[rint(0, keys.length - 1)];
    return buildQuestionForWait(key);
}

function buildQuestionForWait(key) {
    const s = "mps"[rint(0, 2)];
    for (let attempt = 0; attempt < 40; attempt++) {
        const built = buildWaitByKey(key, s);
        const expected = [...built.waits].sort();
        const real = getWinWaits(built.hand).sort();
        if (expected.join("|") !== real.join("|")) continue;
        return {
            hand: sortHand(built.hand),
            waits: real,
            waitName: WAIT_TYPE_NAMES[key],
            waitKey: key,
            nameChoices: shuffleNames(WAIT_TYPE_NAMES, key, 3),
            tileChoices: shuffle([...real].concat(randomTiles(6 - real.length, real)))
        };
    }
    return null;
}

function shuffled(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function shuffleNames(names, excludeKey, count) {
    const pool = Object.entries(names).filter(([k]) => k !== excludeKey).map(([, v]) => v);
    const picked = [];
    while (picked.length < count && pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        picked.push(pool.splice(idx, 1)[0]);
    }
    return shuffle([names[excludeKey]].concat(picked));
}

function randomTiles(count, exclude) {
    const result = [];
    let guard = 0;
    while (result.length < count && guard < 200) {
        guard++;
        const t = randomTile();
        if (exclude.includes(t)) continue;
        if (result.includes(t)) continue;
        result.push(t);
    }
    return result;
}

function buildWaitQuestions(count, multi) {
    return buildWaitQuestionsAsync(count, multi).catch(() => buildWaitQuestionsLocal(count, multi));
}

async function buildWaitQuestionsAsync(count, multi) {
    const api = window.RinconAPI;
    if (!api || !api.isReachable) return buildWaitQuestionsLocal(count, multi);
    const waitKeys = Object.keys(WAIT_TYPE_NAMES);
    const questions = [];
    const seen = new Set();
    const keys = [];
    for (let i = 0; i < count; i++) keys.push(waitKeys[rint(0, waitKeys.length - 1)]);
    const results = await Promise.all(keys.map((k) => api.generateWait(k).catch(() => null)));
    results.forEach((res) => {
        if (!res || !res.tiles) return;
        const sig = res.tiles.join("|");
        if (seen.has(sig)) return;
        seen.add(sig);
        questions.push(mapApiWaitQuestion(res, multi));
    });
    if (questions.length < count) {
        const local = buildWaitQuestionsLocal(count - questions.length, multi);
        questions.push(...local);
    }
    return questions;
}

function mapApiWaitQuestion(res, multi) {
    const waitName = res.wait_type || "complex";
    if (multi) {
        return {
            hand: res.tiles,
            waits: res.waits,
            waitName,
            waitKey: res.wait_key,
            tileChoices: shuffle([...res.waits].concat(randomTiles(6 - res.waits.length, res.waits)))
        };
    }
    return {
        hand: res.tiles,
        waits: res.waits,
        waitName,
        choices: shuffleNames(WAIT_TYPE_NAMES, res.wait_key, 3),
        answer: waitName,
        explain: {
            es: `Espera ${waitName}: completas con ${res.waits.join(", ")}.`,
            en: `It's a ${waitName} wait: you complete with ${res.waits.join(", ")}.`,
            pt: `Espera ${waitName}: você completa com ${res.waits.join(", ")}.`
        }
    };
}

function buildWaitQuestionsLocal(count, multi) {
    const questions = [];
    const seen = new Set();
    let guard = 0;
    while (questions.length < count && guard < 400) {
        guard++;
        const q = buildWaitQuestion();
        if (!q) continue;
        const key = q.hand.join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        questions.push(multi ? { ...q }
            : {
                hand: q.hand,
                waits: q.waits,
                waitName: q.waitName,
                choices: q.nameChoices,
                answer: q.waitName,
                explain: {
                    es: `Espera ${q.waitName}: completas con ${q.waits.join(", ")}.`,
                    en: `It's a ${q.waitName} wait: you complete with ${q.waits.join(", ")}.`,
                    pt: `Espera ${q.waitName}: você completa com ${q.waits.join(", ")}.`
                }
            });
    }
    return questions;
}

const TILE_NAME_IDS = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "0m",
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "0p",
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "0s",
    "1z", "2z", "3z", "4z", "5z", "6z", "7z"
];

const TILE_NAME_MODES = [
    { id: "all", rep: "5m", label: { es: "Todas las fichas", en: "All tiles", pt: "Todas as peças" }, tiles: () => [...TILE_NAME_IDS] },
    { id: "manzu", rep: "4m", label: { es: "Solo Manzu", en: "Manzu only", pt: "Só Manzu" }, tiles: () => TILE_NAME_IDS.filter((t) => t.endsWith("m")) },
    { id: "pinzu", rep: "4p", label: { es: "Solo Pinzu", en: "Pinzu only", pt: "Só Pinzu" }, tiles: () => TILE_NAME_IDS.filter((t) => t.endsWith("p")) },
    { id: "souzu", rep: "4s", label: { es: "Solo Souzu", en: "Souzu only", pt: "Só Souzu" }, tiles: () => TILE_NAME_IDS.filter((t) => t.endsWith("s")) },
    { id: "honors", rep: "5z", label: { es: "Solo Honores", en: "Honors only", pt: "Só Honras" }, tiles: () => TILE_NAME_IDS.filter((t) => t.endsWith("z")) },
    { id: "manzuHonors", rep: "8m", label: { es: "Manzu + Honores", en: "Manzu + Honors", pt: "Manzu + Honras" }, tiles: () => TILE_NAME_IDS.filter((t) => t.endsWith("m") || t.endsWith("z")) },
    { id: "numbers", rep: "7s", label: { es: "Solo números", en: "Numbers only", pt: "Só números" }, tiles: () => TILE_NAME_IDS.filter((t) => /^[1-9][mps]$/.test(t)) }
];

const TILE_NAME_COPY = {
    es: {
        suits: { m: "Manzu", p: "Pinzu", s: "Souzu" },
        honors: { "1z": "Este", "2z": "Sur", "3z": "Oeste", "4z": "Norte", "5z": "Dragón verde", "6z": "Dragón rojo", "7z": "Dragón blanco" },
        aka: { "0m": "Aka 5 Manzu", "0p": "Aka 5 Pinzu", "0s": "Aka 5 Souzu" }
    },
    en: {
        suits: { m: "Manzu", p: "Pinzu", s: "Souzu" },
        honors: { "1z": "East", "2z": "South", "3z": "West", "4z": "North", "5z": "Green dragon", "6z": "Red dragon", "7z": "White dragon" },
        aka: { "0m": "Aka 5 Manzu", "0p": "Aka 5 Pinzu", "0s": "Aka 5 Souzu" }
    },
    pt: {
        suits: { m: "Manzu", p: "Pinzu", s: "Souzu" },
        honors: { "1z": "Leste", "2z": "Sul", "3z": "Oeste", "4z": "Norte", "5z": "Dragão verde", "6z": "Dragão vermelho", "7z": "Dragão branco" },
        aka: { "0m": "Aka 5 Manzu", "0p": "Aka 5 Pinzu", "0s": "Aka 5 Souzu" }
    }
};

function tileDisplayName(tileId, language = state?.language || defaultLanguage) {
    const dict = TILE_NAME_COPY[language] || TILE_NAME_COPY[defaultLanguage];
    if (dict.aka[tileId]) return dict.aka[tileId];
    if (dict.honors[tileId]) return dict.honors[tileId];
    const number = tileId[0];
    const suit = tileId[tileId.length - 1];
    return `${number} ${dict.suits[suit]}`;
}

function localizedMap(builder) {
    return supportedLanguages.reduce((acc, language) => {
        acc[language] = builder(language);
        return acc;
    }, {});
}

function buildTileNameQuestions(count = 10, pool = TILE_NAME_IDS) {
    return shuffled(pool).slice(0, count).map((tileId) => {
        const distractors = shuffled(sameFamilyTiles(tileId).filter((candidate) => candidate !== tileId)).slice(0, 3);
        const optionIds = shuffled([tileId, ...distractors]);
        return {
            hand: [tileId],
            choices: localizedMap((language) => optionIds.map((id) => tileDisplayName(id, language))),
            answer: localizedMap((language) => tileDisplayName(tileId, language)),
            explain: localizedMap((language) => tileExplain(tileId, language))
        };
    });
}

function tileExplain(tileId, language) {
    const dict = TILE_NAME_COPY[language] || TILE_NAME_COPY[defaultLanguage];
    const name = tileDisplayName(tileId, language);
    if (dict.aka[tileId]) {
        return tileExplainForSuit(tileId, name, 5, dict, language, true);
    }
    if (dict.honors[tileId]) {
        const kind = tileId[0] <= "4" ? "viento" : "dragón";
        const msg = {
            es: `${name}. Es un honor de ${kind}; los honores no pertenecen a ningún palo.`,
            en: `${name}. It is a ${kind === "viento" ? "wind" : "dragon"} honor; honors belong to no suit.`,
            pt: `${name}. É um honor de ${kind === "viento" ? "vento" : "dragão"}; os honores não pertencem a nenhum naipe.`
        };
        return msg[language] || msg[defaultLanguage];
    }
    const number = Number(tileId[0]);
    return tileExplainForSuit(tileId, name, number, dict, language, false);
}

function tileExplainForSuit(tileId, name, number, dict, language, isAka) {
    const suit = tileId[tileId.length - 1];
    const suitName = dict.suits[suit];
    let what;
    if (language === "es") {
        what = suit === "m" ? "caracteres" : suit === "p" ? "círculos (pin)" : suit === "s" ? "bambúes (sou)" : "";
        const count = isAka ? 5 : number;
        return isAka
            ? `${name}. Es un ${suitName} rojo; aunque vale 5, va pintado en rojo (aka).`
            : `${name}. Los ${suitName} son ${what}; hay ${count} juntos, así que es el ${count}.`;
    }
    if (language === "pt") {
        what = suit === "m" ? "caracteres" : suit === "p" ? "círculos (pin)" : suit === "s" ? "bambus (sou)" : "";
        const count = isAka ? 5 : number;
        return isAka
            ? `${name}. É um ${suitName} vermelho; embora valha 5, é pintado em vermelho (aka).`
            : `${name}. Os ${suitName} são ${what}; há ${count} juntos, então é o ${count}.`;
    }
    what = suit === "m" ? "characters" : suit === "p" ? "dots (pin)" : suit === "s" ? "bamboo (sou)" : "";
    const count = isAka ? 5 : number;
    return isAka
        ? `${name}. It is a red ${suitName}; even though it counts as 5, it is painted red (aka).`
        : `${name}. ${suitName} are ${what}; there are ${count} of them, making it the ${count}.`;
}

function sameFamilyTiles(tileId) {
    const suit = tileId[tileId.length - 1];
    return TILE_NAME_IDS.filter((candidate) => candidate[candidate.length - 1] === suit);
}

function buildChinitsuQuestions(count = 10) {
    const pool = buildChinitsuPool(100, 20);
    const picked = shuffled(pool).slice(0, count);
    return picked.map((entry) => buildChinitsuQuestion(entry.hand, entry.waits, entry.trick));
}

function buildChinitsuPool(maxValid = 100, maxTrick = 20) {
    const valid = [];
    const tricks = [];
    const seenValid = new Set();
    const seenTrick = new Set();
    const suits = ["m", "p", "s"];
    let guard = 0;
    while ((valid.length < maxValid || tricks.length < maxTrick) && guard < 200000) {
        guard++;
        const suit = suits[rint(0, 2)];
        const needTrick = tricks.length < maxTrick && Math.random() < 0.2;
        const data = needTrick ? buildChinitsuTrick(suit) : buildChinitsuTenpai(suit);
        if (!data) continue;
        const key = `${data.hand.join(",")}|${data.waits.join(",")}`;
        if (data.trick || data.waits.length === 0) {
            if (seenTrick.has(key) || tricks.length >= maxTrick) continue;
            seenTrick.add(key);
            tricks.push({ hand: data.hand, waits: [], trick: true });
        } else {
            if (seenValid.has(key) || valid.length >= maxValid) continue;
            seenValid.add(key);
            valid.push({ hand: data.hand, waits: data.waits, trick: false });
        }
    }
    return [...valid, ...tricks];
}

function buildChinitsuQuestion(hand, waits, isTrick) {
    const suit = hand[0][hand[0].length - 1];
    const sortedHand = sortHand(hand);

    const tileChoices = shuffledChinitsuChoices(suit, waits);
    const explain = isTrick
        ? localizedMap((language) => {
            const txt = {
                es: "Esta mano no está en tenpai: ninguna ficha la completa. A veces la mejor respuesta es no ver ninguna espera.",
                en: "This hand is not in tenpai: no tile completes it. Sometimes the right call is to select no wait.",
                pt: "Esta mão não está em tenpai: nenhuma peça a completa. Às vezes a resposta certa é não marcar espera."
            };
            return txt[language] || txt.en;
        })
        : localizedMap((language) => {
            const txt = {
                es: `Toda la mano es de un solo palo (chinitsu). Esperas: ${waits.join(", ")}.`,
                en: `The whole hand is one suit (chinitsu). Waits: ${waits.join(", ")}.`,
                pt: `Toda a mão é de um só naipe (chinitsu). Esperas: ${waits.join(", ")}.`
            };
            return txt[language] || txt.en;
        });

    return {
        hand: sortedHand,
        waits,
        tileChoices,
        explain
    };
}

function shuffledChinitsuChoices(suit, waits) {
    const pool = [];
    for (let n = 1; n <= 9; n++) {
        const id = `${n}${suit}`;
        if (!waits.includes(id)) pool.push(id);
    }
    const distractors = shuffled(pool).slice(0, 9 - waits.length);
    return shuffled([...waits, ...distractors]);
}

function chinitsuCounts(hand) {
    const c = {};
    hand.forEach((t) => { c[t] = (c[t] || 0) + 1; });
    return c;
}

function chinitsuCanAdd(c, id) {
    return (c[id] || 0) < 4;
}

function chinitsuIsWinning(tiles) {
    if (tiles.length % 3 !== 2) return false;
    const counts = {};
    tiles.forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
    return chinitsuTryGroups(counts);
}

function chinitsuTryGroups(counts) {
    const keys = Object.keys(counts).filter((k) => counts[k] > 0).sort();
    if (keys.length === 0) return true;
    const first = keys[0];
    if (counts[first] >= 2) { counts[first] -= 2; const ok = chinitsuTryGroups(counts); counts[first] += 2; if (ok) return true; }
    if (counts[first] >= 3) { counts[first] -= 3; const ok = chinitsuTryGroups(counts); counts[first] += 3; if (ok) return true; }
    const suit = first[first.length - 1];
    if (suit !== "z") {
        const n = Number(first.slice(0, -1));
        if ((counts[`${n + 1}${suit}`] || 0) > 0 && (counts[`${n + 2}${suit}`] || 0) > 0) {
            counts[first] -= 1; counts[`${n + 1}${suit}`] -= 1; counts[`${n + 2}${suit}`] -= 1;
            const ok = chinitsuTryGroups(counts);
            counts[first] += 1; counts[`${n + 1}${suit}`] += 1; counts[`${n + 2}${suit}`] += 1;
            if (ok) return true;
        }
    }
    return false;
}

function chinitsuFindWaits(hand, suit) {
    const waits = [];
    for (let n = 1; n <= 9; n++) {
        const cand = `${n}${suit}`;
        if (hand.filter((t) => t === cand).length >= 4) continue;
        if (chinitsuIsWinning([...hand, cand])) waits.push(cand);
    }
    return waits;
}

function chinitsuBuildMelds(suit, c) {
    const melds = [];
    for (let m = 0; m < 4; m++) {
        let meld = null;
        for (let attempt = 0; attempt < 40 && !meld; attempt++) {
            if (Math.random() < 0.5) {
                const a = rint(1, 7);
                const ids = [`${a}${suit}`, `${a + 1}${suit}`, `${a + 2}${suit}`];
                if (ids.every((id) => chinitsuCanAdd(c, id))) meld = ids;
            } else {
                const a = rint(1, 9);
                const id = `${a}${suit}`;
                if (chinitsuCanAdd(c, id)) meld = [id, id, id];
            }
        }
        if (!meld) return null;
        meld.forEach((id) => { c[id] = (c[id] || 0) + 1; });
        melds.push(meld);
    }
    return melds;
}

function buildChinitsuTenpai(suit) {
    for (let trial = 0; trial < 60; trial++) {
        const c = {};
        const melds = chinitsuBuildMelds(suit, c);
        if (!melds) continue;
        const hand = [];
        melds.forEach((m) => hand.push(...m));
        const avail = [];
        for (let n = 1; n <= 9; n++) {
            const id = `${n}${suit}`;
            if (chinitsuCanAdd(c, id)) avail.push(id);
        }
        if (!avail.length) continue;
        const tanki = avail[rint(0, avail.length - 1)];
        hand.push(tanki);
        if (hand.length !== 13) continue;
        const waits = chinitsuFindWaits(hand, suit);
        if (waits.length > 0) return { hand, waits, isChinitsu: true };
    }
    return null;
}

function buildChinitsuTrick(suit) {
    for (let trial = 0; trial < 80; trial++) {
        const c = {};
        const melds = chinitsuBuildMelds(suit, c);
        if (!melds) continue;
        const hand = [];
        melds.slice(0, 3).forEach((m) => hand.push(...m));
        for (let i = 0; i < 4; i++) {
            let id = null;
            for (let a = 0; a < 30 && !id; a++) {
                const cand = `${rint(1, 9)}${suit}`;
                if (chinitsuCanAdd(c, cand)) id = cand;
            }
            if (!id) break;
            c[id] = (c[id] || 0) + 1;
            hand.push(id);
        }
        if (hand.length !== 13) continue;
        const waits = chinitsuFindWaits(hand, suit);
        if (waits.length === 0) return { hand, waits: [], isChinitsu: true };
    }
    return null;
}

function shuffle(array) {
    return shuffled(array);
}

const state = {
    language: getInitialLanguage(),
    page: document.body.dataset.modulePage,
    round: 0,
    score: 0,
    selected: null,
    answered: false,
    results: [],
    tileMode: "all",
    started: false
};

//: Which API drill key each page loads, plus its question count.
const PAGE_DRILL = {
    waits: { drill: "waits", count: 10 },
    esperaTipo: { drill: "esperaTipo", count: 10 },
    esperaFichas: { drill: "esperaFichas", count: 10 },
    han: { drill: "han", count: 10 },
    calc: { drill: "calc", count: 10 },
    fu: { drill: "fu", count: 10 },
    valores: { drill: "valores", count: 10 },
    chinitsu: { drill: "chinitsu", count: 10 },
    yaku: { drill: "yaku", count: 10 },
    furiten: { drill: "furiten", count: 10 },
    tileName: { drill: "tileName", count: 10 }
};

//: Landing (start) copy per module, in the three languages.
const START_COPY = {
    waits: { title: { es: "Encuentra la Espera", en: "Find the Wait", pt: "Encontre a Espera" }, subtitle: { es: "Mira la mano diez veces y elige cada vez la ficha que la completa.", en: "Look at the hand ten times and pick the tile that completes it each time.", pt: "Olhe a mão dez vezes e escolha a peça que a completa de cada vez." } },
    esperaTipo: { title: { es: "¿Qué espera es?", en: "Which Wait Is It?", pt: "Qual Espera É?" }, subtitle: { es: "Mira la mano tenpai y elige el nombre de la espera.", en: "Look at the tenpai hand and choose the name of the wait.", pt: "Veja a mão em tenpai e escolha o nome da espera." } },
    esperaFichas: { title: { es: "¿Qué fichas esperas?", en: "Which Tiles Do You Wait On?", pt: "Quais Peças Você Espera?" }, subtitle: { es: "Selecciona todas las fichas que completan tu mano.", en: "Select all the tiles that complete your hand.", pt: "Selecione todas as peças que completam sua mão." } },
    han: { title: { es: "Cuenta los Han", en: "Count Han", pt: "Conte os Han" }, subtitle: { es: "Identifica los yaku y cuenta el total de han de la mano ganadora.", en: "Identify the yaku and count the total han of the winning hand.", pt: "Identifique os yaku e conte o total de han da mão vencedora." } },
    calc: { title: { es: "Cuenta el Puntaje", en: "Count Points", pt: "Conte a Pontuação" }, subtitle: { es: "Con la información de han y fu, elige los puntos que paga la mano.", en: "Using the han and fu info, choose the points the hand pays.", pt: "Com a informação de han e fu, escolha os pontos que a mão paga." } },
    fu: { title: { es: "Cuenta los Fu", en: "Count Fu", pt: "Conte os Fu" }, subtitle: { es: "Elige el total de fu correcto para la situación simplificada.", en: "Choose the correct fu total for the simplified situation.", pt: "Escolha o total correto de fu para a situação simplificada." } },
    valores: { title: { es: "Tabla de Valores", en: "Value Table", pt: "Tabela de Valores" }, subtitle: { es: "Dados han + fu + dealer/no-dealer, elige los puntos correctos según ganes por Ron o Tsumo.", en: "Given han + fu + dealer/non-dealer, pick the correct points for Ron or Tsumo.", pt: "Dados han + fu + dealer/não-dealer, escolha os pontos corretos por Ron ou Tsumo." } },
    chinitsu: { title: { es: "¿Chinitsu?", en: "Is It Chinitsu?", pt: "É Chinitsu?" }, subtitle: { es: "Toda la mano es de un solo palo. Selecciona todas las fichas que la completan.", en: "The whole hand is one suit. Select all the tiles that complete it.", pt: "Toda a mão é de um só naipe. Selecione as peças que a completam." } },
    yaku: { title: { es: "Identifica el Yaku", en: "Identify the Yaku", pt: "Identifique o Yaku" }, subtitle: { es: "Diez manos rápidas. Selecciona los yaku que reconoces y recibe feedback al instante.", en: "Ten quick hands. Select the yaku you recognize and get instant feedback.", pt: "Dez mãos rápidas. Selecione os yaku que reconhece e receba feedback imediato." } },
    furiten: { title: { es: "¿Estoy en Furiten?", en: "Am I in Furiten?", pt: "Estou em Furiten?" }, subtitle: { es: "Tu mano está en tenpai. Mira los descartes de los cuatro jugadores: ¿la ficha que necesitas está en TUS descartes?", en: "Your hand is tenpai. Check the four players' discards: is the tile you need in YOUR discards?", pt: "Sua mão está em tenpai. Veja os descartes dos quatro jogadores: a peça que precisa está nos SEUS descartes?" } },
    tileName: { title: { es: "¿Qué ficha es?", en: "Which Tile Is It?", pt: "Que peça é?" }, subtitle: { es: "Mira la ficha y elige su nombre. Aka significa cinco rojo.", en: "Look at the tile and choose its name. Aka means red five.", pt: "Veja a peça e escolha seu nome. Aka significa cinco vermelho." } }
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector("#themeToggle");
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    Object.assign(els, {
        langSelect: document.querySelector("#languageSelect"),
        startView: document.querySelector("#startView"),
        startButton: document.querySelector("#startButton"),
        startTitle: document.querySelector("#startTitle"),
        startSubtitle: document.querySelector("#startSubtitle"),
        quizCard: document.querySelector("#quizCard"),
        tileModes: document.querySelector("#tileModes"),
        languageSelect: document.querySelector("#languageSelect"),
        roundLabel: document.querySelector("#roundLabel"),
        scoreLabel: document.querySelector("#scoreLabel"),
        hand: document.querySelector("#hand"),
        roundContext: document.querySelector("#roundContext"),
        questionTitle: document.querySelector("#questionTitle"),
        questionHelp: document.querySelector("#questionHelp"),
        choices: document.querySelector("#choices"),
        feedback: document.querySelector("#feedback"),
        feedbackTitle: document.querySelector("#feedbackTitle"),
        feedbackText: document.querySelector("#feedbackText"),
        submitButton: document.querySelector("#submitButton"),
        nextButton: document.querySelector("#nextButton"),
        restartButton: document.querySelector("#restartButton"),
        furitenTable: document.querySelector("#furitenTable"),
        resultsCard: document.querySelector("#resultsCard"),
        resultsBody: document.querySelector("#resultsBody"),
        resultsScore: document.querySelector("#resultsScore"),
        tileExplainModal: document.querySelector("#tileExplainModal"),
        tileExplainTile: document.querySelector("#tileExplainTile"),
        tileExplainTitle: document.querySelector("#tileExplainTitle"),
        tileExplainText: document.querySelector("#tileExplainText")
    });

    // Seed a local question set so the module is instantly playable even if the
    // API is unreachable; it is refreshed from the API once reachable.
    seedLocalQuestions();

    els.languageSelect.value = state.language;
    els.languageSelect.addEventListener("change", (event) => {
        state.language = event.target.value;
        localStorage.setItem(languageStorageKey, state.language);
        applyLanguage();
        if (state.page === "tileName") applyLanguage();
        if (state.started) render();
    });
    els.submitButton.addEventListener("click", submit);
    els.nextButton.addEventListener("click", next);
    els.restartButton.addEventListener("click", restart);
    document.addEventListener("keydown", handleKeyboard);

    const startButton = els.startButton;
    if (startButton) startButton.addEventListener("click", startGame);
    const replayButton = document.querySelector("#replayButton");
    if (replayButton) replayButton.addEventListener("click", restart);
    const backButton = document.querySelector("#backButton");
    if (backButton) backButton.addEventListener("click", showLanding);

    if (state.page === "tileName" && els.tileModes) {
        renderTileModes();
    }
    if (state.page === "tileName") {
        const backModeButton = document.querySelector("#backModeButton");
        if (backModeButton) backModeButton.addEventListener("click", showTileStart);
        const replayButton = document.querySelector("#replayButton");
        if (replayButton) replayButton.addEventListener("click", restart);
    }

    applyLanguage();
    if (hasStartView()) {
        showLanding();
    } else {
        startGame();
    }
    // Refresh questions from the API when it is reachable.
    if (window.RinconAPI) {
        window.RinconAPI.check().then((online) => {
            if (!online) return;
            window.RinconAPI.practice(PAGE_DRILL[state.page].drill, PAGE_DRILL[state.page].count)
                .then((payload) => {
                    const questions = (payload && payload.questions) || [];
                    if (!questions.length) return;
                    modules[state.page].questions = mapApiQuestions(state.page, questions);
                    if (state.started) {
                        state.round = 0;
                        state.score = 0;
                        state.results = [];
                        render();
                    }
                }).catch(() => {});
        }).catch(() => {});
    }
});

function hasStartView() {
    // tileName keeps its own mode-picker landing (no single Start button).
    if (state.page === "tileName") return Boolean(els.startView && els.tileModes);
    return Boolean(els.startView && els.startButton);
}

function showLanding() {
    if (!hasStartView()) return;
    state.started = false;
    els.startView.hidden = false;
    if (els.quizCard) els.quizCard.hidden = true;
    if (els.resultsCard) els.resultsCard.hidden = true;
    if (state.page === "tileName") {
        if (els.tileModes) renderTileModes();
        return;
    }
    if (els.startTitle) els.startTitle.textContent = localized(START_COPY[state.page].title);
    if (els.startSubtitle) els.startSubtitle.textContent = localized(START_COPY[state.page].subtitle);
    const chibi = getFeedbackCoach();
    const coachImg = document.querySelector("#startChibi");
    if (coachImg) coachImg.src = chibi;
}

function startGame() {
    state.started = true;
    state.round = 0;
    state.score = 0;
    state.results = [];
    if (els.startView) els.startView.hidden = true;
    if (els.resultsCard) els.resultsCard.hidden = true;
    if (els.quizCard) els.quizCard.hidden = false;
    render();
    if (els.quizCard && els.quizCard.scrollIntoView) els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function seedLocalQuestions() {
    switch (state.page) {
        case "furiten": modules.furiten.questions = buildFuritenQuestions(); break;
        case "esperaTipo": modules.esperaTipo.questions = buildWaitQuestionsLocal(10, false); break;
        case "esperaFichas": modules.esperaFichas.questions = buildWaitQuestionsLocal(10, true); break;
        case "waits": modules.waits.questions = buildWaitTileQuestionsLocal(10); break;
        case "tileName": modules.tileName.questions = buildTileNameQuestions(10); break;
        case "chinitsu": modules.chinitsu.questions = buildChinitsuQuestions(10); break;
        case "valores": modules.valores.questions = pickValoresRound(10); break;
        case "han": modules.han.questions = buildLocalScoreDrill("han"); break;
        case "calc": modules.calc.questions = buildLocalScoreDrill("calc"); break;
        case "fu": modules.fu.questions = buildLocalScoreDrill("fu"); break;
        default: break;
    }
}

function esPage(name) {
    return state.page === name;
}

//: Turn a batch of API questions into the internal question shapes each page
//: expects. The API returns a superset of fields; we map by module.
function mapApiQuestions(page, questions) {
    switch (page) {
        case "esperaTipo":
            return questions.map(apiWaitQuestion);
        case "esperaFichas":
            return questions.map(apiWaitQuestion);
        case "waits":
            return questions.map(apiWaitQuestion);
        case "chinitsu":
            return questions.map((q) => ({
                hand: q.hand,
                waits: q.waits,
                tileChoices: q.tile_choices,
                explain: q.explain
            }));
        case "furiten":
            return questions.map(apiFuritenQuestion);
        case "yaku":
            return questions.map(apiYakuQuestion);
        case "tileName":
            return questions.map(apiTileNameQuestion);
        default:
            return questions.map(apiScoreQuestion);
    }
}

//: Normalise the shared fields the scoring modules (han/calc/fu/valores) use.
function apiScoreQuestion(q) {
    const out = { ...q };
    if (q.winning_tile != null) out.winningTile = q.winning_tile;
    delete out.winning_tile;
    return out;
}

function apiWaitQuestion(q) {
    const isTile = Boolean(q.choices);
    if (isTile) {
        return {
            hand: q.hand,
            waits: q.waits,
            waitName: q.wait_name,
            waitKey: q.wait_key,
            choices: q.choices,
            answer: q.answer,
            explain: q.explain
        };
    }
    const hasTileChoices = Boolean(q.tile_choices);
    if (hasTileChoices) {
        return {
            hand: q.hand,
            waits: q.waits,
            waitName: q.wait_name,
            waitKey: q.wait_key,
            tileChoices: q.tile_choices,
            explain: q.explain
        };
    }
    return {
        hand: q.hand,
        waits: q.waits,
        waitName: q.wait_name,
        waitKey: q.wait_key,
        choices: q.choices,
        answer: q.answer,
        explain: q.explain
    };
}

function apiFuritenQuestion(q) {
    return {
        hand: q.hand,
        waits: q.waits,
        waitName: q.wait_type,
        mainSeat: q.main_seat,
        roundWind: q.round_wind,
        seatWind: q.main_seat,
        discards: q.discards,
        calls: q.calls || [],
        furiten: q.furiten,
        choices: ["Furiten", "No furiten"],
        answer: q.furiten ? "Furiten" : "No furiten",
        explain: {
            es: q.furiten
                ? `Estás en furiten: la ficha que necesitas (${q.waits.join(", ")}) está en TUS descartes.`
                : `No estás en furiten: la ficha que necesitas (${q.waits.join(", ")}) NO está en tus descartes.`,
            en: q.furiten
                ? `You are in furiten: the tile you need (${q.waits.join(", ")}) is in YOUR discards.`
                : `You are not in furiten: the tile you need (${q.waits.join(", ")}) is NOT in your discards.`,
            pt: q.furiten
                ? `Você está em furiten: a peça que precisa (${q.waits.join(", ")}) está nos SEUS descartes.`
                : `Você não está em furiten: a peça que precisa (${q.waits.join(", ")}) NÃO está nos seus descartes.`
        }
    };
}

function apiYakuQuestion(q) {
    const correct = q.correct || [];
    const labelMap = {
        yakuhai: "Yakuhai", tanyao: "Tanyao", chiitoitsu: "Chiitoitsu",
        toitoi: "Toitoi", honroutou: "Honroutou", honitsu: "Honitsu",
        chinitsu: "Chinitsu", iipeikou: "Iipeikou", sanshoku: "Sanshoku Doujun", ittsu: "Ittsu"
    };
    return {
        hand: q.hand,
        winningTile: q.winning_tile,
        context: q.context,
        correct: correct.map((id) => labelMap[id] || id),
        labelChoices: q.label_choices,
        yakuCorrect: correct.map((id) => labelMap[id] || id),
        explain: q.explain
    };
}

function apiTileNameQuestion(q) {
    return {
        hand: q.hand,
        tileId: q.tile_id,
        choices: q.choices,
        answer: q.answer,
        explain: q.explain
    };
}

//: Local single-choice wait drill (fallback when the API is down).
function buildWaitTileQuestionsLocal(count) {
    const questions = [];
    const seen = new Set();
    let guard = 0;
    while (questions.length < count && guard < 500) {
        guard++;
        const q = buildWaitQuestion();
        if (!q) continue;
        const key = q.hand.join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const answer = q.waits[0];
        const distract = randomTiles(5, q.waits);
        questions.push({
            hand: q.hand,
            waits: q.waits,
            waitName: q.waitName,
            waitKey: q.waitKey,
            choices: shuffle([answer, ...distract]),
            answer,
            explain: {
                es: `Espera ${q.waitName}: completas con ${q.waits.join(", ")}.`,
                en: `It's a ${q.waitName} wait: you complete with ${q.waits.join(", ")}.`,
                pt: `Espera ${q.waitName}: você completa com ${q.waits.join(", ")}.`
            }
        });
    }
    return questions;
}

//: Local fallback drills for the scoring modules. These reuse the value pool to
//: produce plausible (han/fu/calc) questions without a full local engine.
function buildLocalScoreDrill(type, count = 10) {
    const pool = buildValoresPool();
    const picked = shuffle(pool).slice(0, count);
    return picked.map((q) => {
        if (type === "han") {
            return {
                hand: [],
                context: q.context,
                winningTile: null,
                choices: shuffle(["1", "2", "3", "4", "5"]),
                answer: String(Math.min(5, q.context.han)),
                explain: q.explain
            };
        }
        if (type === "fu") {
            const fu = Math.max(20, Math.round(q.context.fu / 10) * 10);
            const fuChoices = ["20 fu", "25 fu", "30 fu", "40 fu", "50 fu", "60 fu", "70 fu"];
            const answer = `${fu} fu`;
            const pool = fuChoices.filter((c) => c !== answer);
            const distract = shuffle(pool).slice(0, 3);
            return {
                hand: [],
                context: q.context,
                winningTile: null,
                choices: [answer, ...distract],
                answer,
                explain: q.explain
            };
        }
        return {
            hand: [],
            context: q.context,
            winningTile: null,
            choices: q.choices,
            answer: q.answer,
            explain: q.explain
        };
    });
}

async function setWaitQuestions(moduleName, count, multi) {
    buildWaitQuestions(count, multi).then((questions) => {
        modules[moduleName].questions = questions;
        state.round = 0;
        state.score = 0;
        render();
    });
}

function renderTileModes() {
    els.tileModes.replaceChildren(...TILE_NAME_MODES.map((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tile-mode";
        const img = tileImage(mode.rep);
        img.style.width = "clamp(2.6rem, 3.6vw, 3.4rem)";
        const label = document.createElement("span");
        label.textContent = mode.label[state.language] || mode.label[defaultLanguage];
        button.append(img, label);
        button.addEventListener("click", () => startTileQuiz(mode.id));
        return button;
    }));
}

function showTileStart() {
    const resultsCard = document.querySelector("#resultsCard");
    if (resultsCard) resultsCard.hidden = true;
    els.quizCard.hidden = true;
    if (els.startView) els.startView.hidden = false;
    if (els.tileModes) renderTileModes();
}

function handleKeyboard(event) {
    const tag = document.activeElement?.tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;

    if (event.key === "Enter") {
        event.preventDefault();
        if (els.restartButton.hidden === false) restart();
        else if (els.nextButton.hidden === false) next();
        else submit();
        return;
    }

    const choiceButtons = [...els.choices.querySelectorAll(".answer-button")];
    if (!choiceButtons.length) return;
    const currentIndex = choiceButtons.findIndex((button) => button.classList.contains("is-selected"));
    const upKeys = ["ArrowUp", "ArrowLeft"];
    const downKeys = ["ArrowDown", "ArrowRight"];

    let nextIndex = null;
    if (upKeys.includes(event.key)) nextIndex = currentIndex < 0 ? choiceButtons.length - 1 : (currentIndex - 1 + choiceButtons.length) % choiceButtons.length;
    else if (downKeys.includes(event.key)) nextIndex = (currentIndex + 1) % choiceButtons.length;
    if (nextIndex == null) return;

    event.preventDefault();
    const button = choiceButtons[nextIndex];
    button.click();
    button.focus({ preventScroll: true });
}

function render() {
    const module = modules[state.page];
    const question = module.questions[state.round];
    state.selected = null;
    state.answered = false;
    els.feedback.hidden = true;
    if (els.tileExplainModal) els.tileExplainModal.hidden = true;
    els.submitButton.hidden = false;
    els.nextButton.hidden = true;
    els.restartButton.hidden = true;
    els.roundLabel.textContent = `${state.round + 1} / ${module.questions.length}`;
    els.scoreLabel.textContent = `${t("score")}: ${state.score}`;
    els.questionTitle.textContent = module.title[state.language];
    els.questionHelp.textContent = module.help[state.language];
    if (state.page === "furiten") {
        renderFuriten(question);
    } else {
        if (state.page !== "esperaTipo" && state.page !== "esperaFichas" && state.page !== "waits" && state.page !== "tileName" && state.page !== "chinitsu") {
            renderContext(question.context);
        } else if ((state.page === "tileName" || state.page === "chinitsu") && els.roundContext) {
            els.roundContext.replaceChildren();
        }
        if (question.winningTile) {
            els.hand.replaceChildren(...renderHand(question));
        } else {
            els.hand.replaceChildren(...question.hand.map(tileImage));
        }
    }
    if (module.multi || state.page === "yaku") {
        state.selected = [];
        els.choices.replaceChildren(...renderChoiceButtons(question));
    } else {
        els.choices.replaceChildren(...localized(question.choices).map(choiceButton));
    }
}

//: Build the answer buttons for multi-select drills (tiles) and the yaku drill
//: (label names). Yaku buttons stay text-based; tile drills use tile images.
function renderChoiceButtons(question) {
    const multi = modules[state.page].multi;
    const keys = multi ? question.tileChoices : question.labelChoices;
    return keys.map((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        const isTile = multi || /^[0-9][mpsz]$/.test(choice);
        button.className = `answer-button${isTile ? " choice-tile" : ""}`;
        button.dataset.choice = choice;
        if (isTile) button.append(tileImage(choice));
        else button.textContent = choice;
        button.addEventListener("click", () => {
            if (state.answered) return;
            const selected = state.selected;
            const idx = selected.indexOf(choice);
            if (idx >= 0) {
                selected.splice(idx, 1);
                button.classList.remove("is-selected");
            } else {
                selected.push(choice);
                button.classList.add("is-selected");
            }
        });
        return button;
    });
}

function renderFuriten(question) {
    els.hand.replaceChildren(...question.hand.map(tileImage));
    if (els.furitenTable) {
        els.furitenTable.replaceChildren(buildFuritenTable(question));
    }
    const container = els.furitenTable ? els.furitenTable.parentElement : null;
    if (container) {
        const old = container.querySelector(".furiten-calls-wrap");
        if (old) old.remove();
        const calls = renderFuritenCalls(question);
        if (calls) {
            const wrap = document.createElement("div");
            wrap.className = "furiten-calls-wrap";
            wrap.append(calls);
            els.furitenTable.insertAdjacentElement("afterend", wrap);
        }
    }
}

//: Render the exposed melds (pon/chi/kan) the subject made, with caller + source.
function renderFuritenCalls(question) {
    if (!question.calls || !question.calls.length) return null;
    const wrap = document.createElement("div");
    wrap.className = "furiten-calls";
    const label = document.createElement("span");
    label.className = "furiten-calls-label";
    label.textContent = "Llamadas";
    wrap.append(label);
    question.calls.forEach((call) => {
        const chip = document.createElement("span");
        chip.className = `furiten-call furiten-call-${String(call.type || "").toLowerCase()}${call.closed ? " is-closed" : ""}`;
        const kind = document.createElement("span");
        kind.className = "furiten-call-kind";
        kind.textContent = call.by === question.seatWind
            ? (call.closed ? `${call.type} cerrado` : call.type)
            : call.type;
        chip.append(kind);
        const callTiles = document.createElement("span");
        callTiles.className = "furiten-call-tiles";
        callTiles.append(...call.tiles.map((t) => {
            const img = tableTile(t);
            return img;
        }));
        chip.append(callTiles);
        const meta = document.createElement("span");
        meta.className = "furiten-call-meta";
        meta.textContent = call.from ? `de ${call.from}` : "";
        chip.append(meta);
        wrap.append(chip);
    });
    return wrap;
}

function buildFuritenTable(question) {
    const table = document.createElement("div");
    table.className = "furiten-table";

    const center = document.createElement("div");
    center.className = "furiten-center";
    const windLabel = document.createElement("div");
    windLabel.className = "furiten-windlabel";
    windLabel.textContent = `E ${question.roundWind || "East"}`;
    const seat = document.createElement("div");
    seat.className = "furiten-seatlabel";
    seat.textContent = question.seatWind;
    center.append(windLabel, seat);
    table.append(center);

    const positions = { North: "north", East: "east", South: "south", West: "west" };
    ["North", "East", "South", "West"].forEach((wind) => {
        const zone = document.createElement("div");
        zone.className = `furiten-zone furiten-${positions[wind]}${wind === question.seatWind ? " is-you" : ""}`;
        zone.dataset.wind = wind;
        const label = document.createElement("span");
        label.className = "furiten-label";
        label.textContent = wind === question.seatWind ? `${wind} · Tú` : wind;
        zone.append(label);
        const rowsWrap = document.createElement("div");
        rowsWrap.className = "furiten-rows";
        chunk(question.discards[wind], 6).forEach((row) => {
            const rowEl = document.createElement("div");
            rowEl.className = "furiten-row";
            rowEl.append(...row.map(tableTile));
            rowsWrap.append(rowEl);
        });
        zone.append(rowsWrap);
        table.append(zone);
    });

    return table;
}

function tableTile(tileId) {
    const img = tileImage(tileId);
    img.style.width = "1.2rem";
    img.style.height = "auto";
    img.style.flex = "0 0 auto";
    return img;
}

function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
    return result;
}

function renderContext(context = defaultContext) {
    if (!els.roundContext) return;
    const data = { ...defaultContext, ...context };
    let chips;
    if (state.page === "valores") {
        chips = [
            contextChip("Han", data.han),
            contextChip("Fu", data.fu),
            contextChip(t("position"), data.dealer ? "Dealer" : "No dealer"),
            contextChip(t("win"), data.win),
            honbaChip(data.honba || 0)
        ];
        els.roundContext.classList.add("context-lg");
    } else {
        els.roundContext.classList.remove("context-lg");
        const callText = data.calls?.length ? data.calls.map((call) => call.type).join(" + ") : t("none");
        chips = [
            contextChip(t("roundWind"), data.roundWind),
            contextChip(t("seatWind"), data.seatWind),
            contextChip(t("dora"), data.dora),
            contextChip(t("win"), data.win),
            contextChip(t("calls"), callText)
        ];
        if (data.riichi != null) chips.push(riichiChip(data.riichi));
        if (data.han != null) chips.push(contextChip("Han", data.han));
        if (data.fu != null) chips.push(contextChip("Fu", data.fu));
        if (data.dealer != null) chips.push(contextChip(t("position"), data.dealer ? "Dealer" : "No dealer"));
        if (data.honba != null) chips.push(honbaChip(data.honba));
    }
    els.roundContext.replaceChildren(...chips);
}

function riichiChip(declared) {
    const chip = document.createElement("span");
    chip.className = `context-chip riichi-chip${declared ? " is-on" : ""}`;
    const stick = document.createElement("img");
    stick.className = "riichi-stick";
    stick.src = "../assets/table/point-stick.svg";
    stick.alt = "";
    const text = document.createElement("span");
    text.textContent = declared ? "Riichi" : "Sin riichi";
    chip.title = declared ? "Palito riichi de 1000 puntos" : "No hay palito riichi en mesa";
    chip.append(stick, text);
    return chip;
}

function honbaChip(count) {
    const chip = document.createElement("span");
    chip.className = "context-chip honba-chip";
    chip.innerHTML = `Honba: <b>${count}</b>`;
    return chip;
}

function contextChip(label, value) {
    const chip = document.createElement("span");
    chip.className = "context-chip";
    chip.append(`${label}: `);
    if (looksLikeTile(value)) chip.append(tileImage(value));
    else chip.append(value);
    return chip;
}

function renderHand(question) {
    const nodes = question.hand.map(tileImage);
    (question.context?.calls || []).forEach((call) => nodes.push(meldGroup(call)));
    if (question.winningTile) nodes.push(winningTileNode(question.winningTile, question.context?.win));
    return nodes;
}

function winningTileNode(tileId, winType) {
    const wrapper = document.createElement("span");
    wrapper.className = `winning-tile win-${String(winType || "").toLowerCase()}`;
    const img = tileImage(tileId);
    wrapper.append(img);
    const badge = document.createElement("span");
    badge.className = "winning-tile-label";
    badge.textContent = winType || "";
    wrapper.append(badge);
    return wrapper;
}

function meldGroup(call) {
    const group = document.createElement("span");
    group.className = "meld-group";
    group.dataset.call = call.type;
    call.tiles.forEach((tile) => {
        const img = tileImage(tile);
        group.append(img);
    });
    return group;
}

function choiceButton(choice) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `answer-button${looksLikeTile(choice) ? " choice-tile" : ""}`;
    button.dataset.choice = choice;
    if (looksLikeTile(choice)) button.append(tileImage(choice));
    else button.textContent = choice;
    button.addEventListener("click", () => {
        if (state.answered) return;
        const multi = modules[state.page].multi;
        if (multi) {
            const selected = state.selected;
            if (selected.includes(choice)) {
                selected.splice(selected.indexOf(choice), 1);
                button.classList.remove("is-selected");
            } else {
                selected.push(choice);
                button.classList.add("is-selected");
            }
        } else {
            state.selected = choice;
            [...els.choices.children].forEach((item) => item.classList.remove("is-selected"));
            button.classList.add("is-selected");
        }
    });
    return button;
}

function localized(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value[state.language] || value[defaultLanguage] || value.es || "";
    }
    return value;
}

function submit() {
    const module = modules[state.page];
    const question = module.questions[state.round];
    const multi = module.multi || state.page === "yaku";
    const allowEmpty = state.page === "chinitsu";
    const hasSelection = multi ? (state.selected && state.selected.length > 0) : Boolean(state.selected);
    if (!hasSelection && !allowEmpty) {
        els.feedback.hidden = false;
        ensureFeedbackCoach();
        els.feedbackTitle.textContent = `! ${t("choose")}`;
        els.feedbackText.textContent = "";
        return;
    }

    state.answered = true;

    // Determine correctness + expected answers for this module type.
    let correct;
    let correctAnswer;
    if (state.page === "yaku") {
        const missed = question.yakuCorrect.filter((id) => !state.selected.includes(id));
        const extra = state.selected.filter((id) => !question.yakuCorrect.includes(id));
        correct = missed.length === 0 && extra.length === 0;
        correctAnswer = question.yakuCorrect;
    } else if (multi) {
        correct = sameSet(state.selected || [], question.waits);
        correctAnswer = question.waits;
    } else {
        const expected = localized(question.answer);
        correct = state.selected === expected;
        correctAnswer = expected;
    }
    if (correct) state.score += 1;

    state.results.push({
        tile: (question.hand && question.hand[0]) || (question.tileId) || "1p",
        type: state.page,
        correct,
        userAnswer: state.selected,
        correctAnswer
    });

    booleanizeChoices(question, correct, correctAnswer, multi);
    els.scoreLabel.textContent = `${t("score")}: ${state.score}`;

    if (state.page === "tileName" && els.tileExplainModal) {
        showTileExplainModal(question, correct);
    } else {
        els.feedback.hidden = false;
        ensureFeedbackCoach();
        els.feedbackTitle.textContent = correct ? `✓ ${t("correct")}` : `× ${t("incorrect")}`;
        els.feedbackText.textContent = question.explain ? localized(question.explain) : "";
        revealWait(question);
    }
    els.submitButton.hidden = true;
    if (state.round === module.questions.length - 1) {
        els.nextButton.hidden = false;
    } else {
        els.nextButton.hidden = false;
    }
}

//: Colour the answer buttons after a submission.
function booleanizeChoices(question, correct, correctAnswer, multi) {
    const correctSet = Array.isArray(correctAnswer) ? new Set(correctAnswer) : new Set([correctAnswer]);
    [...els.choices.children].forEach((button) => {
        button.disabled = true;
        const value = button.dataset.choice;
        if (correctSet.has(value)) {
            button.classList.add("is-correct");
        } else if (state.selected && (multi ? state.selected.includes(value) : value === state.selected)) {
            button.classList.add("is-wrong");
        }
    });
}

function showTileExplainModal(question, correct) {
    const tileId = question.hand[0];
    els.tileExplainTile.replaceChildren(tileImage(tileId));
    els.tileExplainTitle.textContent = correct ? `✓ ${t("correct")}` : `× ${t("incorrect")}`;
    els.tileExplainTitle.classList.toggle("is-correct", correct);
    els.tileExplainTitle.classList.toggle("is-wrong", !correct);
    els.tileExplainText.textContent = localized(question.explain);
    els.tileExplainModal.hidden = false;
}

function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const set = new Set(b);
    return a.every((item) => set.has(item));
}

function revealWait(question) {
    if (!question.waits || question.waits.length === 0) return;
    const block = document.createElement("div");
    block.className = "feedback-reveal";
    const revealTiles = document.createElement("div");
    revealTiles.className = "feedback-reveal-tiles";
    revealTiles.append(...question.waits.map((t) => {
        const img = tileImage(t);
        img.style.width = "2.2rem";
        img.style.height = "auto";
        return img;
    }));
    block.append(revealTiles);
    if (question.waitName) {
        const name = document.createElement("span");
        name.className = "feedback-reveal-name";
        name.textContent = question.waitName;
        block.append(name);
    }
    els.feedback.append(block);
}

function next() {
    state.round += 1;
    const total = modules[state.page].questions.length;
    if (state.round >= total) {
        showResults();
        return;
    }
    render();
}

function showResults() {
    state.started = false;
    els.quizCard.hidden = true;
    if (els.startView) els.startView.hidden = true;
    if (els.resultsCard) els.resultsCard.hidden = false;
    renderResultsSummary();
    if (els.resultsCard && els.resultsCard.scrollIntoView) els.resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderResultsSummary() {
    const body = els.resultsBody;
    const scoreEl = els.resultsScore;
    const score = `${state.score} / ${state.results.length}`;
    if (scoreEl) scoreEl.textContent = score;
    if (body) {
        body.replaceChildren(...state.results.map((entry) => {
            const row = document.createElement("div");
            row.className = `results-row${entry.correct ? " is-correct" : " is-wrong"}`;
            const mark = document.createElement("span");
            mark.className = "results-mark";
            mark.textContent = entry.correct ? "✓" : "✕";
            const tile = document.createElement("span");
            tile.className = "results-tile";
            if (entry.tile && looksLikeTile(entry.tile)) tile.append(tileImage(entry.tile));
            else tile.textContent = formatResultText(entry);
            const correct = document.createElement("span");
            correct.className = "results-correct";
            correct.textContent = Array.isArray(entry.correctAnswer) ? entry.correctAnswer.join(", ") : entry.correctAnswer;
            const user = document.createElement("span");
            user.className = "results-user";
            user.textContent = Array.isArray(entry.userAnswer) ? entry.userAnswer.join(", ") : entry.userAnswer;
            row.append(mark, tile, correct, user);
            return row;
        }));
    }
}

//: Render a readable label in the results tile slot when the entry is not a tile.
function formatResultText(entry) {
    if (entry.type === "furiten") return entry.correct ? "No furiten" : "Furiten";
    return entry.correctAnswer == null ? "" : String(entry.correctAnswer);
}

function startTileQuiz(modeId) {
    const mode = TILE_NAME_MODES.find((m) => m.id === modeId) || TILE_NAME_MODES[0];
    state.tileMode = mode.id;
    const pool = mode.tiles();
    const count = Math.min(10, pool.length);
    modules.tileName.questions = buildTileNameQuestions(count, pool);
    state.round = 0;
    state.score = 0;
    state.results = [];
    state.started = true;
    if (els.startView) els.startView.hidden = true;
    if (els.resultsCard) els.resultsCard.hidden = true;
    els.quizCard.hidden = false;
    render();
}

function restart() {
    state.round = 0;
    state.score = 0;
    state.results = [];
    if (state.page === "tileName") {
        const mode = TILE_NAME_MODES.find((m) => m.id === state.tileMode) || TILE_NAME_MODES[0];
        const pool = mode.tiles();
        modules.tileName.questions = buildTileNameQuestions(Math.min(10, pool.length), pool);
        if (els.resultsCard) els.resultsCard.hidden = true;
        els.quizCard.hidden = false;
        if (els.startView) els.startView.hidden = true;
    }
    if (state.page === "chinitsu") {
        modules.chinitsu.questions = buildChinitsuQuestions(10);
    }
    if (state.page === "valores") {
        modules.valores.questions = pickValoresRound(10);
    }
    state.started = true;
    render();
}

function tileImage(tileId) {
    const img = document.createElement("img");
    img.src = `${tileBasePath}${tileId}.svg`;
    img.alt = tileId;
    return img;
}

function looksLikeTile(value) {
    return /^[0-9][mpsz]$/.test(value);
}

function getInitialLanguage() {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
}

function applyLanguage() {
    const dictionary = ui[state.language] || ui[defaultLanguage];
    document.documentElement.lang = state.language;
    document.title = modules[state.page].title[state.language];
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = resolveI18n(dictionary, element.dataset.i18n);
        if (typeof value === "string") element.textContent = value;
    });
}

function resolveI18n(dict, path) {
    return String(path).split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), dict);
}

function t(key) {
    return ui[state.language][key] || ui[defaultLanguage][key] || key;
}

const FEEDBACK_COACH = {
    waits: "chibi-wait",
    esperaTipo: "chibi-wait",
    esperaFichas: "chibi-wait",
    furiten: "chibi-wait",
    fu: "chibi-score",
    han: "chibi-score",
    calc: "chibi-score",
    valores: "chibi-score",
    chinitsu: "chibi-thinking"
};

function getFeedbackCoach() {
    const file = FEEDBACK_COACH[state.page];
    return `../assets/${file || "chibi-thinking"}.png`;
}

function ensureFeedbackCoach() {
    if (!els.feedback || els.feedback.dataset.coachInjected) return;
    const img = document.createElement("img");
    img.className = "feedback-coach sticker-img";
    img.src = getFeedbackCoach();
    img.alt = "Monique coach";
    els.feedback.prepend(img);
    els.feedback.dataset.coachInjected = "true";
}

/* ===== Scoring / value-table pool (valores) ===== */
const VALUE_HANS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const VALUE_FUS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const HONBA_VARIANTS = [0, 1, 2, 3];
const WIN_VARIANTS = ["Ron", "Tsumo"];

function ceilHundred(value) {
    return Math.ceil(value / 100) * 100;
}

function scoreLimit(han) {
    if (han >= 13) return { name: "yakuman", multiplier: 4 };
    if (han >= 11) return { name: "sanbaiman", multiplier: 3 };
    if (han >= 8) return { name: "baiman", multiplier: 2 };
    if (han >= 6) return { name: "haneman", multiplier: 1.5 };
    return null;
}

function basePoints(han, fu) {
    const limit = scoreLimit(han);
    if (limit) return 2000 * limit.multiplier;
    const fuValue = Math.max(fu, 20);
    const raw = fuValue * Math.pow(2, 2 + han);
    return Math.min(raw, 2000);
}

function scorePayments({ han, fu, dealer, win }) {
    const base = basePoints(han, fu);
    let payments;
    if (win === "Tsumo") {
        if (dealer) {
            const each = ceilHundred(base * 2);
            payments = { text: `${each} all`, split: [each, each, each] };
        } else {
            const nonDealer = ceilHundred(base * 1);
            const dealerPay = ceilHundred(base * 2);
            payments = nonDealer === dealerPay
                ? { text: `${nonDealer} all`, split: [nonDealer, nonDealer, nonDealer] }
                : { text: `${nonDealer}/${dealerPay}`, split: [nonDealer, nonDealer, dealerPay] };
        }
    } else {
        const total = ceilHundred(dealer ? base * 6 : base * 4);
        payments = { text: `${total}`, split: [total] };
    }
    return payments;
}

function describeScore(han, fu, dealer, win, honba) {
    const basePay = scorePayments({ han, fu, dealer, win });
    const honbaTotal = honba * 300;
    let main;
    if (win === "Tsumo") {
        const perPerson = honba * 100;
        if (basePay.split[0] === basePay.split[2]) {
            main = `${basePay.split[0] + perPerson} all`;
        } else {
            const dealerAdd = basePay.split[2] + perPerson;
            const nonDealerAdd = basePay.split[0] + perPerson;
            main = `${nonDealerAdd}/${dealerAdd}`;
        }
    } else {
        main = `${basePay.split[0] + honbaTotal}`;
    }
    const limit = scoreLimit(han);
    return { baseText: basePay.text, text: main, isLimit: Boolean(limit), limitName: limit ? limit.name : null };
}

function buildDistractors(correctText, han, fu, dealer, win, honba) {
    const candidates = new Set([correctText]);
    const attempts = 3;
    const variants = [
        { han: Math.max(1, han - 1), fu, dealer, win, honba },
        { han: han + 1, fu, dealer, win, honba },
        { han, fu: Math.max(20, fu - 10), dealer, win, honba },
        { han, fu: fu + 10, dealer, win, honba },
        { han, fu, dealer: !dealer, win, honba },
        { han, fu, dealer, win: win === "Ron" ? "Tsumo" : "Ron", honba },
        { han, fu, dealer, win, honba: Math.min(3, honba + 1) }
    ];
    variants.forEach((variant) => {
        if (candidates.size >= attempts + 1) return;
        try {
            const text = describeScore(variant.han, variant.fu, variant.dealer, variant.win, variant.honba).text;
            if (text !== correctText) candidates.add(text);
        } catch (e) { /* skip invalid */ }
    });
    while (candidates.size < attempts + 1) {
        const randomHan = pickRandom(VALUE_HANS);
        const randomFu = pickRandom(VALUE_FUS);
        const randomDealer = Math.random() < 0.5;
        const randomWin = pickRandom(WIN_VARIANTS);
        const randomHonba = pickRandom(HONBA_VARIANTS);
        const text = describeScore(randomHan, randomFu, randomDealer, randomWin, randomHonba).text;
        if (text !== correctText) candidates.add(text);
    }
    return shuffle([...candidates]);
}

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function validFuForHan(han, fu) {
    if (han === 1 && fu < 30) return false;
    if (han >= 4 && fu === 20) return false;
    return true;
}

function buildValoresPool() {
    const pool = [];
    VALUE_HANS.forEach((han) => {
        VALUE_FUS.forEach((fu) => {
            if (!validFuForHan(han, fu)) return;
            [true, false].forEach((dealer) => {
                WIN_VARIANTS.forEach((win) => {
                    HONBA_VARIANTS.forEach((honba) => {
                        const result = describeScore(han, fu, dealer, win, honba);
                        const limit = scoreLimit(han);
                        pool.push({
                            hand: [],
                            context: { win, han, fu, dealer, honba, calls: [] },
                            choices: buildDistractors(result.text, han, fu, dealer, win, honba),
                            answer: result.text,
                            explain: {
                                es: `${han} han ${fu} fu, ${dealer ? "dealer" : "no-dealer"} ${win.toLowerCase()}${limit ? ` · ${limit.name}` : ""}${honba ? ` + ${honba} honba` : ""} = ${result.text}.`,
                                en: `${han} han ${fu} fu, ${dealer ? "dealer" : "non-dealer"} ${win.toLowerCase()}${limit ? ` · ${limit.name}` : ""}${honba ? ` + ${honba} honba` : ""} = ${result.text}.`,
                                pt: `${han} han ${fu} fu, ${dealer ? "dealer" : "não-dealer"} ${win.toLowerCase()}${limit ? ` · ${limit.name}` : ""}${honba ? ` + ${honba} honba` : ""} = ${result.text}.`
                            }
                        });
                    });
                });
            });
        });
    });
    return pool;
}

function pickValoresRound(size = 10) {
    return shuffle(buildValoresPool()).slice(0, size);
}
