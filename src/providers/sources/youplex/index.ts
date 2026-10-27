import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

// 1. Expanded Stealth Name Pool
const stealthNames = [
  'NebulaStream',
  'NovaLink',
  'QuantumPlayer',
  'SolarisSource',
  'AetherFlux',
  'VortexVideo',
  'ZenithMedia',
  'PhantomStream',
  'ArcaneLinks',
  'ApexCinema',
  'HorizonPlay',
  'MidnightSource',
  'CosmoStream',
  'StarlightCinema',
  'TitanPlayer',
  'HyperionFlux',
  'AuraVision',
  'EclipseMedia',
  'CelestePlay',
  'OrionStream',
  'ValkyrieVideo',
  'SpectraLink',
  'ChronosCinema',
  'PulsePlayer',
  'InfinityStream',
  'AstroPlay',
  'MirageSource',
  'LuminaVision',
  'ZenithCinema',
  'VeloxStream',
];

/**
 * Universal Bridge Logic
 */
async function youPlexBridge(ctx: ShowScrapeContext | MovieScrapeContext, scraperId: string): Promise<SourcererOutput> {
  const domain = 'https://api.youplex.site';
  const query: any = {
    id: ctx.media.tmdbId,
    type: ctx.media.type === 'show' ? 'tv' : 'movie',
    provider: scraperId,
  };

  if (ctx.media.type === 'show') {
    query.s = ctx.media.season.number.toString();
    query.e = ctx.media.episode.number.toString();
  }

  ctx.progress(25);

  try {
    const res = await ctx.fetcher<any>(`${domain}/scrape`, { query });
    const streamUrl = res?.url || res?.sources?.[0]?.url;
    if (!res || !res.success || !streamUrl) throw new NotFoundError('No results');
    ctx.progress(95);

    return {
      embeds: [],
      stream: [
        {
          id: 'primary',
          type: 'hls',
          playlist: streamUrl,
          flags: [flags.CORS_ALLOWED],
          captions: (res.subtitles || []).map((s: any) => ({
            id: s.url,
            language: s.lang || s.label || s.language || 'English',
            type: 'vtt',
            url: s.url,
          })),
        },
      ],
    };
  } catch (e) {
    throw new NotFoundError('Bridge error');
  }
}

// 2. The Scraper Definitions
// Higher rank values are listed first.
const scrapers = [
  { id: 'chillflix', emoji: '🍿 ', baseRank: 260 }, // ⚡ Primary: Sub-second (~0.3s) pure Axios VAPlayer engine, master HLS, 100+ subtitles, chillflix.lol
  { id: 'vidcore', emoji: '💎 ', baseRank: 250 },   // ⚡ Primary: Sub-second (~0.5s) pure Axios, 1080p HLS, 100+ subtitles, vidcore.org
  { id: 'oneshows', emoji: '🚀 ', baseRank: 240 },  // ⚡ Primary: Sub-second (~0.5s) pure Axios WASM engine, 1080p HLS, 100+ subtitles, 1shows.org
  { id: 'zetmoon', emoji: '🌙 ', baseRank: 230 },   // ⚡ Primary: Sub-second (~0.5s) pure Axios Orion engine, 1080p HLS, 100+ subtitles, zetmoon.live
  { id: 'pressplayz', emoji: '🎬 ', baseRank: 220 }, // ⚡ Primary: Sub-second (~0.6s) pure Axios, 100+ subtitles, 200 OK via proxy
  { id: 'dexter', emoji: '🔥 ', baseRank: 210 },     // ⚡ Primary: Fast pure Axios (~1.0s), master HLS, 50+ subtitles, dexter.pw
  { id: 'kaizoku', emoji: '⚔️ ', baseRank: 200 },    // ⚡ Primary: Fast pure Axios (~1.0s), Orion 1080p HLS, 100+ subtitles, kaizoku.site
  { id: 'arrowtv', emoji: '🏹 ', baseRank: 190 },    // ⚡ Primary: Fast pure Axios (~1.5s), master HLS / DASH, 100+ subtitles, arrowtv.net
  { id: 'rivestream', emoji: '🌊 ', baseRank: 180 }, // ⚡ Fast RiveStream (~0.5s) pure Axios, multi-source (PrimeVids, Vanguard 4K, Apogee)
  { id: 'sevenmovies', emoji: '👑 ', baseRank: 175 }, // ⚡ Fast Vidrift / 7movies (~0.7s) pure Axios, 1080p HLS, no Turnstile
  { id: 'flixhq', emoji: '🛡️ ', baseRank: 165 },     // 🛡️ Reliable backup: JWPlayer extraction, 200 OK via proxy
];

const finalSources: any[] = [];
const currentPool = [...stealthNames];

const pullName = () => {
  const idx = Math.floor(Math.random() * currentPool.length);
  return currentPool.splice(idx, 1)[0] || `Stream-${Math.random().toString(36).substr(2, 4)}`;
};

// 3. Explicit Generation
scrapers.forEach((config) => {
  // Version 1 (Primary)
  const name1 = pullName();
  finalSources.push(
    makeSourcerer({
      id: `yp-${config.id}-1`,
      name: `${config.emoji}${name1}`,
      rank: config.baseRank,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, config.id),
      scrapeShow: (ctx) => youPlexBridge(ctx, config.id),
    }),
  );

  // Version 2 (Backup)
  const name2 = pullName();
  finalSources.push(
    makeSourcerer({
      id: `yp-${config.id}-2`,
      name: `${config.emoji}${name2}`,
      rank: config.baseRank - 1,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, config.id),
      scrapeShow: (ctx) => youPlexBridge(ctx, config.id),
    }),
  );
});

export const youPlexSources = finalSources;
