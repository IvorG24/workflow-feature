import Error404Page from "@/components/ErrorPageList/Error404Page";
import Meta from "@/components/Meta/Meta";

const NotFoundPage = () => {
  return (
    <>
      <Meta description="Not Found Page" url="/404" />
      <Error404Page />
    </>
  );
};

export default NotFoundPage;
