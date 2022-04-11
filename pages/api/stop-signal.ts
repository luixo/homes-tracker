import type { NextApiRequest, NextApiResponse } from "next";
import { changeStopSignal, getHandlerLogger } from "../../server/utils";
import { withLogger } from "../../server/utils/logging";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  try {
    const signal = req.query.signal === "true";
    await withLogger(
      getHandlerLogger(req),
      `Changing stop signal to ${signal}`,
      async () => changeStopSignal(signal)
    );
    res.status(200).send({ success: `Changed stop signal to ${signal}` });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
