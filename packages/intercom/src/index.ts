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
	const notifiers = request.notifiers.map<Notifier>((notifier) =>
		sendToTelegram(ctx, notifier.chatId),
	);
	await Promise.all(notifiers.map((notifier) => callback(notifier)));
};

export const notifyEntity = async (
	ctx: NotifiersContext,
	request: TrackerRequest,
	entity: ScrapedEntity,
): Promise<void> =>
	withNotifiers(ctx, request, (notifier) =>
		notifier({
			images: entity.images?.slice(0, 3),
			text: formatScrapedEntity(entity, escapeMarkdown),
		}),
	);

export const notifyMessage = async (
	ctx: NotifiersContext,
	request: TrackerRequest,
	message: string,
): Promise<void> =>
	withNotifiers(ctx, request, (notifier) => notifier({ text: message }));
