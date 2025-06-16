import { testSource } from './providerUtils';
import { testMedia } from './testMedia';
import dotenv from 'dotenv';
import { eightStreamScraper } from '@/providers/sources/8stream';

dotenv.config();


testSource({
  source: eightStreamScraper,
  testSuite: [testMedia.arcane, testMedia.hamilton],
  types: ['standard'],
  expect: {
    streams: 1,
  },
});
