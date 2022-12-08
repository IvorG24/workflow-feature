// todo: add meta tags
import AuthLayout from "@/components/Layout/AuthLayout";
import Meta from "@/components/Meta/Meta";
import Register from "@/components/Register/Register";
import { ReactElement } from "react";

export default function RegisterPage() {
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
