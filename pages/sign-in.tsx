import AuthLayout from "@/components/Layout/AuthLayout";
import Meta from "@/components/Meta/Meta";
import SignIn from "@/components/SignIn/SignIn";
import { ReactElement } from "react";

export default function SignInPage() {
  return (
    <>
      <Meta description="Sign in Page" url="localhost:3000/sign-in" />
      <SignIn />
    </>
  );
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};
