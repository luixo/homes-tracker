export type PageModel = {
	applicationId: number;
	status: 0;
	address: Address;
	price: Price;
	appImages: AppImage[];
	imageCount: number;
	title: string;
	shortTitle: string;
	description: null | string;
	totalArea: number;
	totalAmountOfFloor: number;
	floorNumber: string; // actually number
	numberOfBedrooms: number;
	type: 4 | 5;
	dealType: 1;
	isMovedUp: boolean;
	isHighlighted: boolean;
	isUrgent: boolean;
	vipStatus: 0 | 1 | 2 | 3;
	hasRemoteViewing: boolean;
	videoLink: null;
	commercialRealEstateType: 0;
	orderDate: string; // "2024-08-23T23:44:11.7043678+04:00"
	createDate: string; // "2024-08-23T23:44:11.7043678+04:00"
	userId: string;
	isFavorite: boolean;
	isForUkraine: boolean;
	isHidden: boolean;
	isUserHidden: boolean;
	isConfirmed: boolean;
	detailUrl: string;
	homeId: null;
	userInfo: UserInfo | null;
	similarityGroup: number | null;
	willLiveInHouse: null;
};

export type Address = {
	municipalityId: null;
	municipalityTitle: null;
	cityId: number;
	cityTitle: string;
	districtId: number | null;
	districtTitle: null | string;
	subdistrictId: number;
	subdistrictTitle: string;
	streetId: number;
	streetTitle: string;
	streetNumber: null | string;
};

export type AppImage = {
	fileName: string;
	isMain: boolean;
	is360: boolean;
	orderNo: number;
	imageType: number;
};

export type Price = {
	priceGeo: number | null;
	unitPriceGeo: number | null;
	priceUsd: number | null;
	unitPriceUsd: number | null;
	currencyType: 1 | 2;
};

export type UserInfo = {
	name: string;
	image: string;
	userType: 2 | 3;
};
