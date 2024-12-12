import { flags } from '@/entrypoint/utils/targets';
import { makeSourcerer } from '@/providers/base';
import {
  fetchSources,
  getEightStreamMovieSources,
  getEightStreamShowSources,
} from '@/providers/sources/8stream/scrape';
import { getDetails } from '@/providers/sources/8stream/search';
import { NotFoundError } from '@/utils/errors';

export const eightStreamScraper = makeSourcerer({
  id: '8stream',
  name: '8stream',
  rank: 51,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  async scrapeMovie(ctx) {
    const movie = await getDetails(ctx, ctx.media);
    ctx.progress(30);
    if (!movie) throw new NotFoundError('no search results match');

    const sources = await getEightStreamMovieSources(ctx, ctx.media, movie);
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
    const show = await getDetails(ctx, ctx.media);
    const { key } = show;
    ctx.progress(30);
    if (!show) throw new NotFoundError('no search results match');

    const sources = await getEightStreamShowSources(ctx, ctx.media, show);
    ctx.progress(60);
    const streams: any[] = [];
    for (const source of sources) {
      streams.push({
        id: 'primary',
        playlist: await fetchSources(ctx, source.stream, key),
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
