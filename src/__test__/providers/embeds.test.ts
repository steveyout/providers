import dotenv from 'dotenv';
import { testEmbed } from './embedUtils';
import { testMedia } from './testMedia';
import { flixhqScraper } from '@/providers/sources/flixhq';
import { upcloudScraper } from '@/providers/embeds/upcloud';

dotenv.config();

