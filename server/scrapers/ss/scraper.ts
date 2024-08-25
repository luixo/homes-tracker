import winston from "winston";

import { ScrapedEntity, Scraper } from "../../types/scraper";
import { withLogger } from "../../utils/logging";
import transliterate from "@sindresorhus/transliterate";
import { PageModel } from "./page-types";
import { Model } from "./types";

const buildParams = (realEstateType: number, page: number) => {
  return {
    cityIdList: [95],
    currencyId: 1,
    page: page + 1,
    pageSize: 20,
    realEstateDealType: 1,
    order: 1, // Order by date desc.
    realEstateType,
  };
};

const mapModalToEntity = (model: Model): ScrapedEntity | null => {
  if (!model.price.priceGeo || !model.price.priceUsd) {
    return null;
  }
  return {
    version: "v1",
    _id: `${ID}:${model.applicationId}`,
    entityId: model.applicationId.toString(),
    scraperId: ID,
    postedTimestamp: new Date(model.orderDate).valueOf(),
    scrapedTimestamp: Date.now(),
    price:
      model.price.currencyType === 1
        ? model.price.priceGeo
        : model.price.priceUsd,
    currency: model.price.currencyType === 1 ? "₾" : "$",
    realtyType:
      model.realEstateTypeId === 4
        ? "house"
        : model.realEstateTypeId === 5
        ? "apartment"
        : model.realEstateTypeId === 6
        ? "commercial"
        : "unknown",
    areaSize: model.areaOfHouse
      ? Number(model.areaOfHouse)
      : Number(model.totalArea),
    yardAreaSize: model.areaOfYard ? Number(model.areaOfYard) : null,
    rooms: model.rooms ? Number(model.rooms) : 0,
    bedrooms: model.bedrooms,
    location: {
      address: transliterate(
        `${model.address.streetTitle}${
          model.address.streetNumber === null
            ? ""
            : ` ${model.address.streetNumber}`
        }`
      ),
      district: model.address.districtTitle,
      subdistrict: model.address.subdistrictTitle,
      coordinates: [model.locationLatitude, model.locationLongitude],
    },
    images: model.appImages
      .sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0))
      .slice(0, 10)
      .map((image) => image.fileNameThumb),
  };
};

type PrepareResult = { token: string };

const getUrl = (id: string) => `https://home.ss.ge/en/real-estate/${id}`;
const ID = "ss.ge";

const COOKIE_KEY = "ss-session-token";

const extractToken = (cookie?: string | string[]) => {
  //ss-session-token
  if (cookie === undefined) {
    throw new Error("Expected to have cookie!");
  }
  const getCookieFromString = (str: string) => {
    const keyPart = str.split(";").map((s) => s.trim())[0];
    if (!keyPart.startsWith(`${COOKIE_KEY}=`)) {
      throw new Error(`Expected to have ${COOKIE_KEY} cookie key!`);
    }
    return keyPart.replace(`${COOKIE_KEY}=`, "");
  };
  if (typeof cookie === "string") {
    return getCookieFromString(cookie);
  }
  const matchedCookie = cookie.find((element) => element.includes(COOKIE_KEY));
  if (!matchedCookie) {
    throw new Error(`Expected to have cookie with key ${COOKIE_KEY}!`);
  }
  return getCookieFromString(matchedCookie);
};

const prepare = (logger: winston.Logger) => {
  return withLogger(
    logger,
    `Fetching ${ID} cookie token`,
    async () => {
      const response = await fetch("https://home.ss.ge/ka/udzravi-qoneba");
      return {
        token: extractToken(response.headers.get("set-cookie") ?? undefined),
      };
    },
    {
      onSuccess: () => `Token was fetched from ss.ge`,
    }
  );
};

const fetchEntity = (
  logger: winston.Logger,
  prepareResult: PrepareResult,
  entityId: number
) => {
  return withLogger(logger, `Fetching ${ID} element #${entityId}`, async () => {
    const response = await fetch(
      `https://api-gateway.ss.ge/v1/RealEstate/details?applicationId=${entityId}}`,
      {
        method: "PUT",
        headers: {
          "accept-language": "en",
          authorization: `Bearer ${prepareResult.token}`,
          "content-type": "application/json",
        },
      }
    );
    const data: Model = await response.json();
    return mapModalToEntity(data);
  });
};

const fetchPageByType =
  (type: "house" | "flat") =>
  async (
    logger: winston.Logger,
    prepareResult: PrepareResult,
    page: number
  ) => {
    return withLogger(
      logger,
      `Fetching ${ID} page #${page} of type ${type}`,
      async () => {
        const realEstateType = type === "house" ? 4 : 5;
        //
        const response = await fetch(
          `https://api-gateway.ss.ge/v1/RealEstate/LegendSearch`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${prepareResult.token}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(buildParams(realEstateType, page)),
          }
        );
        const data: { realStateItemModel: PageModel[] } = await response.json();
        const results = data.realStateItemModel
          .filter((model) => model.price.priceGeo && model.price.priceUsd)
          .map((model) => model.applicationId);
        return {
          results,
          nonVipAdsFound: data.realStateItemModel.some(
            (model) => model.vipStatus === 0
          ),
        };
      },
      {
        onSuccess: (response) =>
          `${response.results.length} elements fetched (${
            response.nonVipAdsFound ? "non-vips found" : "non-vips not found"
          })`,
      }
    );
  };

export const scraper: Scraper<number, PrepareResult> = {
  id: ID,
  prepare,
  pageFetchers: [fetchPageByType("house"), fetchPageByType("flat")],
  getEntityId: (entityId) => entityId.toString(),
  fetchEntity,
  getUrl,
};
