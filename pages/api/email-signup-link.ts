import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

export type SignUpWithRedirectBody = {
  email: string;
  password: string;
  redirectTo: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password, redirectTo }: SignUpWithRedirectBody = req.body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { redirectTo },
    });

    if (error) throw error;

    const signUpConfirmationUrl = data.properties.action_link;
    return res.status(200).json({
      link: signUpConfirmationUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sending email" });
  }
}
