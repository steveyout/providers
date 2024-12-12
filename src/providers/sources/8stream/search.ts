import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { eightStreamBase } from '@/providers/sources/8stream/common';
import { ScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

export async function getDetails(ctx: ScrapeContext, media: MovieMedia | ShowMedia): Promise<any> {
  const search = await ctx.proxiedFetcher(`/api/v1/mediaInfo?id=${media.imdbId}`, {
    baseUrl: eightStreamBase,
  });
  if (!search.success) throw new NotFoundError('no search results match');
  return search.data;
}
