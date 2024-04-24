import Meta from "@/components/Meta/Meta";
import SignUpSuccessPage from "@/components/SignUpPage/SignUpSuccessPage";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import validator from "validator";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  const { confirmationId } = context.query;

  if (!validator.isUUID(`${confirmationId}`, 4)) {
    return {
      redirect: {
        destination: `/sign-up`,
        permanent: false,
      },
    };
  }

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
      <Meta description="Sign Up Success" url="/sign-up/success" />
      <SignUpSuccessPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
