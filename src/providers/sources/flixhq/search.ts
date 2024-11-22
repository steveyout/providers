import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { compareMedia, compareTitle } from '@/utils/compare';
import { ScrapeContext } from '@/utils/context';

export async function getFlixhqId(ctx: ScrapeContext, media: MovieMedia | ShowMedia): Promise<string | null> {
  const search = await ctx.proxiedFetcher(`/search?query=${media.title.replaceAll(/[^a-z0-9A-Z]/g, '-')}`, {
    baseUrl: 'https://youplex.site/api',
  });
  const items = search.results.map((result: { id: string; title: string; releaseDate: string; seasons: number }) => {
    const id = result.id;
    const title = result.title;
    const year = result.releaseDate ? result.releaseDate : 'uknown';
    const seasons = result.seasons ? result.seasons : 0;
    if (!id || !title || !year) return null;
    return {
      id,
      title,
      year: parseInt(year, 10),
      seasons,
    };
  });

  const matchingItem = items.find((v: { title: string; year: number | undefined; seasons: number }) => {
    if (!v) return false;

    if (media.type === 'movie') {
      return compareMedia(media, v.title, v.year);
    }

    return compareTitle(media.title, v.title) && media.season.number < v.seasons + 1;
  });

  if (!matchingItem) return null;
  return matchingItem.id;
}
