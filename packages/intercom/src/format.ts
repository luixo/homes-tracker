import { format } from "date-fns";

import { getUrlById } from "@/scrape/utils";
import type { ScrapedEntity } from "@/types/db/index";
import type { Position } from "@/types/geojson";
import { mapGeoPositionToPosition } from "@/utils/geojson";

const formatterUsd = new Intl.NumberFormat("ru-RU", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

const formatterEur = new Intl.NumberFormat("ru-RU", {
	style: "currency",
	currency: "EUR",
	maximumFractionDigits: 0,
});

const formatterGel = new Intl.NumberFormat("ru-RU", {
	style: "currency",
	currency: "GEL",
	maximumFractionDigits: 0,
});

const formatPrice = (price: number, currency: ScrapedEntity["currency"]) => {
	switch (currency) {
		case "$":
			return formatterUsd.format(price);
		case "€":
			return formatterEur.format(price);
		case "₾":
			return formatterGel.format(price);
		default:
			return `${price} ???`;
	}
};

const getPosition = (
	coordinates: NonNullable<ScrapedEntity["location"]["coordinates"]>,
): Position =>
	Array.isArray(coordinates)
		? mapGeoPositionToPosition(coordinates)
		: coordinates;

const getYandexCoords = (
	coordinates: NonNullable<ScrapedEntity["location"]["coordinates"]>,
) => {
	const { lat, lon } = getPosition(coordinates);
	return `[Яндекс](https://yandex.ru/maps/?whatshere[point]=${lon},${lat}&whatshere[zoom]=16)`;
};

const getGoogleCoords = (
	coordinates: NonNullable<ScrapedEntity["location"]["coordinates"]>,
) => {
	const { lat, lon } = getPosition(coordinates);
	return `[Google](https://www.google.com/maps/place/${lat},${lon})`;
};

export const formatScrapedEntity = (
	entity: ScrapedEntity,
	escapeFn: (input: string) => string,
): string => {
	const {
		price,
		currency,
		areaSize,
		yardAreaSize,
		rooms,
		bedrooms,
		location,
		entityId,
		scraperId,
	} = entity;
	const address = escapeFn(
		[location.address, location.subdistrict, location.district]
			.filter(Boolean)
			.join(", "),
	);
	return [
		`[ID ${entityId}](${getUrlById(scraperId, entityId)})`,
		`💵 Цена: ${escapeFn(formatPrice(price, currency))}`,
		`🏡 Площадь: ${escapeFn(areaSize.toString())}м2${
			yardAreaSize ? `\\+ двор ${escapeFn(yardAreaSize.toString())}м2` : ""
		}`,
		`🛏️ Комнат: ${rooms}, спален: ${bedrooms}`,
		`📍 Адрес: ${address} ${location.coordinates ? `\\[${getGoogleCoords(location.coordinates)} \\| ${getYandexCoords(location.coordinates)}\\]` : ""}`,
		`🕘 Опубликовано: ${format(new Date(entity.postedTimestamp), "hh:mm d/MM/yy")}`,
	]
		.filter(Boolean)
		.join("\n");
};
