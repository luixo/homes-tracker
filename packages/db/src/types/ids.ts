import crypto from "node:crypto";
import type { Brand } from "ts-brand";
import { z } from "zod";

const branded = <T extends string>(x: string): x is T => true;

// <scraperId>:<entityId>
export const entityId = z.string().refine<Brand<string, "entityId">>(branded);
export type EntityId = z.infer<typeof entityId>;

// <entityId>
export const localEntityId = z
	.string()
	.refine<Brand<string, "localEntityId">>(branded);
export type LocalEntityId = z.infer<typeof localEntityId>;

// <scraperId>
export const scraperId = z.string().refine<Brand<string, "scraperId">>(branded);
export type ScraperId = z.infer<typeof scraperId>;

export const requestId = z.string().refine<Brand<string, "requestId">>(branded);
export type RequestId = z.infer<typeof requestId>;
export const generateRequestId = () => crypto.randomUUID() as RequestId;

export const chatId = z.string().refine<Brand<string, "chatId">>(branded);
export type ChatId = z.infer<typeof chatId>;

export const outChatId = z.string().refine<Brand<string, "outChatId">>(branded);
export type OutChatId = z.infer<typeof outChatId>;
