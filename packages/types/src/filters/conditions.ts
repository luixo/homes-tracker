import { z } from "zod";

import { selectOptionId, stepId } from "./ids";

export const staticCondition = z.object({
	type: z.literal("static"),
	value: z.boolean(),
});
export type StaticCondition = z.infer<typeof staticCondition>;
export const selectCondition = z.object({
	type: z.literal("select"),
	blackListValues: selectOptionId.array().optional(),
	whiteListValues: selectOptionId.array().optional(),
});
export type SelectCondition = z.infer<typeof selectCondition>;
export const otherStepCondition = z.object({
	type: z.literal("other-step"),
	stepId,
	condition: selectCondition,
});
export type OtherStepCondition = z.infer<typeof otherStepCondition>;

const opCondition = <
	Types extends [
		z.ZodDiscriminatedUnionOption<"type">,
		z.ZodDiscriminatedUnionOption<"type">,
		...z.ZodDiscriminatedUnionOption<"type">[],
	],
>(
	...conditions: Types
) =>
	z.discriminatedUnion("type", [
		z.object({
			type: z.literal("and"),
			conditions: z.discriminatedUnion("type", conditions).array(),
		}),
		z.object({
			type: z.literal("or"),
			conditions: z.discriminatedUnion("type", conditions).array(),
		}),
		...conditions,
	]);

export const condition = opCondition(staticCondition, otherStepCondition);
export type Condition = z.infer<typeof condition>;
