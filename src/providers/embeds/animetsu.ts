/* eslint-disable no-console */
import { NotFoundError } from '@/utils/errors';

import { EmbedOutput, makeEmbed } from '../base';

const ANIMETSU_SERVERS = ['pahe', 'zoro', 'zaza', 'meg', 'bato'] as const;

const baseUrl = 'https://backend.animetsu.net';
const headers = {
  referer: 'https://animetsu.net/',
  origin: 'https://backend.animetsu.net',
  accept: 'application/json, text/plain, */*',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

export function makeAnimetsuEmbed(id: string, rank: number = 100) {
  return makeEmbed({
    id: `animetsu-${id}`,
    name: `Animetsu ${id.charAt(0).toUpperCase() + id.slice(1)}`,
    rank,
    flags: [],
    async scrape(ctx): Promise<EmbedOutput> {
      const serverName = id as (typeof ANIMETSU_SERVERS)[number];

      const query = JSON.parse(ctx.url);
      const { type, anilistId, episode } = query;

      if (type !== 'movie' && type !== 'show') {
        throw new NotFoundError('Unsupported media type');
      }

      const res = await ctx.proxiedFetcher(`/api/anime/tiddies`, {
        baseUrl,
        headers,
        query: {
          server: serverName,
          id: String(anilistId),
          num: String(episode ?? 1),
          subType: 'dub',
        },
      });

      console.log('Animetsu API Response:', JSON.stringify(res, null, 2));

      const sources = Array.isArray(res?.sources) ? res.sources : (res?.sources ? [res.sources] : []);
      if (!sources.length) throw new NotFoundError('No source URL found');

      ctx.progress(100);

      const streams: any[] = [];
      const qualityMap: Record<number, { type: 'mp4'; url: string }> = {};

      for (const src of sources) {
        if (!src?.url) continue;
        if (src.type === 'mp4') {
          let qualityKey: number = 1080;
          if (src.quality) {
            const qualityMatch = src.quality.match(/(\d+)p?/);
            if (qualityMatch) qualityKey = parseInt(qualityMatch[1], 10);
          }
          if (!qualityMap[qualityKey]) {
            qualityMap[qualityKey] = {
              type: 'mp4',
              url: src.url,
            };
          }
        } else {
          streams.push({
            id: src.name || `animetsu_${streams.length + 1}`,
            type: 'hls' as const,
            playlist: src.url,
            headers,
            flags: [],
            captions: [],
          });
        }
      }

      if (Object.keys(qualityMap).length > 0) {
        streams.push({
          id: 'primary',
          captions: [],
          qualities: qualityMap,
          type: 'file',
          headers,
          flags: [],
        });
      }

      if (streams.length === 0) throw new NotFoundError('No playable stream found');

      return {
        stream: streams,
      };
    },
  });
}

export const AnimetsuEmbeds = ANIMETSU_SERVERS.map((server, i) => makeAnimetsuEmbed(server, 300 - i));
