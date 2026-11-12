// Names and access types: Blooket's official Game Mode Previews, checked 2026-11-12.
// Fields below are historical source observations, NOT live compatibility claims.
const live = ['live'];
const solo = ['solo', 'homework'];
const all = ['live', 'solo', 'homework'];
const entry = (id, name, routes, contexts, fields = [], extra = {}) =>
  ({ id, name, routes, contexts, fields, ...extra });
const field = (key, label, max = Number.MAX_SAFE_INTEGER) => ({ key, label, min: 0, max });

export const MODES = [
  entry('battle-royale', 'Battle Royale', ['royale', 'battle-royale'], live),
  entry('blook-rush', 'Blook Rush', ['rush', 'blook-rush'], live, [field('numBlooks', 'Blooks'), field('numDefense', 'Defense', 4)]),
  entry('busy-bees', 'Busy Bees', ['busy-bees', 'busybees', 'bees'], live, [], { plus: true }),
  entry('classic', 'Classic', ['classic'], live),
  entry('coco-cabana', 'Coco Cabana', ['coco-cabana', 'cococabana', 'coco'], live, [], { plus: true }),
  entry('cocoa-cottage', 'Cocoa Cottage', ['cocoa-cottage', 'cocoacottage', 'cocoa'], live, [], { plus: true }),
  entry('crazy-kingdom', 'Crazy Kingdom', ['kingdom', 'crazy-kingdom'], solo, [field('guestScore', 'Guests')]),
  entry('cyber-hack', 'Cyber Hack', ['crypto', 'cyber', 'cyber-hack', 'crypto-hack'], live, [field('crypto', 'Credits')], { legacy: 'Crypto Hack' }),
  entry('deceptive-dinos', 'Deceptive Dinos', ['dinos', 'deceptive-dinos'], live, [field('fossils', 'Fossils'), field('fossilMult', 'Fossil multiplier')]),
  entry('cafe', 'Café', ['cafe'], all, [field('cafeCash', 'Cash')]),
  entry('factory', 'Factory', ['factory'], all, [field('cash', 'Cash')]),
  entry('fishing-frenzy', 'Fishing Frenzy', ['fishing', 'fishing-frenzy'], all, [field('weight', 'Weight'), field('lure', 'Lure', 5)]),
  entry('gold-quest', 'Gold Quest', ['gold', 'gold-quest'], live, [field('gold', 'Gold')]),
  entry('laser-tag', 'Laser Tag', ['laser-tag', 'lasertag', 'laser'], live, [], { plus: true }),
  entry('mini-mine', 'Mini Mine', ['mini-mine', 'minimine', 'mine'], live, [], { plus: true }),
  entry('monster-brawl', 'Monster Brawl', ['brawl', 'monster-brawl'], all, [field('level', 'Level')]),
  entry('pirate-pool', 'Pirate Pool', ['pirate-pool', 'piratepool', 'pool'], solo),
  entry('plushie-panic', 'Plushie Panic', ['plushie-panic', 'plushiepanic', 'plushie'], solo),
  entry('racing', 'Racing', ['racing'], live, [field('progress', 'Progress')]),
  entry('star-grazer', 'Star Grazer', ['star-grazer', 'stargrazer', 'grazer'], live, [], { plus: true }),
  entry('study', 'Study', ['study'], solo),
  entry('tower-defense', 'Tower Defense', ['defense', 'tower-defense'], all, [field('tokens', 'Tokens'), field('round', 'Round')]),
  entry('tower-defense-2', 'Tower Defense 2', ['defense2', 'tower-defense-2'], all, [field('coins', 'Coins'), field('health', 'Health'), field('round', 'Round')]),
  entry('zorblitz', 'Zorblitz', ['zorblitz'], solo),
  entry('candy-quest', 'Candy Quest', ['candy', 'candy-quest'], live, [], { seasonal: true }),
  entry('santas-workshop', "Santa’s Workshop", ['workshop', 'santas-workshop'], live, [field('toys', 'Toys'), field('toysPerQ', 'Toys per question')], { seasonal: true }),
  entry('egg-hunt', 'Egg Hunt', ['egg-hunt', 'egghunt', 'eggs'], live, [], { seasonal: true }),
  entry('tag-or-treat', 'Tag or Treat', ['tag-or-treat', 'tagortreat'], live, [], { seasonal: true })
];

export const MODE_SOURCE = 'https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews';
export const CODE_SOURCE = 'https://github.com/LiL-Zapped/Blooket-GUI/blob/main/The%20Cheats';

export function detectMode(pathname) {
  // Exact segments avoid matching a question-set slug or "defense2" as "defense".
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  if (!parts.length || parts.length > 3) return null;
  if (parts.length > 1 && !['play', 'solo', 'homework'].includes(parts[0])) return null;
  if (parts.length === 3 && !['solo', 'homework'].includes(parts[1])) return null;
  const route = parts.at(-1)?.replace(/-(solo|homework)$/, '');
  return MODES.find(mode => mode.routes.includes(route)) ?? null;
}

export function isBlooketHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'blooket.com' || host.endsWith('.blooket.com');
}

export function detectPageMode(pageLocation) {
  const host = pageLocation.hostname.toLowerCase().replace(/\.$/, '');
  if (!isBlooketHost(host)) return null;
  // Current games use mode.blooket.com/<game>/play/<player>. Game and player
  // identifiers are neither needed for detection nor saved by this tool.
  const subdomain = host.endsWith('.blooket.com') ? host.slice(0, -'.blooket.com'.length) : '';
  const hostedMode = MODES.find(mode => mode.routes.includes(subdomain));
  if (hostedMode) return hostedMode;
  return ['blooket.com', 'www.blooket.com', 'play.blooket.com'].includes(host)
    ? detectMode(pageLocation.pathname) : null;
}

export function validateValue(raw, spec) {
  if (String(raw).trim() === '') throw new Error('Enter a number.');
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < spec.min || value > spec.max) {
    throw new Error(`Use a whole number from ${spec.min} to ${spec.max}.`);
  }
  return value;
}
