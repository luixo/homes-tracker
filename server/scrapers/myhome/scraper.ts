import transliterate from "@sindresorhus/transliterate";

import {
  Currency,
  RealtyType,
  ScrapedEntity,
  Scraper,
} from "../../types/scraper";
import { withLogger } from "../../utils/logging";
import { Model, CurrencyId } from "./types";

const getRealtyType = (input: Model["real_estate_type_id"]): RealtyType => {
  switch (input) {
    case 1:
      return "apartment";
    case 2:
      return "house";
    case 5:
      return "commercial";
    default:
      return "unknown";
  }
};

const getModelCurrency = (currencyId: CurrencyId): Currency => {
  switch (currencyId) {
    case 1:
      return "₾";
    case 2:
      return "$";
    case 3:
      return "€";
    default:
      return "?";
  }
};

const mapModelToEntity = (model: Model): ScrapedEntity => {
  return {
    version: "v1",
    _id: `${ID}:${model.id}`,
    scraperId: ID,
    entityId: model.id.toString(),
    price: model.price[2].price_total,
    currency: getModelCurrency(model.currency_id),
    areaSize: model.area,
    yardAreaSize: model.yard_area,
    realtyType: getRealtyType(model.real_estate_type_id),
    rooms: model.room === "10+" ? 10 : Number(model.room),
    bedrooms: model.bedroom === null ? 0 : Number(model.bedroom),
    location: {
      address: transliterate(model.address),
      district: model.district_name,
      subdistrict: model.urban_name,
      coordinates: [model.lat, model.lng],
    },
    images: model.images.slice(0, 10).map((image) => image.thumb),
    postedTimestamp: new Date(model.last_updated).valueOf(),
    scrapedTimestamp: Date.now(),
  };
};

const getUrl = (id: string): string => `https://www.myhome.ge/en/pr/${id}/`;
const ID = "myhome.ge";

export const scraper: Scraper<ScrapedEntity, null> = {
  id: ID,
  prepare: async () => null,
  pageFetchers: [
    (logger, _prepareResult, page) =>
      withLogger(
        logger,
        `Fetching ${ID} page #${page}`,
        async () => {
          const params = new URLSearchParams("");
          for (let [key, value] of Object.entries({
            deal_types: 2, // rent
            cities: 1, // Tbilisi
            real_estate_types: "1,2,3", // apartments, houses, country houses
            page,
          })) {
            params.set(key, value.toString());
          }
          const response = await fetch(
            `https://api-statements.tnet.ge/v1/statements?${params.toString()}`,
            {
              headers: {
                locale: "en",
                "x-website-key": "myhome",
              },
            }
          );
          const {
            data: { data: models },
          }: {
            result: boolean;
            data: {
              data: Model[];
            };
          } = await response.json();
          const results = models.map(mapModelToEntity);
          return {
            results: results,
            nonVipAdsFound: models.some(
              (model) =>
                !model.is_vip && !model.is_vip_plus && !model.is_super_vip
            ),
          };
        },
        {
          onSuccess: (response) =>
            `${response.results.length} elements fetched (${
              response.nonVipAdsFound ? "non-vips found" : "non-vips not found"
            })`,
        }
      ),
  ],
  getEntityId: (model) => model.entityId,
  fetchEntity: async (_logger, _prepareResult, result) => result,
  getUrl,
};
