import HomePage from "@/components/HomePage/HomePage";
import Meta from "@/components/Meta/Meta";

// Our Landing Page.
const Page = () => {
  return (
    <>
      <Meta description="Home Page" url="/" />
      <HomePage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
