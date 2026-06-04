import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';
import { createM3U8ProxyUrl } from '@/utils/proxy';

const BASE_URL = 'https://streams.icefy.top';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150 Safari/537.36',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: BASE_URL,
  Origin: BASE_URL,
};

const universalScraper = async (ctx: MovieScrapeContext | ShowScrapeContext): Promise<SourcererOutput> => {
  let apiPath: string;

  if (ctx.media.type === 'movie') {
    apiPath = `movie/${ctx.media.tmdbId}`;
  } else {
    apiPath = `tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;
  }

  const response = await ctx.proxiedFetcher<{ stream: string }>(apiPath, {
    baseUrl: BASE_URL,
    headers,
  });

  if (!response?.stream) throw new NotFoundError('No stream URL returned');

  return {
    embeds: [],
    stream: [
      {
        id: 'primary',
        type: 'hls',
        playlist: createM3U8ProxyUrl(response.stream, ctx.features, headers),
        flags: [flags.CORS_ALLOWED],
        captions: [],
      },
    ],
  };
};

export const icefyScraper = makeSourcerer({
  id: 'icefy',
  name: 'Icefy',
  rank: 235,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: universalScraper,
  scrapeShow: universalScraper,
});
