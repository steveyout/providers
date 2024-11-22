import { load } from 'cheerio';
import { MOVIES } from 'wikiextensions-flix';

import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { flixHqBase } from '@/providers/sources/flixhq/common';
import { compareMedia, compareTitle } from '@/utils/compare';
import { ScrapeContext } from '@/utils/context';

export async function getFlixhqId(ctx: ScrapeContext, media: MovieMedia | ShowMedia): Promise<string | null> {
  const flixhq = new MOVIES.FlixHQ();
  const search = await flixhq.search(media.title.replaceAll(/[^a-z0-9A-Z]/g, '-'));
  const items = search.results.map((result) => {
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

  const matchingItem = items.find((v) => {
    if (!v) return false;

    if (media.type === 'movie') {
      return compareMedia(media, v.title, v.year);
    }

    // @ts-ignore
    return compareTitle(media.title, v.title) && media.season.number < v.seasons + 1;
  });

  if (!matchingItem) return null;
  return matchingItem.id;
}
