import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(405).json({ error: "Jwt secret key is undefined" });
    }

    const supabaseClient = createPagesServerClient({ req, res });

    const { emailList, teamId, teamName } = req.body;

    if (!emailList) {
      return res.status(405).json({ error: "Email list is undefined" });
    }

    for (const email of emailList) {
      try {
        const inviteProps = {
          teamId,
          teamName,
          invitedEmail: email,
          secretKey: process.env.JWT_SECRET_KEY,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/jwt`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "encrypt",
              value: inviteProps,
            }),
          }
        );
        const { data: inviteToken } = await response.json();
        if (!inviteToken) throw new Error("Jwt decoded token is null");

        const inviteUrl = `${window.location.origin}/api/quick-onboard?token=${inviteToken}`;

        await supabaseClient.auth.signUp({
          email,
          password: teamId,
          options: { emailRedirectTo: inviteUrl },
        });
      } catch (error) {
        console.error(error);
      }
    }
    return res.status(405).json({ message: "Email invite success." });
  } catch (error) {
    console.error(error);
    res.redirect("/500");
  }
}
