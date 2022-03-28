import * as ReactQuery from "react-query";

export const getQueryKeyServices = (): ReactQuery.QueryKey => {
  return ["service-keys"];
};

export const getQueryKeyService = (id: string): ReactQuery.QueryKey => {
  return ["entity-ids", id];
};

export const getQueryKeyEntity = (
  serviceId: string,
  id: string
): ReactQuery.QueryKey => {
  return ["entity", serviceId, id];
};
