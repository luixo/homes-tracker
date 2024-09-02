import { z } from "zod";

import { chatId } from "../ids";

export const admin = z.strictObject({
	_id: chatId,
});
export type Admin = z.infer<typeof admin>;
