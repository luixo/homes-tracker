import { type ChatId, type RequestId, generateRequestId } from "@/types/ids";
import type { Logger } from "@/utils/logger";

import { withChatRequestLinks } from "./collections";

export const init = async (logger: Logger) =>
	withChatRequestLinks(logger, "Create link indexes", (collection) =>
		collection.createIndexes([{ key: { chatId: 1 } }]),
	);

export const getChatLinkByChatId = async (logger: Logger, chatId: ChatId) =>
	withChatRequestLinks(
		logger,
		`Get link by chat id "${chatId}"`,
		(collection) => collection.findOne({ chatId }),
	);

export const getChatLinkByRequestId = async (
	logger: Logger,
	requestId: RequestId,
) =>
	withChatRequestLinks(
		logger,
		`Get link by request id "${requestId}"`,
		(collection) => collection.findOne({ _id: requestId }),
	);

export const getOrUpsertChatLinkByChatId = async (
	logger: Logger,
	chatId: ChatId,
) =>
	withChatRequestLinks(
		logger,
		`Get or upsert link for "${chatId}"`,
		async (collection) => {
			const matched = await collection.findOne({ chatId });
			if (matched) {
				return { requestId: matched._id };
			}

			const requestId = generateRequestId();
			const response = await collection.insertOne({ _id: requestId, chatId });
			return { requestId: response.insertedId };
		},
	);
