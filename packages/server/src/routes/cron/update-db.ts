import { z } from "zod";

import { deleteAllEntities, getEntitiesIds } from "@/db/entities";
import type { ScrapedEntity } from "@/db/types";
import { scrapers } from "@/scrape/index";
import { scrapeEntities } from "@/scrape/scraping";
import { procedure } from "@/server/trpc";
import { withLogger } from "@/utils/logger";

export const handler = procedure
	.input(
		z.object({
			scraperIds: z.string().uuid().array().optional(),
			shouldWipe: z.boolean().optional(),
			dryRun: z.boolean().optional(),
			fullRun: z.boolean().optional(),
			maxPages: z.number().int().optional(),
		}),
	)
	.mutation(
		async ({
			input: { scraperIds, shouldWipe, fullRun, maxPages, dryRun },
			ctx,
		}) => {
			const filteredScrapers = scraperIds
				? scrapers.filter((scraper) => scraperIds.includes(scraper.id))
				: scrapers;
			const entities = await withLogger(
				ctx.logger,
				`Update all data for ${filteredScrapers.length} scrapers${
					shouldWipe ? " with total wipe" : ""
				}${scraperIds ? ` (only for ${scraperIds.join(",")})` : ""}`,
				async (logger) => {
					let existingIds: Pick<ScrapedEntity, "entityId" | "scraperId">[] = [];
					if (shouldWipe) {
						await deleteAllEntities(logger);
					} else {
						existingIds = await getEntitiesIds(logger);
					}

					const maybeEntities: (string[] | undefined)[] = await Promise.all(
						filteredScrapers.map((scraper) =>
							scrapeEntities(
								logger,
								scraper,
								existingIds
									.filter(({ scraperId }) => scraperId === scraper.id)
									.map(({ entityId }) => entityId),
								{
									shouldBailOutOnNoNewIds: !fullRun,
									maxPages,
									dryRun,
								},
							),
						),
					);
					return maybeEntities.reduce<string[]>(
						(acc, elements) => (elements ? acc.concat(elements) : acc),
						[],
					);
				},
			);

			return { addedElements: entities.length };
		},
	);
