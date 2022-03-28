import type { NextApiRequest, NextApiResponse } from "next";
import {
  CommonEntityDescription,
  services,
} from "../../server/service-helpers";
import { globalLogger } from "../../server/logger";

type Response =
  | {
      entity: Omit<CommonEntityDescription, "timestamp">;
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const logger = globalLogger.child({ handler: req.url });
  const serviceId = req.query.serviceId;
  if (!serviceId || Array.isArray(serviceId)) {
    return res.status(400).send({
      error: 'No "serviceId" in query or wrong format',
    });
  }
  const id = req.query.id;
  if (!id || Array.isArray(id)) {
    return res.status(400).send({
      error: 'No "id" in query or wrong format',
    });
  }
  try {
    const service = services[serviceId];
    if (!service) {
      return res.status(400).send({
        error: `Service ${serviceId} not found`,
      });
    }
    const entity = await service.fetchCommonEntity(logger, id);
    if (!entity) {
      return res.status(404).send({
        error: `No entity id ${id} found`,
      });
    }
    res.status(200).send({
      entity,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
