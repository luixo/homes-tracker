import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

import type { ScrapedEntity } from "@/db/types";
import { getUrlById } from "@/scrape/utils";

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
		`🏡 Площадь: ${areaSize}м2${
			yardAreaSize ? `+ двор ${yardAreaSize}м2` : ""
		}`,
		`🛏️ Комнат: ${rooms}, спален ${bedrooms}`,
		`📍 Адрес: ${
			location.coordinates
				? `[${address}](https://yandex.ru/maps/?whatshere[point]=${[
						location.coordinates[1],
						location.coordinates[0],
					].join(",")}&whatshere[zoom]=16)`
				: address
		}`,
		`🕘 Выложили: ${format(new Date(entity.postedTimestamp), "d/MM/yy hh:mm", {
			locale: ru,
		})} назад`,
	].join("\n");
};
