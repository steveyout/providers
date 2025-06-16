import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
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

export async function getEightStreamMovieSources(ctx: ScrapeContext, media: MovieMedia, data: any) {
  const source = data.playlist.find((folder: { title: string }) => {
    return folder.title === 'English';
  });

  const sourceLinks = [
    {
      id: source.id,
      embed: media.title,
      stream: source.file,
    },
  ];

  return sourceLinks;
}

// get show sources
export async function getEightStreamShowSources(ctx: ScrapeContext, media: ShowMedia, data: any) {
  const seasonNumber = media.season.number;
  const episodeNumber = media.episode.number;
  const season = await data.playlist.find((show: { id: string }) => {
    return Number(show.id) === seasonNumber;
  });
  const episode = await season.folder.find((folder: { episode: string }) => {
    return Number(folder.episode) === episodeNumber;
  });
  const source = episode.folder.find((folder: { title: string }) => {
    return folder.title === 'English';
  });

  const sourceLinks = [
    {
      id: source.id,
      embed: episode.title,
      episodeId: episode.id,
      stream: source.file,
    },
  ];

  return sourceLinks;
}
