import AuthLayout from "@/components/Layout/AuthLayout";
import Meta from "@/components/Meta/Meta";
import SignIn from "@/components/SignIn/SignIn";
import { LoadingOverlay } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

export default function SignInPage() {
  const { isLoading, session } = useSessionContext();
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return;
    if (session) {
      router.push("/");
      return;
    }
    setIsFetching(false);
  }, [router, isLoading, session]);
  return (
    <>
      <Meta description="Sign in Page" url="localhost:3000/sign-in" />
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {!isLoading && !isFetching && <SignIn />}
    </>
  );
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};
