export type PriceFilter =
  | { type: "total"; min?: number; max?: number }
  | {
      type: "per-meter";
      min?: number;
      max?: number;
    }
  | {
      type: "per-room";
      min?: number;
      max?: number;
    }
  | {
      type: "per-bedroom";
      min?: number;
      max?: number;
    };

export type LocationFilter =
  | {
      type: "district";
      districts: string[];
    }
  | {
      type: "subdistrict";
      subdistricts: string[];
    }
  | {
      type: "polygon";
      polygon: GeoJSON.MultiPolygon;
    };

export type AreaFilter = {
  type: "area";
  min?: number;
  max?: number;
};

export type RoomsFilter =
  | {
      type: "rooms";
      min?: number;
      max?: number;
    }
  | {
      type: "bedrooms";
      min?: number;
      max?: number;
    };

export type TelegramNotifier = {
  type: "telegram";
  chatId: string;
};
export type Notifier = TelegramNotifier;
export type TrackerRequestCity = "Tbilisi";

export type TrackerRequestV1 = {
  _id: string;
  version: "v1";
  city: TrackerRequestCity;
  enabled: boolean;
  notifiers: Notifier[];
  filter: {
    price?: PriceFilter;
    location?: LocationFilter;
    area?: AreaFilter;
    rooms?: RoomsFilter;
  };
  notifiedTimestamp: number;
};

export type RequestChatLink = {
  // requestId
  _id: string;
  chatId: string;
};

export type RequestMatch = {
  // requestId
  _id: string;
  matchIds: string[];
};

export type TrackerRequest = TrackerRequestV1;
