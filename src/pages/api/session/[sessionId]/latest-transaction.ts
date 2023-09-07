import type { NextApiRequest, NextApiResponse } from "next";
import { LatestTransactionResponse } from "src/api/types";
import { startTime } from "../../../../start-time";

export default function latestTransaction(
  _: NextApiRequest,
  res: NextApiResponse<LatestTransactionResponse>,
) {
  const requestTime = Date.now();
  const transactionCount =
    10 + Math.floor((Number(requestTime) - Number(startTime)) / 3000);

  res.status(200).json({
    latest: `TXN${(transactionCount - 1).toString().padStart(4, "0")}`,
  });
}
