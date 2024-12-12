import { testSource } from './providerUtils';
import { testMedia } from './testMedia';
import dotenv from 'dotenv';
import { eightStreamScraper } from '@/providers/sources/8stream';


dotenv.config();

testSource({
  source: eightStreamScraper,
  testSuite: [testMedia.arcane],
  types: ['proxied'],
  debug:true,
  expect: {
    streams: 1,
  },
});
