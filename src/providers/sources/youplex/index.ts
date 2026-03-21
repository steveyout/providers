import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

// 1. Stealth Name Pool
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
    const res = await ctx.fetcher(`${domain}/scrape`, { query });
    if (!res || !res.success || !res.url) throw new NotFoundError(`Failed`);
    ctx.progress(95);

    return {
      embeds: [],
      stream: [
        {
          id: 'primary',
          type: 'hls',
          playlist: res.url,
          flags: [flags.CORS_ALLOWED],
          captions: (res.subtitles || []).map((s: any) => ({
            id: s.url,
            language: s.label || s.language || 'English',
            type: 'vtt',
            url: s.url,
          })),
        },
      ],
    };
  } catch (e) {
    throw new NotFoundError(`Bridge failed`);
  }
}

// 2. The Generation Logic
const scrapers = ['flixhq', 'moviebox'];
const GeneratedSources: Record<string, any> = {};

// Create a fresh pool for this execution
const currentPool = [...stealthNames];

scrapers.forEach((id, index) => {
  // Loop twice to create a Primary and a Backup for each
  [1, 2].forEach((version) => {
    // Get a random name from the pool
    const nameIndex = Math.floor(Math.random() * currentPool.length);
    const rawName = currentPool.splice(nameIndex, 1)[0] || `Source-${Math.random().toString(36).substr(2, 5)}`;

    // 🔥 Apply styling: MovieBox gets the emoji
    const finalName = id === 'moviebox' ? `🔥 ${rawName}` : rawName;
    const uniqueId = `yp-${id}-v${version}`;

    GeneratedSources[uniqueId] = makeSourcerer({
      id: uniqueId,
      name: finalName,
      // High rank for MovieBox (index 1), slightly lower for FlixHQ (index 0)
      // v1 gets a higher rank than v2
      rank: 160 - index * 10 - version,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, id),
      scrapeShow: (ctx) => youPlexBridge(ctx, id),
    });
  });
});

// Export the array for your all.ts file
export const youPlexSources = Object.values(GeneratedSources);
