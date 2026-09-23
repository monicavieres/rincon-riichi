export type ModuleTone = 'pink' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';

export type ModuleCard = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  tone: ModuleTone;
  translationBase: string;
};

export const learnModules: ModuleCard[] = [
  { id: 'tutorial', title: 'Tutorial', description: 'Guía paso a paso: mesa, muro, fichas y yakus.', route: 'aprender/tutorial.html', icon: 'icon-tutorial', tone: 'pink', translationBase: 'module.tutorial' },
  { id: 'visual-guide', title: 'Guía visual', description: 'Riichi explicado con escenas y fichas FluffyStuff.', route: 'aprender/visual-guide.html', icon: 'icon-visual-guide', tone: 'blue', translationBase: 'module.visualGuide' },
  { id: 'fichas', title: 'Fichas', description: 'Manzu, pinzu, souzu, vientos, dragones y aka dora.', route: 'aprender/tiles.html', icon: 'icon-tiles', tone: 'green', translationBase: 'module.fichas' },
  { id: 'machi', title: 'Tipos de Espera', description: 'Ryanmen, kanchan, penchan, tanki, nobetan y más esperas.', route: 'aprender/machi.html', icon: 'icon-machi', tone: 'yellow', translationBase: 'module.machi' },
  { id: 'yaku-ref', title: 'Guía de Yakus', description: 'Todos los yaku con su valor y ejemplo de fichas.', route: 'aprender/yaku-reference.html', icon: 'icon-yaku', tone: 'green', translationBase: 'module.yakuRef' },
  { id: 'dora', title: 'Dora', description: 'Indicador, ciclos, aka, ura y kan dora.', route: 'aprender/dora.html', icon: 'icon-dora', tone: 'green', translationBase: 'module.dora' },
  { id: 'eficiencia', title: 'Eficiencia de Fichas', description: 'Bloques, ukeire y la teoría de 5 bloques.', route: 'aprender/eficiencia.html', icon: 'icon-eficiencia', tone: 'blue', translationBase: 'module.eficiencia' },
  { id: 'defensa', title: 'Defensa', description: 'Genbutsu, suji, kabe, one-chance y fold.', route: 'aprender/defensa.html', icon: 'icon-defensa', tone: 'pink', translationBase: 'module.defensa' },
  { id: 'reglas', title: 'Reglas Especiales', description: 'Empates, chombo, pao y otras reglas poco comunes.', route: 'aprender/reglas.html', icon: 'icon-reglas', tone: 'red', translationBase: 'module.reglas' },
  { id: 'puntaje', title: 'Puntajes', description: 'Tablas de pagos, fu y honba.', route: 'aprender/score.html', icon: 'icon-score', tone: 'orange', translationBase: 'module.puntaje' },
];

export const practiceModules: ModuleCard[] = [
  { id: 'que-ficha-es', title: '¿Qué ficha es?', description: 'Mira una ficha y elige su nombre correcto.', route: 'practicar/que-ficha-es.html', icon: 'icon-tile-name', tone: 'blue', translationBase: 'module.queFichaEs' },
  { id: 'yaku', title: 'Identifica el Yaku', description: 'Reconoce patrones ganadores con pistas visuales.', route: 'practicar/yaku.html', icon: 'icon-yaku', tone: 'green', translationBase: 'module.yaku' },
  { id: 'espera', title: 'Encuentra la Espera', description: 'Marca qué fichas completan tu mano.', route: 'practicar/waits.html', icon: 'icon-waits', tone: 'blue', translationBase: 'module.espera' },
  { id: 'fu', title: 'Cuenta los Fu', description: 'Desglosa minipuntos paso a paso.', route: 'practicar/fu.html', icon: 'icon-fu', tone: 'yellow', translationBase: 'module.fu' },
  { id: 'han', title: 'Cuenta los Han', description: 'Identifica los yaku y suma el valor en han.', route: 'practicar/han.html', icon: 'icon-han', tone: 'purple', translationBase: 'module.han' },
  { id: 'calc', title: 'Cuenta el Puntaje', description: 'De la mano al pago final en puntos.', route: 'practicar/calc.html', icon: 'icon-calc', tone: 'orange', translationBase: 'module.calc' },
  { id: 'valores', title: 'Tabla de Valores', description: 'Practica han + fu + dealer para acertar el pago.', route: 'practicar/valores.html', icon: 'icon-valores', tone: 'pink', translationBase: 'module.valores' },
  { id: 'furiten', title: '¿Estoy en Furiten?', description: 'Revisa los descartes y decide si tu espera está bloqueada.', route: 'practicar/furiten.html', icon: 'icon-furiten', tone: 'red', translationBase: 'module.furiten' },
  { id: 'espera-tipo', title: '¿Qué espera es?', description: 'Reconoce el nombre de la espera de la mano.', route: 'practicar/espera-tipo.html', icon: 'icon-espera-tipo', tone: 'yellow', translationBase: 'module.esperaTipo' },
  { id: 'espera-fichas', title: '¿Qué fichas esperas?', description: 'Marca todas las fichas que completan tu mano.', route: 'practicar/espera-fichas.html', icon: 'icon-espera-fichas', tone: 'pink', translationBase: 'module.esperaFichas' },
  { id: 'chinitsu', title: '¿Chinitsu?', description: 'Distingue un palo, un palo con honores y otras manos.', route: 'practicar/chinitsu.html', icon: 'icon-chinitsu', tone: 'green', translationBase: 'module.chinitsu' },
];
