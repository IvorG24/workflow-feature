import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey, getInitials } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { MemoListItemType } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  CopyButton,
  Flex,
  Grid,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import moment from "moment";
import MemoItemListSignerList from "./MemoListItemSignerList";

type Props = {
  memo: MemoListItemType;
};

const MemoListItemRow = ({ memo }: Props) => {
  const activeTeam = useActiveTeam();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const referenceNumber = `${memo.memo_reference_number_prefix}-${memo.memo_reference_number_serial}`;

  const { memo_author_user } = memo;
  const authorFullname = `${memo_author_user.user_first_name} ${memo_author_user.user_last_name}`;

  return (
    <Grid m={0} px="sm" py={0} justify="space-between">
      <Grid.Col span={2}>
        <Flex gap="md">
          <Text size="xs" truncate maw={150}>
            <Anchor
              href={`/${formatTeamNameToUrlKey(
                activeTeam.team_name ?? ""
              )}/memo/${memo.memo_id}`}
              target="_blank"
            >
              {referenceNumber}
            </Anchor>
          </Text>

          <CopyButton value={referenceNumber}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : `Copy ${referenceNumber}`}
                onClick={copy}
              >
                <ActionIcon>
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Flex>
      </Grid.Col>

      <Grid.Col span={2} offset={0.8}>
        <Text truncate maw={150}>
          {memo.memo_subject}
        </Text>
      </Grid.Col>

      <Grid.Col span={1} offset={0.8}>
        <Badge variant="filled" color={getStatusToColor(memo.memo_status)}>
          {memo.memo_status}
        </Badge>
      </Grid.Col>

      <Grid.Col span="auto" offset={0.8}>
        <Flex px={0} gap={8} wrap="wrap">
          <Avatar
            src={memo_author_user.user_avatar}
            {...defaultAvatarProps}
            color={getAvatarColor(
              Number(`${memo.memo_author_user_id.charCodeAt(0)}`)
            )}
          >
            {getInitials(authorFullname)}
          </Avatar>
          <Text>{authorFullname}</Text>
        </Flex>
      </Grid.Col>

      <Grid.Col span="auto">
        <MemoItemListSignerList signerList={memo.memo_signer_list} />
      </Grid.Col>

      <Grid.Col span={1}>
        <Text>{moment(memo.memo_date_created).format("MMM DD, YYYY")}</Text>
      </Grid.Col>
    </Grid>
  );
};

export default MemoListItemRow;
