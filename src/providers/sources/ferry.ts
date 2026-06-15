import { flags } from '@/entrypoint/utils/targets';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

import { SourcererOutput, makeSourcerer } from '../base';
import { Stream } from '../streams';

const baseUrl = 'https://hahoy.willowmovies.com/download/partners/afterstream/cattus';

const universalScraper = async (ctx: MovieScrapeContext | ShowScrapeContext): Promise<SourcererOutput> => {
  let apiPath = '';
  if (ctx.media.type === 'movie') {
    apiPath = `${baseUrl}/${ctx.media.tmdbId}`;
  } else {
    apiPath = `${baseUrl}/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;
  }
  ctx.progress(20);
  const apiReq = await fetch(apiPath);
  if (!apiReq.ok) {
    throw new NotFoundError(`Soory pookie, That failed 😢`);
  }
  const apiResponse: { streams: Stream[] } | { error: string } = await apiReq.json();
  if ('error' in apiResponse) {
    throw new NotFoundError(`Soory pookie, something broke 😢`);
  }
  if (!apiResponse?.streams?.length) throw new NotFoundError(`Soory pookie, couldn't find anything on Cattus 😢`);

  ctx.progress(100);
  return {
    embeds: [],
    stream: apiResponse.streams,
  };
};

export const FerryScraper = makeSourcerer({
  id: 'ferry',
  name: '🔥 Ferry',
  rank: 236,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: universalScraper,
  scrapeShow: universalScraper,
});
