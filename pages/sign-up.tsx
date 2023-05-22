import Meta from "@/components/Meta/Meta";
import SignUpPage from "@/components/SignUpPage/SignUpPage";

const Page = () => {
  return (
    <>
      <Meta description="Sign Up Page" url="/sign-up" />
      <SignUpPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
