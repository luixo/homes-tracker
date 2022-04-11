import winston from "winston";
import { TrackerRequest } from "../types/request";
import { ScrapedEntity, Scraper } from "../types/scraper";
import { sendToTelegram } from "./telegram";
import { scraper as myHomeScraper } from "../scrapers/myhome";
import { scraper as ssScraper } from "../scrapers/ss";

export const scrapers: Scraper[] = [myHomeScraper, ssScraper];

const getUrlById = (scraperId: string, id: string): string => {
  const matchedScraper = scrapers.find((scraper) => scraper.id === scraperId);
  if (!matchedScraper) {
    return "unknown";
  }
  return matchedScraper.getUrl(id);
};

export const formatScrapedEntity = (entity: ScrapedEntity): string => {
  const {
    price,
    currency,
    areaSize,
    yardAreaSize,
    rooms,
    bedrooms,
    location,
    entityId,
    scraperId,
  } = entity;
  const prices = [
    `${price}${currency}`,
    `${Math.ceil(price / bedrooms)}$/🛏️`,
    `${Math.ceil(price / areaSize)}$/m2`,
  ]
    .filter(Boolean)
    .join(", ");
  const areas = [
    `${areaSize}m2`,
    yardAreaSize ? `+ 🌲 ${yardAreaSize}m2` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const roomsAndBedrooms = [`${rooms}🚪`, `${bedrooms}🛏️`]
    .filter(Boolean)
    .join(", ");
  return [
    [prices, areas, roomsAndBedrooms].filter(Boolean).join("; "),
    `> ${[location.address, location.subdistrict, location.district]
      .filter(Boolean)
      .join(", ")}`,
    getUrlById(scraperId, entityId),
  ].join("\n");
};

export const notifyRequest = async (
  logger: winston.Logger,
  message: string,
  request: TrackerRequest
): Promise<void> => {
  for (const notifier of request.notifiers) {
    switch (notifier.type) {
      case "telegram":
        await sendToTelegram(logger, notifier.chatId, message);
    }
  }
};
