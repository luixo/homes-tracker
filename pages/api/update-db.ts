import type { NextApiRequest, NextApiResponse } from "next";
import {
  deleteAllEntities,
  getEntitiesIds,
} from "../../server/utils/db/entities";
import { scrapers } from "../../server/services/scrapers";
import { scrapeEntities } from "../../server/utils/scraping";
import { EntityIdentification } from "../../server/types/scraper";
import { withLogger } from "../../server/utils/logging";
import { getHandlerLogger } from "../../server/utils";

const NO_DB_UPDATE = Boolean(process.env.NO_DB_UPDATE);

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

type UpdateOptions = {
  shouldWipe: boolean;
  selectedScraperIds?: string[];
  dryRun: boolean;
  keepRunningOnKnownIds: boolean;
};

const getOptions = (query: NextApiRequest["query"]): UpdateOptions => {
  const selectedScraperIds = Array.isArray(query.id)
    ? query.id
    : [query.id].filter(Boolean);
  return {
    shouldWipe: query.wipe === "true",
    selectedScraperIds:
      selectedScraperIds.length === 0 ? undefined : selectedScraperIds,
    dryRun: Boolean(NO_DB_UPDATE),
    keepRunningOnKnownIds: query.full === "true",
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const options = getOptions(req.query);
  if (options.dryRun) {
    return res.status(403).send({
      success: "DB update is forbidden on this instance!",
    });
  }

  const filteredScrapers = options.selectedScraperIds
    ? scrapers.filter((scraper) =>
        options.selectedScraperIds?.includes(scraper.id)
      )
    : scrapers;

  try {
    const entities = await withLogger(
      getHandlerLogger(req),
      `Update all data for ${filteredScrapers.length} scrapers${
        options.shouldWipe ? " with total wipe" : ""
      }${
        options.selectedScraperIds
          ? ` (only for ${options.selectedScraperIds})`
          : ""
      }`,
      async (logger) => {
        let existingIds: EntityIdentification[] = [];
        if (options.shouldWipe) {
          await deleteAllEntities(logger);
        } else {
          existingIds = await getEntitiesIds(logger);
        }

        const maybeEntities: (string[] | undefined)[] = await Promise.all(
          scrapers.map((scraper) =>
            scrapeEntities(
              logger,
              scraper,
              existingIds
                .filter(({ scraperId }) => scraperId === scraper.id)
                .map(({ entityId }) => entityId),
              !options.keepRunningOnKnownIds
            )
          )
        );
        return maybeEntities.reduce<string[]>(
          (acc, elements) => (elements ? acc?.concat(elements) : acc),
          []
        );
      }
    );

    res.status(200).send({
      success: `DB now contains ${entities.length} more elements`,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
