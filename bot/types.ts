import { TrackerRequest } from "../server/types/request";

export type CurrentTrackerRequest = Omit<
  TrackerRequest,
  "_id" | "notifiers" | "notifiedTimestamp" | "enabled"
>;
