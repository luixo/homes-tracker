import axios, { AxiosRequestConfig } from "axios";
import * as nodeHtmlParser from "node-html-parser";
import pointInPolygon from "@turf/boolean-point-in-polygon";
import {
  CommonEntityDescription,
  Currency,
  Service,
} from "./../service-helpers";

import streets from "./location-data/streets.json";
import subdistricts from "./location-data/subdistricts.json";

type ParsedEntity = {
  id: string;
  currency: Currency;
  areaSize: number;
  price: number;
  pricePerMeter?: number;
  address?: string;
  addressComponents?: {
    district: string;
    street: string;
  };
  timestamp: number;
};
type ServiceRequest = {
  bedrooms?: number;
  minAreaSize?: number;
  maxPrice?: number;
  priceType: "total" | "meter";
};

const clearNumbers = (input: string): number =>
  Number(
    input
      .split("")
      .map((char) => (/\d/.test(char) ? char : ""))
      .join("")
  );
const clearChars = (input: string): string =>
  input
    .split("")
    .map((char) => (/[\w. ]/.test(char) ? char : ""))
    .join("")
    .trim();

const buildParams = (
  request: ServiceRequest,
  page: number
): AxiosRequestConfig["params"] => {
  const params: AxiosRequestConfig["params"] = {
    MunicipalityId: "95",
    CityIdList: "95",
    "StatusField.FieldId": "34",
    "StatusField.Type": "SingleSelect",
    "StatusField.StandardField": "Status",
    QuantityFrom: request.minAreaSize?.toString(),
    PriceType: request.priceType === "total" ? "false" : "true",
    CurrencyId: "2",
    PriceTo: request.maxPrice?.toString(),
    "Sort.SortExpression": '"OrderDate"+DESC',
    Page: page,
  };
  if (request.bedrooms) {
    Object.assign(params, {
      "Fields[0].FieldId": "48",
      "Fields[0].StandardField": "None",
      "Fields[0].Type": "Number",
      "Fields[0].ValueFrom": request.bedrooms?.toString(),
      "Fields[0].ValueTo": "",
    });
  }
  return params;
};

const mapPreviewElementToResult = (
  element: nodeHtmlParser.HTMLElement
): ParsedEntity => {
  const id = element.getAttribute("data-id")!;
  const areaSizeBlock = element.querySelector(".latest_flat_km");
  const dollarPriceBlock = element.querySelector(".price-spot.dalla");
  const totalPriceBlock = dollarPriceBlock?.querySelector(
    ".latest_right .dalla .latest_price"
  );
  const meterPriceBlock = dollarPriceBlock?.querySelector(".latest_km_price");
  const addressBlock = element.querySelector(".StreeTaddressList");
  const addressLink = addressBlock?.querySelector("a")?.getAttribute("href");
  const addressMatch = addressLink?.match(/subdistr=(\d+).*stId=(\d+)/);
  const timestampBlock = element.querySelector(".add_time");
  return {
    id,
    areaSize: areaSizeBlock ? clearNumbers(areaSizeBlock.innerText) : 0,
    price: totalPriceBlock ? clearNumbers(totalPriceBlock.innerText) : 0,
    pricePerMeter: meterPriceBlock
      ? clearNumbers(meterPriceBlock.innerText.split("-")[1])
      : undefined,
    address: addressBlock ? clearChars(addressBlock.innerText) : undefined,
    addressComponents: addressMatch
      ? {
          district: addressMatch[1],
          street: addressMatch[2],
        }
      : undefined,
    timestamp: timestampBlock
      ? parseTimeBlock(timestampBlock.innerText.trim())
      : Date.now(),
    // Because we explicitely take dollar price in HTML
    currency: "$",
  };
};

const mapFullElementToEntity = (
  id: string,
  html: nodeHtmlParser.HTMLElement
): Omit<CommonEntityDescription, "timestamp"> => {
  const priceBlock = html.querySelector(".article_right_price");
  const currencyBlock = html.querySelector(".switch-label.switch_label_active");
  const areaSizeBlock = html.querySelector(".WholeFartBlock text");
  const yardSizeBlock = [...html.querySelectorAll(".ProjBotEach")]
    .map((x) => x.innerText)
    .find((x) => x.includes("yard"));
  const roomsOrBedroomsBlocks = [
    ...html.querySelectorAll(".RoomsParBlock"),
  ].map((x) => x.innerText);
  const roomsBlock = roomsOrBedroomsBlocks.find((x) => x.includes("Rooms"));
  const bedroomsBlock = roomsOrBedroomsBlocks.find((x) =>
    x.includes("Bedrooms")
  );
  const addressBlock = html.querySelector(".StreeTaddressList a");

  const price = priceBlock
    ? Number(priceBlock.innerText.trim().split(" ").join(""))
    : 0;
  const currency = currencyBlock
    ? currencyBlock.innerText === "$"
      ? "$"
      : "₾"
    : "?";
  const meters = areaSizeBlock
    ? clearNumbers(areaSizeBlock.innerText.split("m")[0]) ?? 0
    : 0;
  const yardSize = yardSizeBlock ? clearNumbers(yardSizeBlock) : 0;
  const rooms = roomsBlock ? clearNumbers(roomsBlock) : 0;
  const bedrooms = bedroomsBlock ? clearNumbers(bedroomsBlock) : 0;
  const address = addressBlock ? addressBlock.innerText.trim() : "unknown";
  const url = getUrlById(id);

  return {
    id,
    currency,
    price,
    pricePerMeter: Math.ceil(price / meters),
    pricePerBedroom: Math.ceil(price / bedrooms),
    areaSize: meters,
    yardSize,
    rooms,
    bedrooms,
    address,
    url,
  };
};

// Parses formatted as "25.03.2022 / 18:58"
const parseTimeBlock = (text: string): number => {
  const [date, time] = text.trim().split(" / ");
  return Date.parse(date.split(".").reverse().join("-") + "T" + time);
};

const getUrlById = (id: string) => `https://ss.ge/en/real-estate/${id}`;
const ID = "ss.ge";

export const checker: Service<ParsedEntity, ServiceRequest> = {
  id: ID,
  lastPagesAmount: 1,
  request: {
    bedrooms: 3,
    minAreaSize: 100,
    maxPrice: 3500,
    priceType: "total",
  },
  fetchSinglePage: async (logger, request, page) => {
    const name = `Fetching ${ID} page #${page}`;
    logger.info(`${name} started`);
    const response = await axios(
      "https://ss.ge/en/real-estate/l/Private-House/For-Rent",
      {
        params: buildParams(request, page),
      }
    );
    logger.info(`${name} succeed`);
    const data = response.data;
    return nodeHtmlParser
      .parse(data)
      .querySelectorAll(".latest_article_each")
      .map(mapPreviewElementToResult);
  },
  fetchCommonEntity: async (logger, id) => {
    const name = `Fetching ${ID} id #${id}`;
    logger.info(`${name} started`);
    const response = await axios(getUrlById(id));
    logger.info(`${name} succeed`);
    return mapFullElementToEntity(id, nodeHtmlParser.parse(response.data));
  },
  filterByPolygon: (element, polygon) => {
    const street = element.addressComponents?.street;
    if (!street) {
      return true;
    }
    const matchedStreet = streets.find(
      (lookupStreet) => lookupStreet.id === street
    );
    if (!matchedStreet) {
      const district = element.addressComponents?.district;
      if (district) {
        const subdistrictParent = subdistricts.find(
          (lookupDistrict) => lookupDistrict.id === Number(district)
        );
        if (subdistrictParent) {
          return Boolean(subdistrictParent.liveable);
        }
      }
      return true;
    }
    if (matchedStreet.coordinates) {
      return pointInPolygon(matchedStreet.coordinates, polygon);
    } else {
      const parentId = matchedStreet.parentId;
      const subdistrictParent = subdistricts.find(
        (lookupDistrict) => lookupDistrict.id === parentId
      );
      if (subdistrictParent) {
        return Boolean(subdistrictParent.liveable);
      }
      return true;
    }
  },
  getCommonEntity: (result) => ({
    id: result.id,
    currency: result.currency,
    timestamp: result.timestamp,
    price: result.price,
    pricePerMeter: result.pricePerMeter,
    areaSize: result.areaSize,
    address: result.address || "unknown",
    url: getUrlById(result.id),
  }),
};
