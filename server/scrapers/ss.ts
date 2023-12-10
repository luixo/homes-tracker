import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import winston from "winston";

import { ScrapedEntity, Scraper } from "../types/scraper";
import { withLogger } from "../utils/logging";
import { nonNullishGuard } from "../utils";

type RealStateItemModel = {
  applicationId: number;
  status: 0; // ??
  address: {
    municipalityId: null;
    municipalityTitle: null;
    cityId: number;
    cityTitle: string;
    districtId: number;
    districtTitle: string;
    subdistrictId: number;
    subdistrictTitle: string;
    streetId: number;
    streetTitle: string;
    streetNumber: string | null;
  };
  price: {
    priceGeo: number | null;
    unitPriceGeo: number | null;
    priceUsd: number | null;
    unitPriceUsd: number | null;
    currencyType: number;
  };
  appImages: {
    fileName: string;
    isMain: boolean;
    is360: boolean;
    orderNo: number | null;
    imageType: number;
  }[];
  imageCount: number;
  title: string;
  shortTitle: string;
  description: string | null;
  totalArea: number;
  totalAmountOfFloor: number | null;
  floorNumber: string;
  numberOfBedrooms: number;
  type: 4 | 5 | 6; // ??
  dealType: 1; // ??
  isMovedUp: boolean;
  isHighlighted: boolean;
  isUrgent: boolean;
  vipStatus: 0 | 2 | 3; // ??
  hasRemoteViewing: boolean;
  videoLink: null;
  commercialRealEstateType: 0 | 31; // ??
  orderDate: string;
  createDate: string;
  userId: string;
  isFavorite: boolean;
  isForUkraine: boolean;
  isHidden: boolean;
  isUserHidden: boolean;
  isConfirmed: boolean;
  detailUrl: string;
  homeId: null;
  userInfo: null | {
    name: string;
    image: string;
    userType: 2;
  };
  similarityGroup: null;
};

const buildParams = (
  realEstateType: number,
  page: number
): AxiosRequestConfig["params"] => {
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

const mapModalToEntity = (model: RealStateItemModel): ScrapedEntity | null => {
  if (!model.price.priceGeo || !model.price.priceUsd) {
    return null;
  }
  return {
    version: "v1",
    _id: `${ID}:${model.applicationId}`,
    entityId: model.applicationId.toString(),
    scraperId: ID,
    postedTimestamp: new Date(model.createDate).valueOf(),
    scrapedTimestamp: Date.now(),
    price:
      model.price.currencyType === 1
        ? model.price.priceGeo
        : model.price.priceUsd,
    currency: model.price.currencyType === 1 ? "₾" : "$",
    realtyType:
      model.type === 4
        ? "house"
        : model.type === 5
        ? "apartment"
        : model.type === 6
        ? "commercial"
        : "unknown",
    areaSize: model.totalArea,
    yardAreaSize: null,
    rooms: model.numberOfBedrooms,
    bedrooms: model.numberOfBedrooms,
    location: {
      address: `${model.address.streetTitle}${
        model.address.streetNumber === null
          ? ""
          : ` ${model.address.streetNumber}`
      }`,
      district: model.address.districtTitle,
      subdistrict: model.address.subdistrictTitle,
      coordinates: null,
    },
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
      const response = await axios("https://home.ss.ge/ka/udzravi-qoneba");
      return { token: extractToken(response.headers["set-cookie"]) };
    },
    {
      onSuccess: () => `Token was fetched from ss.ge`,
    }
  );
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
        const response: AxiosResponse<{
          realStateItemModel: RealStateItemModel[];
        }> = await axios(
          `https://api-gateway.ss.ge/v1/RealEstate/LegendSearch`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${prepareResult.token}`,
              "content-type": "application/json",
            },
            data: buildParams(realEstateType, page),
          }
        );
        const data = response.data.realStateItemModel
          .map(mapModalToEntity)
          .filter(nonNullishGuard);
        return {
          results: data,
          nonVipAdsFound: true,
        };
      },
      {
        onSuccess: (response) => `${response.results.length} elements fetched`,
      }
    );
  };

export const scraper: Scraper<ScrapedEntity, PrepareResult> = {
  id: ID,
  prepare,
  pageFetchers: [fetchPageByType("house"), fetchPageByType("flat")],
  getEntityId: (result) => result.entityId,
  fetchEntity: async (_logger, _prepareResult, entity) => entity,
  getUrl,
};
