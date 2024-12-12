import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { captionTypes, labelToLanguageCode } from '@/providers/captions';
import { eightStreamBase } from '@/providers/sources/8stream/common';
import { ScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

/// fetch movies
export async function fetchSources(ctx: ScrapeContext, file: string, key: string) {
  const movie = await ctx.proxiedFetcher(`/api/v1/getStream`, {
    method: 'POST',
    baseUrl: eightStreamBase,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file,
      key,
    }),
  });
  if (!movie.success) throw new NotFoundError('source not found');

  return movie.data.link;
}

export async function getEightStreamMovieSources(ctx: ScrapeContext, media: MovieMedia, id: string) {
  const episodeParts = id.split('movie/');
  const episodeId = episodeParts[1];
  const movie = await ctx.proxiedFetcher(`/api/movie/${episodeId}`, {
    baseUrl: eightStreamBase,
  });
  if (!movie.episodes) throw new NotFoundError('movie not found');

  const stream =
    movie.sources.find((source: { quality: string | string[] }) => source.quality && source.quality.includes('auto')) ||
    movie.sources[0];
  const captions = movie.subtitles.map((subtitle: { lang: string; url: string }) => {
    const language = labelToLanguageCode(subtitle.lang);
    return {
      id: subtitle.lang,
      type: captionTypes.vtt,
      url: subtitle.url,
      hasCorsRestrictions: false,
      language,
    };
  });

  return movie.episodes.map((episode: { title: string; id: string }) => {
    return {
      embed: episode.title,
      episodeId: episode.id,
      stream: stream.url,
      captions,
    };
  });
}

// get show sources
export async function getEightStreamShowSources(ctx: ScrapeContext, media: ShowMedia, data: any) {
  const seasonNumber = media.season.number;
  const season = await data.playlist.find((show: { id: string }) => {
    return Number(show.id) === seasonNumber;
  });

  const sourceLinks = season.folder.map((episode: { title: string; id: string; folder: any }) => {
    const source = episode.folder.find((folder: { title: string }) => {
      return folder.title === 'English';
    });
    return {
      id: source.id,
      embed: episode.title,
      episodeId: episode.id,
      stream: source.file,
    };
  });

  return sourceLinks;
}
