import { getInvitationId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import { CREATE_PASSWORD_PAGE_PATH } from "@/utils/constant";
import { TeamInviteJwtPayload } from "@/utils/types";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import jwt from "jsonwebtoken";
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

    const decodedToken = jwt.verify(
      `${token}`,
      process.env.JWT_SECRET_KEY
    ) as TeamInviteJwtPayload;

    const { teamId, invitedEmail } = decodedToken;

    if (!user) {
      const redirectUrl = `${CREATE_PASSWORD_PAGE_PATH}?inviteToken=${token}&email=${invitedEmail}&inviteTeamId=${teamId}`;
      res.redirect(redirectUrl);
    } else {
      const isUserOnboarded = await checkIfEmailExists(supabaseClient, {
        email: invitedEmail,
      });

      if (user && !isUserOnboarded) {
        res.redirect(`/onboarding?inviteTeamId=${teamId}`);
      }

      const invitationId = await getInvitationId(supabaseClient, {
        teamId: `${teamId}`,
        userEmail: `${invitedEmail}`,
      });

      res.redirect(`/invitation/${invitationId}`);
    }
  } catch (error) {
    console.error(error);
    res.redirect("/500");
  }
}
