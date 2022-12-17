import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/Request/Request";
import { retrieveRequest } from "@/utils/queries";
import { RequestType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);

  const selectedRequest = await retrieveRequest(
    supabase,
    Number(ctx.params?.id)
  );

  return {
    props: { selectedRequest },
  };
};

type Props = {
  selectedRequest: RequestType;
};

const RequestPage = ({ selectedRequest }: Props) => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      <Request view="full" selectedRequest={selectedRequest} />
    </div>
  );
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestPage;
