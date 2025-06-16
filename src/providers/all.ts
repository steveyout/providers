import { Embed, Sourcerer } from '@/providers/base';
import { doodScraper } from '@/providers/embeds/dood';
import {
  hianimeHd1DubEmbed,
  hianimeHd1SubEmbed,
  hianimeHd2DubEmbed,
  hianimeHd2SubEmbed,
} from '@/providers/embeds/hianime';
import { mixdropScraper } from '@/providers/embeds/mixdrop';
import { turbovidScraper } from '@/providers/embeds/turbovid';
import { upcloudScraper } from '@/providers/embeds/upcloud';
import { autoembedScraper } from '@/providers/sources/autoembed';
import { catflixScraper } from '@/providers/sources/catflix';
import { ee3Scraper } from '@/providers/sources/ee3';
import { fsharetvScraper } from '@/providers/sources/fsharetv';
import { hianimeScraper } from '@/providers/sources/hianime';
import { insertunitScraper } from '@/providers/sources/insertunit';
import { mp4hydraScraper } from '@/providers/sources/mp4hydra';
import { tugaflixScraper } from '@/providers/sources/tugaflix';
import { vidsrcsuScraper } from '@/providers/sources/vidsrcsu';
import { flixhqScraper } from '@/providers/sources/flixhq';

import {
  oneServerAnimepaheEmbed,
  oneServerAnizoneEmbed,
  oneServerAutoembedEmbed,
  oneServerFlixhqEmbed,
  oneServerFoxstreamEmbed,
  oneServerGokuEmbed,
  oneServerHianimeEmbed,
  oneServerPrimeboxEmbed,
  oneServerVidsrcsuEmbed,
} from './embeds/1server';
import {
  autoembedBengaliScraper,
  autoembedEnglishScraper,
  autoembedHindiScraper,
  autoembedTamilScraper,
  autoembedTeluguScraper,
} from './embeds/autoembed';
import { cinemaosEmbeds } from './embeds/cinemaos';
import { closeLoadScraper } from './embeds/closeload';
import {
  ConsumetStreamSBScraper,
  ConsumetStreamTapeScraper,
  ConsumetVidCloudScraper,
  ConsumetVidStreamingScraper,
} from './embeds/consumet';
import { FedAPIPrivateScraper, FedDBScraper } from './embeds/fedapi';
import { mp4hydraServer1Scraper, mp4hydraServer2Scraper } from './embeds/mp4hydra';
import { ridooScraper } from './embeds/ridoo';
import { streamtapeLatinoScraper, streamtapeScraper } from './embeds/streamtape';
import { streamvidScraper } from './embeds/streamvid';
import {
  streamwishEnglishScraper,
  streamwishJapaneseScraper,
  streamwishLatinoScraper,
  streamwishSpanishScraper,
} from './embeds/streamwish';
import { vidCloudScraper } from './embeds/vidcloud';
import {
  VidsrcsuServer10Scraper,
  VidsrcsuServer11Scraper,
  VidsrcsuServer12Scraper,
  VidsrcsuServer1Scraper,
  VidsrcsuServer20Scraper,
  VidsrcsuServer2Scraper,
  VidsrcsuServer3Scraper,
  VidsrcsuServer4Scraper,
  VidsrcsuServer5Scraper,
  VidsrcsuServer6Scraper,
  VidsrcsuServer7Scraper,
  VidsrcsuServer8Scraper,
  VidsrcsuServer9Scraper,
} from './embeds/vidsrcsu';
import { viperScraper } from './embeds/viper';
import { warezcdnembedHlsScraper } from './embeds/warezcdn/hls';
import { warezcdnembedMp4Scraper } from './embeds/warezcdn/mp4';
import { warezPlayerScraper } from './embeds/warezcdn/warezplayer';
import { webtor1080Scraper, webtor480Scraper, webtor4kScraper, webtor720Scraper } from './embeds/webtor';
import {
  xprimeApolloEmbed,
  xprimeFendiEmbed,
  xprimeFoxEmbed,
  xprimeHarbourEmbed,
  xprimeMarantEmbed,
  xprimePhoenixEmbed,
  xprimePrimenetEmbed,
  xprimeStreamboxEmbed,
  xprimeVolkswagenEmbed,
} from './embeds/xprime';
import { oneServerScraper } from './sources/1server';
import { eightStreamScraper } from './sources/8stream';
import { animeflvScraper } from './sources/animeflv';
import { cinemaosScraper } from './sources/cinemaos';
import { coitusScraper } from './sources/coitus';
import { ConsumetScraper } from './sources/consumet';
import { cuevana3Scraper } from './sources/cuevana3';
import { embedsuScraper } from './sources/embedsu';
import { FedAPIScraper } from './sources/fedapi';
import { hdRezkaScraper } from './sources/hdrezka';
import { hollymoviehdScraper } from './sources/hollymoviehd';
import { iosmirrorScraper } from './sources/iosmirror';
import { iosmirrorPVScraper } from './sources/iosmirrorpv';
import { nunflixScraper } from './sources/nunflix';
import { oneroomScraper } from './sources/oneroom';
import { ridooMoviesScraper } from './sources/ridomovies';
import { slidemoviesScraper } from './sources/slidemovies';
import { soaperTvScraper } from './sources/soapertv';
import { streamboxScraper } from './sources/streambox';
import { uiraliveScraper } from './sources/uiralive';
import { vidapiClickScraper } from './sources/vidapiclick';
import { warezcdnScraper } from './sources/warezcdn';
import { webtorScraper } from './sources/webtor';
import { wecimaScraper } from './sources/wecima';
import { xprimeScraper } from './sources/xprime';

export function gatherAllSources(): Array<Sourcerer> {
  // all sources are gathered here
  return [
    cuevana3Scraper,
    catflixScraper,
    ridooMoviesScraper,
    hdRezkaScraper,
    warezcdnScraper,
    insertunitScraper,
    soaperTvScraper,
    autoembedScraper,
    tugaflixScraper,
    ee3Scraper,
    flixhqScraper,
    fsharetvScraper,
    vidsrcsuScraper,
    mp4hydraScraper,
    webtorScraper,
    embedsuScraper,
    FedAPIScraper,
    slidemoviesScraper,
    iosmirrorScraper,
    iosmirrorPVScraper,
    uiraliveScraper,
    vidapiClickScraper,
    coitusScraper,
    streamboxScraper,
    nunflixScraper,
    eightStreamScraper,
    xprimeScraper,
    ConsumetScraper,
    hianimeScraper,
    oneServerScraper,
    wecimaScraper,
    animeflvScraper,
    cinemaosScraper,
    hollymoviehdScraper,
    oneroomScraper,
  ];
}

export function gatherAllEmbeds(): Array<Embed> {
  // all embeds are gathered here
  return [
    upcloudScraper,
    vidCloudScraper,
    mixdropScraper,
    ridooScraper,
    closeLoadScraper,
    doodScraper,
    streamvidScraper,
    streamtapeScraper,
    warezcdnembedHlsScraper,
    warezcdnembedMp4Scraper,
    warezPlayerScraper,
    autoembedEnglishScraper,
    autoembedHindiScraper,
    autoembedBengaliScraper,
    autoembedTamilScraper,
    autoembedTeluguScraper,
    turbovidScraper,
    mp4hydraServer1Scraper,
    mp4hydraServer2Scraper,
    VidsrcsuServer1Scraper,
    VidsrcsuServer2Scraper,
    VidsrcsuServer3Scraper,
    VidsrcsuServer4Scraper,
    VidsrcsuServer5Scraper,
    VidsrcsuServer6Scraper,
    VidsrcsuServer7Scraper,
    VidsrcsuServer8Scraper,
    VidsrcsuServer9Scraper,
    VidsrcsuServer10Scraper,
    VidsrcsuServer11Scraper,
    VidsrcsuServer12Scraper,
    VidsrcsuServer20Scraper,
    webtor4kScraper,
    webtor1080Scraper,
    webtor720Scraper,
    webtor480Scraper,
    viperScraper,
    FedAPIPrivateScraper,
    FedDBScraper,
    xprimeFoxEmbed,
    xprimeApolloEmbed,
    xprimeStreamboxEmbed,
    xprimeMarantEmbed,
    xprimeFendiEmbed,
    xprimePrimenetEmbed,
    xprimeVolkswagenEmbed,
    xprimeHarbourEmbed,
    xprimePhoenixEmbed,
    ConsumetVidCloudScraper,
    ConsumetStreamSBScraper,
    ConsumetVidStreamingScraper,
    ConsumetStreamTapeScraper,
    hianimeHd1DubEmbed,
    hianimeHd2DubEmbed,
    hianimeHd1SubEmbed,
    hianimeHd2SubEmbed,
    oneServerAutoembedEmbed,
    oneServerVidsrcsuEmbed,
    oneServerPrimeboxEmbed,
    oneServerFoxstreamEmbed,
    oneServerFlixhqEmbed,
    oneServerGokuEmbed,
    oneServerHianimeEmbed,
    oneServerAnimepaheEmbed,
    oneServerAnizoneEmbed,
    streamwishJapaneseScraper,
    streamwishLatinoScraper,
    streamwishSpanishScraper,
    streamwishEnglishScraper,
    streamtapeLatinoScraper,
    ...cinemaosEmbeds,
    // ...cinemaosHexaEmbeds,
  ];
}
