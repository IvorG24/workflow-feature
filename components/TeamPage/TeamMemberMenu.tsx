import { MemberRoleType, TeamMemberType } from "@/utils/types";
import { ActionIcon, Menu, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import {
  IconArrowsLeftRight,
  IconDotsVertical,
  IconTrash,
  IconUserDown,
  IconUserShare,
  IconUserUp,
} from "@tabler/icons-react";
import { startCase } from "lodash";

type Props = {
  member: TeamMemberType;
  authUser: TeamMemberType;
  onUpdateMemberRole: (memberId: string, role: MemberRoleType) => void;
  onRemoveFromTeam: (memberId: string) => void;
  onTransferOwnership: (ownerId: string, memberId: string) => void;
};

const rolesOrder = { OWNER: 1, ADMIN: 2, MEMBER: 3 };

const TeamMemberMenu = ({
  member,
  authUser,
  onRemoveFromTeam,
  onUpdateMemberRole,
  onTransferOwnership,
}: Props) => {
  const defaultMenuIconProps = { size: 20 };

  const canUserUpdateMember =
    authUser &&
    authUser.team_member_role !== "MEMBER" &&
    authUser.team_member_user.user_id !== member.team_member_user.user_id &&
    rolesOrder[authUser.team_member_role] < rolesOrder[member.team_member_role];

  const canUserAccessDangerZone =
    authUser &&
    (authUser.team_member_role === "OWNER" ||
      authUser.team_member_role === "ADMIN");

  return (
    <Menu position="left-start" width={200} withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          c="indigo"
          icon={<IconUserShare {...defaultMenuIconProps} />}
        >
          View Profile
        </Menu.Item>
        {canUserUpdateMember && (
          <>
            {member.team_member_role !== "OWNER" && (
              <>
                <Menu.Divider />
                <Menu.Label>Team Role</Menu.Label>
                {member.team_member_role !== "ADMIN" ? (
                  <Menu.Item
                    icon={<IconUserUp {...defaultMenuIconProps} />}
                    onClick={() =>
                      openConfirmModal({
                        title: <Text>Change Role</Text>,
                        children: (
                          <Text size={14}>
                            Are you sure you want to promote
                            <Text weight={700} span>
                              &nbsp;
                              {startCase(
                                `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`
                              )}
                              &nbsp;
                            </Text>
                            to admin?
                          </Text>
                        ),
                        labels: { confirm: "Confirm", cancel: "Cancel" },
                        centered: true,
                        onConfirm: () =>
                          onUpdateMemberRole(member.team_member_id, "ADMIN"),
                      })
                    }
                  >
                    Promote to Admin
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    icon={<IconUserDown {...defaultMenuIconProps} />}
                    onClick={() =>
                      openConfirmModal({
                        title: <Text>Change Role</Text>,
                        children: (
                          <Text size={14}>
                            Are you sure you want to demote
                            <Text weight={700} span>
                              &nbsp;
                              {startCase(
                                `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`
                              )}
                              &nbsp;
                            </Text>
                            to member?
                          </Text>
                        ),
                        labels: { confirm: "Confirm", cancel: "Cancel" },
                        centered: true,
                        onConfirm: () =>
                          onUpdateMemberRole(member.team_member_id, "MEMBER"),
                      })
                    }
                  >
                    Demote to Member
                  </Menu.Item>
                )}
              </>
            )}

            {canUserAccessDangerZone && (
              <>
                <Menu.Divider />
                <Menu.Label>Danger zone</Menu.Label>

                {authUser.team_member_role === "OWNER" && (
                  <Menu.Item
                    icon={<IconArrowsLeftRight {...defaultMenuIconProps} />}
                    onClick={() =>
                      openConfirmModal({
                        title: <Text>Transfer Ownership</Text>,
                        children: (
                          <Text size={14}>
                            Are you sure you want to transfer the ownership of
                            this team to
                            <Text weight={700} span>
                              &nbsp;
                              {startCase(
                                `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`
                              )}
                            </Text>
                            ?
                          </Text>
                        ),
                        labels: { confirm: "Transfer", cancel: "Cancel" },
                        centered: true,
                        onConfirm: () =>
                          onTransferOwnership(
                            authUser.team_member_id,
                            member.team_member_id
                          ),

                        confirmProps: { color: "red" },
                      })
                    }
                  >
                    Transfer Team Ownership
                  </Menu.Item>
                )}

                <Menu.Item
                  color="red"
                  icon={<IconTrash {...defaultMenuIconProps} />}
                  onClick={() =>
                    openConfirmModal({
                      title: <Text>Remove Team Member</Text>,
                      children: (
                        <Text size={14}>
                          Are you sure you want to remove
                          <Text weight={700} span>
                            &nbsp;
                            {startCase(
                              `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`
                            )}
                            &nbsp;
                          </Text>
                          from this team?
                        </Text>
                      ),
                      labels: { confirm: "Remove", cancel: "Cancel" },
                      centered: true,
                      onConfirm: () => onRemoveFromTeam(member.team_member_id),
                      confirmProps: { color: "red" },
                    })
                  }
                >
                  Remove From Team
                </Menu.Item>
              </>
            )}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default TeamMemberMenu;
