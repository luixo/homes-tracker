import { wrapHttpHandler } from "@/web/utils/trpc/http";

export const POST = wrapHttpHandler(async ({ caller, req }) => {
	const { searchParams } = req.nextUrl;
	const pagesRaw = searchParams.get("pages");
	await caller.cron.updateDb({
		scraperIds: searchParams.get("scrapers")?.split(","),
		shouldWipe: Boolean(searchParams.get("wipe")),
		dryRun: Boolean(searchParams.get("dry-run")),
		fullRun: Boolean(searchParams.get("full-run")),
		maxPages: pagesRaw ? Number(pagesRaw) : undefined,
	});
});
