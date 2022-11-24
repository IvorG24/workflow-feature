import AuthLayout from "@/components/Layout/AuthLayout";
import Register from "@/components/Register/Register";
import createClient from "@/utils/supabase";
import { ReactElement } from "react";

export default function RegisterPage() {
  return <Register />;
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
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
