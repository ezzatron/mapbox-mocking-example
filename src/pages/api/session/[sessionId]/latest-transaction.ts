import type { NextApiRequest, NextApiResponse } from "next";
import generateFeatures from "src/api/generate-features";
import { LatestTransactionResponse } from "src/api/types";

export default function latestTransaction(
  req: NextApiRequest,
  res: NextApiResponse<LatestTransactionResponse>,
) {
  const { sessionId, since = "" } = req.query;

  if (typeof sessionId !== "string" || typeof since !== "string") {
    res.status(400);
    return;
  }

  const features = generateFeatures(sessionId, since);
  const latest =
    features.features[features.features.length - 1]?.properties.id ?? "";

  res.status(200).json({ latest });
}
