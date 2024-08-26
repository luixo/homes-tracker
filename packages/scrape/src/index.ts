import { scraper as myHomeScraper } from "./myhome/scraper";
import { scraper as ssScraper } from "./ss/scraper";
import type { Scraper } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const scrapers: Scraper<any, any>[] = [ssScraper, myHomeScraper];
