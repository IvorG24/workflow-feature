import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { ReceiverStatusType, RequestListItemType } from "@/utils/types";
import {
  Anchor,
  Avatar,
  Badge,
  Flex,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const useStyles = createStyles(() => ({
  PENDING: {
    border: "solid 2px #4DABF7",
    cursor: "pointer",
  },
  APPROVED: {
    border: "solid 2px #69DB7C",
    cursor: "pointer",
  },
  REJECTED: {
    border: "solid 2px #FF8787",
    cursor: "pointer",
  },
}));

type RequestSignerListProps = {
  signerList: RequestListItemType["request_signer"];
};

const RequestSignerList = ({ signerList }: RequestSignerListProps) => {
  const { classes } = useStyles();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const otherSigners = signerList.slice(3);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Tooltip.Group openDelay={300} closeDelay={100}>
      <Modal opened={opened} onClose={close} title="Approver" centered>
        <Stack>
          {signerList.map((signer) => {
            const user =
              signer.request_signer.signer_team_member.team_member_user;
            return (
              <Flex key={signer.request_signer_id} justify="space-between">
                <Group>
                  <Avatar
                    {...defaultAvatarProps}
                    color={getAvatarColor(
                      Number(`${user.user_id.charCodeAt(0)}`)
                    )}
                    src={user.user_avatar}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      window.open(
                        `/member/${signer.request_signer.signer_team_member.signer_team_member_id}`
                      )
                    }
                  >
                    {(
                      user.user_first_name[0] + user.user_last_name[0]
                    ).toUpperCase()}
                  </Avatar>
                  <Text>
                    <Anchor
                      href={`/member/${signer.request_signer.signer_team_member.signer_team_member_id}`}
                      target="_blank"
                    >
                      <Text>
                        {user.user_first_name} {user.user_last_name}
                      </Text>
                    </Anchor>
                  </Text>
                </Group>
                <Badge
                  variant="filled"
                  color={getStatusToColor(signer.request_signer_status)}
                >
                  {signer.request_signer_status}
                </Badge>
              </Flex>
            );
          })}
        </Stack>
      </Modal>
      <Avatar.Group spacing="sm">
        {signerList.map((signer, idx) => {
          const user =
            signer.request_signer.signer_team_member.team_member_user;

          if (idx < 3) {
            return (
              <Tooltip
                key={signer.request_signer_id}
                label={`${user.user_first_name} ${user.user_last_name} - ${signer.request_signer_status}`}
                withArrow
              >
                <Avatar
                  {...defaultAvatarProps}
                  color={getAvatarColor(
                    Number(`${user.user_id.charCodeAt(0)}`)
                  )}
                  src={user.user_avatar}
                  className={
                    signer.request_signer_status
                      ? classes[
                          signer.request_signer_status.toUpperCase() as ReceiverStatusType
                        ]
                      : ""
                  }
                  onClick={() =>
                    window.open(
                      `/member/${signer.request_signer.signer_team_member.signer_team_member_id}`
                    )
                  }
                >
                  {(
                    user.user_first_name[0] + user.user_last_name[0]
                  ).toUpperCase()}
                </Avatar>
              </Tooltip>
            );
          }
        })}
        {signerList.length > 3 && (
          <Tooltip
            withArrow
            label={otherSigners.map((signer) => {
              const user =
                signer.request_signer.signer_team_member.team_member_user;
              return (
                <div
                  key={signer.request_signer_id}
                >{`${user.user_first_name} ${user.user_last_name} - ${signer.request_signer_status}`}</div>
              );
            })}
          >
            <Avatar
              {...defaultAvatarProps}
              sx={{
                cursor: "pointer",
              }}
              onClick={open}
            >
              +{signerList.length - 3}
            </Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
    </Tooltip.Group>
  );
};

export default RequestSignerList;
