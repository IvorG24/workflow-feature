import { createNotification } from "@/backend/api/post";
import { approveOrRejectMemo } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor } from "@/utils/styling";
import { MemoType } from "@/utils/types";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseClient } from "@supabase/supabase-js";
import { IconCircleDashed, IconCircleX } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import ExportMemoToPdf from "./ExportMemoToPdf";

type Props = {
  memo: MemoType;
};

const renderMemoDetails = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Group>
      <Text weight={600} miw={120}>
        {label}
      </Text>
      <Text>:</Text>
      <Text>{value !== "" ? value : "<empty>"}</Text>
    </Group>
  );
};

const renderMemoLineItems = (lineItem: MemoType["memo_line_item_list"][0]) => {
  const attachment = lineItem.memo_line_item_attachment;
  const caption = attachment?.memo_line_item_attachment_caption;

  return (
    <>
      <Markdown>{lineItem.memo_line_item_content}</Markdown>
      {attachment?.memo_line_item_attachment_public_url && (
        <Box maw={900} mah={600}>
          <Image
            src={attachment.memo_line_item_attachment_public_url}
            alt={caption ?? "No alt provided"}
            withPlaceholder
          />
          {caption && <Text italic>Image caption: {caption}</Text>}
        </Box>
      )}
    </>
  );
};

const renderSignerItem = (
  signerItem: MemoType["memo_signer_list"][0],
  supabaseClient: SupabaseClient<Database>
) => {
  const signerUserData = signerItem.memo_signer_team_member.user;
  const signerSignature =
    signerItem.memo_signer_team_member.user.user_signature_attachment;
  let signatureSrc = "";

  if (signerSignature) {
    const {
      data: { publicUrl },
    } = supabaseClient.storage
      .from("USER_SIGNATURES")
      .getPublicUrl(signerSignature.attachment_value);

    // check if valid public url
    const startIndex =
      publicUrl.indexOf("USER_SIGNATURES/") + "USER_SIGNATURES/".length;
    const signaturePath = publicUrl.substring(startIndex);

    if (signaturePath !== "null") {
      signatureSrc = publicUrl;
      signerItem.signature_public_url = publicUrl;
    }
  }

  return (
    <Stack key={signerItem.memo_signer_id} spacing={0}>
      <Image
        width={120}
        height={80}
        src={signatureSrc}
        alt="User signature"
        fit="contain"
        withPlaceholder
        placeholder={
          <Box>
            <Text>No signature</Text>
          </Box>
        }
      />
      <Text weight={600}>
        {signerUserData.user_first_name + " " + signerUserData.user_last_name}
      </Text>
      <Text>{signerUserData.user_job_title}</Text>
    </Stack>
  );
};

const MemoPage = ({ memo }: Props) => {
  const userTeamMemberData = useUserTeamMember();
  const activeTeam = useActiveTeam();
  const supabaseClient = createPagesBrowserClient<Database>();

  const { memo_author_user } = memo;
  const sortMemoLineItems = memo.memo_line_item_list.sort(
    (a, b) => a.memo_line_item_order - b.memo_line_item_order
  );
  const memoAuthorFullname = `${memo_author_user.user_first_name} ${memo_author_user.user_last_name}`;
  const pendingSignerList = memo.memo_signer_list.filter(
    (signer) => signer.memo_signer_status === "PENDING"
  );
  const signedSignerList = memo.memo_signer_list.filter((signer) =>
    ["APPROVED", "REJECTED"].includes(signer.memo_signer_status)
  );

  const [currentMemoStatus, setCurrentMemoStatus] = useState(memo.memo_status);
  const [userSignerData, setUserSignerData] = useState<
    MemoType["memo_signer_list"][0] | null
  >(null);
  const [userSignerStatus, setUserSignerStatus] = useState(
    userSignerData?.memo_signer_status
  );
  const [currentPendingSignerList, setCurrentPendingSignerList] =
    useState(pendingSignerList);
  const [currentSignedSignerList, setCurrentSignedSignerList] =
    useState(signedSignerList);
  const [isLoading, setIsLoading] = useState(false);

  const handleApproveOrRejectMemo = async (
    action: string,
    signerId: string,
    isPrimarySigner: boolean
  ) => {
    try {
      const signer = userSignerData?.memo_signer_team_member.user;

      setIsLoading(true);
      await approveOrRejectMemo(supabaseClient, {
        memoSignerId: signerId,
        memoId: memo.memo_id,
        action,
        isPrimarySigner,
      });

      await createNotification(supabaseClient, {
        notification_app: "REQUEST",
        notification_type: `MEMO-${action}`,
        notification_content: `${signer?.user_first_name} ${
          signer?.user_last_name
        } ${action.toLowerCase()} your request`,
        notification_redirect_url: `/${formatTeamNameToUrlKey(
          activeTeam.team_name ?? ""
        )}/memo/${memo.memo_id}`,
        notification_user_id: `${memo.memo_author_user.user_id}`,
        notification_team_id: activeTeam.team_id,
      });

      setUserSignerStatus(action);

      if (isPrimarySigner) {
        setCurrentMemoStatus(action);
      }
      const updatedSignerData = {
        ...userSignerData,
        memo_signer_status: action,
      };
      setUserSignerData(updatedSignerData as MemoType["memo_signer_list"][0]);

      const updatedCurrentSignerList = currentPendingSignerList.filter(
        (signer) => signer.memo_signer_id !== signerId
      );
      setCurrentPendingSignerList(updatedCurrentSignerList);

      const updatedSignedSignerList = [
        ...currentSignedSignerList,
        updatedSignerData as MemoType["memo_signer_list"][0],
      ];
      setCurrentSignedSignerList(updatedSignedSignerList);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to sign the memo",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userSignerData = pendingSignerList.find(
      (signer) =>
        signer.memo_signer_team_member.team_member_id ===
        userTeamMemberData?.team_member_id
    );

    if (userSignerData) {
      setUserSignerData(userSignerData);
      setUserSignerStatus(userSignerData.memo_signer_status);
    }
  }, [userTeamMemberData]);

  return (
    <Container pos="relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Group position="apart">
        <Title order={3} color="dimmed">
          Memo Page
        </Title>
        <ExportMemoToPdf
          memo={memo}
          currentSignedSignerList={currentSignedSignerList}
          sortMemoLineItems={sortMemoLineItems}
        />
      </Group>
      <Paper mt="md" p="md" radius="md">
        <Text mb="md" weight={700}>
          MEMORANDUM
        </Text>
        <Stack spacing="xs">
          {renderMemoDetails({
            label: "Reference No.",
            value: memo.memo_reference_number,
          })}
          {renderMemoDetails({
            label: "Date",
            value: moment(memo.memo_date_created).format("MMMM DD, YYYY"),
          })}
          {renderMemoDetails({
            label: "Author",
            value: memoAuthorFullname,
          })}
          {renderMemoDetails({
            label: "Subject",
            value: memo.memo_subject,
          })}
          <Group>
            <Text weight={600} miw={120}>
              Status
            </Text>
            <Text>:</Text>
            <Badge color={getStatusToColor(currentMemoStatus)}>
              {currentMemoStatus}
            </Badge>
          </Group>
          <Box>
            <Divider color="dark" mt="sm" />
            <Divider color="dark" mt={2} size="lg" />
          </Box>
          <Box>
            {sortMemoLineItems.map((lineItem) => (
              <Box key={lineItem.memo_line_item_id}>
                {renderMemoLineItems(lineItem)}
              </Box>
            ))}
          </Box>

          {currentSignedSignerList.length > 0 ? (
            <>
              <Space mt="xl" />
              <Flex gap={48}>
                {currentSignedSignerList.map((signer) =>
                  signer.memo_signer_status === "APPROVED"
                    ? renderSignerItem(signer, supabaseClient)
                    : null
                )}
              </Flex>
            </>
          ) : null}
        </Stack>
      </Paper>
      {currentPendingSignerList.length > 0 && (
        <Paper mt="xl" p="md" radius="md">
          <Stack>
            <Title order={3} color="dimmed">
              Signers
            </Title>
            {currentPendingSignerList.map((signer) => {
              const { user_first_name, user_last_name } =
                signer.memo_signer_team_member.user;
              const signerFullname = `${user_first_name} ${user_last_name}`;

              return (
                <Group key={signer.memo_signer_id} spacing={12}>
                  <ThemeIcon
                    color={
                      signer.memo_signer_status === "PENDING" ? "blue" : "red"
                    }
                    size="xs"
                    radius="xl"
                  >
                    {signer.memo_signer_status === "PENDING" ? (
                      <IconCircleDashed />
                    ) : (
                      <IconCircleX />
                    )}
                  </ThemeIcon>
                  {signer.memo_signer_status === "PENDING" ? (
                    <Text>To be signed by {signerFullname}</Text>
                  ) : (
                    <Text>Rejected by {signerFullname}</Text>
                  )}
                  {signer.memo_signer_is_primary && (
                    <Badge size="sm" color="green" variant="light">
                      Primary
                    </Badge>
                  )}
                </Group>
              );
            })}
          </Stack>
        </Paper>
      )}
      {userSignerStatus === "PENDING" ? (
        <Stack spacing="xs" mt="xl">
          <Button
            color="green"
            onClick={() => {
              handleApproveOrRejectMemo(
                "APPROVED",
                userSignerData?.memo_signer_id as string,
                userSignerData?.memo_signer_is_primary as boolean
              );
              setUserSignerStatus("APPROVED");
            }}
          >
            Approve
          </Button>
          <Button
            color="red"
            onClick={() =>
              handleApproveOrRejectMemo(
                "REJECTED",
                userSignerData?.memo_signer_id as string,
                userSignerData?.memo_signer_is_primary as boolean
              )
            }
          >
            Reject
          </Button>
        </Stack>
      ) : null}
    </Container>
  );
};

export default MemoPage;
