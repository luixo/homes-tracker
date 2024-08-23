export type Model = {
  applicationId: number;
  isInactiveApplication: boolean;
  address: Address;
  price: Price;
  appImages: AppImage[];
  applicationPhones: ApplicationPhone[];
  title: string;
  description: Description;
  status: 0;
  realEstateType: string;
  realEstateTypeId: number;
  realEstateDealType: string;
  realEstateDealTypeId: number;
  isUrgent: boolean;
  isHighlighted: boolean;
  isMovedUp: boolean;
  vipStatus: 0 | 1 | 2 | 3;
  orderDate: string; // "2024-08-23T23:44:11.7043678+04:00"
  endDate: string; // "2024-08-23T23:44:11.7043678+04:00"
  userId: string;
  uploadVideoLink: null;
  videoLinkThumb: null;
  applicationVideoLink: null;
  applicationVideoLinkThumb: null;
  userImage: null;
  userEntityType: string;
  agencyId: null;
  agencyName: null;
  agencyLogoUrl: null;
  locationLatitude: number;
  locationLongitude: number;
  isFavorite: boolean;
  isConfirmed: boolean;
  comment: null;
  blockReason: null;
  contactPerson: string;
  mapInfo: MapInfo;
  cadastralCode: null;
  hasRemoteViewing: boolean;
  isForUkraine: boolean;
  isPetFriendly: boolean;
  homeId: null;
  houseUrlPrefix: string;
  companyName: null;
  companyLogo: null;
  companyId: null;
  projectName: null;
  projectId: null;
  viewCount: number;
  houseUrl: string;
  houseRooms: null;
  airConditioning: boolean;
  balcony: boolean;
  basement: boolean;
  cableTelevision: boolean;
  drinkingWater: boolean;
  electricity: boolean;
  elevator: boolean;
  fridge: boolean;
  furniture: boolean;
  garage: boolean;
  glazedWindows: boolean;
  heating: boolean;
  hotWater: boolean;
  internet: boolean;
  ironDoor: boolean;
  lastFloor: boolean;
  naturalGas: boolean;
  securityAlarm: boolean;
  sewage: boolean;
  storage: boolean;
  telephone: boolean;
  tv: boolean;
  washingMachine: boolean;
  water: boolean;
  wiFi: boolean;
  withPool: boolean;
  viewOnYard: boolean;
  viewOnStreet: boolean;
  comfortable: boolean;
  light: boolean;
  areaOfHouse: string;
  areaOfYard: string;
  bedrooms: number;
  floor: string;
  floors: string;
  kitchenArea: string;
  numberOfGuests: number;
  rooms: string;
  totalArea: string;
  toilet: string;
  project: string;
  balcony_Loggia: string;
  realEstateStatus: string;
  realEstateStatusId: number;
  floorType: number;
  floorTypeText: null;
  state: string;
  houseWillHaveToLive: null;
  commercialType: number;
  commercialTypeText: null;
  userApplicationCount: number;
  mortgagePercentages: MortgagePercentages;
  priceLevel: string;
  metaTitle: string;
  similarityGroup: null;
  similarTitle: string;
};

export type Address = {
  municipalityId: null;
  municipalityTitle: null;
  cityId: number;
  cityTitle: string;
  districtId: number;
  districtTitle: string;
  subdistrictId: number;
  subdistrictTitle: string;
  streetId: number;
  streetTitle: string;
  streetNumber: string;
};

export type AppImage = {
  fileName: string;
  isMain: boolean;
  is360: boolean;
  orderNo: number;
  imageType: number;
  fileNameThumb: string;
};

export type ApplicationPhone = {
  applicationPhoneId: number;
  applicationId: number;
  phoneNumber: string;
  isMain: boolean;
  isApproved: boolean;
  hasViber: boolean;
  hasWhatsapp: boolean;
};

export type Description = {
  ka: string;
  en: string;
  ru: string;
  allLanguageTogather: string;
  serializedText: null;
  text: string;
};

export type MapInfo = {
  subway_station: null;
  supermarket: number;
  school: number;
  park: number;
  pharmacy: number;
  mapScreen: null;
  isMapmarker: null;
};

export type MortgagePercentages = {
  bogNominal: string;
  bogEffective: string;
  tbcNominal: string;
  tbcEffective: string;
  teraNominal: string;
  teraEffective: string;
};

export type Price = {
  priceGeo: number;
  unitPriceGeo: number;
  priceUsd: number;
  unitPriceUsd: number;
  currencyType: number;
};
