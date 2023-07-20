import { getAllNotification } from "@/backend/api/get";
import HomePage from "@/components/HomePage/HomePage";
import Meta from "@/components/Meta/Meta";
import { Button } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const Page = () => {
  const supabaseClient = useSupabaseClient();
  return (
    <>
      <Meta description="Home Page" url="/" />
      <HomePage />
      <Button
        onClick={async () => {
          const data = await getAllNotification(supabaseClient, {
            userId: "a5b7040d-b150-40c0-bed8-4c16918fe3ae",
            app: "REQUEST",
            page: 1,
            limit: 10,
            teamId: "a5a28977-6956-45c1-a624-b9e90911502e",
          });
          console.log("data", data);
        }}
      >
        Go
      </Button>
    </>
  );
};

export default Page;
Page.Layout = "HOME";
