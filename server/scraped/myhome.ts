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
};

type MyHomeChecker = Checker<MyHomeResult>;

const getNewResults = (
  prevResult: MyHomeResult[],
  nextResult: MyHomeResult[]
): MyHomeResult[] => {
  const prevIds = prevResult.map(({ id }) => id);
  const nextIds = nextResult.map(({ id }) => id);
  const newIds = nextIds.filter((id) => !prevIds.includes(id));
  return newIds.map(
    (lookupId) => nextResult.find(({ id }) => id === lookupId)!
  );
};

const getMessages: MyHomeChecker["getMessages"] = (results) =>
  results.map((result) => {
    return `${result.bedrooms} / ${result.rooms} (area ${result.areaSize} / ${result.yardSize}) for ${result.price} at ${result.address} (${result.anotherAddress}): https://www.myhome.ge/en/pr/${result.id}/`;
  });

const checkFn: MyHomeChecker["checkFn"] = async () => {
  const result = await axios("https://www.myhome.ge/en/s/", {
    params: {
      Keyword: "Tbilisi",
      AdTypeID: "3",
      PrTypeID: "2",
      cities: "1996871",
      GID: "1996871",
      FCurrencyID: "1",
      FPriceTo: "3500",
      AreaSizeFrom: "100",
      BedRoomNums: "3",
      Ajax: "1",
    },
  });
  return result.data.Data.Prs.map((element: any) => ({
    id: element.product_id,
    areaSize: Number(element.area_size_value),
    yardSize: Number(element.yard_size),
    rooms: Number(element.rooms),
    bedrooms: Number(element.bedrooms),
    price: Number(element.price),
    address: element.street_address,
    anotherAddress: JSON.parse(element.pathway_json).en,
  }));
};

export const checker: Checker<MyHomeResult> = {
  id: "myhome.ge",
  checkFn,
  getNewResults,
  getMessages,
};
