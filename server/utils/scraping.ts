import winston from "winston";
import { Scraper } from "../types/scraper";
import { getStopSignal, timeout, wait } from "../utils";
import { putEntity, removeEntity } from "../utils/db/entities";
import { withLogger } from "./logging";
import { MINUTE, SECOND } from "./time";

const fetchAndPutIds = async <T, P>(
  logger: winston.Logger,
  results: T[],
  prepareResult: P,
  scraper: Scraper<T, P>
): Promise<string[]> => {
  let entityIds: string[] = [];
  for (const result of results) {
    const entity = await scraper.fetchEntity(logger, prepareResult, result);
    // We're not filthy scraperers, aren't we?
    let promises: Promise<unknown>[] = [];
    if (entity) {
      promises.push(putEntity(logger, entity));
      entityIds.push(entity._id);
    } else {
      promises.push(removeEntity(logger, scraper.getEntityId(result)));
    }
    await Promise.all(promises);
  }
  return entityIds;
};

const maxPagesRaw = Number(process.env.MAX_PAGES);
const MAX_PAGES = Number.isNaN(maxPagesRaw) ? Infinity : maxPagesRaw;

export const scrapeEntities = async <T, P>(
  logger: winston.Logger,
  scraper: Scraper<T, P>,
  existingIds: string[],
  shouldBailOutOnNoNewIds: boolean
): Promise<string[]> => {
  const prepareResult = await withLogger(
    logger.child({ scraper: `${scraper.id}` }),
    `Scraping preparation`,
    scraper.prepare
  );
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

          // We're not filthy scraperers, aren't we?
          await wait(250);
          const pageResult = await withLogger(
            logger,
            `Fetch page #${page}`,
            async () => {
              const pageResult = await timeout(
                fetcher(logger, prepareResult, page),
                5 * SECOND
              );
              if (!pageResult) {
                return null;
              }
              return {
                results: pageResult.results,
                nonVipAdsFound: pageResult.nonVipAdsFound,
                filteredResults: pageResult.results.filter(
                  (result) => !existingIds.includes(scraper.getEntityId(result))
                ),
              };
            },
            {
              onSuccess: (response) =>
                response
                  ? `${response.filteredResults.length} new ids found${
                      response.filteredResults.length
                        ? ` : ${response.filteredResults
                            .map(scraper.getEntityId)
                            .join(", ")}`
                        : ""
                    }`
                  : undefined,
            }
          );

          if (!pageResult) {
            continue;
          }
          if (pageResult.filteredResults.length !== 0) {
            const elementsResult = await timeout(
              fetchAndPutIds(
                logger,
                pageResult.filteredResults,
                prepareResult,
                scraper
              ),
              10 * MINUTE
            );
            if (elementsResult) {
              entityIds.push(...elementsResult);
              existingIds = existingIds.concat(
                pageResult.filteredResults.map(scraper.getEntityId)
              );
            }
          } else if (
            pageResult.results.length === 0 ||
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
