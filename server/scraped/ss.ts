import axios from "axios";
import * as nodeHtmlParser from "node-html-parser";
import { Checker } from "./../checkers";

type SsResult = {
  id: string;
  areaSize?: number;
  price?: number;
  pricePerMeter?: number;
  address?: string;
}[];
type SsRequest = {
  bedrooms?: number;
  minAreaSize?: number;
  maxPrice?: number;
  page?: number;
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

const getSsResponse = async (request: SsRequest): Promise<SsResult> => {
  const params = {
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
  const response = await axios(
    "https://ss.ge/en/real-estate/l/Private-House/For-Rent",
    {
      params,
    }
  );
  const data = response.data;
  const parsedHtml = nodeHtmlParser.parse(data);
  const elements = parsedHtml.querySelectorAll(".latest_article_each");

  return elements.map((element) => {
    const id = element.getAttribute("data-id")!;
    const areaSizeBlock = element.querySelector(".latest_flat_km");
    const dollarPriceBlock = element.querySelector(".price-spot.dalla");
    const totalPriceBlock = dollarPriceBlock?.querySelector(".latest_price");
    const meterPriceBlock = dollarPriceBlock?.querySelector(".latest_km_price");
    const addressBlock = element.querySelector(".StreeTaddressList");
    return {
      id,
      areaSize: areaSizeBlock
        ? clearNumbers(areaSizeBlock.innerText)
        : undefined,
      price: totalPriceBlock
        ? clearNumbers(totalPriceBlock.innerText)
        : undefined,
      pricePerMeter: meterPriceBlock
        ? clearNumbers(meterPriceBlock.innerText.split("-")[1])
        : undefined,
      address: addressBlock ? clearChars(addressBlock.innerText) : undefined,
    };
  });
};

const PAGES_TO_FETCH = 1;

export const checker: Checker<SsResult> = {
  id: "ss.ge",
  checkFn: async (logger) => {
    const request: SsRequest = {
      bedrooms: 3,
      minAreaSize: 100,
      maxPrice: 3500,
      page: 1,
      priceType: "total",
    };
    logger.info("Started fetching ss.ge");
    const results = await Promise.all(
      new Array(PAGES_TO_FETCH).fill(null).map((_, index) =>
        getSsResponse({
          ...request,
          page: index + 1,
        })
      )
    );
    logger.info("Done fetching ss.ge");
    return results.reduce<SsResult>((acc, page) => acc.concat(page), []);
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
        description: `${result.areaSize}m2 for ${result.price}$ (${result.pricePerMeter}$/m2) at ${result.address}`,
        url: `https://ss.ge/en/real-estate/${result.id}`,
      };
    }),
  isEmpty: (results) => results.length === 0,
  checkGeo: (results) => results,
};
