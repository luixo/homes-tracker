import type { TrackerRequest } from "@/db/types";
import { formatRequest } from "@/filters/format";
import { parseFilters } from "@/filters/parse";
import { unparseRequest } from "@/filters/unparse";

import type { BotContext, BotHandler } from "../types";

const requestHelpResponse = [
	'Чтобы создать или изменить запрос - напиши его в виде фильтров разделенных символом ";", например:',
	"/request price-total 200-300; area <500; rooms >5",
	"/request area >100; bedrooms >5",
	"/request area >100; address Vake",
	"",
	"Какие есть фильтры?",
	"- По цене (можно выбрать один):",
	"-- По цене за всё: price-total",
	"-- По цене за м2: price-per-meter",
	"-- По цене за комнату: price-per-room",
	"-- По цене за спальню: price-per-bedroom",
	"- По площади: area",
	"- По количеству комнат или спален (ожно выбрать один):",
	"-- По количеству комнат: rooms",
	"-- По количеству спален: bedrooms",
	"- По адресу: address",
	"-- Используй регулярное выражение: (Vake|Saburtalo)",
	"",
	"Для каждого запроса можно указать min и max",
	"В запросах с ценами цена указывается в долларах, площадь указывается в квадратных метрах, комнаты - в штуках :)",
].join("\n");

export const respondGet = async (
	context: BotContext,
	currentRequest: TrackerRequest | null,
) => {
	if (currentRequest) {
		if (!currentRequest.enabled) {
			await context.respond(
				["Запрос выключен", "", requestHelpResponse].join("\n"),
			);
		}
		await context.respond(
			[
				"Твой текущий запрос:",
				formatRequest(currentRequest.filter),
				`(${unparseRequest(currentRequest.filter)})`,
				"",
				requestHelpResponse,
			].join("\n"),
		);
	} else {
		await context.respond(
			["У тебя нет запроса!", "", requestHelpResponse].join("\n"),
		);
	}
};

export const handler: BotHandler = async (context, input) => {
	const currentRequest = await context.caller.requests.get();
	if (!input) {
		return respondGet(context, currentRequest);
	}
	try {
		const filters = parseFilters(input);
		await context.caller.requests.upsert({
			request: {
				filters,
				version: "v1",
				city: "Tbilisi",
			},
		});
		await context.respond(
			`Твой запрос теперь:\n${formatRequest(filters)}\nЖди уведомлений!`,
		);
	} catch (error) {
		if (error instanceof Error && Array.isArray(error.cause)) {
			await context.respond(
				[
					"Я не понял твой запрос, а именно части:",
					...error.cause.map((causeElement) => String(causeElement)),
					"",
					requestHelpResponse,
				].join("\n"),
			);
		} else {
			throw error;
		}
	}
};
