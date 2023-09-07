import circle from "@turf/circle";
import type { NextApiRequest, NextApiResponse } from "next";
import generateFeatures from "src/api/generate-features";
import { TransactionAccuracyResponse } from "src/api/types";

export default function accuracy(
  req: NextApiRequest,
  res: NextApiResponse<TransactionAccuracyResponse>,
) {
  const { sessionId, transactionId } = req.query;

  if (typeof sessionId !== "string" || typeof transactionId !== "string") {
    res.status(400);
    return;
  }

  const features = generateFeatures(sessionId, "");
  const transaction = features.features.find(
    (feature) => feature.properties.id === transactionId,
  );

  if (!transaction) {
    res.status(404);
    return;
  }

  const { geometry, properties } = transaction;

  if (geometry.type !== "Point") {
    res.status(500);
    return;
  }

  const { coordinates } = geometry;
  const accuracy = circle(coordinates, properties.accuracy, {
    steps: 96,
    units: "meters",
  });

  res.status(200).json({ transactionId, accuracy });
}
