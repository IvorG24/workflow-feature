import { getAvatarColor } from "@/utils/styling";
import { RequestTableViewData } from "@/utils/types";
import { Avatar, Tooltip, createStyles } from "@mantine/core";
import { capitalize } from "lodash";

const useStyles = createStyles(() => ({
  primarySigner: {
    border: "solid 2px #4DABF7",
  },
}));

type RequestSignerListProps = {
  signerList: RequestTableViewData["request_signers"];
};

const RequestSignerList = ({ signerList }: RequestSignerListProps) => {
  const { classes } = useStyles();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const otherSigners = signerList.slice(3);

  return (
    <Tooltip.Group openDelay={300} closeDelay={100}>
      <Avatar.Group spacing="sm">
        {signerList.map((signer, idx) => {
          if (idx < 3) {
            return (
              <Tooltip
                key={signer.request_signer_id}
                label={`${signer.user_first_name} ${signer.user_last_name}`}
                withArrow
              >
                <Avatar
                  {...defaultAvatarProps}
                  color={getAvatarColor(
                    Number(`${signer.team_member_id.charCodeAt(0)}`)
                  )}
                  src={signer.user_avatar}
                  className={
                    signer.is_primary_signer ? classes.primarySigner : ""
                  }
                >{`${capitalize(signer.user_first_name[0])}${capitalize(
                  signer.user_last_name[0]
                )}`}</Avatar>
              </Tooltip>
            );
          }
        })}
        {signerList.length > 3 && (
          <Tooltip
            withArrow
            label={otherSigners.map((signer) => (
              <div
                key={signer.request_signer_id}
              >{`${signer.user_first_name} ${signer.user_last_name}`}</div>
            ))}
          >
            <Avatar {...defaultAvatarProps}>+{signerList.length - 3}</Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
    </Tooltip.Group>
  );
};

export default RequestSignerList;
