import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/Request/Request";
import { getFileUrl, retrieveRequest } from "@/utils/queries";
import { Database, RequestType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSideProps } from "next";
import { ReactElement, useEffect, useState } from "react";

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
  const supabaseClient = useSupabaseClient<Database>();
  const [
    selectedRequestWithAttachmentUrl,
    setSelectedRequestWithAttachmentUrl,
  ] = useState<RequestType>(selectedRequest);

  // TODO: Supabase download function for attachments does not work on server side so I will be converting the url here for now on fetch.
  useEffect(() => {
    (async () => {
      // convert selectRequest.attachments to url with getFileUrl.
      const attachmentList = selectedRequest?.attachments
        ? selectedRequest.attachments
        : [];
      const promiseList = attachmentList.map((path) =>
        getFileUrl(supabaseClient, path, "request_attachments")
      );
      const attachmentUrlList = await Promise.all(promiseList);
      setSelectedRequestWithAttachmentUrl({
        ...selectedRequest,
        attachments: attachmentUrlList,
      });
    })();
  }, [selectedRequest]);

  return (
    <div>
      <Meta description="Specific Request" url="localhost:3000/requests/id" />
      {/* <Request view="full" selectedRequest={selectedRequest} /> */}
      <Request view="full" selectedRequest={selectedRequestWithAttachmentUrl} />
    </div>
  );
};

RequestPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestPage;
