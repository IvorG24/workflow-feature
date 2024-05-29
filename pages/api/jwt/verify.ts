import { verifyJwtToken } from "@/utils/functions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(405).json({ error: "Jwt secret key is undefined" });
    }

    const { token } = req.query;
    if (!token) {
      console.error("Jwt token is undefined");
      res.redirect("/500");
    }

    const decodedToken = await verifyJwtToken({
      token: `${token}`,
      secretKey: process.env.JWT_SECRET_KEY,
    });

    res.status(200).json({ decodedToken: decodedToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({ decodedToken: null });
  }
}
