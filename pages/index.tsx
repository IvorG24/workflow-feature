import HomePage from "@/components/HomePage/HomePage";
import Meta from "@/components/Meta/Meta";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: "/userActiveTeam",
        permanent: false,
      },
    };
  } else {
    return {
      props: {},
    };
  }
};

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
