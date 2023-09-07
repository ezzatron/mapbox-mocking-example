import { Feature, FeatureCollection, Geometry } from "geojson";
import seedrandom from "seedrandom";
import { TransactionFeatureProperties } from "src/api/types";
import { maximumLat, maximumLng, minimumLat, minimumLng } from "src/bounds";
import { startTime } from "./start-time";

const minimumAccuracy = 6;
const maximumAccuracy = 500;

export default function generateFeatures(
  sessionId: string,
  since: string,
): FeatureCollection<Geometry, TransactionFeatureProperties> {
  const requestTime = Date.now();

  const random = seedrandom(JSON.stringify([startTime, sessionId]));
  const transactionCount =
    10 + Math.floor((Number(requestTime) - Number(startTime)) / 3000);

  const features: Feature<Geometry, TransactionFeatureProperties>[] = [];
  let sinceSeen = false;

  for (let i = 0; i < transactionCount; i++) {
    const lat = random() * (maximumLat - minimumLat) + minimumLat;
    const lng = random() * (maximumLng - minimumLng) + minimumLng;
    const accuracy =
      random() * (maximumAccuracy - minimumAccuracy) + minimumAccuracy;

    const id = `TXN${i.toString().padStart(4, "0")}`;
    const isLatest = i === transactionCount - 1;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        accuracy,
        id,
        isNew: isLatest || sinceSeen ? true : undefined,
        isLatest: isLatest ? true : undefined,
      },
    });

    sinceSeen = sinceSeen || id === since;
  }

  return { type: "FeatureCollection", features };
}
