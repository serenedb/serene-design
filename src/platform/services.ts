/* The one list of SereneDB playground services.

   It lives in the design kit — not in the playground — so that every front end
   that shows the switcher (playground, serenedb.com, serene-ui, docs search)
   offers the same set without copy-pasting it. Adding a service is a bump of
   this file plus a tag. */

export interface PlatformService {
  id: string;
  /** Shown after "SereneDB /" in the header. */
  name: string;
  /** One line under the name in the switcher. */
  tagline: string;
  /** Route inside the playground SPA. */
  path: string;
  /** Absolute URL — used whenever the switcher renders outside the playground. */
  url: string;
  /** Where this service's code lives; the header's GitHub button points here. */
  source: string;
  status?: 'live' | 'soon';
}

export const PLAYGROUND_ORIGIN = 'https://playground.serenedb.com';

const PLAYGROUND_REPO = 'https://github.com/serenedb/playground/tree/main/products';

function service(
  s: Omit<PlatformService, 'url' | 'source'> & { url?: string; source?: string },
): PlatformService {
  return {
    ...s,
    url: s.url ?? `${PLAYGROUND_ORIGIN}${s.path}`,
    source: s.source ?? `${PLAYGROUND_REPO}/${s.id}`,
  };
}

export const PLATFORM_SERVICES: PlatformService[] = [
  service({
    id: 'will-it-hn',
    name: 'Will It HN?',
    tagline: 'Score a Hacker News headline over ~50M submissions',
    path: '/hn',
    status: 'live',
  }),
  service({
    id: 'chess',
    name: 'Chess',
    tagline: 'Play against a database of 47M evaluated positions',
    path: '/chess',
    status: 'live',
  }),
  service({
    id: 'codesearch',
    name: 'Codesearch',
    tagline: 'Search 11.5M solutions indexed straight off the data lake',
    path: '/codesearch',
    status: 'live',
  }),
  service({
    id: 'benchmark-game',
    name: 'Benchmark Game',
    tagline: 'IResearch against Lucene and Tantivy on the Wikipedia query set',
    path: '/benchmark-game',
    status: 'live',
  }),
  service({
    id: 'searchbench',
    name: 'SearchBench',
    tagline: 'Full-text search and analytics benchmark on 1B log lines',
    path: '/searchbench',
    status: 'live',
  }),
];

export function findService(id: string): PlatformService | undefined {
  return PLATFORM_SERVICES.find((s) => s.id === id);
}
