import type { ChatId } from "@/types/ids";
import type { Logger } from "@/utils/logger";

import { withAdmins } from "./collections";

export const getAdminIds = async (logger: Logger) =>
	withAdmins(logger, `Get admin ids`, async (collection) => {
		const admins = await collection.find({}).toArray();
		return admins.map((admin) => admin._id);
	});

export const addAdmin = async (logger: Logger, chatId: ChatId) =>
	withAdmins(logger, `Put admin "${chatId}"`, (collection) =>
		collection.insertOne({ _id: chatId }),
	);

export const removeAdmin = async (logger: Logger, chatId: ChatId) =>
	withAdmins(logger, `Remove admin "${chatId}"`, (collection) =>
		collection.deleteOne({ _id: chatId }),
	);
