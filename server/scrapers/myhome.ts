import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as nodeHtmlParser from "node-html-parser";
import { RealtyType, ScrapedEntity, Scraper } from "../types/scraper";
import { withLogger } from "../utils/logging";
import { DAY } from "../utils/time";

const buildParams = (page: number): AxiosRequestConfig["params"] => {
  return {
    Keyword: "Tbilisi",
    AdTypeID: "3",
    PrTypeID: "1.2",
    cities: "1996871",
    GID: "1996871",
    Ajax: "1",
    Page: (page + 1).toString(),
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

const mapFullElementToEntity = (id: string, html: string): ScrapedEntity => {
  const htmlDoc = nodeHtmlParser.parse(html);
  const scripts = htmlDoc.querySelectorAll("script");
  const fbTrackMatch = scripts
    .map((script) => script.innerText.match(/var fbPixelData = (.*?);/))
    .find((x): x is RegExpMatchArray => Boolean(x));
  const fbTrackObject = fbTrackMatch ? JSON.parse(fbTrackMatch[1]) : 0;

  const trackingDataMatch = scripts
    .map((script) => script.innerText.match(/var TrackingData = (.*?);/))
    .find((x): x is RegExpMatchArray => Boolean(x));
  const trackingDataObject = trackingDataMatch
    ? JSON.parse(trackingDataMatch[1])
    : 0;

  const dBlocks = htmlDoc.querySelectorAll(".amenities-ul .d-block");
  const yardSizeMatch = dBlocks.find((block) =>
    block.innerText.includes("Yard area")
  );

  const addressBlock = htmlDoc.querySelector("span.address");
  const mapFullElementToEntity = htmlDoc.querySelector("#map");

  const dateBlock = htmlDoc.querySelector(".date span");
  const price = Number(fbTrackObject.preferred_price_range[0]);
  const currency = fbTrackObject.currency === "USD" ? "$" : "₾";
  const realtyType = getRealtyType(trackingDataObject.prtype_id);
  const meters = Number(trackingDataObject.area_size);
  const yardSize = yardSizeMatch
    ? Number(yardSizeMatch.innerText.trim().split(": ")[1].split(" ")[0])
    : null;
  const rooms = Number(trackingDataObject.rooms);
  const bedrooms = Number(trackingDataObject.bedrooms);
  const address = addressBlock ? addressBlock.innerText.trim() : "unknown";
  const coordinates = mapFullElementToEntity
    ? [
        Number(mapFullElementToEntity.getAttribute("data-lng")),
        Number(mapFullElementToEntity.getAttribute("data-lat")),
      ]
    : null;

  let postedTimestamp = 0;
  if (dateBlock) {
    let now = new Date();
    let [date, time] = dateBlock.innerText.split(" ");
    if (date === "Today" || date === "Yesterday") {
      if (date === "Yesterday") {
        now = new Date(now.valueOf() - DAY);
      }
      date = now.toISOString().slice(0, 10);
    } else {
      date = new Date().getFullYear() + " " + date;
    }
    postedTimestamp = new Date([date, time].join("T")).valueOf();
  }

  return {
    version: "v1",
    _id: `${ID}:${id}`,
    scraperId: ID,
    entityId: id,
    price,
    currency: currency === "$" ? "$" : "₾",
    areaSize: meters,
    yardAreaSize: yardSize,
    realtyType,
    rooms,
    bedrooms,
    location: {
      address,
      district: null,
      subdistrict: null,
      coordinates,
    },
    postedTimestamp,
    scrapedTimestamp: Date.now(),
  };
};

const getUrl = (id: string): string => `https://www.myhome.ge/en/pr/${id}/`;
const ID = "myhome.ge";

export const scraper: Scraper = {
  id: ID,
  pageFetchers: [
    (logger, page) =>
      withLogger(
        logger,
        `Fetching ${ID} page #${page}`,
        async () => {
          const response: AxiosResponse<{
            Data: { Prs: { product_id: string; vip: string }[] };
          }> = await axios("https://www.myhome.ge/en/s/", {
            params: buildParams(page),
          });
          const ids = response.data.Data.Prs.map(
            (element) => element.product_id
          );
          const nonVipAdsFound = response.data.Data.Prs.some(
            (element) => element.vip === "0"
          );
          return {
            ids,
            nonVipAdsFound,
          };
        },
        {
          onSuccess: (response) =>
            `${response.ids.length} elements fetched (${
              response.nonVipAdsFound ? "non-vips found" : "non-vips not found"
            })`,
        }
      ),
  ],
  fetchEntity: async (logger, id) =>
    withLogger(logger, `Fetching ${ID} id #${id}`, async () => {
      const response: AxiosResponse<string> = await axios(getUrl(id));
      return mapFullElementToEntity(id, response.data);
    }),
  getUrl,
};
