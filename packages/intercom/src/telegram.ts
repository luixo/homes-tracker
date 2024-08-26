import { withLogger } from "@/utils/logger";

import type { Notifier, NotifiersContext } from "./types";

const MAX_TELEGRAM_CHARS = 4096;

export const sendToTelegram =
	(ctx: NotifiersContext, chatId: string): Notifier =>
	async ({ text, images }) => {
		const originalMessage = text;
		const hasImages = images && images.length !== 0;
		return withLogger(
			ctx.logger.child({ service: "teleram" }),
			`Send message (size ${text.length}${
				hasImages ? `, with ${images.length} images` : ""
			}) to ${chatId}`,
			async () => {
				while (text.length > 0) {
					const isFirstMessage = text === originalMessage;
					if (hasImages && isFirstMessage) {
						await ctx.bot.sendMediaGroup(
							chatId,
							// eslint-disable-next-line @typescript-eslint/no-loop-func
							images.map((image, index) => ({
								type: "photo",
								media: image,
								...(index === 0
									? {
											caption: text.slice(0, MAX_TELEGRAM_CHARS),
											parse_mode: "MarkdownV2",
										}
									: undefined),
							})),
						);
					} else {
						await ctx.bot.sendMessage(
							chatId,
							text.slice(0, MAX_TELEGRAM_CHARS),
							{
								disable_web_page_preview: isFirstMessage,
							},
						);
					}
					// eslint-disable-next-line no-param-reassign
					text = text.slice(MAX_TELEGRAM_CHARS + 1);
				}
			},
		);
	};
