import { getAvatarColor } from "@/utils/styling";
import { MemoListItemType, ReceiverStatusType } from "@/utils/types";
import { Anchor, Avatar, Badge, createStyles, Flex, Modal, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { getMemoStatusColor } from './MemoListPage';

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

type Props = {
  signerList: MemoListItemType["memo_signer_list"];
};

const MemoItemListSignerList = ({ signerList }: Props) => {
  const { classes } = useStyles();
  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
  const otherSigners = signerList.slice(3);
  const [opened, { open, close }] = useDisclosure(false);

  if (signerList.length === 1) {
    const user = signerList[0].memo_signer_team_member.user
    return (
      <Flex px={0} gap={8} align='center'>
        <Avatar
              {...defaultAvatarProps}
              color={getAvatarColor(
                Number(`${user.user_id.charCodeAt(0)}`)
              )}
              src={user.user_avatar}
          >
          {(
            user.user_first_name[0] + user.user_last_name[0]
          ).toUpperCase()}
        </Avatar>

        <Anchor
          href={`/member/${signerList[0].memo_signer_team_member.team_member_id}`}
          target="_blank"
        >
          <Text >{`${user.user_first_name} ${user.user_last_name}`} </Text>
        </Anchor>
    </Flex>
    )
  }

  return (
   <>
    {/* modal for approver*/}
    <Modal opened={opened} onClose={close} title="Approver">
        {signerList.map((signer) => {
          const user = signer.memo_signer_team_member.user;
          return (
            <div key={signer.memo_signer_id}>
              <Flex px={0} justify={"space-between"} gap={10} mb={10}>
                <Flex px={0} gap={10}>
                  <Avatar
                        {...defaultAvatarProps}
                        color={getAvatarColor(
                          Number(`${user.user_id.charCodeAt(0)}`)
                        )}
                        src={user.user_avatar}
                        className={
                          signer.memo_signer_status
                            ? classes[
                                signer.memo_signer_status.toUpperCase() as ReceiverStatusType
                              ]
                            : ""
                        }
                    >
                    {(
                      user.user_first_name[0] + user.user_last_name[0]
                    ).toUpperCase()}
                  </Avatar>
                  <Anchor
                    href={`/member/${signer.memo_signer_team_member.team_member_id}`}
                    target="_blank"
                  >
                    <Text >{`${user.user_first_name} ${user.user_last_name}`} </Text>
                  </Anchor>
                </Flex>
                <Flex justify="center">

                    <Badge
                      variant="filled"
                      color={getMemoStatusColor(signer.memo_signer_status)}
                    >
                      {`${signer.memo_signer_status}`}
                    </Badge>
                </Flex>
              </Flex>
            </div>
          )
        })}
    </Modal>
   
    <Tooltip.Group openDelay={300} closeDelay={100}>
        <Avatar.Group spacing="sm" onClick={open} sx={{cursor: 'pointer'}}>
          {signerList.map((signer, idx) => {
            const user = signer.memo_signer_team_member.user;

            if (idx < 3) {
              return (
                <Tooltip
                  key={signer.memo_signer_id}
                  label={`${user.user_first_name} ${user.user_last_name} - ${signer.memo_signer_status}`}
                  withArrow
                >
                  <Avatar
                    {...defaultAvatarProps}
                    color={getAvatarColor(
                      Number(`${user.user_id.charCodeAt(0)}`)
                    )}
                    src={user.user_avatar}
                    className={
                      signer.memo_signer_status
                        ? classes[
                            signer.memo_signer_status.toUpperCase() as ReceiverStatusType
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
                const user = signer.memo_signer_team_member.user;

                return (
                  <div
                    key={signer.memo_signer_id}
                  >{`${user.user_first_name} ${user.user_last_name} - ${signer.memo_signer_status}`}</div>
                );
              })}
            >
              <Avatar {...defaultAvatarProps}>+{signerList.length - 3}</Avatar>
            </Tooltip>
          )}
        </Avatar.Group>
    </Tooltip.Group>
   </>
  );
};

export default MemoItemListSignerList;
