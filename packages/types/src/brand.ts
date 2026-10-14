export { type Brand } from "ts-brand";
export const branded = <T extends string>(x: string): x is T => {
	void x;
	return true;
};
