// todo: add meta tags
import AuthLayout from "@/components/Layout/AuthLayout";
import Meta from "@/components/Meta/Meta";
import Register from "@/components/Register/Register";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

export default function RegisterPage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  // todo: transfer this to GSSP when fetching sesion inside GSSP is figured out.
  // blinking problem if useEffect is used and not GSSP.
  useEffect(() => {
    const handleAuthProtect = async () => {
      if (!router.isReady) return;
      if (isLoading) return;
      if (session) router.push("/");
    };

    handleAuthProtect();
  }, [router, session, isLoading]);

  return (
    <>
      <Meta description="Register Page" url="localhost:3000/register" />
      <Register />
    </>
  );
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};
// export const getServerSideProps = async () => {
//   const supabase = createClient;
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // fetch all users from user_profile_table
//   const { data } = await supabase.from("user_profile_table").select("*");

//   console.log(data);

//   if (session)
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };

//   return {
//     props: {},
//   };
// };
