import { wrapHttpHandler } from "@/web/utils/trpc/http";

export const POST = wrapHttpHandler(({ caller }) => caller.cron.cleanup());
