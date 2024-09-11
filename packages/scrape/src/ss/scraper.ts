import transliterate from "@sindresorhus/transliterate";

import type { ScrapedEntity } from "@/types/db/index";
import type { EntityId, LocalEntityId, ScraperId } from "@/types/ids";
import type { Logger } from "@/utils/logger";
import { withLogger } from "@/utils/logger";

import type { Scraper } from "../types";

import type { PageModel } from "./page-types";
import type { Model } from "./types";

const ID = "ss.ge" as ScraperId;

const buildParams = (realEstateType: number, page: number) => ({
	cityIdList: [95],
	currencyId: 1,
	page: page + 1,
	pageSize: 20,
	realEstateDealType: 1,
	order: 1, // Order by date desc.
	realEstateType,
});

const mapModalToEntity = (model: Model): ScrapedEntity | null => {
	if (!model.price.priceGeo || !model.price.priceUsd) {
		return null;
	}
	return {
		version: "v1",
		_id: `${ID}:${model.applicationId}` as EntityId,
		entityId: model.applicationId.toString() as LocalEntityId,
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
				}`,
			).trim(),
			district: model.address.districtTitle.trim(),
			subdistrict: model.address.subdistrictTitle.trim(),
			coordinates: {
				lat: model.locationLatitude,
				lon: model.locationLongitude,
			},
		},
		images: model.appImages
			.sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0))
			.slice(0, 10)
			.map((image) => image.fileNameThumb),
	};
};

type PrepareResult = { token: string };

const getUrl = (id: string) => `https://home.ss.ge/en/real-estate/${id}`;

const COOKIE_KEY = "ss-session-token";

const getCookieFromString = (str: string) => {
	const cookies = str.split(";").map((s) => s.trim());
	const matchedCookie = cookies.find((cookie) =>
		cookie.includes(`${COOKIE_KEY}=`),
	);
	if (!matchedCookie) {
		throw new Error(`Expected to have cookie with key ${COOKIE_KEY}!`);
	}
	const cookieParts = matchedCookie.split(",").map((s) => s.trim());
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const matchedCookiePart = cookieParts.find((part) =>
		part.startsWith(`${COOKIE_KEY}=`),
	)!;
	return matchedCookiePart.replace(`${COOKIE_KEY}=`, "");
};

const extractToken = (cookie?: string | string[]) => {
	if (cookie === undefined) {
		throw new Error("Expected to have cookie!");
	}
	if (typeof cookie === "string") {
		return getCookieFromString(cookie);
	}
	const matchedCookie = cookie.find((element) => element.includes(COOKIE_KEY));
	if (!matchedCookie) {
		throw new Error(
			`Expected to have cookie with key ${COOKIE_KEY} (in array)!`,
		);
	}
	return getCookieFromString(matchedCookie);
};

const prepare = (logger: Logger) =>
	withLogger(
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
		},
	);

const fetchEntity = (
	logger: Logger,
	prepareResult: PrepareResult,
	entityId: LocalEntityId,
) =>
	withLogger(logger, `Fetching ${ID} element #${entityId}`, async () => {
		const response = await fetch(
			`https://api-gateway.ss.ge/v1/RealEstate/details?applicationId=${entityId}`,
			{
				method: "PUT",
				headers: {
					"accept-language": "en",
					authorization: `Bearer ${prepareResult.token}`,
					"content-type": "application/json",
				},
			},
		);
		const data = (await response.json()) as Model;
		return mapModalToEntity(data);
	});

const fetchPageByType =
	(type: "house" | "flat") =>
	async (logger: Logger, prepareResult: PrepareResult, page: number) =>
		withLogger(
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
					},
				);
				const data = (await response.json()) as {
					realStateItemModel: PageModel[];
				};
				const results = data.realStateItemModel
					.filter((model) => model.price.priceGeo && model.price.priceUsd)
					.map((model) => model.applicationId.toString() as LocalEntityId);
				return {
					results,
					nonVipAdsFound: data.realStateItemModel.some(
						(model) => model.vipStatus === 0,
					),
				};
			},
			{
				onSuccess: (response) =>
					`${response.results.length} elements fetched (${
						response.nonVipAdsFound ? "non-vips found" : "non-vips not found"
					})`,
			},
		);

export const scraper: Scraper<LocalEntityId, PrepareResult> = {
	id: ID,
	prepare,
	pageFetchers: [fetchPageByType("house"), fetchPageByType("flat")],
	getEntityId: (applicationId) => applicationId,
	fetchEntity,
	getUrl,
};
