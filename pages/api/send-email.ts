import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export type SendEmailBody = {
  to: string;
  subject: string;
  html: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabaseClient = createPagesServerClient({ req, res });
    // Check if we have a session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session)
      return res.status(401).json({
        error: "not_authenticated",
        description:
          "The user does not have an active session or is not authenticated",
      });

    const { to, subject, html }: SendEmailBody = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "help@formsly.io",
      to,
      subject,
      html,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sending email" });
  }
}
