import { z } from "zod";

import { selectOptionId, stepId } from "./ids";

export const staticCondition = z.object({
	type: z.literal("static"),
	value: z.boolean(),
});
export type StaticCondition = z.infer<typeof staticCondition>;
export const selectCondition = z.object({
	blackListValues: selectOptionId.array().optional(),
	type: z.literal("select"),
	whiteListValues: selectOptionId.array().optional(),
});
export type SelectCondition = z.infer<typeof selectCondition>;
export const otherStepCondition = z.object({
	condition: selectCondition,
	stepId,
	type: z.literal("other-step"),
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
			conditions: z.discriminatedUnion("type", conditions).array(),
			type: z.literal("and"),
		}),
		z.object({
			conditions: z.discriminatedUnion("type", conditions).array(),
			type: z.literal("or"),
		}),
		...conditions,
	]);

export const condition = opCondition(staticCondition, otherStepCondition);
export type Condition = z.infer<typeof condition>;
