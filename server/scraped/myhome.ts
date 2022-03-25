import axios from "axios";
import { Checker } from "./../checkers";

type MyHomeResult = {
  id: string;
  areaSize: number;
  yardSize: number;
  rooms: number;
  bedrooms: number;
  price: number;
  address: string;
  anotherAddress: string;
}[];
type MyHomeRequest = {
  bedrooms?: number;
  minAreaSize?: number;
  maxPrice?: number;
  page?: number;
};
type MyHomeProduct = {
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
const getMyHomeResponse = async (
  request: MyHomeRequest
): Promise<MyHomeProduct[]> => {
  return (
    await axios("https://www.myhome.ge/en/s/", {
      params: {
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
        Page: (request.page || 1).toString(),
      },
    })
  ).data.Data.Prs;
};

export const checker: Checker<MyHomeResult> = {
  id: "myhome.ge",
  checkFn: async () => {
    const request: MyHomeRequest = {
      bedrooms: 3,
      minAreaSize: 100,
      maxPrice: 3500,
      page: 1,
    };
    const results = await Promise.all(
      new Array(3).fill(null).map((_, index) =>
        getMyHomeResponse({
          ...request,
          page: index + 1,
        })
      )
    );
    return results.reduce<MyHomeResult>((acc, page) => {
      const mapped: MyHomeResult = page.map((element) => ({
        id: element.product_id,
        areaSize: Number(element.area_size_value),
        yardSize: Number(element.yard_size),
        rooms: Number(element.rooms),
        bedrooms: Number(element.bedrooms),
        price: Number(element.price),
        address: element.street_address,
        anotherAddress: JSON.parse(element.pathway_json).en,
      }));
      return acc.concat(mapped);
    }, []);
  },
  getNewResults: (prevResult, nextResult) => {
    const prevIds = prevResult.map(({ id }) => id);
    const nextIds = nextResult.map(({ id }) => id);
    const newIds = nextIds.filter((id) => !prevIds.includes(id));
    return newIds.map(
      (lookupId) => nextResult.find(({ id }) => id === lookupId)!
    );
  },
  getMessages: (results) =>
    results.map((result) => {
      return {
        description: `${result.bedrooms} / ${result.rooms} (area ${result.areaSize} / ${result.yardSize}) for ${result.price} at ${result.address} (${result.anotherAddress})`,
        url: `https://www.myhome.ge/en/pr/${result.id}/`,
      };
    }),
  isEmpty: (results) => results.length === 0,
};
