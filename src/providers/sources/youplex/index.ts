import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';
import { createM3U8ProxyUrl } from '@/utils/proxy';

// 1. Stealth Name Pool - Randomized every time the app loads
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

const getRandomName = () => stealthNames[Math.floor(Math.random() * stealthNames.length)];

/**
 * Universal Bridge Logic
 */
async function youPlexBridge(ctx: ShowScrapeContext | MovieScrapeContext, scraperId: string): Promise<SourcererOutput> {
  const domain = 'https://api.youplex.site';

  const query: any = {
    id: ctx.media.tmdbId,
    type: ctx.media.type,
    provider: scraperId, // Passes 'vidlink', 'vidsrc', etc. to your VPS
  };

  if (ctx.media.type === 'show') {
    query.s = ctx.media.season.number.toString();
    query.e = ctx.media.episode.number.toString();
  }

  ctx.progress(25);

  try {
    const res = await ctx.proxiedFetcher(`${domain}/scrape`, { query });

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

// 2. The Scraper List - Add/Remove here to update the whole library
const scrapers = ['vidlink', 'videasy', 'vidfast', 'vidnest', 'vidsrc', 'flixhq', 'sflix'];

// 3. Dynamic Export Generation
// We map through the scrapers and create individual Sourcerer objects
const generatedSources = scrapers.map((id, index) => {
  return makeSourcerer({
    id: `yp-${id}`, // Unique ID: yp_vidlink, yp_sflix, etc.
    name: getRandomName(), // Each gets a cool unique name like "NebulaStream"
    rank: 150 - index, // Sets priority based on the order in your list
    flags: [flags.CORS_ALLOWED],
    disabled: false,
    scrapeMovie: (ctx) => youPlexBridge(ctx, id),
    scrapeShow: (ctx) => youPlexBridge(ctx, id),
  });
});

// Destructuring for specific exports
export const [
  YouPlexVidLink,
  YouPlexVidEasy,
  YouPlexVidFast,
  YouPlexVidNest,
  YouPlexVidSrc,
  YouPlexFlixHQ,
  YouPlexSFlix,
] = generatedSources;
