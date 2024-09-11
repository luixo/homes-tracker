import type { ScrapedEntity, TrackerRequest } from "@/types/db/index";

import { formatScrapedEntity } from "./format";
import { escapeMarkdown } from "./markdown";
import { sendToTelegram } from "./telegram";
import type { Notifier, NotifiersContext } from "./types";

export const withNotifiers = async (
	ctx: NotifiersContext,
	request: TrackerRequest,
	callback: (notifier: Notifier) => Promise<void>,
) => {
	const notifiers = request.notifiers.map<Notifier>((notifier) => {
		switch (notifier.type) {
			case "telegram":
				return sendToTelegram(ctx, notifier.chatId);
			default:
				return async () => {};
		}
	});
	await Promise.all(notifiers.map((notifier) => callback(notifier)));
};

export const notifyEntity = async (
	ctx: NotifiersContext,
	request: TrackerRequest,
	entity: ScrapedEntity,
): Promise<void> =>
	withNotifiers(ctx, request, (notifier) =>
		notifier({
			text: formatScrapedEntity(entity, escapeMarkdown),
			images: entity.images?.slice(0, 3),
		}),
	);

export const notifyMessage = async (
	ctx: NotifiersContext,
	request: TrackerRequest,
	message: string,
): Promise<void> =>
	withNotifiers(ctx, request, (notifier) => notifier({ text: message }));
