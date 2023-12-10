import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Currency, RealtyType, ScrapedEntity, Scraper } from "../types/scraper";
import { withLogger } from "../utils/logging";

type CurrencyId =
  // USD
  | "1"
  // EURO
  | "2"
  // GEL
  | "3";

type Model = {
  product_id: string;
  user_id: string;
  parent_id: string | null;
  makler_id: string | null;
  has_logo: null | "1";
  makler_name: string | null;
  loc_id: string;
  street_address: string;
  yard_size: string; // int look-a-like
  yard_size_type_id: "0" | "1";
  // {"FOR_SALE":1,"FOR_BAIL":2,"FOR_RENT":3,"DAILY_RENT":7,"FOR_LEASE":8};
  adtype_id: "1" | "2" | "3" | "7" | "8";
  // {"FLAT":1,"HOUSE":2,"COMMERCIAL":4,"LAND":5,"HOTELS":7}
  product_type_id: "1" | "2" | "4" | "5" | "7";
  price: string; // int look-a-like
  photo: string; // "9/2/5/6/9"
  photo_ver: string; // int look-a-like
  photos_count: string; // int look-a-like
  area_size_value: string; // int look-a-like
  currency_id: CurrencyId;
  order_date: string; // date look-a-like
  price_type_id: "0";
  // {"20":"SUPER VIP","15":"VIP +","10":"VIP"}
  vip: "0" | "10" | "15" | "20";
  color: string;
  // 3 - older, 1 - newly, 14 - non agirucultural land, 18 - country house, 17 - house, 13 - land
  estate_type_id: "0" | "1" | "2" | "3" | "14" | "18" | "17" | "13";
  area_size: string; // float look-a-like
  area_size_type_id: "1" | "3"; // 3 - hectare, 1 - m^2
  comment: null | string;
  map_lat: string; // float look-a-like
  map_lon: string; // float look-a-like
  l_living: "0";
  special_persons: "0" | "1";
  rooms: string; // float look-a-like
  bedrooms: string; // int look-a-like
  floor: string; // int look-a-like
  parking_id: "0" | "1" | "2" | "3"; // 1 - garage, 2 - parking place
  canalization: "0" | "1"; // needed in land
  water: "0" | "1"; // needed in land
  road: "0" | "1"; // needed in land
  electricity: "0" | "1"; // needed in land
  // {"PRIVATE":1,"AGENCY":2,"DEVELOPER":3}
  owner_type_id: "1" | "2" | "3";
  osm_id: string;
  name_json: string;
  pathway_json: string;
  homeselfie: "0";
  Currencies: Record<
    CurrencyId,
    {
      currency_id: CurrencyId;
      currency_symbol: string;
      currency_rate: string; // int look-a-like
      title: string; // like GEL
    }
  >;
  name: string;
  pathway: string;
};

const buildParams = (page: number): AxiosRequestConfig["params"] => {
  return {
    Keyword: "Tbilisi",
    AdTypeID: "3",
    PrTypeID: "1.2",
    cities: "1",
    // Nothing above doesn't work on this old API :(
    Page: page + 1,
  };
};

const getRealtyType = (input: string): RealtyType => {
  switch (input) {
    case "1":
      return "apartment";
    case "2":
      return "house";
    case "4":
      return "commercial";
    case "5":
      return "land";
    case "7":
      return "hotel";
    default:
      return "unknown";
  }
};

const getModelCurrency = (currencyId: CurrencyId): Currency => {
  switch (currencyId) {
    case "1":
      return "$";
    case "3":
      return "₾";
    default:
      return "?";
  }
};

const mapModelToEntity = (model: Model): ScrapedEntity => {
  return {
    version: "v1",
    _id: `${ID}:${model.product_id}`,
    scraperId: ID,
    entityId: model.product_id,
    price: Number(model.price),
    currency: getModelCurrency(model.currency_id),
    areaSize: Number(model.area_size),
    yardAreaSize: Number(model.yard_size),
    realtyType: getRealtyType(model.product_type_id),
    rooms: Number(model.rooms),
    bedrooms: Number(model.bedrooms),
    location: {
      address: [model.street_address, model.name].join(" / "),
      district: null,
      subdistrict: null,
      coordinates: [Number(model.map_lat), Number(model.map_lon)],
    },
    postedTimestamp: new Date(model.order_date).valueOf(),
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
          const response: AxiosResponse<{
            Prs: { Prs: Model[] };
          }> = await axios("https://api.myhome.ge/en/products/", {
            method: "POST",
            data: buildParams(page),
          });
          const models = response.data.Prs.Prs;
          const results = models.map(mapModelToEntity);
          return {
            results: results,
            nonVipAdsFound: models.some((model) => model.vip === "0"),
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
