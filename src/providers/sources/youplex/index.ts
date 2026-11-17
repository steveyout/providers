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
    const stream =
      res.sources && Array.isArray(res.sources) && res.sources.length > 0
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
// Primary (-1) is registered for all scrapers.
// Duplicate/Backup (-2) is only registered if the scraper uses Playwright.
interface YouPlexScraperConfig {
  id: string;
  primaryEmoji: string;
  backupEmoji: string;
  primaryName: string;
  backupName: string;
  baseRank: number;
  usesPlaywright?: boolean;
}

const scrapers: YouPlexScraperConfig[] = [
  {
    id: 'movi47',
    primaryEmoji: '🏰 ',
    backupEmoji: '👑 ',
    primaryName: 'Movi47',
    backupName: 'WhyWorry',
    baseRank: 485,
    usesPlaywright: false,
  },
  {
    id: 'zoechip',
    primaryEmoji: '💎 ',
    backupEmoji: '🔮 ',
    primaryName: 'Zoechip',
    backupName: 'ZoeStream',
    baseRank: 480,
    usesPlaywright: false,
  },
  {
    id: 'bingebang',
    primaryEmoji: '💥 ',
    backupEmoji: '🚀 ',
    primaryName: 'BingeBang',
    backupName: 'BangStream',
    baseRank: 475,
    usesPlaywright: false,
  },
  {
    id: 'taroflix',
    primaryEmoji: '⭐ ',
    backupEmoji: '🌟 ',
    primaryName: 'Starkio',
    backupName: 'Cipher',
    baseRank: 470,
    usesPlaywright: false,
  },
  {
    id: 'cinemaos',
    primaryEmoji: '🎬 ',
    backupEmoji: '📽️ ',
    primaryName: 'Screenscape',
    backupName: 'MovieBox',
    baseRank: 465,
    usesPlaywright: false,
  },
  {
    id: 'aether',
    primaryEmoji: '⚡ ',
    backupEmoji: '✨ ',
    primaryName: 'Aether',
    backupName: 'Aetheris',
    baseRank: 460,
    usesPlaywright: false,
  },
  {
    id: 'vidlink',
    primaryEmoji: '🔗 ',
    backupEmoji: '🌐 ',
    primaryName: 'VidLink',
    backupName: 'Nexus',
    baseRank: 455,
    usesPlaywright: false,
  },
  {
    id: 'cno',
    primaryEmoji: '🪐 ',
    backupEmoji: '🌌 ',
    primaryName: 'Titan',
    backupName: 'Atlas',
    baseRank: 450,
    usesPlaywright: false,
  },
  {
    id: 'cinejoy',
    primaryEmoji: '🎆 ',
    backupEmoji: '🎇 ',
    primaryName: 'Aurora',
    backupName: 'Celestial',
    baseRank: 440,
    usesPlaywright: false,
  },
  {
    id: 'oneshows',
    primaryEmoji: '💫 ',
    backupEmoji: '🌠 ',
    primaryName: 'Nova',
    backupName: 'Zenith',
    baseRank: 430,
    usesPlaywright: false,
  },
  {
    id: 'cinecat',
    primaryEmoji: '🐱 ',
    backupEmoji: '🐾 ',
    primaryName: 'Shadow',
    backupName: 'Lynx',
    baseRank: 420,
    usesPlaywright: false,
  },
  {
    id: 'pressplayz',
    primaryEmoji: '▶️ ',
    backupEmoji: '⚡ ',
    primaryName: 'Midnight',
    backupName: 'Quantum',
    baseRank: 410,
    usesPlaywright: false,
  },
  {
    id: 'arrowtv',
    primaryEmoji: '🏹 ',
    backupEmoji: '🎯 ',
    primaryName: 'Apex',
    backupName: 'Valkyrie',
    baseRank: 400,
    usesPlaywright: false,
  },
  {
    id: 'rivestream',
    primaryEmoji: '🌊 ',
    backupEmoji: '💧 ',
    primaryName: 'Nebula',
    backupName: 'Arcane',
    baseRank: 390,
    usesPlaywright: false,
  },
  {
    id: 'kaizoku',
    primaryEmoji: '🏴‍☠️ ',
    backupEmoji: '⚔️ ',
    primaryName: 'Vortex',
    backupName: 'Ronin',
    baseRank: 380,
    usesPlaywright: false,
  },
  {
    id: 'chillflix',
    primaryEmoji: '❄️ ',
    backupEmoji: '🧊 ',
    primaryName: 'Frost',
    backupName: 'Solstice',
    baseRank: 370,
    usesPlaywright: false,
  },
  {
    id: 'zetmoon',
    primaryEmoji: '🌙 ',
    backupEmoji: '🌕 ',
    primaryName: 'Eclipse',
    backupName: 'Lunar',
    baseRank: 360,
    usesPlaywright: false,
  },
  {
    id: 'vidcore',
    primaryEmoji: '🔋 ',
    backupEmoji: '⚙️ ',
    primaryName: 'Quasar',
    backupName: 'Hyperion',
    baseRank: 350,
    usesPlaywright: false,
  },
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

  // Version 2 (Backup / Duplicate) - ONLY added if the source uses Playwright
  if (config.usesPlaywright) {
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
  }
});

export const youPlexSources = finalSources;
