import Error403Page from "@/components/ErrorPageList/Error403Page";
import Meta from "@/components/Meta/Meta";

const ForbiddenPage = () => {
  return (
    <>
      <Meta description="Forbidden Page" url="/403" />
      <Error403Page />
    </>
  );
};

export default ForbiddenPage;
