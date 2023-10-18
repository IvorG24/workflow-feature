import { getAvatarColor } from "@/utils/styling";
import { ReceiverStatusType, RequestListItemType } from "@/utils/types";
import { Avatar, Tooltip, createStyles } from "@mantine/core";

const useStyles = createStyles(() => ({
  PENDING: {
    border: "solid 2px #4DABF7",
  },
  APPROVED: {
    border: "solid 2px #69DB7C",
  },
  REJECTED: {
    border: "solid 2px #FF8787",
  },
}));

type RequestSignerListProps = {
  signerList: RequestListItemType["request_signer"];
};

const RequestSignerList = ({ signerList }: RequestSignerListProps) => {
  const { classes } = useStyles();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const otherSigners = signerList.slice(3);

  return (
    <Tooltip.Group openDelay={300} closeDelay={100}>
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
            <Avatar {...defaultAvatarProps}>+{signerList.length - 3}</Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
    </Tooltip.Group>
  );
};

export default RequestSignerList;
