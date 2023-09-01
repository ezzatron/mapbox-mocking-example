import { Feature, FeatureCollection } from "geojson";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<FeatureCollection>
) {
  let minimumLat = 40.73088334317342;
  let maximumLat = 40.71368521621004;
  let minimumLng = -74.06457278183707;
  let maximumLng = -74.03501416729776;

  const features: Feature[] = [];
  const count = 1000;

  for (let i = 0; i < count; i++) {
    const lat = Math.random() * (maximumLat - minimumLat) + minimumLat;
    const lng = Math.random() * (maximumLng - minimumLng) + minimumLng;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        id: `TXN${i.toString().padStart(4, "0")}}`,
        isLatest: i === count - 1,
      },
    });
  }

  res.status(200).json({
    type: "FeatureCollection",
    features,
  });
}
