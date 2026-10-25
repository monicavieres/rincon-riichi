import type { TutorialLanguage } from '../../domain/tutorialContent';

type Link = { href: string; es: string; en: string; pt: string; hint: { es: string; en: string; pt: string } };

const PRACTISE: Link[] = [
  { href: '../practicar/que-ficha-es.html', es: '¿Qué ficha es?', en: 'Which tile is it?', pt: 'Que peça é?', hint: { es: 'Reconoce las 34 fichas', en: 'Recognise the 34 tiles', pt: 'Reconheça as 34 peças' } },
  { href: '../practicar/espera-fichas.html', es: '¿Qué fichas esperas?', en: 'Which tiles do you wait on?', pt: 'Que peças você espera?', hint: { es: 'Lee tu espera', en: 'Read your wait', pt: 'Leia sua espera' } },
  { href: '../practicar/espera-tipo.html', es: '¿Qué espera es?', en: 'What kind of wait?', pt: 'Que tipo de espera?', hint: { es: 'Tipos de espera', en: 'Wait types', pt: 'Tipos de espera' } },
  { href: '../practicar/furiten.html', es: '¿Estoy en furiten?', en: 'Am I in furiten?', pt: 'Estou em furiten?', hint: { es: 'Revisa tu río', en: 'Check your river', pt: 'Confira seu rio' } },
  { href: '../practicar/yaku.html', es: 'Identifica el yaku', en: 'Identify the yaku', pt: 'Identifique o yaku', hint: { es: 'Condiciones de victoria', en: 'Winning conditions', pt: 'Condições de vitória' } },
  { href: '../practicar/han.html', es: 'Cuenta los han', en: 'Count the han', pt: 'Conte os han', hint: { es: 'Suma han', en: 'Add up han', pt: 'Some han' } },
  { href: '../practicar/fu.html', es: 'Cuenta los fu', en: 'Count the fu', pt: 'Conte os fu', hint: { es: 'Suma fu', en: 'Add up fu', pt: 'Some fu' } },
  { href: '../practicar/calc.html', es: 'Cuenta el puntaje', en: 'Count the score', pt: 'Conte a pontuação', hint: { es: 'Han + fu = puntos', en: 'Han + fu = points', pt: 'Han + fu = pontos' } },
  { href: '../practicar/chinitsu.html', es: '¿Es chinitsu?', en: 'Is it chinitsu?', pt: 'É chinitsu?', hint: { es: 'Un solo palo', en: 'A single suit', pt: 'Um só naipe' } },
  { href: '../practicar/valores.html', es: 'Tabla de valores', en: 'Value table', pt: 'Tabela de valores', hint: { es: 'Memoriza los pagos', en: 'Memorise payments', pt: 'Memorize os pagamentos' } },
];

const LEARN: Link[] = [
  { href: '../aprender/tiles.html', es: 'Las fichas', en: 'The tiles', pt: 'As peças', hint: { es: 'Cuáles son y cómo se leen', en: 'What they are and how to read them', pt: 'Quais são e como ler' } },
  { href: '../aprender/eficiencia.html', es: 'Eficiencia de fichas', en: 'Tile efficiency', pt: 'Eficiência de peças', hint: { es: 'Qué botar y qué guardar', en: 'What to throw and keep', pt: 'O que descartar e guardar' } },
  { href: '../aprender/machi.html', es: 'Tipos de espera', en: 'Wait types', pt: 'Tipos de espera', hint: { es: 'Machi a fondo', en: 'Machi in depth', pt: 'Machi a fundo' } },
  { href: '../aprender/reglas.html', es: 'Reglas especiales', en: 'Special rules', pt: 'Regras especiais', hint: { es: 'Llamadas, kan y más', en: 'Calls, kan and more', pt: 'Chamadas, kan e mais' } },
  { href: '../aprender/defensa.html', es: 'Defensa', en: 'Defence', pt: 'Defesa', hint: { es: 'Cómo no pagar', en: 'How not to pay', pt: 'Como não pagar' } },
  { href: '../aprender/dora.html', es: 'Dora', en: 'Dora', pt: 'Dora', hint: { es: 'Fichas que suman han', en: 'Tiles that add han', pt: 'Peças que somam han' } },
  { href: '../aprender/score.html', es: 'Puntajes', en: 'Scores', pt: 'Pontuações', hint: { es: 'Tablas y cómo contar', en: 'Tables and how to count', pt: 'Tabelas e como contar' } },
  { href: '../aprender/yaku-reference.html', es: 'Guía de yakus', en: 'Yaku guide', pt: 'Guia de yakus', hint: { es: 'Todos los yaku', en: 'All the yaku', pt: 'Todos os yaku' } },
  { href: '../aprender/visual-guide.html', es: 'Guía visual', en: 'Visual guide', pt: 'Guia visual', hint: { es: 'Todo en imágenes', en: 'Everything in pictures', pt: 'Tudo em imagens' } },
];

/** The end of the tutorial: direct buttons to the practice exercises and the learn pages. */
export function FinishBoard({ language }: { language: TutorialLanguage }) {
  const t = (es: string, en: string, pt: string) => ({ es, en, pt }[language]);
  const column = (title: string, links: Link[], tone: string) => (
    <section className={`fin-col is-${tone}`}>
      <h3>{title}</h3>
      <div className="fin-grid">
        {links.map((link) => (
          <a key={link.href} className="fin-link" href={link.href}>
            <b>{link[language]}</b>
            <span>{link.hint[language]}</span>
          </a>
        ))}
      </div>
    </section>
  );
  return (
    <div className="sort-stage deck-stage">
      <div className="sort-board deck-board fin-board">
        {column(t('Practicar', 'Practise', 'Praticar'), PRACTISE, 'practise')}
        {column(t('Aprender y repasar', 'Learn and review', 'Aprender e revisar'), LEARN, 'learn')}
      </div>
    </div>
  );
}
