import { FeatureCollection, Geometry } from "geojson";

export type MapFeaturesResponse = {
  latest: string;
  features: SessionFeatureCollection;
};

export type LatestTransactionResponse = { latest: string };

export type SessionFeatureCollection = FeatureCollection<
  Geometry,
  SessionFeatureProperties
>;

export type SessionFeatureProperties = {
  id: string;
  accuracy: number;
  lat: number;
  isLatest?: boolean;
  isNew?: boolean;
};
