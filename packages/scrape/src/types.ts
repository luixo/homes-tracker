import type { ScrapedEntity } from "@/types/db/index";
import type { LocalEntityId, ScraperId } from "@/types/ids";
import type { Logger } from "@/utils/logger";

export type Scraper<T, P> = {
	id: ScraperId;
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
	getEntityId: (result: T) => LocalEntityId;
	getUrl: (id: string) => string;
};
