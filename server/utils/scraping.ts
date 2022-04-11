import winston from "winston";
import { Scraper } from "../types/scraper";
import { getStopSignal, timeout, wait } from "../utils";
import { putEntity, removeEntity } from "../utils/db/entities";
import { withLogger } from "./logging";
import { MINUTE, SECOND } from "./time";

export const fetchAndPutIds = async (
  logger: winston.Logger,
  ids: string[],
  scraper: Scraper
): Promise<string[]> => {
  let entityIds: string[] = [];
  for (const id of ids) {
    const entity = await scraper.fetchEntity(logger, id);
    // We're not filthy scraperers, aren't we?
    let promises: Promise<unknown>[] = [wait(250)];
    if (entity) {
      promises.push(putEntity(logger, entity));
      entityIds.push(entity._id);
    } else {
      promises.push(removeEntity(logger, id));
    }
    await Promise.all(promises);
  }
  return entityIds;
};

const MAX_PAGES = process.env.MAX_PAGES || Infinity;

export const scrapeEntities = async (
  logger: winston.Logger,
  scraper: Scraper,
  existingIds: string[],
  shouldBailOutOnNoNewIds: boolean
): Promise<string[]> => {
  let entityIds: string[] = [];
  for (const [index, fetcher] of Object.entries(scraper.pageFetchers)) {
    const { ids: newEntityIds } = await withLogger(
      logger.child({ scraper: `${scraper.id} #${index}` }),
      `Scraping`,
      async (logger) => {
        let page = 0;
        while (page < MAX_PAGES) {
          if (getStopSignal()) {
            break;
          }
          page++;

          const pageResult = await withLogger(
            logger,
            `Fetch page #${page}`,
            async () => {
              const pageResult = await timeout(
                fetcher(logger, page),
                5 * SECOND
              );
              if (!pageResult) {
                return null;
              }
              return {
                ids: pageResult.ids,
                nonVipAdsFound: pageResult.nonVipAdsFound,
                filteredIds: pageResult.ids.filter(
                  (id) => !existingIds.includes(id)
                ),
              };
            },
            {
              onSuccess: (response) =>
                response
                  ? `${response.filteredIds.length} new ids found${
                      response.filteredIds.length
                        ? ` : ${response.filteredIds.join(", ")}`
                        : ""
                    }`
                  : undefined,
            }
          );

          if (!pageResult) {
            continue;
          }
          if (pageResult.filteredIds.length !== 0) {
            const elementsResult = await timeout(
              fetchAndPutIds(logger, pageResult.filteredIds, scraper),
              10 * MINUTE
            );
            if (elementsResult) {
              entityIds.push(...elementsResult);
              existingIds = existingIds.concat(pageResult.filteredIds);
            }
          } else if (
            pageResult.ids.length === 0 ||
            (shouldBailOutOnNoNewIds && pageResult.nonVipAdsFound)
          ) {
            break;
          }
        }
        return {
          ids: entityIds,
          lastPage: page,
        };
      },
      {
        onSuccess: ({ ids, lastPage }) =>
          `${ids.length} ids fetched, with total pages used ${lastPage}`,
      }
    );
    entityIds = entityIds.concat(newEntityIds);
  }
  return entityIds;
};
