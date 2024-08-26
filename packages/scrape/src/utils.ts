import { scrapers } from "./index";

export const getUrlById = (scraperId: string, id: string): string => {
	const matchedScraper = scrapers.find((scraper) => scraper.id === scraperId);
	if (!matchedScraper) {
		return "unknown";
	}
	return matchedScraper.getUrl(id);
};
