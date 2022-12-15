import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import useFetchEmptyForm from "@/hooks/useFetchEmptyForm";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect } from "react";

// todo: fix meta tags
const RequestFormEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { emptyForm } = useFetchEmptyForm(
    router.query.fid as unknown as number
  );

  useEffect(() => {
    console.log("emptyForm", JSON.stringify(emptyForm, null, 2));
  }, [emptyForm]);

  return (
    <div>
      <Meta
        description="Edit Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      {/* <RequestFormEditPage /> */}
    </div>
  );
};

RequestFormEditPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestFormEditPage;
