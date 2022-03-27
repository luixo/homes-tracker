import winston from "winston";
import { listAllKeys } from "./services/s3";

import { checker as myHomeChecker } from "./scraped/myhome";
import { checker as ssChecker } from "./scraped/ss";

export type GetNewResults<T> = (prevResult: T, nextResult: T) => T;

export type FormattedMessage = {
  price: number;
  pricePerMeter?: number;
  pricePerBedroom?: number;
  areaSize: number;
  yardSize?: number;
  rooms?: number;
  bedrooms?: number;
  address: string;
  url: string;
};

export type Checker<T> = {
  id: string;
  checkFn: (logger: winston.Logger) => Promise<T>;
  getNewResults: GetNewResults<T>;
  getFormatted: (results: T) => FormattedMessage[];
  isEmpty: (data: T) => boolean;
  checkGeo: (results: T, polygon: GeoJSON.MultiPolygon) => T;
};

export type CheckData<T> = {
  id: string;
  results: T;
}[];

export const CHECKERS_PREFIX = "checkers/";

export const getCheckerKey = (postfix: string) => {
  return `${CHECKERS_PREFIX}${postfix}`;
};

export const extractTimestampFromKey = (key: string): string => {
  return key.split(CHECKERS_PREFIX).filter(Boolean)[0];
};

export const getLastKeys = async (
  logger: winston.Logger
): Promise<string[]> => {
  logger.info("Fetching last key");
  const keys = await listAllKeys(logger, CHECKERS_PREFIX);
  const lastKeysTimestamps = keys
    .map(extractTimestampFromKey)
    .sort((a, b) => Number(b) - Number(a));
  if (lastKeysTimestamps.length === 0) {
    logger.info(`Got no last key!`);
  } else {
    logger.info(`Got last key: ${getCheckerKey(lastKeysTimestamps[0])}`);
  }
  return lastKeysTimestamps.map(getCheckerKey);
};

export const checkers: Record<string, Checker<unknown>> = [
  myHomeChecker,
  ssChecker,
].reduce<Record<string, Checker<any>>>((acc, checker) => {
  acc[checker.id] = checker;
  return acc;
}, {});

export const formatMessage = (message: FormattedMessage): string => {
  const prices = [
    `${message.price}$`,
    message.pricePerBedroom ? `${message.pricePerBedroom}$/🛏️` : undefined,
    message.pricePerMeter ? `${message.pricePerMeter}$/m2` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const areas = [
    `${message.areaSize}m2`,
    message.yardSize ? `+ 🌲 ${message.pricePerBedroom}m2` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const rooms = [
    message.rooms ? `${message.rooms}🚪` : undefined,
    message.bedrooms ? `${message.bedrooms}🛏️` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  return [
    [prices, areas, rooms].filter(Boolean).join("; "),
    `> ${message.address}`,
    message.url,
  ].join("\n");
};

export const POLYGON: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [44.806575, 41.709727],
        [44.807358, 41.712322],
        [44.806049, 41.712868],
        [44.805504, 41.714428],
        [44.803917, 41.714737],
        [44.802509, 41.716038],
        [44.801132, 41.715702],
        [44.798183, 41.716328],
        [44.801533, 41.7173],
        [44.801834, 41.718323],
        [44.800343, 41.722496],
        [44.801479, 41.724323],
        [44.801098, 41.724918],
        [44.799507, 41.72562],
        [44.797855, 41.724979],
        [44.796112, 41.725929],
        [44.795509, 41.726955],
        [44.794506, 41.727169],
        [44.792801, 41.726032],
        [44.791757, 41.723545],
        [44.790193, 41.72285],
        [44.788491, 41.723041],
        [44.787285, 41.724324],
        [44.785821, 41.724222],
        [44.786032, 41.723011],
        [44.784302, 41.722041],
        [44.785428, 41.720041],
        [44.784882, 41.718601],
        [44.780925, 41.722902],
        [44.780668, 41.724526],
        [44.779219, 41.724453],
        [44.776668, 41.725532],
        [44.774668, 41.724589],
        [44.771668, 41.72487],
        [44.769304, 41.720902],
        [44.771668, 41.720176],
        [44.771891, 41.719125],
        [44.773403, 41.718637],
        [44.773294, 41.716528],
        [44.774668, 41.715905],
        [44.77693, 41.716164],
        [44.777115, 41.714902],
        [44.779012, 41.714376],
        [44.779469, 41.713396],
        [44.778452, 41.711725],
        [44.775746, 41.711913],
        [44.774249, 41.71269],
        [44.77332, 41.711314],
        [44.772196, 41.711314],
        [44.772502, 41.712314],
        [44.770249, 41.71405],
        [44.768484, 41.71382],
        [44.766484, 41.714924],
        [44.764801, 41.71402],
        [44.761878, 41.714179],
        [44.760253, 41.715899],
        [44.758253, 41.715473],
        [44.753308, 41.711543],
        [44.754501, 41.709543],
        [44.757395, 41.707685],
        [44.760511, 41.706801],
        [44.763044, 41.707096],
        [44.764484, 41.706542],
        [44.765251, 41.706985],
        [44.766484, 41.705985],
        [44.769362, 41.705201],
        [44.773017, 41.706136],
        [44.776452, 41.703637],
        [44.780423, 41.703547],
        [44.78109, 41.701088],
        [44.784473, 41.698906],
        [44.787472, 41.699242],
        [44.787849, 41.69846],
        [44.79092, 41.697536],
        [44.791473, 41.696362],
        [44.793856, 41.697122],
        [44.792992, 41.693462],
        [44.79459, 41.692337],
        [44.792217, 41.689461],
        [44.793613, 41.688614],
        [44.79446, 41.688446],
        [44.795464, 41.689053],
        [44.797462, 41.688633],
        [44.798462, 41.687656],
        [44.79982, 41.688816],
        [44.802525, 41.688522],
        [44.803463, 41.687767],
        [44.806465, 41.687641],
        [44.807465, 41.687824],
        [44.808464, 41.689007],
        [44.80946, 41.688217],
        [44.811667, 41.689225],
        [44.817832, 41.68969],
        [44.821276, 41.687662],
        [44.824724, 41.68311],
        [44.826132, 41.682139],
        [44.827132, 41.682282],
        [44.828882, 41.683768],
        [44.829132, 41.685808],
        [44.829161, 41.684547],
        [44.832552, 41.683938],
        [44.833132, 41.683241],
        [44.833625, 41.683518],
        [44.833869, 41.685781],
        [44.835241, 41.686409],
        [44.835488, 41.687518],
        [44.833319, 41.688705],
        [44.83187, 41.688256],
        [44.831132, 41.690724],
        [44.828132, 41.691693],
        [44.827132, 41.692559],
        [44.821919, 41.689921],
        [44.822258, 41.692068],
        [44.821192, 41.694068],
        [44.818134, 41.696461],
        [44.815464, 41.696781],
        [44.813824, 41.697693],
        [44.811465, 41.696724],
        [44.812855, 41.698907],
        [44.811053, 41.700513],
        [44.811065, 41.701907],
        [44.809816, 41.703907],
        [44.809767, 41.706227],
        [44.808231, 41.706691],
        [44.808238, 41.708907],
        [44.806575, 41.709727],
      ],
    ],
    [
      [
        [44.796616, 41.737434],
        [44.795509, 41.737854],
        [44.794838, 41.737328],
        [44.793171, 41.735329],
        [44.793255, 41.734581],
        [44.794941, 41.732327],
        [44.794838, 41.730663],
        [44.795876, 41.730328],
        [44.798542, 41.727303],
        [44.801048, 41.72879],
        [44.80106, 41.730328],
        [44.802597, 41.731331],
        [44.801865, 41.73333],
        [44.800068, 41.734329],
        [44.801353, 41.735329],
        [44.796616, 41.737434],
      ],
    ],
    [
      [
        [44.787521, 41.74334],
        [44.785511, 41.74316],
        [44.784504, 41.744164],
        [44.782009, 41.743824],
        [44.782009, 41.742832],
        [44.782757, 41.742325],
        [44.782509, 41.740509],
        [44.78791, 41.740925],
        [44.788731, 41.742546],
        [44.787521, 41.74334],
      ],
    ],
    [
      [
        [44.789749, 41.728565],
        [44.787502, 41.729115],
        [44.78701, 41.728825],
        [44.7854, 41.727333],
        [44.785507, 41.72583],
        [44.786507, 41.725231],
        [44.790485, 41.725353],
        [44.790718, 41.72654],
        [44.789749, 41.728565],
      ],
    ],
    [
      [
        [44.780754, 41.751575],
        [44.779507, 41.751072],
        [44.778507, 41.751282],
        [44.777248, 41.749588],
        [44.777508, 41.748825],
        [44.780502, 41.747982],
        [44.781254, 41.748581],
        [44.783005, 41.750328],
        [44.780754, 41.751575],
      ],
    ],
    [
      [
        [44.841572, 41.688564],
        [44.840515, 41.687408],
        [44.839466, 41.687927],
        [44.838379, 41.687546],
        [44.837753, 41.686462],
        [44.840462, 41.684059],
        [44.841465, 41.68512],
        [44.842667, 41.685257],
        [44.844303, 41.686462],
        [44.842384, 41.687382],
        [44.841572, 41.688564],
      ],
    ],
    [
      [
        [44.854462, 41.686047],
        [44.852859, 41.686066],
        [44.85191, 41.685463],
        [44.854462, 41.684349],
        [44.855358, 41.685463],
        [44.854462, 41.686047],
      ],
    ],
  ],
};
