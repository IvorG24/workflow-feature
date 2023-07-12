import { getAvatarColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  CopyButton,
  Flex,
  Grid,
  Group,
  Text,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { IconArrowsMaximize, IconCopy } from "@tabler/icons-react";
import moment from "moment";
import { useRouter } from "next/router";
import RequestSignerList from "./RequestCard/RequestSignerList";

type Props = {
  request: RequestType;
};

const useStyles = createStyles(() => ({
  requestor: {
    border: "solid 2px white",
  },
}));

const RequestItemRow = ({ request }: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const {
    request_form: form,
    request_team_member: { team_member_user: requestor },
    request_signer,
  } = request;

  return (
    <Grid justify="space-between">
      <Grid.Col span={2}>
        <Group spacing={0}>
          <Text truncate w={100}>
            {request.request_id}
          </Text>
          <CopyButton value={request.request_id}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy"} onClick={copy}>
                <ActionIcon>
                  <IconCopy />
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Grid.Col>
      <Grid.Col span={3}>
        <Text truncate>{form.form_name}</Text>
      </Grid.Col>
      <Grid.Col span={2}>
        <Text>
          {moment(request.request_date_created).format("MMM DD, YYYY")}
        </Text>
      </Grid.Col>
      <Grid.Col span={2}>
        <Flex w={200} gap={8} justify="flex-start" wrap="wrap">
          <Avatar
            src={requestor.user_avatar}
            {...defaultAvatarProps}
            color={getAvatarColor(Number(`${requestor.user_id.charCodeAt(0)}`))}
            className={classes.requestor}
          >
            {requestor.user_first_name[0] + requestor.user_last_name[0]}
          </Avatar>
          <Text>{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <RequestSignerList signerList={request_signer} />
      </Grid.Col>
      <Grid.Col span={1}>
        <Group position="center">
          <ActionIcon color="blue">
            <IconArrowsMaximize
              onClick={() =>
                router.push(`/team-requests/requests/${request.request_id}`)
              }
            />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  );
};

export default RequestItemRow;
