import winston from "winston";
import { TrackerRequest } from "../types/request";
import { Currency, ScrapedEntity, Scraper } from "../types/scraper";
import { sendToTelegram, TelegramError } from "./telegram";
import { scraper as myHomeScraper } from "../scrapers/myhome/scraper";
import { scraper as ssScraper } from "../scrapers/ss/scraper";
import { escapeMarkdown } from "../utils/markdown";

export const scrapers: Scraper<any, any>[] = [ssScraper, myHomeScraper];

const getUrlById = (scraperId: string, id: string): string => {
  const matchedScraper = scrapers.find((scraper) => scraper.id === scraperId);
  if (!matchedScraper) {
    return "unknown";
  }
  return matchedScraper.getUrl(id);
};

const formatterUsd = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatterEur = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatterGel = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "GEL",
  maximumFractionDigits: 0,
});

const formatPrice = (price: number, currency: Currency) => {
  switch (currency) {
    case "$":
      return formatterUsd.format(price);
    case "€":
      return formatterEur.format(price);
    case "₾":
      return formatterGel.format(price);
    default:
      return `${price} ???`;
  }
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
  const address = escapeMarkdown(
    [location.address, location.subdistrict, location.district]
      .filter(Boolean)
      .join(", ")
  );
  return [
    `[ID ${entityId}](${getUrlById(scraperId, entityId)})`,
    `💵 Цена: ${escapeMarkdown(formatPrice(price, currency))}`,
    `🏡 Площадь: ${areaSize}м2${
      yardAreaSize ? `+ двор ${yardAreaSize}м2` : ""
    }`,
    `🛏️ Комнат: ${rooms}, спален ${bedrooms}`,
    `📍 Адрес: ${
      location.coordinates
        ? `[${address}](https://yandex.ru/maps/?whatshere[point]=${[
            location.coordinates[1],
            location.coordinates[0],
          ].join(",")}&whatshere[zoom]=16)`
        : address
    }`,
  ].join("\n");
};

export const notifyRequest = async (
  logger: winston.Logger,
  request: TrackerRequest,
  message: string,
  images?: string[]
): Promise<TelegramError | undefined> => {
  for (const notifier of request.notifiers) {
    switch (notifier.type) {
      case "telegram":
        return sendToTelegram(logger, notifier.chatId, message, images);
    }
  }
};
