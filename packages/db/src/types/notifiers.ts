import { z } from "zod";

import { chatId } from "./ids";

export const telegramNotifier = z.strictObject({
	type: z.literal("telegram"),
	chatId,
});
export type TelegramNotifier = z.infer<typeof telegramNotifier>;

export const notifier = telegramNotifier;
export type Notifier = z.infer<typeof notifier>;
