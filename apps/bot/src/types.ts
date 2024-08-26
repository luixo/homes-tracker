import type { TrackerRequest } from "@/db/types";

export type CurrentTrackerRequest = Omit<
	TrackerRequest,
	"_id" | "notifiers" | "notifiedTimestamp" | "enabled"
>;
