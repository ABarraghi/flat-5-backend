export type FeatureCollection = {
  type: string;
  query: string[];
  features: Feature[];
};

export type Feature = {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  place_name: string;
  matching_text: string;
  matching_place_name: string;
  center: number[];
};
