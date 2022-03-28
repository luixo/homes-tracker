import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import pointInPolygon from "@turf/boolean-point-in-polygon";
import {
  CommonEntityDescription,
  Currency,
  Service,
} from "./../service-helpers";

type ParsedEntity = {
  id: string;
  timestamp: number;
  areaSize: number;
  yardSize: number;
  rooms: number;
  bedrooms: number;
  price: number;
  address: string;
  currency: Currency;
  coordinates?: [number, number];
};
type ServiceRequest = {
  bedrooms?: number;
  minAreaSize?: number;
  maxPrice?: number;
};
type ServiceItem = {
  product_id: string;
  user_id: string;
  parent_id: string;
  makler_id: string;
  has_logo: string;
  makler_name: string;
  loc_id: string;
  street_address: string;
  yard_size: string;
  yard_size_type_id: string;
  submission_id: string;
  adtype_id: string;
  product_type_id: string;
  price: string;
  photo: string;
  photo_ver: string;
  photos_count: string;
  area_size_value: string;
  video_url: string;
  currency_id: string;
  order_date: string;
  price_type_id: string;
  vip: string;
  color: string;
  estate_type_id: string;
  area_size: string;
  area_size_type_id: string;
  comment: string | null;
  map_lat: string;
  map_lon: string;
  l_living: string;
  special_persons: string;
  rooms: string;
  bedrooms: string;
  floor: string;
  parking_id: string;
  canalization: string;
  water: string;
  road: string;
  electricity: string;
  owner_type_id: string;
  osm_id: string;
  name_json: string;
  pathway_json: string;
  homeselfie: string;
  seo_title_json: string;
  seo_name_json: string;
};

const buildParams = (
  request: ServiceRequest,
  page: number
): AxiosRequestConfig["params"] => {
  return {
    Keyword: "Tbilisi",
    AdTypeID: "3",
    PrTypeID: "2",
    cities: "1996871",
    GID: "1996871",
    FCurrencyID: "1",
    FPriceTo: request.maxPrice?.toString(),
    AreaSizeFrom: request.minAreaSize?.toString(),
    BedRoomNums: request.bedrooms?.toString(),
    Ajax: "1",
    Page: page.toString(),
  };
};

const mapResponseElementToResult = (element: ServiceItem): ParsedEntity => {
  return {
    id: element.product_id,
    areaSize: Number(element.area_size_value),
    yardSize: Number(element.yard_size),
    rooms: Number(element.rooms),
    bedrooms: Number(element.bedrooms),
    price: Number(element.price),
    address: JSON.parse(element.pathway_json).en,
    coordinates:
      element.map_lon && element.map_lat
        ? [Number(element.map_lon), Number(element.map_lat)]
        : undefined,
    timestamp: new Date(element.order_date).valueOf(),
    currency: element.currency_id === "1" ? "$" : "₾",
  };
};

const mapFullElementToEntity = (
  id: string,
  html: string
): Omit<CommonEntityDescription, "timestamp"> => {
  const fbTrackMatch = html.match(/var fbPixelData = (.*?);/);
  const fbTrackObject = fbTrackMatch ? JSON.parse(fbTrackMatch[1]) : 0;

  const trackingDataMatch = html.match(/var TrackingData = (.*?);/);
  const trackingDataObject = trackingDataMatch
    ? JSON.parse(trackingDataMatch[1])
    : 0;

  const yardSizeMatch = html.match(/Yard area: (\d+) m/);

  const addressMatch = html.match(/<span class="address">\s*(.*)\s*<\/span>/);

  const price = Number(fbTrackObject.preferred_price_range[0]);
  const currency = fbTrackObject.currency === "USD" ? "$" : "₾";
  const meters = Number(trackingDataObject.area_size);
  const yardSize = yardSizeMatch ? Number(yardSizeMatch[1]) : 0;
  const rooms = Number(trackingDataObject.rooms);
  const bedrooms = Number(trackingDataObject.bedrooms);
  const address = addressMatch ? addressMatch[1] : "unknown";
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

const getUrlById = (id: string): string => `https://www.myhome.ge/en/pr/${id}/`;

export const checker: Service<ParsedEntity, ServiceRequest> = {
  id: "myhome.ge",
  lastPagesAmount: 1,
  request: {
    bedrooms: 3,
    minAreaSize: 100,
    maxPrice: 3500,
  },
  fetchSinglePage: async (logger, request, page) => {
    const name = `Fetching myhome.ge page #${page}`;
    logger.info(`${name} started`);
    const response: AxiosResponse<{ Data: { Prs: ServiceItem[] } }> =
      await axios("https://www.myhome.ge/en/s/", {
        params: buildParams(request, page),
      });
    logger.info(`${name} succeed`);
    return response.data.Data.Prs.map(mapResponseElementToResult);
  },
  fetchCommonEntity: async (logger, id) => {
    const name = `Fetching myhome.ge id #${id}`;
    logger.info(`${name} started`);
    const response: AxiosResponse<string> = await axios(getUrlById(id));
    logger.info(`${name} succeed`);
    return mapFullElementToEntity(id, response.data);
  },
  filterByPolygon: (element, polygon) => {
    if (!element.coordinates) {
      return true;
    }
    return pointInPolygon(element.coordinates, polygon);
  },
  getCommonEntity: (result) => ({
    id: result.id,
    currency: result.currency,
    timestamp: result.timestamp,
    price: result.price,
    pricePerMeter: Math.ceil(result.price / result.areaSize),
    pricePerBedroom: Math.ceil(result.price / result.bedrooms),
    areaSize: result.areaSize,
    yardSize: result.yardSize,
    rooms: result.rooms,
    bedrooms: result.bedrooms,
    address: result.address,
    url: getUrlById(result.id),
  }),
};
