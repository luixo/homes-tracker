import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import winston from "winston";
import * as nodeHtmlParser from "node-html-parser";

import streets from "./location-data/streets.json";
import subdistricts from "./location-data/subdistricts.json";
import districts from "./location-data/districts.json";
import { Currency, RealtyType, ScrapedEntity, Scraper } from "../types/scraper";
import { withLogger } from "../utils/logging";

const clearNumbers = (input: string): number =>
  Number(
    input
      .split("")
      .map((char) => (/\d/.test(char) ? char : ""))
      .join("")
  );

const buildParams = (page: number): AxiosRequestConfig["params"] => {
  return {
    MunicipalityId: "95",
    CityIdList: "95",
    "StatusField.FieldId": "34",
    "StatusField.Type": "SingleSelect",
    "StatusField.StandardField": "Status",
    PriceType: false,
    CurrencyId: "2",
    "Sort.SortExpression": '"OrderDate"+DESC',
    Page: page + 1,
  };
};

const mapFullElementToEntity = (id: string, rawHtml: string): ScrapedEntity => {
  const html = nodeHtmlParser.parse(rawHtml);
  const scripts = html
    .querySelectorAll("script")
    .map((script) => script.innerText);

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
  const navList = html.querySelector(".detailed_page_navlist ul")!;
  const rentTypeNavItem = navList.querySelector("li:nth-child(2)");
  const lastNavItem = navList.querySelector("li:last-child a");
  const timestampBlock = html.querySelector(".add_date_block");

  const meters = areaSizeBlock
    ? clearNumbers(areaSizeBlock.innerText.split("m")[0]) ?? 0
    : 0;
  const yardSize = yardSizeBlock
    ? clearNumbers(yardSizeBlock.split("m")[0])
    : null;
  const rooms = roomsBlock ? clearNumbers(roomsBlock) : 0;
  const bedrooms = bedroomsBlock ? clearNumbers(bedroomsBlock) : 0;

  let realtyType: RealtyType = "unknown";
  if (rentTypeNavItem) {
    const trimmedType = rentTypeNavItem.innerText.trim();
    if (trimmedType === "Flat") {
      realtyType = "apartment";
    }
    if (trimmedType === "Private House") {
      realtyType = "house";
    }
  }

  const priceScript = scripts.find((script) =>
    script.includes("sourceCurrencyId")
  );

  let price = 0;
  let currency: Currency = "?";
  if (priceScript) {
    const currencyMatch = priceScript.match(
      /var sourceCurrencyId = (\d+);/
    )?.[1];
    const priceMatch = priceScript.match(/var price = (\d+);/)?.[1];
    if (currencyMatch && priceMatch) {
      if (currencyMatch === "1") {
        currency = "₾";
      }
      if (currencyMatch === "2") {
        currency = "$";
      }
      price = Number(priceMatch);
    }
  }

  const elementLocationQuery = lastNavItem
    ? lastNavItem
        .getAttribute("href")!
        .split("?")[1]
        .split("&")
        .map((element) => {
          const [key, value] = element.split("=");
          return { key, value };
        })
    : undefined;
  const streetId = elementLocationQuery?.find(
    (element) => element.key === "stId"
  )?.value;
  const subdistrictId = elementLocationQuery?.find(
    (element) => element.key === "subdistr"
  )?.value;
  const subdistrictObject = subdistricts.find(
    (subdistrict) => subdistrict.id.toString() === subdistrictId
  );
  const districtObject = districts.find(
    (district) =>
      district.id.toString() === subdistrictObject?.parentId.toString()
  );
  const streetObject = streets.find(
    (street) => street.id.toString() === streetId
  );

  let postedTimestamp = 0;
  if (timestampBlock) {
    const [date, time] = timestampBlock.innerText.trim().split(" / ");
    const posted = new Date(
      date.split(".").reverse().join("-") + "T" + time
    ).valueOf();
    if (!isNaN(posted)) {
      postedTimestamp = posted;
    }
  }

  return {
    version: "v1",
    _id: `${ID}:${id}`,
    entityId: id,
    scraperId: ID,
    price,
    currency,
    realtyType,
    areaSize: meters,
    yardAreaSize: yardSize,
    rooms,
    bedrooms,
    location: {
      address: streetObject?.title.trim() ?? "unknown",
      district: districtObject?.title.trim() ?? null,
      subdistrict: subdistrictObject?.title.trim() ?? null,
      coordinates: null,
    },
    postedTimestamp,
    scrapedTimestamp: Date.now(),
  };
};

const getUrl = (id: string) => `https://ss.ge/en/real-estate/${id}`;
const ID = "ss.ge";

const fetchPageByType =
  (type: "house" | "flat") => async (logger: winston.Logger, page: number) => {
    return withLogger(
      logger,
      `Fetching ${ID} page #${page} of type ${type}`,
      async () => {
        const typePart = type === "house" ? "Private-House" : "Flat";
        const response = await axios(
          `https://ss.ge/en/real-estate/l/${typePart}/For-Rent`,
          {
            params: buildParams(page),
          }
        );
        const data = response.data;
        return {
          ids: nodeHtmlParser
            .parse(data)
            .querySelectorAll(".latest_article_each")
            .map((element) => {
              return element.getAttribute("data-id")!;
            }),
          nonVipAdsFound: true,
        };
      },
      {
        onSuccess: (response) => `${response.ids.length} elements fetched`,
      }
    );
  };

export const scraper: Scraper = {
  id: ID,
  pageFetchers: [fetchPageByType("house"), fetchPageByType("flat")],
  fetchEntity: async (logger, id) =>
    withLogger(logger, `Fetching ${ID} id #${id}`, async () => {
      const response: AxiosResponse<string> = await axios(getUrl(id));
      return mapFullElementToEntity(id, response.data);
    }),
  getUrl,
};
