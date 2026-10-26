/** Scripted games on the 3D table that show how a yaku comes about. */
export type Lang = 'es' | 'en' | 'pt';
export type Text = Record<Lang, string>;
export type Act =
  | { k: 'say'; title: Text; body: Text; ms?: number }
  | { k: 'view'; v: 'hand' | 'wide' }
  | { k: 'rival'; who: 1 | 2 | 3; tile: string; fromWall?: boolean }
  | { k: 'draw'; tile: string }
  | { k: 'throw' }
  | { k: 'riichi' }
  | { k: 'shout'; text: string; bad?: boolean }
  | { k: 'reveal'; merge: boolean }
  | { k: 'kanOwn'; tile: string }
  | { k: 'dead'; tile: string }
  | { k: 'rivalPon'; who: 1 | 2 | 3; tile: string }
  | { k: 'robKan'; who: 1 | 2 | 3; tile: string }
  | { k: 'claim'; tile: string; from: 'pond' | 'kan'; who: 1 | 2 | 3 }
  | { k: 'wall'; left: number };

export type FlowScript = { hand: string[]; acts: Act[]; ponds?: boolean };

const L = (es: string, en: string, pt: string): Text => ({ es, en, pt });
const say = (title: Text, body: Text, ms = 5200): Act => ({ k: 'say', title, body, ms });

const PINFU = ['2m', '3m', '4m', '6m', '7m', '8p', '8p', '3s', '4s', '5s', '4p', '5p', '6p'];
const CLOSED = ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m', '5z', '5z'];
const CHANKAN = ['2m', '3m', '4m', '2p', '3p', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m'];
const RINSHAN = ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '3s', '3s', '6m', '7m', '5z', '5z'];


export const FLOW_SCRIPTS: Record<string, FlowScript> = {
  pinfu: {
    hand: PINFU,
    acts: [
      say(L('Una mano pinfu', 'A pinfu hand', 'Uma mão pinfu'), L('Tres secuencias, la espera 6-7 manzu y un par de 8 pinzu, que no vale puntos. Todo son secuencias.', 'Three sequences, a 6-7 manzu wait and a pair of 8 pinzu, which is worth nothing. It is all sequences.', 'Três sequências, a espera 6-7 manzu e um par de 8 pinzu, que não vale nada. Tudo são sequências.')),
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 1, tile: '2z' },
      { k: 'rival', who: 2, tile: '3z' },
      { k: 'rival', who: 3, tile: '9m' },
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '9s' },
      say(L('Robas y botas', 'You draw and throw', 'Você compra e descarta'), L('El 9 souzu no sirve: lo botas sin cambiar la forma de tu mano.', 'The 9 souzu does not help: you throw it without changing the shape of your hand.', 'O 9 souzu não serve: você o descarta sem mudar a forma da mão.'), 3200),
      { k: 'throw' },
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 1, tile: '1p' },
      say(L('Espera por ambos lados', 'A two-sided wait', 'Espera pelos dois lados'), L('Con 6-7 manzu esperas el 5 o el 8: por los dos lados de la secuencia.', 'With 6-7 manzu you wait on the 5 or the 8: both sides of the sequence.', 'Com 6-7 manzu você espera o 5 ou o 8: pelos dois lados da sequência.'), 4200),
      { k: 'rival', who: 2, tile: '8m' },
      { k: 'shout', text: 'RON' },
      { k: 'claim', tile: '8m', from: 'pond', who: 2 },
      { k: 'reveal', merge: true },
      say(L('¡Pinfu!', 'Pinfu!', 'Pinfu!'), L('Cuatro secuencias, un par sin valor y una espera por ambos lados. Si hubieras esperado solo el 7 del medio, no sería pinfu.', 'Four sequences, a worthless pair and a two-sided wait. If you had waited only on the middle 7, it would not be pinfu.', 'Quatro sequências, um par sem valor e espera pelos dois lados. Se você tivesse esperado só o 7 do meio, não seria pinfu.'), 6500),
    ],
  },
  riichi: {
    hand: CLOSED,
    acts: [
      say(L('Mano cerrada a una ficha', 'Closed hand, one tile away', 'Mão fechada a uma peça'), L('Sin llamadas y a una ficha de ganar: esperas el 5 o el 8 manzu.', 'No calls and one tile from winning: you wait on the 5 or the 8 manzu.', 'Sem chamadas e a uma peça de ganhar: você espera o 5 ou o 8 manzu.')),
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '9s' },
      { k: 'shout', text: 'RIICHI' },
      { k: 'riichi' },
      say(L('Riichi declarado', 'Riichi declared', 'Riichi declarado'), L('Botas la ficha de lado y pones el palito de 1000 puntos. Desde ahora tu mano queda fija.', 'You throw the tile sideways and put down the 1000-point stick. From now on your hand is locked.', 'Você descarta a peça de lado e coloca o palito de 1000 pontos. A partir de agora sua mão fica fixa.'), 4600),
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 1, tile: '2z' },
      { k: 'rival', who: 2, tile: '3z' },
      { k: 'rival', who: 3, tile: '4z' },
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '5m' },
      { k: 'shout', text: 'TSUMO' },
      { k: 'reveal', merge: false },
      say(L('¡Ganas con riichi!', 'You win with riichi!', 'Você ganha com riichi!'), L('Por haber declarado riichi con la mano cerrada tienes ese yaku (1 han).', 'Having declared riichi with a closed hand gives you that yaku (1 han).', 'Por ter declarado riichi com a mão fechada você tem esse yaku (1 han).'), 6000),
    ],
  },
  ippatsu: {
    hand: CLOSED,
    acts: [
      say(L('Riichi y una vuelta', 'Riichi and one lap', 'Riichi e uma volta'), L('Declaras riichi. El ippatsu se gana si ganas antes de que vuelva tu turno, sin que nadie llame.', 'You declare riichi. Ippatsu is yours if you win before your turn comes round again, with nobody calling.', 'Você declara riichi. O ippatsu é seu se ganhar antes que sua vez volte, sem que ninguém chame.')),
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '9s' },
      { k: 'shout', text: 'RIICHI' },
      { k: 'riichi' },
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 1, tile: '3z' },
      { k: 'rival', who: 2, tile: '4z' },
      { k: 'rival', who: 3, tile: '2z' },
      say(L('Nadie llamó', 'Nobody called', 'Ninguém chamou'), L('Los tres rivales botaron y nadie llamó (pon, chii o kan). Si alguien hubiera llamado, el ippatsu se perdería.', 'The three rivals threw and nobody called (pon, chii or kan). If anyone had called, ippatsu would be lost.', 'Os três rivais descartaram e ninguém chamou (pon, chii ou kan). Se alguém tivesse chamado, o ippatsu se perderia.'), 5200),
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '8m' },
      { k: 'shout', text: 'TSUMO' },
      { k: 'reveal', merge: false },
      say(L('¡Ippatsu!', 'Ippatsu!', 'Ippatsu!'), L('Ganaste en tu primer turno tras declarar riichi: 1 han extra.', 'You won on your first turn after declaring riichi: 1 extra han.', 'Você ganhou no primeiro turno depois de declarar riichi: 1 han extra.'), 6000),
    ],
  },
  'menzen-tsumo': {
    hand: CLOSED,
    acts: [
      say(L('Mano cerrada', 'Closed hand', 'Mão fechada'), L('No has hecho ninguna llamada (chii, pon o kan): tu mano sigue cerrada.', 'You have made no calls (chii, pon or kan): your hand is still closed.', 'Você não fez nenhuma chamada (chii, pon ou kan): sua mão continua fechada.')),
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 1, tile: '2z' },
      { k: 'rival', who: 2, tile: '3z' },
      { k: 'rival', who: 3, tile: '4z' },
      { k: 'view', v: 'hand' },
      say(L('Tu turno', 'Your turn', 'Sua vez'), L('Robas del muro la ficha que esperabas: el 8 manzu.', 'You draw the tile you were waiting on from the wall: the 8 manzu.', 'Você compra do muro a peça que esperava: o 8 manzu.'), 2600),
      { k: 'draw', tile: '8m' },
      { k: 'shout', text: 'TSUMO' },
      { k: 'reveal', merge: false },
      say(L('¡Tsumo con mano cerrada!', 'Tsumo with a closed hand!', 'Tsumo com mão fechada!'), L('Ganar robando tú la ficha con la mano cerrada suma 1 han. Si hubieras llamado antes, no contaría.', 'Winning on your own draw with a closed hand adds 1 han. If you had called earlier, it would not count.', 'Ganhar comprando a peça com a mão fechada soma 1 han. Se tivesse chamado antes, não contaria.'), 6000),
    ],
  },
  haitei: {
    hand: CLOSED,
    acts: [
      { k: 'wall', left: 1 },
      say(L('El muro se acaba', 'The wall runs out', 'O muro acaba'), L('Casi no quedan fichas por robar: solo una.', 'There are almost no tiles left to draw: just one.', 'Quase não restam peças para comprar: só uma.')),
      { k: 'view', v: 'hand' },
      say(L('La última del muro', 'The last tile of the wall', 'A última do muro'), L('Te toca robar la última ficha del muro y es el 8 manzu que esperabas.', 'It is your turn to draw the last tile of the wall and it is the 8 manzu you were waiting on.', 'É a sua vez de comprar a última peça do muro e é o 8 manzu que você esperava.'), 2800),
      { k: 'draw', tile: '8m' },
      { k: 'shout', text: 'TSUMO' },
      { k: 'reveal', merge: false },
      say(L('¡Haitei raoyue!', 'Haitei raoyue!', 'Haitei raoyue!'), L('Ganar por tsumo con la última ficha del muro da 1 han.', 'Winning by tsumo on the last tile of the wall gives 1 han.', 'Ganhar por tsumo na última peça do muro dá 1 han.'), 6000),
    ],
  },
  houtei: {
    hand: CLOSED,
    acts: [
      { k: 'wall', left: 0 },
      say(L('El muro ya se acabó', 'The wall is empty', 'O muro acabou'), L('No hay más fichas para robar: la última ficha de la partida va a ser un descarte.', 'There are no more tiles to draw: the last tile of the game is going to be a discard.', 'Não há mais peças para comprar: a última peça do jogo vai ser um descarte.')),
      { k: 'view', v: 'wide' },
      { k: 'rival', who: 2, tile: '8m', fromWall: false },
      { k: 'shout', text: 'RON' },
      { k: 'claim', tile: '8m', from: 'pond', who: 2 },
      { k: 'reveal', merge: true },
      say(L('¡Houtei raoyui!', 'Houtei raoyui!', 'Houtei raoyui!'), L('Ganar por ron con el último descarte de la partida da 1 han.', 'Winning by ron on the very last discard gives 1 han.', 'Ganhar por ron no último descarte do jogo dá 1 han.'), 6000),
    ],
  },
  chankan: {
    hand: CHANKAN,
    acts: [
      say(L('Esperas 1 o 4 pinzu', 'You wait on 1 or 4 pinzu', 'Você espera 1 ou 4 pinzu'), L('Con 2-3 pinzu esperas el 1 o el 4 pinzu.', 'With 2-3 pinzu you wait on the 1 or the 4 pinzu.', 'Com 2-3 pinzu você espera o 1 ou o 4 pinzu.')),
      { k: 'view', v: 'wide' },
      { k: 'rivalPon', who: 1, tile: '4p' },
      say(L('Un pon de 4 pinzu', 'A pon of 4 pinzu', 'Um pon de 4 pinzu'), L('El jugador de tu derecha tiene un pon de 4 pinzu a la vista.', 'The player on your right has a pon of 4 pinzu on display.', 'O jogador à sua direita tem um pon de 4 pinzu à vista.'), 3600),
      { k: 'robKan', who: 1, tile: '4p' },
      say(L('Agrega el cuarto', 'He adds the fourth', 'Ele acrescenta a quarta'), L('Roba el cuarto 4 pinzu y lo agrega a su pon para hacer kan. ¡Es tu espera!', 'He draws the fourth 4 pinzu and adds it to his pon to make a kan. It is your wait!', 'Ele compra o quarto 4 pinzu e acrescenta ao pon para fazer kan. É a sua espera!'), 4200),
      { k: 'shout', text: 'RON' },
      { k: 'claim', tile: '4p', from: 'kan', who: 1 },
      { k: 'reveal', merge: true },
      say(L('¡Chankan!', 'Chankan!', 'Chankan!'), L('Le robaste la ficha al kan antes de que se completara: 1 han.', 'You robbed the tile from the kan before it was completed: 1 han.', 'Você roubou a peça do kan antes de ser completado: 1 han.'), 6000),
    ],
  },
  rinshan: {
    hand: RINSHAN,
    acts: [
      say(L('Tres 3 souzu en la mano', 'Three 3 souzu in hand', 'Três 3 souzu na mão'), L('Tienes tres 3 souzu y esperas el 5 o el 8 manzu.', 'You hold three 3 souzu and wait on the 5 or the 8 manzu.', 'Você tem três 3 souzu e espera o 5 ou o 8 manzu.')),
      { k: 'view', v: 'hand' },
      { k: 'draw', tile: '3s' },
      { k: 'kanOwn', tile: '3s' },
      say(L('Haces kan', 'You make a kan', 'Você faz kan'), L('Robaste el cuarto 3 souzu: lo juntas con los otros tres en un kan.', 'You drew the fourth 3 souzu: you put it with the other three in a kan.', 'Você comprou o quarto 3 souzu: junta com os outros três num kan.'), 4200),
      { k: 'view', v: 'wide' },
      { k: 'dead', tile: '5m' },
      say(L('Ficha de reemplazo', 'Replacement tile', 'Peça de reposição'), L('Como el kan agrega una ficha, robas una de reemplazo del muro muerto: ¡es el 5 manzu!', 'Since a kan adds a tile, you draw a replacement from the dead wall: it is the 5 manzu!', 'Como o kan acrescenta uma peça, você compra uma de reposição do muro morto: é o 5 manzu!'), 4200),
      { k: 'shout', text: 'TSUMO' },
      { k: 'view', v: 'hand' },
      { k: 'reveal', merge: false },
      say(L('¡Rinshan kaihou!', 'Rinshan kaihou!', 'Rinshan kaihou!'), L('Ganar con la ficha de reemplazo de un kan da 1 han.', 'Winning on the replacement tile of a kan gives 1 han.', 'Ganhar com a peça de reposição de um kan dá 1 han.'), 6000),
    ],
  },
};
