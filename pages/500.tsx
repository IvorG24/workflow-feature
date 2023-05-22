import Error500Page from "@/components/ErrorPageList/Error500Page";
import Meta from "@/components/Meta/Meta";

const InternalServerErrorPage = () => {
  return (
    <>
      <Meta description="Internal Server Error Page" url="/500" />
      <Error500Page />
    </>
  );
};

export default InternalServerErrorPage;
