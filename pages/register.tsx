// todo: add meta tags
import AuthLayout from "@/components/Layout/AuthLayout";
import Meta from "@/components/Meta/Meta";
import Register from "@/components/Register/Register";
import { LoadingOverlay } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

export default function RegisterPage() {
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
      <Meta description="Register Page" url="localhost:3000/register" />
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {!isLoading && !isFetching && <Register />}
    </>
  );
}

RegisterPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};
