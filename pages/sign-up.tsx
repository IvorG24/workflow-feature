import Meta from "@/components/Meta/Meta";
import SignUpPage from "@/components/SignUpPage/SignUpPage";
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
      <Meta description="Sign Up Page" url="/sign-up" />
      <SignUpPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
