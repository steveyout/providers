import { flags } from '@/entrypoint/utils/targets';
import { Sourcerer, SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

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

// 2. Active Production Scrapers with Distinct Names & Emojis
// Primary (-1) and Duplicate/Backup (-2) each have their own unique, non-colliding names and emojis
interface YouPlexScraperConfig {
  id: string;
  primaryEmoji: string;
  backupEmoji: string;
  primaryName: string;
  backupName: string;
  baseRank: number;
}

const scrapers: YouPlexScraperConfig[] = [
  { id: 'taroflix', primaryEmoji: '? ', backupEmoji: '?? ', primaryName: 'Starkio', backupName: 'Cipher', baseRank: 440 },
  { id: 'cinemaos', primaryEmoji: '?? ', backupEmoji: '??? ', primaryName: 'Screenscape', backupName: 'MovieBox', baseRank: 430 },
  { id: 'cno', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Titan', backupName: 'Aether', baseRank: 420 },
  { id: 'cinejoy', primaryEmoji: '? ', backupEmoji: '?? ', primaryName: 'Aurora', backupName: 'Celestial', baseRank: 410 },
  { id: 'oneshows', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Nova', backupName: 'Zenith', baseRank: 400 },
  { id: 'cinecat', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Shadow', backupName: 'Lynx', baseRank: 390 },
  { id: 'pressplayz', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Midnight', backupName: 'Quantum', baseRank: 380 },
  { id: 'arrowtv', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Apex', backupName: 'Valkyrie', baseRank: 370 },
  { id: 'rivestream', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Nebula', backupName: 'Arcane', baseRank: 360 },
  { id: 'kaizoku', primaryEmoji: '?? ', backupEmoji: '??? ', primaryName: 'Vortex', backupName: 'Ronin', baseRank: 350 },
  { id: 'chillflix', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Frost', backupName: 'Solstice', baseRank: 340 },
  { id: 'zetmoon', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Eclipse', backupName: 'Lunar', baseRank: 330 },
  { id: 'vidcore', primaryEmoji: '?? ', backupEmoji: '?? ', primaryName: 'Quasar', backupName: 'Hyperion', baseRank: 320 },
];

const finalSources: Sourcerer[] = [];

// 3. Explicit Generation with Distinct Identities
scrapers.forEach((config) => {
  // Version 1 (Primary)
  finalSources.push(
    makeSourcerer({
      id: `yp-${config.id}-1`,
      name: `${config.primaryEmoji}${config.primaryName}`,
      rank: config.baseRank,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, config.id),
      scrapeShow: (ctx) => youPlexBridge(ctx, config.id),
    }),
  );

  // Version 2 (Backup / Duplicate with distinct name and emoji)
  finalSources.push(
    makeSourcerer({
      id: `yp-${config.id}-2`,
      name: `${config.backupEmoji}${config.backupName}`,
      rank: config.baseRank - 1,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, config.id),
      scrapeShow: (ctx) => youPlexBridge(ctx, config.id),
    }),
  );
});

export const youPlexSources = finalSources;
