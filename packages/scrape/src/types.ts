import type { ScrapedEntity } from "@/db/types";
import type { Logger } from "@/utils/logger";

export type Scraper<T, P> = {
	id: string;
	prepare: (logger: Logger) => Promise<P>;
	pageFetchers: ((
		logger: Logger,
		prepareResult: P,
		page: number,
	) => Promise<{ results: T[]; nonVipAdsFound: boolean }>)[];
	fetchEntity: (
		logger: Logger,
		prepareResult: P,
		result: T,
	) => Promise<ScrapedEntity | null>;
	getEntityId: (result: T) => string;
	getUrl: (id: string) => string;
};

export type EntityIdentification = {
	entityId: string;
	scraperId: string;
};
