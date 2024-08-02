import jwt from "jsonwebtoken";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { action, value } = req.body;

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(400).json({ error: "JWT variables undefined" });
    }

    let returnData = "";
    switch (action) {
      case "encrypt":
        returnData = jwt.sign(value, process.env.JWT_SECRET_KEY);
        break;
      case "decrypt":
        returnData = jwt.verify(value, process.env.JWT_SECRET_KEY) as string;
        break;
    }

    return res.status(200).json({ data: returnData });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}
