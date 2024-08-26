import { getTrackerRequestToChatLinkByChatId } from "@/db/request-chat-links";
import { getTrackerRequest } from "@/db/requests";
import type { TrackerRequest } from "@/db/types";
import type { Logger } from "@/utils/logger";
import { withLogger } from "@/utils/logger";

export const getExistingRequestByChatId = async (
	logger: Logger,
	chatId: string,
): Promise<TrackerRequest | null> => {
	const existingLink = await withLogger(
		logger,
		`Fetching existing link for chat id ${chatId}`,
		getTrackerRequestToChatLinkByChatId(chatId.toString()),
	);
	if (!existingLink) {
		return null;
	}
	return withLogger(
		logger,
		`Fetching existing request for request id ${existingLink._id}`,
		getTrackerRequest(existingLink._id),
	);
};
