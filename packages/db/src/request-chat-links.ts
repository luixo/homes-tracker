import type { ChatId, RequestId } from "@/db/types";
import type { Logger } from "@/utils/logger";

import { withChatRequestLinks } from "./collections";

export const init = async (logger: Logger) =>
	withChatRequestLinks(logger, "Create link indexes", (collection) =>
		collection.createIndexes([{ key: { chatId: 1 } }]),
	);

export const insertChatLink = async (
	logger: Logger,
	requestId: RequestId,
	chatId: ChatId,
) =>
	withChatRequestLinks(
		logger,
		`Insert link "${requestId}" <-> "${chatId}"`,
		async (collection) => collection.insertOne({ _id: requestId, chatId }),
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
