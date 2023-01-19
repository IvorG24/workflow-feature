import { getFileUrl } from "@/utils/file";
import { GetTeam } from "@/utils/queries-new";
import { setBadgeColor } from "@/utils/request";
import { Box, Divider, Flex, Group, Text, Title } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MARKS } from "./RequestItem";
import { ReducedRequestType } from "./RequestList";

type Props = {
  request: ReducedRequestType;
  attachments: { filepath: string; url: string | null }[] | undefined;
  approver?: GetTeam[0] | undefined;
  purchaser?: GetTeam[0] | undefined;
};

const PdfPreview = ({ request, attachments, approver, purchaser }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [approverSignatureUrl, setApproverSignatureUrl] = useState("");
  const [purchaserSignatureUrl, setPurchaserSignatureUrl] = useState("");
  const defaultFontSize = 11; // px

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const localeDate = new Date(
    request.request_date_created as string
  ).toLocaleDateString("en-US", dateOptions);

  useEffect(() => {
    (async () => {
      try {
        if (approver) {
          const approverSignature = await getFileUrl(
            supabaseClient,
            approver?.user_signature_filepath as string,
            "signatures"
          );
          setApproverSignatureUrl(approverSignature);
        }

        if (purchaser) {
          const purchaserSignature = await getFileUrl(
            supabaseClient,
            purchaser?.user_signature_filepath as string,
            "signatures"
          );
          setPurchaserSignatureUrl(purchaserSignature);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [approver, purchaser, supabaseClient]);

  return (
    <Box id={`${request.request_id}`}>
      <Box
        sx={{
          // border: "1px solid #e9e9e9",
          backgroundColor: "#FFFFFF",
        }}
        py={16}
      >
        <Title fz={defaultFontSize} align="center" order={4} my={8}>
          {request.team_name?.toUpperCase()}
        </Title>

        <Group px={4} position="apart">
          <Text fz={defaultFontSize} fw={700} c="dark.9">
            {request.form_name}
          </Text>

          <Text
            px={4}
            fz={defaultFontSize}
            fw={700}
            color={setBadgeColor(request.request_status_id as string)}
          >
            {startCase(request.request_status_id as string)}
          </Text>
        </Group>
        <Divider my={16} />
        <Group px={4} position="apart">
          <Text fz={defaultFontSize} c="dark.9">
            <strong>Title:</strong> {request.request_title}
          </Text>
        </Group>
        <Box px={4}>
          <Text fz={defaultFontSize} c="dark.9">
            <strong>Date:</strong> {localeDate}
          </Text>
          <Text fz={defaultFontSize} c="dark.9">
            <strong>Title:</strong> {request.request_description}
          </Text>
        </Box>
        {request && (
          <Box my={16}>
            <Box px={8}>
              <Text
                align="center"
                fz={defaultFontSize}
                fw={700}
                c="dark.9"
                mb={4}
              >
                Request Form Details
              </Text>
              {request.fields.map((f, idx: number) => {
                let valueToDisplay = f.value;
                if (f.type === "section") {
                  return (
                    <>
                      <Box key={idx} my={8}>
                        <Text align="center" fz={defaultFontSize} c="dark.9">
                          <strong>Section: </strong>
                          {f.label}
                        </Text>
                      </Box>
                    </>
                  );
                }
                if (f.type === "date") {
                  valueToDisplay = new Date(f.value).toLocaleDateString();
                }
                if (f.type === "daterange") {
                  const localeDate = f.value
                    .split(",")
                    .map((date) => new Date(date).toLocaleDateString());
                  valueToDisplay = localeDate.join(" - ");
                }
                if (f.type === "slider") {
                  valueToDisplay = MARKS[Number(f.value) - 1].label;
                }

                return (
                  <Box key={idx} mb={8}>
                    <Text fz={defaultFontSize} c="dark.9">
                      <strong>Question: </strong>
                      {f.label}
                    </Text>
                    <Text fz={defaultFontSize} c="dark.9">
                      <strong>Answer: </strong>
                      {valueToDisplay ? valueToDisplay : "N/A"}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        <Group spacing={32} position="center" my={32}>
          {purchaser && request.request_status_id === "purchased" ? (
            <Flex direction="column" align="center">
              <Text fz={defaultFontSize} fw={500} c="dark.9">
                Purchased By
              </Text>
              {purchaserSignatureUrl ? (
                <Image
                  src={purchaserSignatureUrl}
                  alt={purchaser.user_signature_filepath as string}
                  width={50}
                  height={50}
                />
              ) : null}
              {purchaser.user_last_name ? (
                <Text fz={defaultFontSize}>
                  {purchaser?.user_first_name} {purchaser?.user_last_name}
                </Text>
              ) : (
                <Text fz={defaultFontSize}>{purchaser?.user_email}</Text>
              )}
            </Flex>
          ) : (
            <Text>No Purchaser</Text>
          )}
          {approver ? (
            <Flex direction="column" align="center">
              <Text fz={defaultFontSize} fw={500} c="dark.9">
                Approved By
              </Text>
              {approverSignatureUrl ? (
                <Image
                  src={approverSignatureUrl}
                  alt={approver.user_signature_filepath as string}
                  width={50}
                  height={50}
                />
              ) : null}
              {approver.user_last_name ? (
                <Text fz={defaultFontSize}>
                  {approver?.user_first_name} {approver?.user_last_name}
                </Text>
              ) : (
                <Text fz={defaultFontSize}>{approver?.user_email}</Text>
              )}
            </Flex>
          ) : (
            <Text>No Approver</Text>
          )}
        </Group>
        {attachments && attachments?.length > 0 ? (
          <>
            <Text px={4} fz={defaultFontSize} fw={500} c="dark.9">
              Attachments
            </Text>
            {attachments?.map((item, idx: number) => {
              return (
                <Text fz={defaultFontSize} px={4} key={idx}>
                  {item.filepath}
                </Text>
              );
            })}
          </>
        ) : (
          <>
            <Text px={4} c="dimmed" fz={11}>
              No attachments
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PdfPreview;
