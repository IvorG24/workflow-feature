import Meta from "@/components/Meta/Meta";
import SignInPage from "@/components/SignInPage/SignInPage";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: `/userActiveTeam`,
        permanent: false,
      },
    };
  }
  return { props: {} };
};

const Page = () => {
  return (
    <>
      <Meta description="Sign In Page" url="/sign-in" />
      <SignInPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
