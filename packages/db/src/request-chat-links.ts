import type { InsertOneResult } from "mongodb";

import type { RequestChatLink } from "@/db/types";
import type { Logger } from "@/utils/logger";

import { withChatRequestLinks } from "./collections";

export const init = async (logger: Logger): Promise<string[]> =>
	withChatRequestLinks(logger, "Create indexes", (collection) =>
		collection.createIndexes([{ key: { chatId: 1 } }]),
	);

export const insertTrackerRequestToChatLink =
	(requestId: string, chatId: string) =>
	async (logger: Logger): Promise<InsertOneResult> =>
		withChatRequestLinks(
			logger,
			`Insert "${requestId}" to chat "${chatId}"`,
			async (collection) => collection.insertOne({ _id: requestId, chatId }),
		);

export const getTrackerRequestToChatLinkByChatId =
	(chatId: string) =>
	async (logger: Logger): Promise<RequestChatLink | null> =>
		withChatRequestLinks(
			logger,
			`Insert by chat "${chatId}" chat id`,
			(collection) => collection.findOne({ chatId }),
		);

export const getTrackerRequestToChatLinkByRequestId = async (
	logger: Logger,
	requestId: string,
): Promise<RequestChatLink | null> =>
	withChatRequestLinks(
		logger,
		`Insert by chat "${requestId}" request id`,
		(collection) => collection.findOne({ _id: requestId }),
	);
