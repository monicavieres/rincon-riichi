export type ResourceLink = { tag: string; name: string; description: string; url: string };
export type ResourceDefinition = { title: string; description: string; links: ResourceLink[] };

export const resourceMeta: Record<string, ResourceDefinition> = {
  'fuentes.html': { title: 'Fuentes y créditos', description: 'Fuentes consultadas y recursos gráficos utilizados en Rincón Riichi.', links: [
    { tag: 'Wiki', name: 'Riichi Mahjong Wiki', description: 'Referencia en inglés con reglas, terminología y machi.', url: 'https://riichi.wiki' },
    { tag: 'Fichas', name: 'FluffyStuff riichi tiles', description: 'Set de fichas SVG y PNG usado por las ilustraciones.', url: 'https://github.com/FluffyStuff/riichi-mahjong-tiles' },
    { tag: 'Reglas', name: 'Tenhou', description: 'Servidor y tablas de puntuación de referencia.', url: 'https://tenhou.net' },
  ] },
  'comunidades.html': { title: 'Comunidades', description: 'Espacios donde aprender, conversar y jugar Riichi Mahjong.', links: [
    { tag: 'Foro', name: 'r/Mahjong — Reddit', description: 'Comunidad general con estrategia y novedades.', url: 'https://www.reddit.com/r/Mahjong/' },
    { tag: 'Discord', name: 'Riichi Mahjong Discord', description: 'Análisis de manos, jugadores y torneos.', url: 'https://discord.gg/riichi' },
    { tag: 'Club', name: 'EMA', description: 'European Mahjong Association.', url: 'https://www.emahjong.com' },
  ] },
  'jugar.html': { title: 'Jugar online', description: 'Servicios y clientes para practicar con otras personas.', links: [
    { tag: 'Servidor', name: 'Tenhou', description: 'El servidor japonés clásico.', url: 'https://tenhou.net' },
    { tag: 'Juego', name: 'Mahjong Soul', description: 'Cliente gratuito con ranking y eventos.', url: 'https://mahjongsoul.game.yo-star.com/' },
    { tag: 'Juego', name: 'Riichi City', description: 'Cliente moderno con misiones y torneos.', url: 'https://riichicity.com' },
  ] },
  'bibliotecas.html': { title: 'Bibliotecas y organizaciones', description: 'Reglamentos, federaciones y proyectos para profundizar.', links: [
    { tag: 'Wiki', name: 'Riichi Mahjong Wiki', description: 'Terminología, yaku, reglas y machi.', url: 'https://riichi.wiki' },
    { tag: 'Reglamento', name: 'WRC 2025', description: 'Reglamento internacional de competición.', url: 'https://www.worldriichi.org/wrc-rules' },
    { tag: 'Federación', name: 'EMA', description: 'Torneos y reglas de la federación europea.', url: 'https://www.emahjong.com' },
  ] },
};
