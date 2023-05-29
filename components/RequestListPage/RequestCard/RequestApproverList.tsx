import { getAvatarColor } from "@/utils/styling";
import { RequestType } from "@/utils/types";
import { Avatar, Tooltip, createStyles } from "@mantine/core";
import { capitalize } from "lodash";

const useStyles = createStyles(() => ({
  primaryApprover: {
    border: "solid 2px #4DABF7",
  },
}));

type RequestApproverListProps = {
  approverList: RequestType["request_signer"];
};

const RequestApproverList = ({ approverList }: RequestApproverListProps) => {
  const { classes } = useStyles();
  const defaultAvatarProps = { color: "blue", size: "md", radius: "xl" };
  const otherSigners = approverList.slice(3);

  return (
    <Tooltip.Group openDelay={300} closeDelay={100}>
      <Avatar.Group spacing="sm">
        {approverList.map(
          (
            {
              request_signer_id,
              request_signer: {
                signer_team_member: { team_member_user },
                signer_is_primary_signer,
              },
            },
            idx
          ) => {
            if (idx < 3) {
              return (
                <Tooltip
                  key={request_signer_id}
                  label={`${team_member_user.user_first_name} ${team_member_user.user_last_name}`}
                  withArrow
                >
                  <Avatar
                    {...defaultAvatarProps}
                    color={getAvatarColor(
                      Number(`${team_member_user.user_id.charCodeAt(0)}`)
                    )}
                    src={team_member_user.user_avatar}
                    className={
                      signer_is_primary_signer ? classes.primaryApprover : ""
                    }
                  >{`${capitalize(
                    team_member_user.user_first_name[0]
                  )}${capitalize(team_member_user.user_last_name[0])}`}</Avatar>
                </Tooltip>
              );
            }
          }
        )}
        {approverList.length > 3 && (
          <Tooltip
            withArrow
            label={otherSigners.map(
              ({
                request_signer_id,
                request_signer: {
                  signer_team_member: { team_member_user },
                },
              }) => (
                <div
                  key={request_signer_id}
                >{`${team_member_user.user_first_name} ${team_member_user.user_last_name}`}</div>
              )
            )}
          >
            <Avatar {...defaultAvatarProps}>+{approverList.length - 3}</Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
    </Tooltip.Group>
  );
};

export default RequestApproverList;
