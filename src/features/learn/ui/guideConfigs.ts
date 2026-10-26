import { DEFENSA_LIST } from '../domain/defensaData';
import { REGLAS_LIST } from '../domain/reglasData';
import type { GuideConfig } from './GuideWorkspace';

export const DEFENSA_GUIDE: GuideConfig = {
  entries: DEFENSA_LIST,
  glyph: '守',
  example: { es: [], en: [], pt: [] },
  intro: {
    es: { short: 'Introducción', sub: '¿Qué es defender?', title: '¿Qué es defender?', label: 'Antes de empezar', stageTitle: 'Defender es no pagar', next: 'Empieza con genbutsu →', body: ['**Defender** es elegir qué botar para **no darle la ficha ganadora** a un rival que está en **tenpai**, sobre todo si declaró **riichi**.', 'No existe una ficha segura al 100% salvo una: por eso se usan **herramientas** que miden el riesgo de cada descarte.', 'En esta guía verás esas herramientas (**genbutsu**, **suji**, **kabe**, **one-chance**…) y cuándo conviene **empujar** o **retirarse**.'] },
    en: { short: 'Introduction', sub: 'What is defence?', title: 'What is defence?', label: 'Before we start', stageTitle: 'Defending is not paying', next: 'Start with genbutsu →', body: ['**Defending** is choosing what to throw so you **do not hand the winning tile** to a rival who is in **tenpai**, especially after a **riichi**.', 'No tile is 100% safe except one kind: that is why **tools** are used to measure the risk of each discard.', 'In this guide you will see those tools (**genbutsu**, **suji**, **kabe**, **one-chance**…) and when to **push** or **fold**.'] },
    pt: { short: 'Introdução', sub: 'O que é defender?', title: 'O que é defender?', label: 'Antes de começar', stageTitle: 'Defender é não pagar', next: 'Comece pelo genbutsu →', body: ['**Defender** é escolher o que descartar para **não entregar a peça vencedora** a um rival em **tenpai**, sobretudo depois de um **riichi**.', 'Nenhuma peça é 100% segura exceto um tipo: por isso usam-se **ferramentas** que medem o risco de cada descarte.', 'Neste guia você verá essas ferramentas (**genbutsu**, **suji**, **kabe**, **one-chance**…) e quando **empurrar** ou **recuar**.'] },
  },
};

export const REGLAS_GUIDE: GuideConfig = {
  entries: REGLAS_LIST,
  glyph: '則',
  example: { es: [], en: [], pt: [] },
  intro: {
    es: { short: 'Introducción', sub: 'Situaciones poco frecuentes', title: 'Reglas especiales', label: 'Antes de empezar', stageTitle: 'Cuando la ronda se sale del guion', next: 'Empieza con el empate →', body: ['Estas son **situaciones poco frecuentes** que **terminan** o **cambian** una ronda: empates, castigos, pagos especiales y detalles de reglamento.', 'No las necesitas para jugar tu primera partida, pero conviene conocerlas: algunas **cambian cómo se paga** o **quién queda de dealer**.', 'Cada paso explica una regla con su nombre japonés, para que la reconozcas en cualquier mesa.'] },
    en: { short: 'Introduction', sub: 'Uncommon situations', title: 'Special rules', label: 'Before we start', stageTitle: 'When the round goes off script', next: 'Start with the exhaustive draw →', body: ['These are **uncommon situations** that **end** or **change** a round: draws, penalties, special payments and rule details.', 'You do not need them for your first game, but it helps to know them: some **change how payment works** or **who stays dealer**.', 'Each step explains one rule with its Japanese name, so you can recognise it at any table.'] },
    pt: { short: 'Introdução', sub: 'Situações pouco frequentes', title: 'Regras especiais', label: 'Antes de começar', stageTitle: 'Quando a rodada foge do roteiro', next: 'Comece pelo empate →', body: ['Estas são **situações pouco frequentes** que **terminam** ou **mudam** uma rodada: empates, punições, pagamentos especiais e detalhes de regulamento.', 'Você não precisa delas para a primeira partida, mas convém conhecê-las: algumas **mudam como se paga** ou **quem continua dealer**.', 'Cada passo explica uma regra com seu nome japonês, para você reconhecê-la em qualquer mesa.'] },
  },
};
