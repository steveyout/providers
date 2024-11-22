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
    if (!id) throw new NotFoundError('no search results match');

    const sources = await getFlixhqMovieSources(ctx, ctx.media, id);

    const embeds: SourcererEmbed[] = [];

    for (const source of sources) {
      embeds.push({
        embedId: upcloudScraper.id,
        url: await getFlixhqSourceDetails(ctx, source.episodeId, id),
      });
    }

    return {
      embeds,
    };
  },
  async scrapeShow(ctx) {
    const id = await getFlixhqId(ctx, ctx.media);
    if (!id) throw new NotFoundError('no search results match');

    const sources = await getFlixhqShowSources(ctx, ctx.media, id);

    const embeds: SourcererEmbed[] = [];
    for (const source of sources) {
      embeds.push({
        embedId: upcloudScraper.id,
        url: await getFlixhqSourceDetails(ctx, source.episodeId, id),
      });
    }

    return {
      embeds,
    };
  },
});
