export type PageProps<T = object> = {
	params: T;
	searchParams: Record<string, string | string[] | undefined>;
};
