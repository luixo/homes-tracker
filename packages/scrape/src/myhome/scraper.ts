import transliterate from "@sindresorhus/transliterate";

import type { Scraper } from "@/scrape/types";
import type { ScrapedEntity } from "@/types/db/index";
import type { EntityId, LocalEntityId, ScraperId } from "@/types/ids";
import { withLogger } from "@/utils/logger";

import type { CurrencyId, Model } from "./types";

const ID = "myhome.ge" as ScraperId;

const getRealtyType = (
	input: Model["real_estate_type_id"],
): ScrapedEntity["realtyType"] => {
	switch (input) {
		case 1: {
			return "apartment";
		}
		case 2: {
			return "house";
		}
		case 5: {
			return "commercial";
		}
		default: {
			return "unknown";
		}
	}
};

const getModelCurrency = (
	currencyId: CurrencyId,
): ScrapedEntity["currency"] => {
	switch (currencyId) {
		case 1: {
			return "₾";
		}
		case 2: {
			return "$";
		}
		case 3: {
			return "€";
		}
		default: {
			return "?";
		}
	}
};

const mapModelToEntity = (model: Model): ScrapedEntity => ({
	_id: `${ID}:${model.id}` as EntityId,
	areaSize: model.area,
	bedrooms: model.bedroom === null ? 0 : Number(model.bedroom),
	currency: getModelCurrency(model.currency_id),
	entityId: model.id.toString() as LocalEntityId,
	images: model.images.slice(0, 10).map((image) => image.thumb),
	location: {
		address: model.address ? transliterate(model.address).trim() : "unknown",
		coordinates: { lat: model.lat, lon: model.lng },
		district: model.district_name.trim(),
		subdistrict: model.urban_name.trim(),
	},
	postedTimestamp: new Date(model.last_updated).valueOf(),
	price: model.price[2].price_total,
	realtyType: getRealtyType(model.real_estate_type_id),
	rooms: model.room === "10+" ? 10 : Number(model.room),
	scrapedTimestamp: Date.now(),
	scraperId: ID,
	version: "v1",
	yardAreaSize: model.yard_area,
});

const getUrl = (id: string): string => `https://www.myhome.ge/en/pr/${id}/`;

export const scraper: Scraper<ScrapedEntity, null> = {
	fetchEntity: (_logger, _prepareResult, result) => Promise.resolve(result),
	getEntityId: (model) => model.entityId,
	getUrl,
	id: ID,
	pageFetchers: [
		(logger, _prepareResult, page) =>
			withLogger(
				logger,
				`Fetching ${ID} page #${page}`,
				async () => {
					const params = new URLSearchParams("");
					for (const [key, value] of Object.entries({
						cities: 1, // Tbilisi
						deal_types: 2, // rent
						page,
						real_estate_types: "1,2,3", // apartments, houses, country houses,
					})) {
						params.set(key, value.toString());
					}
					const response = await fetch(
						`https://api-statements.tnet.ge/v1/statements?${params.toString()}`,
						{
							headers: {
								locale: "en",
								"x-website-key": "myhome",
							},
						},
					);
					const {
						data: { data: models },
					} = (await response.json()) as {
						result: boolean;
						data: {
							data: Model[];
						};
					};
					const results = models.map(mapModelToEntity);
					return {
						nonVipAdsFound: models.some(
							(model) =>
								!model.is_vip && !model.is_vip_plus && !model.is_super_vip,
						),
						results,
					};
				},
				{
					onSuccess: (response) =>
						`${response.results.length} elements fetched (${
							response.nonVipAdsFound ? "non-vips found" : "non-vips not found"
						})`,
				},
			),
	],
	prepare: () => Promise.resolve(null),
};
