import Error401Page from "@/components/ErrorPageList/Error401Page";
import Meta from "@/components/Meta/Meta";

const UnauthorizedPage = () => {
  return (
    <>
      <Meta description="UnAuthorized Page" url="/401" />
      <Error401Page />
    </>
  );
};

export default UnauthorizedPage;
