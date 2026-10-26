/** Short game-flow examples for the yaku that depend on how the hand is played, not only on the tiles. */
export type Lang = 'es' | 'en' | 'pt';
export type Action = 'start' | 'draw' | 'discard' | 'riichi' | 'kan' | 'win' | 'deadwall' | 'last';
export type FlowStep = {
  actor: 0 | 1 | 2 | 3;
  action: Action;
  tile?: string;
  /** Hand on show: yours (13 tiles) with an optional tile in play. */
  hand?: string[];
  stick?: boolean;
  wall?: number;
  text: Record<Lang, string>;
};

const L = (es: string, en: string, pt: string): Record<Lang, string> => ({ es, en, pt });

const PINFU = ['2m', '3m', '4m', '6m', '7m', '8p', '8p', '3s', '4s', '5s', '4p', '5p', '6p'];
const CLOSED = ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m', '5z', '5z'];
const KAN = ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '3s', '3s', '3s', '6m', '7m', '5z'];

export const YAKU_FLOWS: Record<string, FlowStep[]> = {
  pinfu: [
    { actor: 0, action: 'start', hand: PINFU, text: L('Tu mano: tres secuencias, la espera 6-7 manzu y un par de 8 pinzu, que no vale puntos. Todo son secuencias.', 'Your hand: three sequences, a 6-7 manzu wait and a pair of 8 pinzu, which is worth nothing. It is all sequences.', 'Sua mão: três sequências, a espera 6-7 manzu e um par de 8 pinzu, que não vale nada. Tudo são sequências.') },
    { actor: 0, action: 'discard', tile: '9s', hand: PINFU, text: L('Los turnos pasan: robas y botas lo que sobra, sin cambiar la forma de tu mano.', 'The turns go by: you draw and throw what is spare without changing the shape of your hand.', 'Os turnos passam: você compra e descarta o que sobra, sem mudar a forma da mão.') },
    { actor: 2, action: 'discard', tile: '8m', hand: PINFU, text: L('Enfrente bota un 8 manzu. Con 6-7 manzu esperabas el 5 o el 8: por ambos lados.', 'Across throws an 8 manzu. With 6-7 manzu you were waiting on the 5 or the 8: both sides.', 'À frente descarta um 8 manzu. Com 6-7 manzu você esperava o 5 ou o 8: pelos dois lados.') },
    { actor: 0, action: 'win', tile: '8m', hand: PINFU, text: L('¡Ron! Completas 6-7-8 manzu: cuatro secuencias, un par sin valor y una espera por ambos lados. Eso es pinfu.', 'Ron! You complete 6-7-8 manzu: four sequences, a worthless pair and a two-sided wait. That is pinfu.', 'Ron! Você completa 6-7-8 manzu: quatro sequências, um par sem valor e espera pelos dois lados. Isso é pinfu.') },
    { actor: 0, action: 'start', hand: ['2m', '3m', '4m', '6m', '8m', '8p', '8p', '3s', '4s', '5s', '4p', '5p', '6p'], text: L('Si tu espera fuera 6 y 8 manzu (esperando solo el 7 del medio) no sería pinfu: la espera debe ser por ambos lados.', 'If your shape were 6 and 8 manzu (waiting only on the middle 7) it would not be pinfu: the wait must be two-sided.', 'Se sua forma fosse 6 e 8 manzu (esperando só o 7 do meio) não seria pinfu: a espera deve ser pelos dois lados.') },
  ],
  riichi: [
    { actor: 0, action: 'start', hand: CLOSED, text: L('Tu mano está cerrada (sin llamadas) y a una ficha de ganar: esperas el 5 o el 8 manzu.', 'Your hand is closed (no calls) and one tile from winning: you wait on the 5 or the 8 manzu.', 'Sua mão está fechada (sem chamadas) e a uma peça de ganhar: você espera o 5 ou o 8 manzu.') },
    { actor: 0, action: 'riichi', tile: '9s', hand: CLOSED, stick: true, text: L('Declaras riichi: botas una ficha de lado y pones un palito de 1000 puntos.', 'You declare riichi: you throw a tile sideways and put down a 1000-point stick.', 'Você declara riichi: descarta uma peça de lado e coloca um palito de 1000 pontos.') },
    { actor: 1, action: 'discard', tile: '2z', hand: CLOSED, stick: true, text: L('Desde ahora tu mano queda fija: solo robas y botas lo que robas, hasta ganar.', 'From now on your hand is locked: you only draw and throw what you draw, until you win.', 'A partir de agora sua mão fica fixa: só compra e descarta o que comprou, até ganhar.') },
    { actor: 0, action: 'win', tile: '5m', hand: CLOSED, stick: true, text: L('¡Robas el 5 manzu y ganas! Por haber declarado riichi tienes ese yaku (1 han).', 'You draw the 5 manzu and win! Having declared riichi gives you that yaku (1 han).', 'Você compra o 5 manzu e ganha! Por ter declarado riichi você tem esse yaku (1 han).') },
  ],
  ippatsu: [
    { actor: 0, action: 'riichi', tile: '9s', hand: CLOSED, stick: true, text: L('Declaras riichi con tu mano cerrada.', 'You declare riichi with your closed hand.', 'Você declara riichi com sua mão fechada.') },
    { actor: 1, action: 'discard', tile: '3z', hand: CLOSED, stick: true, text: L('Empieza la vuelta: juega el de tu derecha…', 'The lap begins: the player on your right plays…', 'A volta começa: joga o jogador à sua direita…') },
    { actor: 3, action: 'discard', tile: '4z', hand: CLOSED, stick: true, text: L('…enfrente y a tu izquierda botan, nadie llama (pon, chii o kan). Si alguien llamara, el ippatsu se perdería.', '…across and on your left throw, nobody calls (pon, chii or kan). If anyone called, ippatsu would be lost.', '…à frente e à esquerda descartam, ninguém chama (pon, chii ou kan). Se alguém chamasse, o ippatsu se perderia.') },
    { actor: 0, action: 'win', tile: '8m', hand: CLOSED, stick: true, text: L('¡Ganas en tu primer turno después de declarar riichi! Eso es ippatsu (1 han extra).', 'You win on your first turn after declaring riichi! That is ippatsu (1 extra han).', 'Você ganha no seu primeiro turno depois de declarar riichi! Isso é ippatsu (1 han extra).') },
  ],
  'menzen-tsumo': [
    { actor: 0, action: 'start', hand: CLOSED, text: L('Tu mano está cerrada: no has hecho ninguna llamada (chii, pon o kan).', 'Your hand is closed: you have made no calls (chii, pon or kan).', 'Sua mão está fechada: você não fez nenhuma chamada (chii, pon ou kan).') },
    { actor: 0, action: 'draw', tile: '8m', hand: CLOSED, text: L('Es tu turno y robas del muro la ficha que esperabas: el 8 manzu.', 'It is your turn and you draw the tile you were waiting on from the wall: the 8 manzu.', 'É sua vez e você compra do muro a peça que esperava: o 8 manzu.') },
    { actor: 0, action: 'win', tile: '8m', hand: CLOSED, text: L('¡Tsumo! Ganas con tu propio robo y con la mano cerrada: eso suma 1 han. Si hubieras llamado antes, no contaría.', 'Tsumo! You win on your own draw with a closed hand: that adds 1 han. If you had called earlier, it would not count.', 'Tsumo! Você ganha com sua própria compra e com a mão fechada: isso soma 1 han. Se tivesse chamado antes, não contaria.') },
  ],
  chankan: [
    { actor: 1, action: 'kan', tile: '4p', text: L('El jugador de tu derecha tenía un pon de 4 pinzu y roba el cuarto: lo agrega para hacer kan.', 'The player on your right held a pon of 4 pinzu and draws the fourth: he adds it to make a kan.', 'O jogador à sua direita tinha um pon de 4 pinzu e compra a quarta: acrescenta para fazer kan.') },
    { actor: 0, action: 'start', hand: ['2m', '3m', '4m', '2p', '3p', '5p', '6p', '7p', '3s', '4s', '5s', '6m', '7m'].concat([]).slice(0, 13), text: L('¡Justo esa ficha, el 4 pinzu, es tu espera (2-3 pinzu)!', 'That very tile, the 4 pinzu, is your wait (2-3 pinzu)!', 'Justo essa peça, o 4 pinzu, é a sua espera (2-3 pinzu)!') },
    { actor: 0, action: 'win', tile: '4p', text: L('¡Ron! Le robas la ficha al kan antes de que se complete. Eso es chankan (1 han).', 'Ron! You rob the tile from the kan before it is completed. That is chankan (1 han).', 'Ron! Você rouba a peça do kan antes de ser completado. Isso é chankan (1 han).') },
  ],
  rinshan: [
    { actor: 0, action: 'kan', tile: '3s', hand: KAN, text: L('Tienes tres 3 souzu, robas el cuarto y haces kan: las cuatro fichas quedan a un lado.', 'You hold three 3 souzu, draw the fourth and make a kan: the four tiles go to one side.', 'Você tem três 3 souzu, compra a quarta e faz kan: as quatro peças ficam de lado.') },
    { actor: 0, action: 'deadwall', tile: '5m', hand: KAN, text: L('Como el kan agrega una ficha, robas una de reemplazo del muro muerto.', 'Since a kan adds a tile, you draw a replacement from the dead wall.', 'Como o kan acrescenta uma peça, você compra uma de reposição do muro morto.') },
    { actor: 0, action: 'win', tile: '5m', hand: KAN, text: L('¡Esa ficha de reemplazo es tu espera y ganas! Eso es rinshan kaihou (1 han).', 'That replacement tile is your wait and you win! That is rinshan kaihou (1 han).', '¡Essa peça de reposição é a sua espera e você ganha! Isso é rinshan kaihou (1 han).') },
  ],
  haitei: [
    { actor: 0, action: 'start', hand: CLOSED, wall: 1, text: L('El muro casi se acaba: queda una sola ficha para robar.', 'The wall is almost gone: only one tile is left to draw.', 'O muro quase acabou: resta uma só peça para comprar.') },
    { actor: 0, action: 'draw', tile: '8m', hand: CLOSED, wall: 0, text: L('Te toca robar la última ficha del muro y es el 8 manzu que esperabas.', 'It is your turn to draw the last tile of the wall and it is the 8 manzu you were waiting on.', 'É a sua vez de comprar a última peça do muro e é o 8 manzu que você esperava.') },
    { actor: 0, action: 'win', tile: '8m', hand: CLOSED, wall: 0, text: L('¡Tsumo con la última ficha del muro! Eso es haitei raoyue (1 han).', 'Tsumo on the last tile of the wall! That is haitei raoyue (1 han).', 'Tsumo na última peça do muro! Isso é haitei raoyue (1 han).') },
  ],
  houtei: [
    { actor: 2, action: 'last', hand: CLOSED, wall: 0, text: L('El muro ya se acabó: la última ficha de la partida la va a botar el jugador de enfrente.', 'The wall is empty: the last tile of the game is about to be thrown by the player across.', 'O muro acabou: a última peça do jogo vai ser descartada pelo jogador à frente.') },
    { actor: 2, action: 'discard', tile: '8m', hand: CLOSED, wall: 0, text: L('Enfrente bota su última ficha: un 8 manzu.', 'Across throws their last tile: an 8 manzu.', 'À frente descarta sua última peça: um 8 manzu.') },
    { actor: 0, action: 'win', tile: '8m', hand: CLOSED, wall: 0, text: L('¡Ron con la última ficha botada! Eso es houtei raoyui (1 han).', 'Ron on the very last discard! That is houtei raoyui (1 han).', 'Ron no último descarte! Isso é houtei raoyui (1 han).') },
  ],
};
