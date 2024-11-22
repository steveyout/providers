import { MOVIES } from 'wikiextensions-flix';

import { MovieMedia, ShowMedia } from '@/entrypoint/utils/media';
import { flixHqBase } from '@/providers/sources/flixhq/common';
import axios from '@/utils/axios';
import { ScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

export async function getFlixhqSourceDetails(ctx: ScrapeContext, sourceId: string, id: string): Promise<string> {
  const flixhq = new MOVIES.FlixHQ();
  const videoResult: { source: string; subtitles: string[] } = { source: '', subtitles: [] };
  const servers = await flixhq.fetchEpisodeServers(id, sourceId);
  const i = servers.findIndex((s: { name: string }) => s.name === 'UpCloud' || 'VidCloud');
  const { data } = await axios.get(`${flixHqBase}/ajax/sources/${servers[i].id}`);
  const videoUrl = new URL(data.link);
  const mid = videoUrl.href.split('/').pop()?.split('?')[0];
  const sources = await axios.post(`https://youplex.site/api/sources/upcloud`, { id: mid });
  videoResult.source = sources.data.source;
  videoResult.subtitles = sources.data.subtitle.map((s: { file: string; label: string; default: boolean }) => ({
    url: s.file ? s.file : s,
    lang: s.label ? s.label : s,
    default: s.default && s.default,
  }));
  if (!videoResult.source) throw new NotFoundError('source not found');

  return videoResult.source;
}

export async function getFlixhqMovieSources(ctx: ScrapeContext, media: MovieMedia, id: string) {
  const flixhq = new MOVIES.FlixHQ();
  const movie = await flixhq.fetchMovieInfo(id);
  if (!movie.episodes) throw new NotFoundError('movie not found');

  const sourceLinks = movie.episodes.map((episode) => {
    return {
      embed: episode.title,
      episodeId: episode.id,
    };
  });

  return sourceLinks;
}

// get show sources
export async function getFlixhqShowSources(ctx: ScrapeContext, media: ShowMedia, id: string) {
  const flixhq = new MOVIES.FlixHQ();
  const movie = await flixhq.fetchMovieInfo(id);
  if (!movie.episodes) throw new NotFoundError('season not found');

  const sourceLinks = movie.episodes.map((episode) => {
    return {
      embed: episode.title,
      episodeId: episode.id,
    };
  });

  return sourceLinks;
}
