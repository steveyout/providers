import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { Caption, captionTypes } from '@/providers/captions';
import { flixHqBase } from '@/providers/sources/flixhq/common';
import { ScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

export async function getFlixhqSourceDetails(ctx: ScrapeContext, sourceId: string, id: string): Promise<string> {
  let sources;
  if (id.includes('movie')) {
    const episodeParts = id.split('movie/');
    const episodeId = episodeParts[1];
    sources = await ctx.proxiedFetcher(`/api/movie/${episodeId}`, {
      baseUrl: flixHqBase,
    });
  } else if (id.includes('tv')) {
    const episodeParts = id.split('tv/');
    const episodeId = episodeParts[1];
    sources = await ctx.proxiedFetcher(`/api/series/${episodeId}`, {
      baseUrl: flixHqBase,
    });
  } else {
    throw new NotFoundError('source not found');
  }
  const stream =
    sources.sources.find(
      (source: { quality: string | string[] }) => source.quality && source.quality.includes('auto'),
    ) || sources.sources[0];
  return stream.url;
}

export async function getFlixhqMovieSources(ctx: ScrapeContext, media: MovieMedia, id: string) {
  const episodeParts = id.split('movie/');
  const episodeId = episodeParts[1];
  const movie = await ctx.proxiedFetcher(`/api/movie/${episodeId}`, {
    baseUrl: flixHqBase,
  });
  if (!movie.episodes) throw new NotFoundError('movie not found');

  const stream =
    movie.sources.find((source: { quality: string | string[] }) => source.quality && source.quality.includes('auto')) ||
    movie.sources[0];
  const captions = movie.subtitles.map((subtitle: { lang: string; url: string }) => {
    return {
      type: captionTypes.vtt,
      id: subtitle.lang,
      opensubtitles: false,
      url: subtitle.url,
      hasCorsRestrictions: false,
      language: subtitle.lang,
    };
  });
  const sourceLinks = movie.episodes.map((episode: { title: string; id: string }) => {
    return {
      embed: episode.title,
      episodeId: episode.id,
      stream: stream.url,
      captions,
    };
  });

  return sourceLinks;
}

// get show sources
export async function getFlixhqShowSources(ctx: ScrapeContext, media: ShowMedia, id: string) {
  const episodeParts = id.split('tv/');
  const episodeId = episodeParts[1];
  const movie = await ctx.proxiedFetcher(`/api/series/${episodeId}`, {
    baseUrl: flixHqBase,
  });
  if (!movie.episodes) throw new NotFoundError('season not found');

  const sourceLinks = movie.episodes.map((episode: { title: string; id: string }) => {
    return {
      embed: episode.title,
      episodeId: episode.id,
    };
  });

  return sourceLinks;
}
