import type { NextApiRequest, NextApiResponse } from "next";
import winston from "winston";
import {
  EntitiesDatabase,
  Service,
  services,
  putEntitiesDatabase,
  mergeWithDb,
  getEntitiesDatabase,
  EntityWithService,
  BaseEntity,
} from "../../server/service-helpers";
import { globalLogger } from "../../server/logger";
import POLYGON from "../../server/scraped/polygon.json";
import { wait } from "../../server/utils";

const NO_DB_UPDATE = Boolean(process.env.NO_DB_UPDATE);

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const MAX_PAGES = Infinity;

const fetchAllData = async <T extends BaseEntity, R>(
  logger: winston.Logger,
  service: Service<T, R>
): Promise<T[]> => {
  let page = 1;
  let entities: T[] = [];
  while (page < MAX_PAGES) {
    const entitiesPage = await service.fetchSinglePage(
      logger,
      service.request,
      page
    );
    if (entitiesPage.length === 0) {
      return entities;
    }
    // We're not filthy scraperers, aren't we?
    await wait(250);
    entities.push(...entitiesPage);
    page++;
  }
  return entities;
};

const polygon = POLYGON as GeoJSON.MultiPolygon;

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const logger = globalLogger.child({ handler: req.url });
  if (NO_DB_UPDATE) {
    return res.status(403).send({
      success: "DB update is forbidden on this instance!",
    });
  }
  const shouldWipe = Boolean(req.query.wipe);
  const selectedServiceId = req.query.id;
  try {
    const servicesPlain = Object.values(services);
    const prevDatabase = await getEntitiesDatabase(logger);
    logger.info(`Fetch all data for ${servicesPlain.length} service - started`);
    const entitiesWithService: EntityWithService[] = (
      await Promise.all(
        servicesPlain.map(async (service) => {
          if (selectedServiceId && service.id !== selectedServiceId) {
            return;
          }
          const allEntities = await fetchAllData(logger, service);
          return {
            id: service.id,
            entities: allEntities.filter((entity) =>
              service.filterByPolygon(entity, polygon)
            ),
          };
        })
      )
    ).filter((x): x is EntityWithService => Boolean(x));
    logger.info(`Fetch all data for ${servicesPlain.length} service - succeed`);
    const nextDatabase = mergeWithDb(
      shouldWipe ? { services: {} } : prevDatabase,
      entitiesWithService
    );
    await putEntitiesDatabase(logger, nextDatabase);
    res.status(200).send({
      success: `DB now contains ${Object.values(nextDatabase.services).reduce(
        (acc, element) => acc + element.length,
        0
      )} elements`,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
