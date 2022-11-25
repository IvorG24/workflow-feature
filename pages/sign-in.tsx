import AuthLayout from "@/components/Layout/AuthLayout";
import SignIn from "@/components/SignIn/SignIn";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

export default function SignInPage() {
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

  return <SignIn />;
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

// export const getServerSideProps = async () => {
//   const supabase = createClient;
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   console.log(session);

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
