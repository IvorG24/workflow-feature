import { getFileUrl } from "@/utils/file";
import { GetTeam } from "@/utils/queries-new";
import { setBadgeColor } from "@/utils/request";
import { Box, Divider, Group, Text, Title } from "@mantine/core";
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
    <Box
      id={`${request.request_id}`}
      p="md"
      sx={{
        border: "1px solid #e9e9e9",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Title align="center" order={4} mb="md">
        {request.team_name?.toUpperCase()}
      </Title>

      <Group position="apart">
        <Text fz="md" fw={700} c="dark.9">
          {request.form_name}
        </Text>

        <Text
          fw={700}
          color={setBadgeColor(request.request_status_id as string)}
        >
          {startCase(request.request_status_id as string)}
        </Text>
      </Group>
      <Divider my="xs" />
      <Group position="apart">
        <Text fw={500} c="dark.9">
          {request.request_title}
        </Text>
      </Group>
      <Text c="dark.9">{request.request_date_created?.slice(0, 10)}</Text>
      <Text my="sm" c="dark.9">
        {request.request_description}
      </Text>
      {request && (
        <>
          <Divider my="sm" />
          <Text fw={500} c="dark.9">
            Request Form Details
          </Text>
          {request.fields.map((f, idx: number) => {
            let valueToDisplay = f.value;
            if (f.type === "section") {
              return (
                <Box key={idx}>
                  <Group spacing="xs">
                    <Text fw={500} c="dark.9">
                      Section:
                    </Text>
                    <Text c="dark.9">{f.label}</Text>
                  </Group>
                </Box>
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
              <Box key={idx} p="xs">
                <Group>
                  <Text fw={500} c="dark.9">
                    Q:
                  </Text>
                  <Text c="dark.9">{f.label}</Text>
                </Group>
                <Group>
                  <Text fw={500} c="dark.9">
                    A:
                  </Text>
                  <Text c="dark.9">
                    {valueToDisplay ? valueToDisplay : "N/A"}
                  </Text>
                </Group>
              </Box>
            );
          })}
        </>
      )}
      <Divider my="sm" />

      <Group position="apart">
        {purchaser && request.request_status_id === "purchased" ? (
          <Box>
            <Text fw={500} c="dark.9">
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
              <Text>
                {purchaser?.user_first_name} {purchaser?.user_last_name}
              </Text>
            ) : (
              <Text>{purchaser?.user_email}</Text>
            )}
          </Box>
        ) : (
          <Text>No Purchaser</Text>
        )}
        {approver ? (
          <Box>
            <Text fw={500} c="dark.9">
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
              <Text>
                {approver?.user_first_name} {approver?.user_last_name}
              </Text>
            ) : (
              <Text>{approver?.user_email}</Text>
            )}
          </Box>
        ) : (
          <Text>No Approver</Text>
        )}
      </Group>
      {attachments && attachments?.length > 0 ? (
        <>
          <Divider my="sm" />
          <Text fw={500} c="dark.9">
            Attachments
          </Text>
          {attachments?.map((item, idx: number) => {
            return <Text key={idx}>{item.filepath}</Text>;
          })}
        </>
      ) : (
        <>
          <Divider my="sm" />
          <Text c="dimmed">No attachments</Text>
        </>
      )}
    </Box>
  );
};

export default PdfPreview;
