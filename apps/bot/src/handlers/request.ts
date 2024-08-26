import {
	getTrackerRequestToChatLinkByChatId,
	insertTrackerRequestToChatLink,
} from "@/db/request-chat-links";
import { upsertTrackerRequest } from "@/db/requests";
import type { TrackerRequest } from "@/db/types";
import { formatRequest } from "@/filters/format";
import { parseFilters } from "@/filters/parse";
import { unparseRequest } from "@/filters/unparse";
import type { Logger } from "@/utils/logger";
import { withLogger } from "@/utils/logger";
import { MINUTE } from "@/utils/time";

import type { BotContext, BotHandler } from "../types";
import { getExistingRequestByChatId } from "../utils";

export const createRequestByChatId = async (
	logger: Logger,
	chatId: string,
): Promise<string> => {
	const existingLink = await withLogger(
		logger,
		`Fetching existing link for chat id ${chatId}`,
		getTrackerRequestToChatLinkByChatId(chatId),
	);
	if (existingLink) {
		return existingLink._id;
	}
	const creationResponse = await withLogger(
		logger,
		`Creating link for chat id ${chatId}`,
		insertTrackerRequestToChatLink(crypto.randomUUID(), chatId),
	);
	return creationResponse.insertedId.toString();
};

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
		await context.respond(
			[
				"Твой текущий запрос:",
				formatRequest(currentRequest),
				`(${unparseRequest(currentRequest)})`,
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

const getNextRequest = async (
	context: BotContext,
	currentRequst: TrackerRequest | null,
	input: string,
): Promise<TrackerRequest> => {
	const filter = parseFilters(input);
	let requestId = currentRequst ? currentRequst._id : null;
	if (!requestId) {
		requestId = await createRequestByChatId(context.logger, context.chatId);
	}
	return {
		filter,
		version: "v1",
		city: "Tbilisi",
		_id: requestId,
		enabled: true,
		notifiedTimestamp: currentRequst
			? currentRequst.notifiedTimestamp
			: Date.now() - 10 * MINUTE,
		notifiers: [
			{
				type: "telegram",
				chatId: context.chatId,
			},
		],
	};
};

export const handler: BotHandler = async (context, input) => {
	const currentRequest = await getExistingRequestByChatId(
		context.logger,
		context.chatId,
	);
	if (!input) {
		return respondGet(context, currentRequest);
	}
	try {
		const nextRequest = await getNextRequest(context, currentRequest, input);
		await withLogger(
			context.logger,
			`Updating tracker request ${nextRequest._id}`,
			(logger) => upsertTrackerRequest(logger, nextRequest),
		);
		await context.respond(
			`Твой запрос теперь:\n${formatRequest(nextRequest)}\nЖди уведомлений!`,
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
