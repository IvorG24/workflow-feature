import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.body.metadata.transactionServiceName) {
      case "formsly_subscription":
        await handleFormslyPayment(req.body);
        break;
    }
    return res.status(200).send("Success");
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
}

export const handleFormslyPayment = async (
  data: Record<string, string> & {
    metadata: {
      teamId: string;
      transactionId: string;
      newExpiryDate: string;
      numberOfMonths: number;
      price: number;
      token: string;
    };
  }
) => {
  if (data.status === "PAYMENT_SUCCESS") {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/handle_formsly_payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          Authorization: data.metadata.token,
        },
        body: JSON.stringify({
          input_data: {
            teamId: data.metadata.teamId,
            newExpiryDate: data.metadata.newExpiryDate,
            numberOfMonths: Number(data.metadata.numberOfMonths),
            price: Number(data.metadata.price),
          },
        }),
      }
    );
    if (!response.ok) {
      throw new Error();
    }
  }
};
