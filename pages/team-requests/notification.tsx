import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";

const Page = () => {
  return (
    <>
      <Meta description="Notification Page" url="/team-requests/notification" />
      <NotificationPage app="REQUEST"/>
    </>
  );
};

export default Page;
Page.Layout = "APP";
