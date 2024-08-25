// 1 - GEL, 2 - USD, 3 - EUR
export type CurrencyId = 1 | 2 | 3;

export type Model = {
	id: number;
	// 1 - for sale, 2 - for rent, 3 - leasehold mortgage, 7 - daily rent, 10 - for lease
	deal_type_id: 2;
	// 1: apartments, 2: house, 3: country house, 3: land plots, 5: commercial area, 6: hotel
	real_estate_type_id: 1 | 2 | 5;
	/*
    "1": "Old building",
    "2": "New building",
    "3": "Under construction",
    "4": "Agricultural",
    "5": "Non-agricultural",
    "6": "Commercial",
    "7": "Special",
    "8": "Office",
    "9": "Trade",
    "10": "Warehousing",
    "11": "Manufacturing",
    "12": "Food object",
    "13": "Garage",
    "18": "Investment / for construction",
    "23": "Finished",
    "24": "Universal",
    "25": "Basement",
    "26": "Part basement",
    "27": "Full building",
    "28": "Car wash",
    "29": "Autoservice",
    "30": "Farm",
  */
	status_id: 1 | 2 | 3 | 10 | null;
	uuid: string;
	price: Record<`${CurrencyId}`, Price>;
	price_negotiable: boolean;
	price_from: boolean;
	lat: number;
	lng: number;
	images: Image[];
	address: string;
	area: number;
	yard_area: number | null;
	area_type_id: 1; // ?
	bedroom: "1" | "2" | "3" | "4" | "5" | "6" | null;
	room: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10+";
	gifts: unknown[];
	favorite: boolean;
	is_old: boolean;
	has_3d: null;
	"3d_url": null;
	dynamic_title: string;
	dynamic_slug: string;
	last_updated: string; // "2024-08-22 17:55:33"
	floor: null | number;
	total_floors: number;
	street_id: number;
	urban_id: number;
	urban_name: string;
	district_id: number;
	district_name: string;
	city_name: string;
	quantity_of_day: number;
	hidden: boolean;
	viewed: boolean;
	user_id: number;
	// ???
	price_type_id: 3;
	statement_currency_id: CurrencyId;
	currency_id: CurrencyId;
	user_title: string;
	grouped_street_id: number | null;
	parameters: Parameter[];
	comment: string | null;
	has_color: boolean;
	is_vip: boolean;
	is_vip_plus: boolean;
	is_super_vip: boolean;
	user_statements_count: null;
	user_type: UserType;
};

export type Image = {
	large: string;
	thumb: string;
	large_webp: string | null;
	thumb_webp: string | null;
};

export type Parameter = {
	id: number;
	key: string;
	sort_index: number;
	deal_type_id: number | null;
	input_name: string | null;
	select_name: string | null;
	svg_file_name: string;
	background_color: string | null;
	type: string;
	display_name: string;
	parameter_value: string | null;
	parameter_select_name: null;
};

export type Price = {
	price_total: number;
	price_square: number;
};

export type UserType = {
	type: "agent" | "physical";
};
