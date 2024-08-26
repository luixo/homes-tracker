import { handler as announce } from "./handlers/announce";
import { handler as disable } from "./handlers/disable";
import { handler as enable } from "./handlers/enable";
import { handler as getUserRequest } from "./handlers/getUserRequest";
import { handler as help } from "./handlers/help";
import { handler as request } from "./handlers/request";
import { handler as start } from "./handlers/start";
import { handler as stop } from "./handlers/stop";
import type { BotHandler } from "./types";

const restrictAdmin = (handler: BotHandler): BotHandler => {
	// The simplest way to restrict handlers for admins
	// eslint-disable-next-line no-param-reassign
	handler.adminOnly = true;
	return handler;
};

export const handlers: Record<string, BotHandler> = {
	help,
	start,
	stop,
	request,
	enable,
	disable,
	getUserRequest: restrictAdmin(getUserRequest),
	announce: restrictAdmin(announce),
};
