import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

// 1. Stealth Name Pool
const stealthNames = [
  'NebulaStream', 'NovaLink', 'QuantumPlayer', 'SolarisSource',
  'AetherFlux', 'VortexVideo', 'ZenithMedia', 'PhantomStream',
  'ArcaneLinks', 'ApexCinema', 'HorizonPlay', 'MidnightSource',
];

// Helper to get a random name and remove it from the pool to avoid duplicates
const namePool = [...stealthNames];
const getRandomName = () => {
  const index = Math.floor(Math.random() * namePool.length);
  return namePool.splice(index, 1)[0] || `Provider_${Math.random().toString(36).substr(2, 5)}`;
};

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

    if (!res || !res.success || !res.url) {
      throw new NotFoundError(`Provider ${scraperId} could not find this content.`);
    }

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
    throw new NotFoundError(`Bridge failed for ${scraperId}`);
  }
}

// 2. The Scraper List
const scrapers = ['flixhq', 'moviebox'];

// 3. Dynamic Object Generation
// This creates an object like { "NebulaStream": providerObject }
export const GeneratedSources: Record<string, any> = {};

scrapers.forEach((id, index) => {
  const sName = getRandomName();

  GeneratedSources[sName] = makeSourcerer({
    id: `yp-${id}`,
    name: sName, // Use the same stealth name here
    rank: 150 - index,
    flags: [flags.CORS_ALLOWED],
    disabled: false,
    scrapeMovie: (ctx) => youPlexBridge(ctx, id),
    scrapeShow: (ctx) => youPlexBridge(ctx, id),
  });
});

/**
 * If you still need specific named exports for your registration logic,
 * you can extract them from the object values:
 */
export const [YouPlexFlixHQ, YouPlexMovieBox] = Object.values(GeneratedSources);
