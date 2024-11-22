import { testSource } from './providerUtils';
import { testMedia } from './testMedia';
import dotenv from 'dotenv';
import { flixhqScraper } from '@/providers/sources/flixhq';


dotenv.config();

testSource({
  source: flixhqScraper,
  testSuite: [testMedia.hamilton],
  types: ['proxied'],
  debug:true,
  expect: {
    embeds: 1,
  },
});
