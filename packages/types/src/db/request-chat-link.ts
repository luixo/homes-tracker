import { z } from "zod";

import { chatId, requestId } from "../ids";

export const requestChatLink = z.strictObject({
	_id: requestId,
	chatId,
});
export type RequestChatLink = z.infer<typeof requestChatLink>;
