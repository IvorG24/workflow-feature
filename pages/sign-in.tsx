import SignInWrapper from "@/components/SignIn/SignInWrapper";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignIn() {
  const session = useSession();
  const router = useRouter();

  // If after sign in we have a session, redirect to home page.
  useEffect(() => {
    if (!router.isReady) return;
    if (session) router.push("/");
  }, [router, session]);

  return <SignInWrapper />;
}

// If we have a session, redirect to home page directly.
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
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
