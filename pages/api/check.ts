import type { NextApiRequest, NextApiResponse } from "next";
import winston from "winston";
import { isDeepStrictEqual } from "util";
import {
  services,
  getEntitiesDatabase,
  putEntitiesDatabase,
  Service,
  CommonEntityDescription,
  mergeWithDb,
  BaseEntity,
} from "../../server/service-helpers";
import POLYGON from "../../server/scraped/polygon.json";
import { sendToTelegram } from "../../server/services/telegram";
import { globalLogger } from "../../server/logger";

const NO_UPDATE = Boolean(process.env.NO_UPDATE);

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const fetchLastPages = async <T extends BaseEntity, R>(
  logger: winston.Logger,
  service: Service<T, R>
): Promise<T[]> => {
  const entities = await Promise.all(
    new Array(service.lastPagesAmount)
      .fill(null)
      .map((_, index) =>
        service.fetchSinglePage(logger, service.request, index + 1)
      )
  );
  return entities.reduce<T[]>((acc, page) => [...acc, ...page], []);
};

const formatMessage = (entity: CommonEntityDescription): string => {
  const prices = [
    `${entity.price}$`,
    entity.pricePerBedroom ? `${entity.pricePerBedroom}$/🛏️` : undefined,
    entity.pricePerMeter ? `${entity.pricePerMeter}$/m2` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const areas = [
    `${entity.areaSize}m2`,
    entity.yardSize ? `+ 🌲 ${entity.pricePerBedroom}m2` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const rooms = [
    entity.rooms ? `${entity.rooms}🚪` : undefined,
    entity.bedrooms ? `${entity.bedrooms}🛏️` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  return [
    [prices, areas, rooms].filter(Boolean).join("; "),
    `> ${entity.address}`,
    entity.url,
  ].join("\n");
};

const sendEntitiesToTelegram = async (
  logger: winston.Logger,
  entitiesGroups: CommonEntityDescription[][]
): Promise<boolean> => {
  const notificationMessage = entitiesGroups
    .map((group) => group.map(formatMessage).join("\n\n"))
    .filter(Boolean)
    .join("\n\n");
  if (notificationMessage.length !== 0) {
    await sendToTelegram(logger, notificationMessage);
    return true;
  } else {
    logger.info("No updates to send to telegram");
    return false;
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const logger = globalLogger.child({ handler: req.url });
  try {
    const servicesPlain = Object.values(services);
    const prevDatabase = await getEntitiesDatabase(logger);
    logger.info(`Fetch ${servicesPlain.length} services - started`);
    const polygon = POLYGON as GeoJSON.MultiPolygon;
    const nextEntitiesData = await Promise.all(
      servicesPlain.map(async (service) => {
        const id = service.id;
        const nextEntities = await fetchLastPages(logger, service);
        const prevEntitiesIds = prevDatabase.services[id].map(({ id }) => id);
        const newEntities = nextEntities.filter((entity) => {
          if (prevEntitiesIds.includes(entity.id)) {
            return false;
          }
          return service.filterByPolygon(entity, polygon);
        });
        return {
          id,
          entities: newEntities.map(service.getCommonEntity),
        };
      })
    );
    logger.info(`Fetch ${servicesPlain.length} services - succeed`);

    const nextDatabase = mergeWithDb(prevDatabase, nextEntitiesData);

    if (!NO_UPDATE && !isDeepStrictEqual(prevDatabase, nextDatabase)) {
      await putEntitiesDatabase(logger, nextDatabase);
    }
    const updateHappened = await sendEntitiesToTelegram(
      logger,
      nextEntitiesData.map((nextEntitiesDatum) => nextEntitiesDatum.entities)
    );

    res.status(200).send({
      success: updateHappened
        ? "Successfully updated data"
        : "Nothing to update",
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
