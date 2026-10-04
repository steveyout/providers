import dotenv from 'dotenv';
import { flixhqScraper } from '@/providers/sources/flixhq';
import { upcloudScraper } from '@/providers/embeds/upcloud';
import { zoechipScraper } from '@/providers/sources/zoechip';
import { mixdropScraper } from '@/providers/embeds/mixdrop';
import { testEmbed } from './embedUtils';
import { testMedia } from './testMedia';

dotenv.config();

testEmbed({
  embed: upcloudScraper,
  source: flixhqScraper,
  testSuite: [testMedia.arcane, testMedia.hamilton],
  types: ['standard', 'proxied'],
  expect: {
    embeds: 1,
    streams: 1,
  },
});

testEmbed({
  embed: upcloudScraper,
  source: zoechipScraper,
  testSuite: [testMedia.arcane, testMedia.hamilton],
  types: ['standard', 'proxied'],
  expect: {
    embeds: 2,
    streams: 1,
  },
});

testEmbed({
  embed: mixdropScraper,
  source: zoechipScraper,
  testSuite: [testMedia.arcane, testMedia.hamilton],
  types: ['standard', 'proxied'],
  expect: {
    embeds: 2,
    streams: 1,
  },
});
