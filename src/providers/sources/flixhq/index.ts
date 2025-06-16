import { flags } from '@/entrypoint/utils/targets';
import { SourcererEmbed, makeSourcerer } from '@/providers/base';
import { upcloudScraper } from '@/providers/embeds/upcloud';
import { getFlixhqMovieSources, getFlixhqShowSources, getFlixhqSourceDetails } from '@/providers/sources/flixhq/scrape';
import { getFlixhqId } from '@/providers/sources/flixhq/search';
import { NotFoundError } from '@/utils/errors';

export const flixhqScraper = makeSourcerer({
  id: 'youplex',
  name: 'Youplex',
  rank: 61,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  async scrapeMovie(ctx) {
    const id = await getFlixhqId(ctx, ctx.media);
    ctx.progress(30);
    if (!id) throw new NotFoundError('no search results match');

    const sources = await getFlixhqMovieSources(ctx, ctx.media, id);
    ctx.progress(60);
    const streams: any[] = [];
    for (const source of sources) {
      streams.push({
        id: 'primary',
        playlist: source.stream,
        type: 'hls',
        flags: [flags.CORS_ALLOWED],
        captions: source.captions,
      });
    }
    return {
      embeds: [],
      stream: streams,
    };
  },
  async scrapeShow(ctx) {
    const id = await getFlixhqId(ctx, ctx.media);
    ctx.progress(30);
    if (!id) throw new NotFoundError('no search results match');

    const sources = await getFlixhqShowSources(ctx, ctx.media, id);
    ctx.progress(600);
    const streams: any[] = [];
    for (const source of sources) {
      streams.push({
        id: 'primary',
        playlist: source.stream,
        type: 'hls',
        flags: [flags.CORS_ALLOWED],
        captions: source.captions,
      });
    }
    return {
      embeds: [],
      stream: streams,
    };
  },
});
