"use client";

import { getUserSignatureList } from "@/backend/api/get";
import ExportToPdf from "@/components/ExportToPDF/ExportToPdf";
import Meta from "@/components/Meta/Meta";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { ApproverDetailsType, RequestWithResponseType } from "@/utils/types";
import { notifications } from "@mantine/notifications";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  try {
    const { data, error } = await supabaseClient.rpc("get_request", {
      request_id: `${context.query.requestId}`,
    });
    if (error) throw error;
    return {
      props: {
        request: data,
      },
    };
  } catch (e) {
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  request: RequestWithResponseType;
};

const Page = ({ request }: Props) => {
  const supabaseClient = useSupabaseClient();

  const [approverDetails, setApproverDetails] = useState<ApproverDetailsType[]>(
    []
  );
  const [isFetchingApprover, setIsFetchingApprover] = useState(true);

  useEffect(() => {
    try {
      setIsFetchingApprover(true);
      const fetchApproverDetails = async () => {
        const data = await Promise.all(
          request.request_signer.map(async (signer) => {
            let signatureUrl: string | null = null;
            if (
              signer.request_signer_status === "APPROVED" &&
              signer.request_signer_signer.signer_team_member.team_member_user
                .user_signature_attachment_id
            ) {
              const signatureList = await getUserSignatureList(supabaseClient, {
                userId:
                  signer.request_signer_signer.signer_team_member
                    .team_member_user.user_id,
              });

              const defaultSignature = signatureList[signatureList.length - 1];

              const signedDate = new Date(
                `${signer.request_signer_status_date_updated}`
              ).getTime();

              const signatureMatch = signatureList.find((signature, index) => {
                if (!signature) {
                  return false;
                }

                const nextSignatureDateCreatedTime =
                  index < signatureList.length - 1
                    ? new Date(
                        signatureList[index + 1].signature_history_date_created
                      ).getTime()
                    : 0;

                return signedDate < nextSignatureDateCreatedTime;
              });

              if (signatureMatch) {
                signatureUrl = signatureMatch.signature_history_value;
              } else {
                signatureUrl = defaultSignature
                  ? defaultSignature.signature_history_value
                  : "";
              }
            }

            return {
              name: `${signer.request_signer_signer.signer_team_member.team_member_user.user_first_name} ${signer.request_signer_signer.signer_team_member.team_member_user.user_last_name}`,
              jobDescription:
                signer.request_signer_signer.signer_team_member.team_member_user
                  .user_job_title,
              status: signer.request_signer_status,
              date: signer.request_signer_status_date_updated,
              signature: signatureUrl,
            };
          })
        );

        setApproverDetails(data);
        setIsFetchingApprover(false);
      };
      if (request) {
        fetchApproverDetails();
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  }, [request]);

  const originalSectionList = request.request_form.form_section;
  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

  return (
    <>
      <Meta description="Export to PDF" url="/" />
      {!isFetchingApprover && approverDetails.length !== 0 && (
        <ExportToPdf
          request={request}
          sectionWithDuplicateList={sectionWithDuplicateList}
          approverDetails={approverDetails}
        />
      )}
    </>
  );
};

export default Page;
