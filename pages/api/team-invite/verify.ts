import { getInvitationId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import { TeamInviteJwtPayload } from "@/utils/types";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
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

    const supabaseClient = createPagesServerClient({ req, res });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/jwt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decrypt",
          value: `${token}`,
        }),
      }
    );
    const { data } = await response.json();

    if (!data) {
      return res.status(405).json({ error: "Jwt decoded token is null" });
    }

    const { teamId, invitedEmail } = data as TeamInviteJwtPayload;

    if (!user) {
      res.redirect(`/sign-in?inviteToken=${token}`);
    } else {
      const isUserOnboarded = await checkIfEmailExists(supabaseClient, {
        email: invitedEmail,
      });

      if (user && !isUserOnboarded) {
        res.redirect(`/onboarding`);
      }

      const invitationId = await getInvitationId(supabaseClient, {
        teamId: `${teamId}`,
        userEmail: `${invitedEmail}`,
      });

      res.redirect(`/user/invitation/${invitationId}`);
    }
  } catch (e) {
    res.redirect("/500");
  }
}
