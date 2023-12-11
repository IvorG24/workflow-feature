import { getInvitationId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import { JWT_SECRET_KEY, SIGN_IN_PAGE_PATH } from "@/utils/constant";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export type JwtPayload = {
  teamId: string;
  teamName: string;
  invitedEmail: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabaseClient = createPagesServerClient({ req, res });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { token } = req.query;
    const decodedToken = jwt.verify(`${token}`, JWT_SECRET_KEY) as JwtPayload;
    const { teamId, invitedEmail } = decodedToken;

    if (!user) {
      const redirectUrl = `${SIGN_IN_PAGE_PATH}?inviteToken=${token}`;
      res.redirect(redirectUrl);
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

      res.redirect(`/invitation/${invitationId}`);
    }
  } catch (error) {
    console.error(error);
    res.redirect("/500");
  }
}
