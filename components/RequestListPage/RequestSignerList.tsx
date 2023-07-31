import { getAvatarColor } from "@/utils/styling";
import { RequestListItemType } from "@/utils/types";
import { Avatar, Tooltip, createStyles } from "@mantine/core";
import { capitalize } from "lodash";

const useStyles = createStyles(() => ({
  primarySigner: {
    border: "solid 2px #4DABF7",
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
                label={`${user.user_first_name} ${user.user_last_name}`}
                withArrow
              >
                <Avatar
                  {...defaultAvatarProps}
                  color={getAvatarColor(
                    Number(`${user.user_id.charCodeAt(0)}`)
                  )}
                  src={user.user_avatar}
                  className={
                    signer.request_signer.signer_is_primary_signer
                      ? classes.primarySigner
                      : ""
                  }
                >{`${capitalize(user.user_first_name[0])}${capitalize(
                  user.user_last_name[0]
                )}`}</Avatar>
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
                >{`${user.user_first_name} ${user.user_last_name}`}</div>
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
