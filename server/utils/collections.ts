import { Collection, Document } from "mongodb";
import winston from "winston";
import { withMongo } from "../services/mongodb";
import {
  TrackerRequest,
  RequestChatLink,
  RequestMatch,
} from "../types/request";
import { ScrapedEntity } from "../types/scraper";
import { withLogger } from "./logging";

const withCollection =
  <C extends Document>(collectionName: string) =>
  async <T>(
    logger: winston.Logger,
    action: string,
    run: (collection: Collection<C>, logger: winston.Logger) => Promise<T>
  ): Promise<T> => {
    return withLogger(
      logger.child({ service: "mongodb", collection: collectionName }),
      action,
      (logger) =>
        withMongo((db) => run(db.collection<C>(collectionName), logger))
    );
  };

export const withEntities = withCollection<ScrapedEntity>("entities");
export const withTrackerRequests = withCollection<TrackerRequest>("requests");
export const withChatRequestLinks =
  withCollection<RequestChatLink>("request-links");
// export const withRequestMatches =
//   withCollection<RequestMatch>("request-matches");
