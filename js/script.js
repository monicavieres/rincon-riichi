const defaultLanguage = "en";
const supportedLanguages = ["es", "en", "pt"];
const tileBasePath = "assets/tiles-fluffystuff-composite/";

const translations = {
    es: {
        pageTitle: "El Rincón de Mahjong",
        navLabel: "Navegación principal",
        language: { short: "Idioma", label: "Seleccionar idioma" },
        theme: { toggle: "Cambiar tema", light: "Claro", dark: "Oscuro" },
        settings: {
            label: "Configuración",
            short: "Config",
            tileSet: "Fichas",
            tileSetLabel: "Seleccionar estilo de fichas",
            tileSetRincon: "Rincón",
            tileSetFluffystuff: "FluffyStuff",
            tileHelp: "Ayuda fichas"
        },
        nav: {
            learn: "Aprender",
            practice: "Practicar"
        },
        hero: {
            eyebrow: "Mahjong riichi",
            title: "Aprende, practica y mejora",
            subtitle: "Módulos claros y ejercicios con corrección inmediata para entender cada mano y jugar mejor.",
            chip1: "Módulos guiados",
            chip2: "3 idiomas",
            chip3: "Gratis"
        },
        actions: {
            practiceTechniques: "Practicar técnicas",
            learn: "Aprender",
            practice: "Practicar",
            answer: "Responder"
        },
        coach: {
            label: "Asistente chibi",
            speech: "¿Dudas? Te muestro el paso a paso y celebramos cada avance.",
            alt: "Monique, guía chibi de mahjong con un libro"
        },
        feedback: {
            correct: "✓ Correcto",
            almost: "! Casi",
            incorrect: "× Incorrecto"
        },
        profile: {
            label: "Progreso rápido",
            streak: "Racha",
            streakValue: "0 días",
            mastery: "Dominio yaku",
            masteryValue: "Inicial",
            tiles: "Fichas base",
            tilesValue: "37 assets",
            nextFocus: "Siguiente foco",
            nextFocusValue: "Esperas"
        },
        learn: {
            label: "Lecciones básicas",
            eyebrow: "Aprender",
            title: "Primero: ¿qué es mahjong?",
            subtitle: "Una introducción corta y visual antes de entrar a yaku, esperas y puntaje.",
            lessonOne: {
                title: "Un juego de formar manos",
                desc: "Piensa en una mezcla entre poker y karioka: buscas combinaciones útiles, lees la mesa y decides qué conservar o descartar."
            },
            lessonTwo: {
                title: "Robas una ficha, descartas una",
                desc: "En cada turno mejoras tu mano poco a poco. La gracia está en elegir qué ficha ya no aporta."
            },
            lessonThree: {
                title: "Ganar requiere una forma válida",
                desc: "Normalmente quieres cuatro grupos y un par, pero además necesitas al menos un yaku."
            },
            board: {
                label: "Mesa riichi con muros, palitos e indicador de vientos",
                eyebrow: "Mesa y muros",
                title: "Las fichas empiezan en cuatro muros",
                desc: "Los jugadores roban desde el muro, descartan al centro y usan palitos e indicador de vientos para seguir la partida.",
                alt: "Mesa riichi con cuatro muros amarillos, palitos de puntos, descartes e indicador de vientos",
                center: "Descartes"
            },
            tiles: {
                label: "Catálogo de fichas",
                eyebrow: "Estas son las fichas",
                title: "Apréndelas por familia",
                desc: "Separarlas por categoría hace más fácil reconocer patrones. Primero palos numerados, luego honores.",
                manzu: "Manzu / Caracteres",
                pinzu: "Pinzu / Círculos",
                souzu: "Souzu / Bambúes",
                honors: "Honores / Vientos y dragones",
                aka: "Aka dora / Cincos rojos",
                back: "← Volver a módulos"
            }
        },
        practice: {
            label: "Práctica destacada",
            chibiAlt: "Monique pensando una respuesta",
            eyebrow: "Mini práctica",
            title: "¿Qué yaku ves?",
            handLabel: "Mano de ejemplo con yakuhai de dragón verde"
        },
        modules: {
            title: "Aprender",
            subtitle: "Haz click para acceder a los distintos módulos.",
            label: "Secciones principales",
            minigamesTitle: "Practicar",
            minigamesSubtitle: "Practica con manos concretas y feedback inmediato.",
            minigamesLabel: "Minijuegos"
        },
        status: {
            mvp: "MVP",
            next: "Luego",
            advanced: "Avanzado",
            extra: "Extra"
        },
        module: {
            yaku: {
                title: "Identifica el Yaku",
                desc: "Reconoce patrones ganadores con pistas visuales.",
                message: "Identifica el Yaku: buen primer MVP para ejercicios de reconocimiento."
            },
            queFichaEs: {
                title: "¿Qué ficha es?",
                desc: "Mira una ficha y elige su nombre correcto.",
                message: "¿Qué ficha es?: entrena reconocimiento rápido de fichas."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Aprende Riichi Mahjong desde cero, paso a paso.",
                message: "Tutorial: ruta guiada para empezar desde cero."
            },
            visualGuide: {
                title: "Guía visual",
                desc: "Riichi explicado con escenas y fichas FluffyStuff.",
                message: "Guía visual: recorrido rápido para entender cómo se ve una partida."
            },
            yakuRef: {
                title: "Guía de Yakus",
                desc: "Todos los yaku con su valor y ejemplo de fichas.",
                message: "Guía de Yakus: aprende cada yaku, su valor y ejemplo."
            },
            espera: {
                title: "Encuentra la Espera",
                desc: "Marca qué fichas completan tu mano.",
                message: "Encuentra la Espera: ideal para feedback visual inmediato."
            },
            ganar: {
                title: "¿Puedes ganar?",
                desc: "Detecta Ron, Tsumo, furiten o falta de yaku.",
                message: "¿Puedes ganar?: aquí viven furiten, falta de yaku y Ron/Tsumo."
            },
            fu: {
                title: "Cuenta los Fu",
                desc: "Desglosa minipuntos paso a paso.",
                message: "Cuenta los Fu: conviene hacerlo después del motor base de manos."
            },
            han: {
                title: "Cuenta los Han",
                desc: "Identifica los yaku y suma el valor en han.",
                message: "Cuenta los Han: identifica yaku y suma han."
            },
            calc: {
                title: "Cuenta el Puntaje",
                desc: "De la mano al pago final en puntos.",
                message: "Cuenta el Puntaje: de la mano al pago final."
            },
            valores: {
                title: "Tabla de Valores",
                desc: "Practica han + fu + dealer para acertar el pago.",
                message: "Tabla de Valores: combina han, fu, dealer y Ron/Tsumo."
            },
            furiten: {
                title: "¿Estoy en Furiten?",
                desc: "Revisa los descartes y decide si tu espera está bloqueada.",
                message: "¿Estoy en Furiten?: decide si tu ficha de espera está en tus descartes."
            },
            machi: {
                title: "Tipos de Espera",
                desc: "Ryanmen, kanchan, penchan, tanki, nobetan y más esperas.",
                message: "Tipos de Espera: aprende el nombre de cada machi."
            },
            dora: {
                title: "Dora",
                desc: "Indicador, ciclos, aka, ura y kan dora.",
                message: "Dora: las fichas bonus y sus ciclos."
            },
            eficiencia: {
                title: "Eficiencia de Fichas",
                desc: "Bloques, ukeire y la teoría de 5 bloques.",
                message: "Eficiencia de Fichas: elige el mejor descarte."
            },
            defensa: {
                title: "Defensa",
                desc: "Genbutsu, suji, kabe, one-chance y fold.",
                message: "Defensa: cómo evitar el ron enemigo."
            },
            reglas: {
                title: "Reglas Especiales",
                desc: "Empates, chombo, pao y otras reglas poco comunes.",
                message: "Reglas Especiales: casos raros y empates."
            },
            esperaTipo: {
                title: "¿Qué espera es?",
                desc: "Reconoce el nombre de la espera de la mano.",
                message: "¿Qué espera es?: identifica el machi de la mano."
            },
            esperaFichas: {
                title: "¿Qué fichas esperas?",
                desc: "Marca todas las fichas que completan tu mano.",
                message: "¿Qué fichas esperas?: selecciona las fichas de victoria."
            },
            chinitsu: {
                title: "¿Chinitsu?",
                desc: "Mira la mano y decide: ¿un palo, un palo + honores, simples o nada?",
                message: "¿Chinitsu?: reconoce un solo palo, honitsu y tanyao."
            },
            puntaje: {
                title: "Puntajes",
                desc: "Tablas de pagos, fu y honba.",
                message: "Puntajes: tablas de pagos, fu y honba."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Guía paso a paso: mesa, muro, fichas y yakus.",
                message: "Tutorial: ruta guiada para principiantes."
            },
            descarte: {
                title: "¿Qué descartas?",
                desc: "Eficiencia, ukeire y lectura de forma.",
                message: "¿Qué descartas?: módulo avanzado para eficiencia y ukeire."
            },
            rapida: {
                title: "Práctica Rápida",
                desc: "Sesiones cortas mezclando errores recientes.",
                message: "Práctica Rápida: mezcla ejercicios cortos según tus errores."
            },
            conceptos: {
                title: "Conceptos",
                desc: "Mahjong básico, Riichi, Ron, Pon, Kan, furiten, suji, kabe y más.",
                message: "Conceptos: vocabulario clave de riichi explicado de forma visual."
            },
            diario: {
                title: "Desafío Diario",
                desc: "Una situación nueva cada día.",
                message: "Desafío Diario: perfecto cuando exista banco de ejercicios."
            },
            progreso: {
                title: "Mi Progreso",
                desc: "Precisión por yaku, esperas y fichas.",
                message: "Mi Progreso: estadísticas locales por módulo y concepto."
            },
            logros: {
                title: "Logros",
                desc: "Insignias para mantener motivación.",
                message: "Logros: motivación ligera, sin tapar el aprendizaje."
            },
            personalizacion: {
                title: "Personalización",
                desc: "Tema, mesa, fichas y personalidad chibi.",
                message: "Personalización: tema, mesa, fichas y personalidad chibi."
            },
            fichas: {
                title: "Fichas",
                desc: "Manzu, pinzu, souzu, vientos, dragones y aka dora.",
                message: "Fichas: set visual base para manzu, pinzu, souzu, honores y aka dora."
            }
        },
        banner: {
            chibiAlt: "Chibi celebrando una respuesta correcta",
            eyebrow: "Feedback inmediato",
            title: "Correcto, Casi o Revisemos",
            subtitle: "El objetivo es que cada respuesta enseñe algo: no solo decir si estuvo bien, sino mostrar qué patrón o regla importaba."
        },
        dailyConcept: {
            eyebrow: "Concepto del día",
            cta: "Ver en Aprender"
        },
        tiles: {
            oneManzu: "1 manzu",
            twoManzu: "2 manzu",
            threeManzu: "3 manzu",
            greenDragon: "Dragón verde",
            redDragon: "Dragón rojo",
            whiteDragon: "Dragón blanco",
            eastWind: "Viento este",
            redFiveManzu: "Cinco rojo manzu",
            redFivePinzu: "Cinco rojo pinzu",
            redFiveSouzu: "Cinco rojo souzu"
        },
        accessibility: {
            open: "Abrir",
            fallback: "Módulo en diseño."
        },
        credits: {
            owner: "© 2026 monicavieres. Rincón Riichi es un sitio creado por mí. Todos los derechos reservados."
        },
        resources: {
            title: "Recursos y Relacionados",
            subtitle: "Fuentes, comunidades, sitios para jugar y bibliotecas para seguir aprendiendo.",
            label: "Recursos externos",
            credits: {
                title: "Fuentes y Créditos",
                desc: "Richi Mahjong Wiki y las fuentes usadas para fichas y datos del sitio."
            },
            communities: {
                title: "Comunidades",
                desc: "Foros, Discord y clubes de mahjong de distintos países."
            },
            play: {
                title: "Jugar Online",
                desc: "Tenhou, Riichi City, Mahjong Soul y otros servidores."
            },
            libraries: {
                title: "Bibliotecas y Organizaciones",
                desc: "Reglamentos, federaciones y bibliotecas públicas de mahjong."
            }
        }
    },
    en: {
        pageTitle: "Mahjong Corner",
        navLabel: "Main navigation",
        language: { short: "Language", label: "Select language" },
        theme: { toggle: "Toggle theme", light: "Light", dark: "Dark" },
        settings: {
            label: "Settings",
            short: "Settings",
            tileSet: "Tiles",
            tileSetLabel: "Select tile style",
            tileSetRincon: "Rincón",
            tileSetFluffystuff: "FluffyStuff",
            tileHelp: "Tile hints"
        },
        nav: {
            learn: "Learn",
            practice: "Practice"
        },
        hero: {
            eyebrow: "Riichi mahjong",
            title: "Learn, practice, improve",
            subtitle: "Clear modules and exercises with instant feedback to understand every hand and play better.",
            chip1: "Guided modules",
            chip2: "3 languages",
            chip3: "Free"
        },
        actions: {
            practiceTechniques: "Practice techniques",
            learn: "Learn",
            practice: "Practice",
            answer: "Answer"
        },
        coach: {
            label: "Chibi assistant",
            speech: "Questions? I can show each step and celebrate every bit of progress.",
            alt: "Monique, a chibi mahjong guide with a book"
        },
        feedback: {
            correct: "✓ Correct",
            almost: "! Almost",
            incorrect: "× Incorrect"
        },
        profile: {
            label: "Quick progress",
            streak: "Streak",
            streakValue: "0 days",
            mastery: "Yaku mastery",
            masteryValue: "Beginner",
            tiles: "Base tiles",
            tilesValue: "37 assets",
            nextFocus: "Next focus",
            nextFocusValue: "Waits"
        },
        learn: {
            label: "Basic lessons",
            eyebrow: "Riichi Academy",
            title: "First: what is mahjong?",
            subtitle: "A short visual intro before yaku, waits, and scoring.",
            lessonOne: {
                title: "A game about building hands",
                desc: "Think of it as a mix between poker and karioka: you look for useful combinations, read the table, and choose what to keep or discard."
            },
            lessonTwo: {
                title: "Draw one tile, discard one",
                desc: "Each turn improves your hand little by little. The fun is deciding which tile no longer helps."
            },
            lessonThree: {
                title: "Winning needs a valid shape",
                desc: "Usually you want four groups and a pair, but you also need at least one yaku."
            },
            board: {
                label: "Riichi table with walls, point sticks, and wind indicator",
                eyebrow: "Table and walls",
                title: "Tiles start in four walls",
                desc: "Players draw from the wall, discard to the center, and use point sticks plus a wind indicator to track the game.",
                alt: "Riichi table with four yellow walls, point sticks, discards, and a wind indicator",
                center: "Discards"
            },
            tiles: {
                label: "Tile catalog",
                eyebrow: "These are the tiles",
                title: "Learn them by family",
                desc: "Separating them by category makes patterns easier to recognize. Start with numbered suits, then honors.",
                manzu: "Manzu / Characters",
                pinzu: "Pinzu / Circles",
                souzu: "Souzu / Bamboos",
                honors: "Honors / Winds and dragons",
                aka: "Aka dora / Red fives",
                back: "← Back to modules"
            }
        },
        practice: {
            label: "Featured practice",
            chibiAlt: "Monique thinking through an answer",
            eyebrow: "Mini practice",
            title: "Which yaku do you see?",
            handLabel: "Example hand with green dragon yakuhai"
        },
        modules: {
            title: "Learn",
            subtitle: "Click to access the different modules.",
            label: "Main sections",
            minigamesTitle: "Practice",
            minigamesSubtitle: "Practice with concrete hands and instant feedback.",
            minigamesLabel: "Minigames"
        },
        status: {
            mvp: "MVP",
            next: "Next",
            advanced: "Advanced",
            extra: "Extra"
        },
        module: {
            yaku: {
                title: "Identify the Yaku",
                desc: "Recognize winning patterns with visual hints.",
                message: "Identify the Yaku: a strong first MVP for recognition exercises."
            },
            queFichaEs: {
                title: "Which Tile Is It?",
                desc: "Look at a tile and choose its correct name.",
                message: "Which Tile Is It?: train fast tile recognition."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Learn Riichi Mahjong from zero, step by step.",
                message: "Tutorial: a guided path to start from zero."
            },
            visualGuide: {
                title: "Visual Guide",
                desc: "Riichi explained with scenes and FluffyStuff tiles.",
                message: "Visual Guide: a quick tour to understand what a game looks like."
            },
            yakuRef: {
                title: "Yaku Guide",
                desc: "Every yaku with its value and a tile example.",
                message: "Yaku Guide: learn each yaku, its value and example."
            },
            espera: {
                title: "Find the Wait",
                desc: "Choose which tiles complete your hand.",
                message: "Find the Wait: perfect for instant visual feedback."
            },
            ganar: {
                title: "Can You Win?",
                desc: "Spot Ron, Tsumo, furiten, or a missing yaku.",
                message: "Can You Win?: this is where furiten, missing yaku, Ron, and Tsumo live."
            },
            fu: {
                title: "Count the Fu",
                desc: "Break minipoints down step by step.",
                message: "Count the Fu: best after the base hand engine exists."
            },
            han: {
                title: "Count the Han",
                desc: "Identify the yaku and add the han value.",
                message: "Count the Han: identify yaku and add han."
            },
            calc: {
                title: "Count the Score",
                desc: "From the hand to the final point payment.",
                message: "Count the Score: from the hand to the final payment."
            },
            valores: {
                title: "Value Table",
                desc: "Practice han + fu + dealer to hit the payment.",
                message: "Value Table: combine han, fu, dealer, and Ron/Tsumo."
            },
            furiten: {
                title: "Am I in Furiten?",
                desc: "Check the discards and decide if your wait is blocked.",
                message: "Am I in Furiten?: decide if your wait tile is in your discards."
            },
            machi: {
                title: "Wait Types",
                desc: "Ryanmen, kanchan, penchan, tanki, nobetan and more waits.",
                message: "Wait Types: learn the name of each machi."
            },
            dora: {
                title: "Dora",
                desc: "Indicator, cycles, aka, ura and kan dora.",
                message: "Dora: the bonus tiles and their cycles."
            },
            eficiencia: {
                title: "Tile Efficiency",
                desc: "Blocks, ukeire and the 5-block theory.",
                message: "Tile Efficiency: pick the best discard."
            },
            defensa: {
                title: "Defense",
                desc: "Genbutsu, suji, kabe, one-chance and fold.",
                message: "Defense: how to avoid dealing in."
            },
            reglas: {
                title: "Special Rules",
                desc: "Draws, chombo, pao and other uncommon rules.",
                message: "Special Rules: rare cases and draws."
            },
            esperaTipo: {
                title: "Which Wait Is It?",
                desc: "Recognize the name of the hand's wait.",
                message: "Which Wait Is It?: identify the hand's machi."
            },
            esperaFichas: {
                title: "Which Tiles Do You Wait On?",
                desc: "Mark all the tiles that complete your hand.",
                message: "Which Tiles Do You Wait On?: select the winning tiles."
            },
            chinitsu: {
                title: "Is It Chinitsu?",
                desc: "Look at the hand: one suit, one suit + honors, simples, or none?",
                message: "Is It Chinitsu?: spot a single suit, honitsu, and tanyao."
            },
            puntaje: {
                title: "Scores",
                desc: "Payment tables, fu, and honba.",
                message: "Scores: payment tables, fu, and honba."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Step-by-step guide: table, wall, tiles and yaku.",
                message: "Tutorial: guided path for beginners."
            },
            descarte: {
                title: "What Do You Discard?",
                desc: "Efficiency, ukeire, and hand shape reading.",
                message: "What Do You Discard?: an advanced module for efficiency and ukeire."
            },
            rapida: {
                title: "Quick Practice",
                desc: "Short sessions based on recent mistakes.",
                message: "Quick Practice: mixes short exercises based on your mistakes."
            },
            conceptos: {
                title: "Concepts",
                desc: "Mahjong basics, Riichi, Ron, Pon, Kan, furiten, suji, kabe, and more.",
                message: "Concepts: key riichi vocabulary explained visually."
            },
            diario: {
                title: "Daily Challenge",
                desc: "A new situation every day.",
                message: "Daily Challenge: great once there is an exercise bank."
            },
            progreso: {
                title: "My Progress",
                desc: "Accuracy by yaku, waits, and tiles.",
                message: "My Progress: local stats by module and concept."
            },
            logros: {
                title: "Achievements",
                desc: "Badges to keep motivation up.",
                message: "Achievements: light motivation without hiding the learning."
            },
            personalizacion: {
                title: "Customization",
                desc: "Theme, table, tiles, and chibi personality.",
                message: "Customization: theme, table, tiles, and chibi personality."
            },
            fichas: {
                title: "Tiles",
                desc: "Manzu, pinzu, souzu, winds, dragons, and aka dora.",
                message: "Tiles: base visual set for manzu, pinzu, souzu, honors, and aka dora."
            }
        },
        banner: {
            chibiAlt: "Chibi celebrating a correct answer",
            eyebrow: "Instant feedback",
            title: "Correct, Almost, or Review",
            subtitle: "The goal is for every answer to teach something: not only whether it was right, but which pattern or rule mattered."
        },
        dailyConcept: {
            eyebrow: "Concept of the day",
            cta: "Open Learn"
        },
        tiles: {
            oneManzu: "1 manzu",
            twoManzu: "2 manzu",
            threeManzu: "3 manzu",
            greenDragon: "Green dragon",
            redDragon: "Red dragon",
            whiteDragon: "White dragon",
            eastWind: "East wind",
            redFiveManzu: "Red five manzu",
            redFivePinzu: "Red five pinzu",
            redFiveSouzu: "Red five souzu"
        },
        accessibility: {
            open: "Open",
            fallback: "Module in design."
        },
        credits: {
            owner: "© 2026 monicavieres. Rincón Riichi was created by me. All rights reserved."
        },
        resources: {
            title: "Resources & Related",
            subtitle: "Sources, communities, places to play, and libraries to keep learning.",
            label: "External resources",
            credits: {
                title: "Sources & Credits",
                desc: "Riichi Mahjong Wiki and the sources used for tiles and site data."
            },
            communities: {
                title: "Communities",
                desc: "Forums, Discord servers and mahjong clubs around the world."
            },
            play: {
                title: "Play Online",
                desc: "Tenhou, Riichi City, Mahjong Soul and other servers."
            },
            libraries: {
                title: "Libraries & Organizations",
                desc: "Rulebooks, federations and public mahjong libraries."
            }
        }
    },
    pt: {
        pageTitle: "Cantinho do Mahjong",
        navLabel: "Navegação principal",
        language: { short: "Idioma", label: "Selecionar idioma" },
        theme: { toggle: "Alternar tema", light: "Claro", dark: "Escuro" },
        settings: {
            label: "Configurações",
            short: "Config",
            tileSet: "Peças",
            tileSetLabel: "Selecionar estilo das peças",
            tileSetRincon: "Rincón",
            tileSetFluffystuff: "FluffyStuff",
            tileHelp: "Ajuda peças"
        },
        nav: {
            learn: "Aprender",
            practice: "Praticar"
        },
        hero: {
            eyebrow: "Mahjong riichi",
            title: "Aprenda, pratique e melhore",
            subtitle: "Módulos claros e exercícios com correção imediata para entender cada mão e jogar melhor.",
            chip1: "Módulos guiados",
            chip2: "3 idiomas",
            chip3: "Grátis"
        },
        actions: {
            practiceTechniques: "Praticar técnicas",
            learn: "Aprender",
            practice: "Praticar",
            answer: "Responder"
        },
        coach: {
            label: "Assistente chibi",
            speech: "Dúvidas? Eu mostro o passo a passo e celebramos cada avanço.",
            alt: "Monique, guia chibi de mahjong com um livro"
        },
        feedback: {
            correct: "✓ Correto",
            almost: "! Quase",
            incorrect: "× Incorreto"
        },
        profile: {
            label: "Progresso rápido",
            streak: "Sequência",
            streakValue: "0 dias",
            mastery: "Domínio de yaku",
            masteryValue: "Inicial",
            tiles: "Peças base",
            tilesValue: "37 assets",
            nextFocus: "Próximo foco",
            nextFocusValue: "Esperas"
        },
        learn: {
            label: "Lições básicas",
            eyebrow: "Aprender",
            title: "Primeiro: o que é mahjong?",
            subtitle: "Uma introdução curta e visual antes de yaku, esperas e pontuação.",
            lessonOne: {
                title: "Um jogo de formar mãos",
                desc: "Pense como uma mistura entre poker e karioka: você busca combinações úteis, lê a mesa e decide o que guardar ou descartar."
            },
            lessonTwo: {
                title: "Você compra uma peça e descarta uma",
                desc: "A cada turno sua mão melhora aos poucos. A graça está em escolher qual peça já não ajuda."
            },
            lessonThree: {
                title: "Ganhar exige uma forma válida",
                desc: "Normalmente você quer quatro grupos e um par, mas também precisa de pelo menos um yaku."
            },
            board: {
                label: "Mesa riichi com muros, bastões de pontos e indicador de ventos",
                eyebrow: "Mesa e muros",
                title: "As peças começam em quatro muros",
                desc: "Os jogadores compram do muro, descartam no centro e usam bastões de pontos e indicador de ventos para acompanhar a partida.",
                alt: "Mesa riichi com quatro muros amarelos, bastões de pontos, descartes e indicador de ventos",
                center: "Descartes"
            },
            tiles: {
                label: "Catálogo de peças",
                eyebrow: "Estas são as peças",
                title: "Aprenda por família",
                desc: "Separar por categoria facilita reconhecer padrões. Primeiro os naipes numerados, depois as honras.",
                manzu: "Manzu / Caracteres",
                pinzu: "Pinzu / Círculos",
                souzu: "Souzu / Bambus",
                honors: "Honras / Ventos e dragões",
                aka: "Aka dora / Cincos vermelhos",
                back: "← Voltar aos módulos"
            }
        },
        practice: {
            label: "Prática em destaque",
            chibiAlt: "Monique pensando em uma resposta",
            eyebrow: "Mini prática",
            title: "Que yaku você vê?",
            handLabel: "Mão de exemplo com yakuhai de dragão verde"
        },
        modules: {
            title: "Aprender",
            subtitle: "Clique para acessar os diferentes módulos.",
            label: "Seções principais",
            minigamesTitle: "Praticar",
            minigamesSubtitle: "Pratique com mãos concretas e feedback imediato.",
            minigamesLabel: "Minijogos"
        },
        status: {
            mvp: "MVP",
            next: "Depois",
            advanced: "Avançado",
            extra: "Extra"
        },
        module: {
            yaku: {
                title: "Identifique o Yaku",
                desc: "Reconheça padrões vencedores com pistas visuais.",
                message: "Identifique o Yaku: um ótimo primeiro MVP para exercícios de reconhecimento."
            },
            queFichaEs: {
                title: "Que peça é?",
                desc: "Veja uma peça e escolha o nome correto.",
                message: "Que peça é?: treine reconhecimento rápido de peças."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Aprenda Riichi Mahjong do zero, passo a passo.",
                message: "Tutorial: caminho guiado para começar do zero."
            },
            visualGuide: {
                title: "Guia visual",
                desc: "Riichi explicado com cenas e peças FluffyStuff.",
                message: "Guia visual: passeio rápido para entender como uma partida aparece."
            },
            yakuRef: {
                title: "Guia de Yaku",
                desc: "Todos os yaku com seu valor e exemplo de peças.",
                message: "Guia de Yaku: aprenda cada yaku, seu valor e exemplo."
            },
            espera: {
                title: "Encontre a Espera",
                desc: "Escolha quais peças completam sua mão.",
                message: "Encontre a Espera: ideal para feedback visual imediato."
            },
            ganar: {
                title: "Você pode ganhar?",
                desc: "Detecte Ron, Tsumo, furiten ou falta de yaku.",
                message: "Você pode ganhar?: aqui entram furiten, falta de yaku, Ron e Tsumo."
            },
            fu: {
                title: "Conte os Fu",
                desc: "Divida minipontos passo a passo.",
                message: "Conte os Fu: melhor depois do motor base de mãos."
            },
            han: {
                title: "Conte os Han",
                desc: "Identifique os yaku e some o valor em han.",
                message: "Conte os Han: identifique yaku e some han."
            },
            calc: {
                title: "Conte a Pontuação",
                desc: "Da mão ao pagamento final em pontos.",
                message: "Conte a Pontuação: da mão ao pagamento final."
            },
            valores: {
                title: "Tabela de Valores",
                desc: "Pratique han + fu + dealer para acertar o pagamento.",
                message: "Tabela de Valores: combine han, fu, dealer e Ron/Tsumo."
            },
            furiten: {
                title: "Estou em Furiten?",
                desc: "Revise os descartes e decida se sua espera está bloqueada.",
                message: "Estou em Furiten?: decida se sua peça de espera está nos seus descartes."
            },
            machi: {
                title: "Tipos de Espera",
                desc: "Ryanmen, kanchan, penchan, tanki, nobetan e mais esperas.",
                message: "Tipos de Espera: aprenda o nome de cada machi."
            },
            dora: {
                title: "Dora",
                desc: "Indicador, ciclos, aka, ura e kan dora.",
                message: "Dora: as peças bônus e seus ciclos."
            },
            eficiencia: {
                title: "Eficiência de Peças",
                desc: "Blocos, ukeire e a teoria de 5 blocos.",
                message: "Eficiência de Peças: escolha o melhor descarte."
            },
            defensa: {
                title: "Defesa",
                desc: "Genbutsu, suji, kabe, one-chance e fold.",
                message: "Defesa: como evitar o ron inimigo."
            },
            reglas: {
                title: "Regras Especiais",
                desc: "Empates, chombo, pao e outras regras incomuns.",
                message: "Regras Especiais: casos raros e empates."
            },
            esperaTipo: {
                title: "Qual Espera É?",
                desc: "Reconheça o nome da espera da mão.",
                message: "Qual Espera É?: identifique o machi da mão."
            },
            esperaFichas: {
                title: "Quais Peças Você Espera?",
                desc: "Marque todas as peças que completam sua mão.",
                message: "Quais Peças Você Espera?: selecione as peças de vitória."
            },
            chinitsu: {
                title: "É Chinitsu?",
                desc: "Veja a mão: um só naipe, um naipe + honras, simples ou nada?",
                message: "É Chinitsu?: reconheça um só naipe, honitsu e tanyao."
            },
            puntaje: {
                title: "Pontuação",
                desc: "Tabelas de pagamento, fu e honba.",
                message: "Pontuação: tabelas de pagamento, fu e honba."
            },
            tutorial: {
                title: "Tutorial",
                desc: "Guia passo a passo: mesa, muro, peças e yaku.",
                message: "Tutorial: caminho guiado para iniciantes."
            },
            descarte: {
                title: "O que descartar?",
                desc: "Eficiência, ukeire e leitura da forma.",
                message: "O que descartar?: módulo avançado para eficiência e ukeire."
            },
            rapida: {
                title: "Prática Rápida",
                desc: "Sessões curtas com erros recentes.",
                message: "Prática Rápida: mistura exercícios curtos segundo seus erros."
            },
            conceptos: {
                title: "Conceitos",
                desc: "Mahjong básico, Riichi, Ron, Pon, Kan, furiten, suji, kabe e mais.",
                message: "Conceitos: vocabulário importante de riichi explicado visualmente."
            },
            diario: {
                title: "Desafio Diário",
                desc: "Uma situação nova por dia.",
                message: "Desafio Diário: perfeito quando existir um banco de exercícios."
            },
            progreso: {
                title: "Meu Progresso",
                desc: "Precisão por yaku, esperas e peças.",
                message: "Meu Progresso: estatísticas locais por módulo e conceito."
            },
            logros: {
                title: "Conquistas",
                desc: "Insígnias para manter a motivação.",
                message: "Conquistas: motivação leve sem esconder o aprendizado."
            },
            personalizacion: {
                title: "Personalização",
                desc: "Tema, mesa, peças e personalidade chibi.",
                message: "Personalização: tema, mesa, peças e personalidade chibi."
            },
            fichas: {
                title: "Peças",
                desc: "Manzu, pinzu, souzu, ventos, dragões e aka dora.",
                message: "Peças: set visual base para manzu, pinzu, souzu, honras e aka dora."
            }
        },
        banner: {
            chibiAlt: "Chibi comemorando uma resposta correta",
            eyebrow: "Feedback imediato",
            title: "Correto, Quase ou Revisar",
            subtitle: "O objetivo é que cada resposta ensine algo: não só dizer se estava certa, mas mostrar qual padrão ou regra importava."
        },
        dailyConcept: {
            eyebrow: "Conceito do dia",
            cta: "Ver em Aprender"
        },
        resources: {
            title: "Recursos e Relacionados",
            subtitle: "Fontes, comunidades, sites para jogar e bibliotecas para continuar aprendendo.",
            label: "Recursos externos",
            credits: {
                title: "Fontes e Créditos",
                desc: "Riichi Mahjong Wiki e as fontes usadas para peças e dados do site."
            },
            communities: {
                title: "Comunidades",
                desc: "Fóruns, Discord e clubes de mahjong de diferentes países."
            },
            play: {
                title: "Jogar Online",
                desc: "Tenhou, Riichi City, Mahjong Soul e outros servidores."
            },
            libraries: {
                title: "Bibliotecas e Organizações",
                desc: "Regulamentos, federações e bibliotecas públicas de mahjong."
            }
        },
        tiles: {
            oneManzu: "1 manzu",
            twoManzu: "2 manzu",
            threeManzu: "3 manzu",
            greenDragon: "Dragão verde",
            redDragon: "Dragão vermelho",
            whiteDragon: "Dragão branco",
            eastWind: "Vento leste",
            redFiveManzu: "Cinco vermelho manzu",
            redFivePinzu: "Cinco vermelho pinzu",
            redFiveSouzu: "Cinco vermelho souzu"
        },
        accessibility: {
            open: "Abrir",
            fallback: "Módulo em design."
        },
        credits: {
            owner: "© 2026 monicavieres. Rincón Riichi é um site criado por mim. Todos os direitos reservados."
        }
    }
};

let currentLanguage = getInitialLanguage();

document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.querySelector("#languageSelect");
    const moduleCards = document.querySelectorAll("[data-module]");
    const themeToggle = document.querySelector("#themeToggle");

    const savedTheme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener("change", (event) => {
            setLanguage(event.target.value);
        });
    }

    moduleCards.forEach((element) => {
        const moduleId = element.dataset.module;

        element.addEventListener("click", () => {
            if (moduleId === "yaku") {
                window.location.href = "practicar/yaku.html";
                return;
            }

            if (moduleId === "fichas") {
                window.location.href = "aprender/tiles.html";
                return;
            }

            const moduleRoutes = {
                tutorial: "aprender/tutorial.html",
                "visual-guide": "aprender/visual-guide.html",
                machi: "aprender/machi.html",
                "yaku-ref": "aprender/yaku-reference.html",
                dora: "aprender/dora.html",
                eficiencia: "aprender/eficiencia.html",
                defensa: "aprender/defensa.html",
                reglas: "aprender/reglas.html",
                espera: "practicar/waits.html",
                fu: "practicar/fu.html",
                han: "practicar/han.html",
                calc: "practicar/calc.html",
                valores: "practicar/valores.html",
                furiten: "practicar/furiten.html",
                "que-ficha-es": "practicar/que-ficha-es.html",
                "espera-tipo": "practicar/espera-tipo.html",
                "espera-fichas": "practicar/espera-fichas.html",
                chinitsu: "practicar/chinitsu.html",
                puntaje: "aprender/score.html"
            };

            if (moduleRoutes[moduleId]) {
                window.location.href = moduleRoutes[moduleId];
                return;
            }

            showToast(getModuleMessage(moduleId));
            popElement(element);
            sparkleFrom(element);
        });

        if (element.tagName !== "BUTTON") {
            element.setAttribute("tabindex", "0");
            element.setAttribute("role", "button");
        }

        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                element.click();
            }
        });
    });

    setupSectionKeyboardNavigation();
    applyLanguage(currentLanguage);
    renderDailyConcept();
    applyTileDisplay();
});

function setupSectionKeyboardNavigation() {
    const sections = [...document.querySelectorAll("[data-home-section]")];
    if (!sections.length) return;

    document.addEventListener("keydown", (event) => {
        const activeTag = document.activeElement?.tagName;
        if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "A"].includes(activeTag)) return;
        if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;

        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const currentIndex = nearestSectionIndex(sections);
        const nextIndex = (currentIndex + direction + sections.length) % sections.length;
        if (nextIndex === currentIndex) return;

        event.preventDefault();
        sections[nextIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function nearestSectionIndex(sections) {
    const topbarOffset = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
    const viewportAnchor = window.scrollY + topbarOffset + 32;
    const passedIndex = sections.findLastIndex((section) => section.offsetTop <= viewportAnchor);
    if (passedIndex >= 0) return passedIndex;

    return sections.reduce((nearestIndex, section, index) => {
        const currentDistance = Math.abs(section.offsetTop - viewportAnchor);
        const nearestDistance = Math.abs(sections[nearestIndex].offsetTop - viewportAnchor);
        return currentDistance < nearestDistance ? index : nearestIndex;
    }, 0);
}

function applyTileDisplay() {
    document.documentElement.dataset.tileSet = "fluffystuff";

    document.querySelectorAll("img").forEach((image) => {
        const currentSrc = image.getAttribute("src") || "";
        if (!currentSrc.includes("assets/tiles")) return;

        const currentFileName = currentSrc.split("/").pop();
        const tileId = currentFileName?.replace(/\.(svg|png)$/i, "");
        if (!tileId) return;

        image.setAttribute("src", `${tileBasePath}${tileId}.svg`);
    });
}

function getInitialLanguage() {
    const savedLanguage = localStorage.getItem("rincon-riichi-language");
    if (supportedLanguages.includes(savedLanguage)) return savedLanguage;

    return defaultLanguage;
}

function setLanguage(language) {
    if (!supportedLanguages.includes(language)) return;

    currentLanguage = language;
    localStorage.setItem("rincon-riichi-language", language);
    applyLanguage(language);
    renderDailyConcept();
}

function applyLanguage(language) {
    const dictionary = translations[language] || translations[defaultLanguage];

    document.documentElement.lang = language;
    document.title = dictionary.pageTitle;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = getTranslation(dictionary, element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        element.alt = getTranslation(dictionary, element.dataset.i18nAlt);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        element.setAttribute("aria-label", getTranslation(dictionary, element.dataset.i18nAriaLabel));
    });

    updateModuleAriaLabels(dictionary);
}

function updateModuleAriaLabels(dictionary) {
    document.querySelectorAll("[data-module]").forEach((element) => {
        if (element.tagName === "BUTTON") return;

        const moduleId = element.dataset.module;
        const title = getTranslation(dictionary, `module.${moduleId}.title`);
        element.setAttribute("aria-label", `${dictionary.accessibility.open} ${title}`);
    });
}

function renderDailyConcept() {
    const concepts = window.riichiConcepts || [];
    const title = document.querySelector("#dailyConceptTitle");
    const description = document.querySelector("#dailyConceptDescription");
    const tip = document.querySelector("#dailyConceptTip");
    if (!concepts.length || !title || !description || !tip) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const index = Math.floor(today.getTime() / 86400000) % concepts.length;
    const concept = concepts[index];

    title.textContent = concept.term;
    description.textContent = concept[currentLanguage] || concept[defaultLanguage] || concept.es;
    tip.textContent = concept.example;
}

function getModuleMessage(moduleId) {
    const dictionary = translations[currentLanguage] || translations[defaultLanguage];
    return getTranslation(dictionary, `module.${moduleId}.message`, dictionary.accessibility.fallback);
}

function getTranslation(dictionary, path, fallback = "") {
    return path.split(".").reduce((value, key) => value?.[key], dictionary) ?? fallback;
}

function popElement(element) {
    element.animate(
        [
            { transform: "scale(1)" },
            { transform: "scale(0.97)" },
            { transform: "scale(1)" }
        ],
        { duration: 180, easing: "ease-out" }
    );
}

function showToast(message) {
    document.querySelector(".toast")?.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 260);
    }, 2800);
}

function sparkleFrom(element) {
    const rect = element.getBoundingClientRect();
    const colors = ["#22b573", "#f2b84b", "#61a8ff", "#ff7d6e"];

    for (let index = 0; index < 8; index += 1) {
        const sparkle = document.createElement("span");
        sparkle.style.cssText = `
            position: fixed;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            background: ${colors[index % colors.length]};
            pointer-events: none;
            z-index: 30;
        `;

        document.body.appendChild(sparkle);
        sparkle.animate(
            [
                { transform: "translate(-50%, -50%) scale(0.3)", opacity: 1 },
                { transform: `translate(${Math.random() * 80 - 40}px, ${Math.random() * -70 - 20}px) scale(1)`, opacity: 0 }
            ],
            { duration: 620, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );

        window.setTimeout(() => sparkle.remove(), 650);
    }
}
