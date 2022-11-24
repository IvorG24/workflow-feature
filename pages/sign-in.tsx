import AuthLayout from "@/components/Layout/AuthLayout";
import SignIn from "@/components/SignIn/SignIn";
import createClient from "@/utils/supabase";
import { ReactElement } from "react";

export default function SignInPage() {
  return <SignIn />;
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async () => {
  const supabase = createClient;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return {
    props: {},
  };
};
