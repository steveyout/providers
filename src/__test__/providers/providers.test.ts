import { testSource } from './providerUtils';
import { testMedia } from './testMedia';
import dotenv from 'dotenv';
// Import one of your generated providers
import { YouPlexVidLink } from '@/providers/sources/youplex';

dotenv.config();

/**
 * Testing the YouPlex Bridge
 * This will trigger:
 *
 */
testSource({
  source: YouPlexVidLink,
  testSuite: [
    testMedia.arcane, // Tests TV Show logic (s=1&e=1)
    testMedia.hamilton, // Tests Movie logic
  ],
  types: ['standard'],
  expect: {
    streams: 1, // We expect at least one HLS stream back from your VPS
  },
  timeout: 30000,
});
