import Meta from "@/components/Meta/Meta";
import SignInPage from "@/components/SignInPage/SignInPage";

const Page = () => {
  return (
    <>
      <Meta description="Sign In Page" url="/sign-in" />
      <SignInPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
