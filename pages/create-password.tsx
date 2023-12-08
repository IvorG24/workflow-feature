import CreatePasswordPage from "@/components/CreatePasswordPage/CreatePasswordPage";
import { DEFAULT_LANDING_PAGE } from "@/utils/constant";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  const { email, inviteTeamId } = context.query;
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: DEFAULT_LANDING_PAGE,
        permanent: false,
      },
    };
  } else if (email && inviteTeamId) {
    return {
      props: { email, inviteTeamId },
    };
  }
  return {
    redirect: {
      destination: DEFAULT_LANDING_PAGE,
      permanent: false,
    },
  };
};

type Props = {
  email: string;
  inviteTeamId: string;
};

const Page = ({ email, inviteTeamId }: Props) => {
  return <CreatePasswordPage email={email} inviteTeamId={inviteTeamId} />;
};

export default Page;
Page.Layout = "HOME";
