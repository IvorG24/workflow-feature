import { Database } from "@/utils/database";
import {
  SupabaseClient,
  createPagesServerClient,
} from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseClient = createPagesServerClient({ req, res });

  try {
    switch (req.body.metadata.transactionServiceName) {
      case "formsly_subscription":
        await handleFormslyPayment(supabaseClient, req.body);
        break;
    }
    return res.status(200).send("Success");
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

export const handleFormslyPayment = async (
  supabaseClient: SupabaseClient<Database>,
  data: Record<string, string> & {
    metadata: {
      teamId: string;
      transactionId: string;
      newExpiryDate: string;
      numberOfMonths: number;
      price: number;
    };
  }
) => {
  if (data.status === "PAYMENT_SUCCESS") {
    const { error } = await supabaseClient.rpc("handle_formsly_payment", {
      input_data: {
        teamId: data.metadata.teamId,
        newExpiryDate: data.metadata.newExpiryDate,
        numberOfMonths: Number(data.metadata.numberOfMonths),
        price: Number(data.metadata.price),
      },
    });
    if (error) throw error;
  }
};
