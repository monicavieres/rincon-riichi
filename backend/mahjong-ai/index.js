// @ts-check
/** Public surface of the mahjong AI module. Server code (api/) and tests import from here. */
export * from './tiles.js';
export * from './shanten.js';
export { advise, adviseCall, buildContext, ukeireOf, rankDiscards, normalizeWind } from './efficiency.js';
export { toMjaiTile, fromMjaiTile, buildMjaiEvents } from './mjai.js';
export { getEngine, registerEngine, listEngines, efficiencyEngine, createMjaiHttpEngine } from './engines.js';
export { handleAdvise } from './http.js';
