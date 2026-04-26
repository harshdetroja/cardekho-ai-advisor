export interface Car {
  id: number;
  name: string;
  brand: string;
  variant: string;
  price_ex_showroom_inr: number;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number;
  max_power_bhp: number;
  seating_capacity: number;
  boot_space_litres: number;
  ground_clearance_mm: number;
  has_sunroof: boolean;
  has_automatic_climate: boolean;
  mileage_kmpl_arai: number | null;
  electric_range_km: number | null;
  ncap_safety_rating: number | null;
  airbag_count: number;
  review_summary: string;
  common_praise: string[];
  common_criticism: string[];
  city_friendly_score: number;
  highway_friendly_score: number;
  family_friendly_score: number;
  brand_reliability_note: string;
}

export interface UserInput {
  freeText: string;
  budget: string;
  familySize: string;
  primaryUse: string;
  previousContext?: string;
}

export interface ExcludedCar {
  car_id: number;
  reason: string;
}

export interface ExtractedPreferences {
  budget_min: number;
  budget_max: number;
  fuel_type: string | null;
  body_type: string | null;
  transmission: string | null;
  seating_capacity: number;
  primary_use: "city" | "highway" | "mixed";
  priorities: string[];
}

export interface CarRecommendation {
  car_id: number;
  why_for_you: string;
  tradeoffs: string;
  match_strength: "strong" | "good" | "stretch";
}

export interface AdvisorResponse {
  is_car_query: boolean;
  redirect_message?: string;
  assumptions: { label: string; value: string }[];
  recommendations: CarRecommendation[];
  relaxed_constraints?: string[];
  excluded_popular?: ExcludedCar[];
}
