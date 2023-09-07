import { Feature, FeatureCollection, Geometry, Polygon } from "geojson";

export type MapFeaturesResponse = {
  latest: string;
  features: TransactionFeatureCollection;
};

export type LatestTransactionResponse = { latest: string };

export type TransactionAccuracyResponse = {
  transactionId: string;
  accuracy: Feature<Polygon>;
};

export type TransactionFeatureCollection = FeatureCollection<
  Geometry,
  TransactionFeatureProperties
>;

export type TransactionFeature = Feature<
  Geometry,
  TransactionFeatureProperties
>;

export type TransactionFeatureProperties = {
  id: string;
  accuracy: number;
  isLatest?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
};
