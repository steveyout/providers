import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

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

const namePool = [...stealthNames];

const getStealthName = (id: string) => {
  const index = Math.floor(Math.random() * namePool.length);
  const name = namePool.splice(index, 1)[0] || `Source_${Math.random().toString(36).substr(2, 5)}`;
  return id === 'moviebox' ? `🔥 ${name}` : name;
};

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

const scrapers = ['flixhq', 'moviebox'];

// 3. Duplicate Generation (2x per scraper)
export const GeneratedSources: Record<string, any> = {};

scrapers.forEach((id, index) => {
  // We loop twice for each scraper ID
  [1, 2].forEach((version) => {
    const sName = getStealthName(id);
    const uniqueId = `yp-${id}-v${version}`; // e.g., yp-moviebox-v1, yp-moviebox-v2

    GeneratedSources[sName] = makeSourcerer({
      id: uniqueId,
      name: sName,
      // Rank v1 higher than v2 so they appear in order
      rank: 150 - index * 10 - version,
      flags: [flags.CORS_ALLOWED],
      disabled: false,
      scrapeMovie: (ctx) => youPlexBridge(ctx, id),
      scrapeShow: (ctx) => youPlexBridge(ctx, id),
    });
  });
});

// Specific exports for manual registration if needed
export const [YouPlexFlixHQ, YouPlexMovieBox] = Object.values(GeneratedSources);
