import winston from "winston";

import { checker as myHomeService } from "./scraped/myhome";
import { checker as ssService } from "./scraped/ss";
import { getS3Key, putS3Key } from "./services/s3";

export type BaseEntity = {
  id: string;
  timestamp: number;
};

export type Currency = "$" | "₾" | "?";

export type CommonEntityDescription = BaseEntity & {
  price: number;
  currency: Currency;
  pricePerMeter?: number;
  pricePerBedroom?: number;
  areaSize: number;
  yardSize?: number;
  rooms?: number;
  bedrooms?: number;
  address: string;
  url: string;
};

export type Service<T extends BaseEntity, R> = {
  id: string;
  fetchSinglePage: (
    logger: winston.Logger,
    request: R,
    page: number
  ) => Promise<T[]>;
  fetchCommonEntity: (
    logger: winston.Logger,
    id: string
  ) => Promise<Omit<CommonEntityDescription, "timestamp"> | undefined>;
  lastPagesAmount: number;
  request: R;
  filterByPolygon: (entity: T, polygon: GeoJSON.MultiPolygon) => boolean;
  getCommonEntity: (entity: T) => CommonEntityDescription;
};

export type DatabaseEntityElement = {
  id: string;
  timestamp: number;
};

export type EntitiesDatabase = {
  services: Record<string, DatabaseEntityElement[]>;
};

export type EntityWithService<T extends BaseEntity = BaseEntity> = {
  id: string;
  entities: T[];
};

export const ENTITY_DB_PREFIX = "entity-db/";
export const ENTITY_DB_PATH = ENTITY_DB_PREFIX + "db";

export const services: Record<string, Service<BaseEntity, unknown>> = [
  myHomeService,
  ssService,
].reduce<Record<string, Service<BaseEntity, unknown>>>((acc, service) => {
  acc[service.id] = service as unknown as Service<BaseEntity, unknown>;
  return acc;
}, {});

export const getEntitiesDatabase = async (
  logger: winston.Logger
): Promise<EntitiesDatabase> => {
  let database: EntitiesDatabase = { services: {} };
  try {
    database =
      (await getS3Key<EntitiesDatabase>(logger, ENTITY_DB_PATH)) || database;
  } catch (e) {
    if (!String(e).includes("NoSuchKey")) {
      throw e;
    }
  }
  return database;
};
export const putEntitiesDatabase = async (
  logger: winston.Logger,
  nextDb: EntitiesDatabase
): Promise<void> => {
  await putS3Key<EntitiesDatabase>(logger, ENTITY_DB_PATH, nextDb);
};

export const sortEntities = (
  entities: DatabaseEntityElement[]
): DatabaseEntityElement[] => {
  return entities.sort((a, b) => b.timestamp - a.timestamp);
};

export const mergeWithDb = <T extends BaseEntity>(
  db: EntitiesDatabase,
  services: EntityWithService<T>[]
): EntitiesDatabase => {
  return services.reduce<EntitiesDatabase>((db, service) => {
    const entitiesIds = service.entities.map(({ id }) => id);
    db.services[service.id] = [
      ...(db.services[service.id] || []).filter(
        (prevEntitity) => !entitiesIds.includes(prevEntitity.id)
      ),
      ...service.entities.map((entity) => ({
        id: entity.id,
        timestamp: entity.timestamp,
      })),
    ];
    return db;
  }, JSON.parse(JSON.stringify(db)));
};
