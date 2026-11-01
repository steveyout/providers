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

    const captions = (res.subtitles || []).map((s: any) => ({
      id: s.url,
      language: s.lang || s.label || s.language || 'English',
      type: 'vtt' as const,
      url: s.url,
    }));

    // If multiple stream sources are returned (e.g. Cinecat ZCDN 1/2/3, Cinejoy Lightspeed/Nebula), include all
    const stream = res.sources && Array.isArray(res.sources) && res.sources.length > 0
      ? res.sources.map((s: any, idx: number) => ({
          id: s.name ? s.name.replace(/[^a-zA-Z0-9_-]/g, '_') : `server_${idx + 1}`,
          type: 'hls' as const,
          playlist: s.url,
          flags: [flags.CORS_ALLOWED],
          captions,
        }))
      : [
          {
            id: 'primary',
            type: 'hls' as const,
            playlist: streamUrl,
            flags: [flags.CORS_ALLOWED],
            captions,
          },
        ];

    return {
      embeds: [],
      stream,
    };
  } catch (e) {
    throw new NotFoundError('Bridge error');
  }
}

// 2. The 10 Active, 100% Verified Production Scrapers
// Higher rank values are listed first.
const scrapers = [
  { id: 'cinecat', emoji: '🐾 ', baseRank: 300 },   // ⚡ Primary: Multi-worker ZCDN (ZCDN-1, ZCDN-2, ZCDN-3) 4K/1080p, cinecat.eu
  { id: 'cinejoy', emoji: '✨ ', baseRank: 290 },   // ⚡ Primary: Multi-server WASM (Lightspeed, Nebula) 1080p, cinejoy.pk
  { id: 'oneshows', emoji: '🚀 ', baseRank: 280 },  // ⚡ Primary: Pure Axios WASM 1shows/dcloud 1080p, 1shows.org
  { id: 'pressplayz', emoji: '🎬 ', baseRank: 270 },// ⚡ Primary: Sub-second 1080p, 200 OK via proxy
  { id: 'arrowtv', emoji: '🏹 ', baseRank: 260 },   // ⚡ Primary: PunkFlix 1080p HLS, arrowtv.net
  { id: 'rivestream', emoji: '🌊 ', baseRank: 250 },// ⚡ Fast RiveStream multi-source (PrimeVids, Vanguard 4K)
  { id: 'kaizoku', emoji: '⚔️ ', baseRank: 240 },   // ⚡ Fast Orion / VidRock 1080p, kaizoku.site
  { id: 'chillflix', emoji: '🍿 ', baseRank: 230 }, // ⚡ VAPlayer 1080p, chillflix.lol
  { id: 'zetmoon', emoji: '🌙 ', baseRank: 220 },   // ⚡ Orion 1080p, zetmoon.live
  { id: 'vidcore', emoji: '💎 ', baseRank: 210 },   // ⚡ Rigel /vs/ open 1080p, vidcore.org
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
