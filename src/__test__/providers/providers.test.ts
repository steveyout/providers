import { testSource } from './providerUtils';
import { testMedia } from './testMedia';
import dotenv from 'dotenv';
import { flixhqScraper } from '@/providers/sources/flixhq';


dotenv.config();

testSource({
  source: flixhqScraper,
  testSuite: [testMedia.arcane],
  types: ['proxied'],
  debug:true,
  expect: {
    streams: 1,
  },
});
